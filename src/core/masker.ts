import { MaskingConfig, MaskingResult, DetectedField, FieldType, CustomPattern } from "./types";
import { Detector } from "./detectors";
import { MaskingRules } from "./rules";

/**
 * Core masking engine that traverses and masks sensitive data
 */
export class Masker {
  private config: Required<MaskingConfig>;
  private detector: Detector;
  private rules: MaskingRules;
  private piiFieldSet: Set<string>;
  private phiFieldSet: Set<string>;
  private piiPatterns: RegExp[];
  private phiPatterns: RegExp[];

  constructor(config: MaskingConfig = {}) {
    // Set defaults
    this.config = {
      env: config.env || "production",
      piiFields: config.piiFields || [],
      phiFields: config.phiFields || [],
      maskingRules: config.maskingRules || [],
      piiEnvironmentMapping: config.piiEnvironmentMapping || {},
      phiEnvironmentMapping: config.phiEnvironmentMapping || {},
      detectPII: config.detectPII !== undefined ? config.detectPII : true,
      maskStringValues: config.maskStringValues !== undefined ? config.maskStringValues : true,
      hashAlgorithm: config.hashAlgorithm || "sha256",
      preserveStructure: config.preserveStructure !== undefined ? config.preserveStructure : true,
      customPatterns: config.customPatterns || []
    };

    this.rules = new MaskingRules(
      this.config.maskingRules,
      this.config.env,
      this.config.hashAlgorithm,
      this.config.piiEnvironmentMapping as any,
      this.config.phiEnvironmentMapping as any
    );
    this.detector = new Detector(this.config.customPatterns, this.rules);

    // Separate string fields from regex patterns
    this.piiFieldSet = new Set<string>();
    this.piiPatterns = [];
    this.phiFieldSet = new Set<string>();
    this.phiPatterns = [];

    this.config.piiFields.forEach((field) => {
      if (typeof field === "string") {
        this.piiFieldSet.add(field.toLowerCase());
      } else {
        this.piiPatterns.push(field);
      }
    });

    this.config.phiFields.forEach((field) => {
      if (typeof field === "string") {
        this.phiFieldSet.add(field.toLowerCase());
      } else {
        this.phiPatterns.push(field);
      }
    });
  }

  /**
   * Check if a field is configured as PII
   */
  private isPIIField(fieldName: string): boolean {
    const lowerName = fieldName.toLowerCase();

    // Check exact matches
    if (this.piiFieldSet.has(lowerName)) {
      return true;
    }

    // Check regex patterns
    return this.piiPatterns.some((pattern) => pattern.test(fieldName));
  }

  /**
   * Check if a field is configured as PHI
   */
  private isPHIField(fieldName: string): boolean {
    const lowerName = fieldName.toLowerCase();

    // Check exact matches
    if (this.phiFieldSet.has(lowerName)) {
      return true;
    }

    // Check regex patterns
    return this.phiPatterns.some((pattern) => pattern.test(fieldName));
  }

  /**
   * Determine field type for a given field name and value
   */
  private getFieldType(fieldName: string, value: any): FieldType | null {
    // Check configured fields first
    if (this.isPHIField(fieldName)) {
      return "phi";
    }
    if (this.isPIIField(fieldName)) {
      return "pii";
    }

    // Auto-detection if enabled
    if (this.config.detectPII) {
      return this.detector.detectFieldType(fieldName, value);
    }

    return null;
  }

  /**
   * Get custom pattern that matches the value
   */
  private getCustomPattern(value: any): any {
    return this.detector.getMatchingCustomPattern(value);
  }

  /**
   * Deep clone an object to avoid mutation
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as any;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item)) as any;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Recursively mask sensitive fields in an object
   */
  private maskObject(obj: any, path: string = "", detectedFields: DetectedField[] = []): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle primitives
    if (typeof obj !== "object") {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item, index) => this.maskObject(item, `${path}[${index}]`, detectedFields));
    }

    // Handle objects
    const masked: any = {};

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      const fieldType = this.getFieldType(key, value);

      // If it's a sensitive field
      if (fieldType) {
        let maskedValue;
        let strategy;

        // Check if value matches a custom pattern with specific masking rules
        const customPattern = this.getCustomPattern(value);
        if (customPattern && customPattern.fieldType === fieldType) {
          // Use custom pattern's specific masking strategy or function
          if (customPattern.customMask) {
            maskedValue = customPattern.customMask(value);
            strategy = "custom";
          } else if (customPattern.maskingStrategy) {
            strategy = customPattern.maskingStrategy;
            maskedValue = this.rules.applyCustomStrategy(
              value,
              strategy,
              this.config.hashAlgorithm
            );
          } else {
            strategy = this.rules.getStrategy(key, fieldType);
            maskedValue = this.rules.maskValue(key, value, fieldType);
          }
        } else {
          // Use standard field masking
          strategy = this.rules.getStrategy(key, fieldType);
          maskedValue = this.rules.maskValue(key, value, fieldType);
        }

        // Track detected field
        detectedFields.push({
          path: currentPath,
          type: fieldType,
          value: value,
          strategy: strategy,
          customPattern: customPattern?.name
        });

        // Handle 'remove' strategy
        if (strategy === "remove") {
          if (this.config.preserveStructure) {
            masked[key] = "<removed>";
          }
          // else: don't add the key at all
        } else {
          masked[key] = maskedValue;
        }
      } else if (typeof value === "object" && value !== null) {
        // Recursively process nested objects/arrays
        masked[key] = this.maskObject(value, currentPath, detectedFields);
      } else if (typeof value === "string" && this.config.maskStringValues) {
        // Mask PII/PHI patterns within string values
        // Use environment-based strategy for PII by default
        const strategy = this.rules.getStrategy("", "pii");
        const maskedString = this.detector.maskStringValue(value, strategy);

        // Only mark as processed if something was actually masked
        if (maskedString !== value) {
          detectedFields.push({
            path: currentPath,
            type: "pii",
            value: value,
            strategy: strategy
          });
        }
        masked[key] = maskedString;
      } else {
        // Keep non-sensitive primitives as-is
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Mask sensitive data in the input
   * Returns a new object without mutating the original
   */
  public mask(data: any): MaskingResult {
    if (data === null || data === undefined) {
      return {
        masked: data,
        fieldsProcessed: 0
      };
    }

    // Clone to prevent mutation
    const cloned = this.deepClone(data);
    const detectedFields: DetectedField[] = [];

    // Perform masking
    const masked = this.maskObject(cloned, "", detectedFields);

    return {
      masked,
      fieldsProcessed: detectedFields.length,
      detectedFields
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<MaskingConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      piiFields: config.piiFields || this.config.piiFields,
      phiFields: config.phiFields || this.config.phiFields,
      maskingRules: config.maskingRules || this.config.maskingRules,
      piiEnvironmentMapping: config.piiEnvironmentMapping || this.config.piiEnvironmentMapping,
      phiEnvironmentMapping: config.phiEnvironmentMapping || this.config.phiEnvironmentMapping,
      customPatterns: config.customPatterns || this.config.customPatterns
    };

    // Rebuild detector with updated custom patterns
    this.detector = new Detector(this.config.customPatterns);

    // Rebuild rules engine
    this.rules = new MaskingRules(
      this.config.maskingRules,
      this.config.env,
      this.config.hashAlgorithm,
      this.config.piiEnvironmentMapping as any,
      this.config.phiEnvironmentMapping as any
    );
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<Required<MaskingConfig>> {
    return { ...this.config };
  }

  /**
   * Add a custom pattern for detection and masking
   */
  public addCustomPattern(pattern: CustomPattern): void {
    this.config.customPatterns.push(pattern);
    this.detector.addCustomPattern(pattern);
  }

  /**
   * Remove a custom pattern by name
   */
  public removeCustomPattern(name: string): boolean {
    const index = this.config.customPatterns.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.config.customPatterns.splice(index, 1);
      return this.detector.removeCustomPattern(name);
    }
    return false;
  }

  /**
   * Get all custom patterns
   */
  public getCustomPatterns(): CustomPattern[] {
    return this.detector.getCustomPatterns();
  }

  /**
   * Clear all custom patterns
   */
  public clearCustomPatterns(): void {
    this.config.customPatterns = [];
    this.detector.clearCustomPatterns();
  }
}
