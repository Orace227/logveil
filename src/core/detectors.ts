import { DetectionPattern, FieldType, CustomPattern } from "./types";

/**
 * Built-in PII detection patterns
 */
export const PII_PATTERNS: DetectionPattern[] = [
  {
    name: "email",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    fieldType: "pii"
  },
  {
    name: "phone",
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    fieldType: "pii"
  },
  {
    name: "ssn",
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    fieldType: "pii"
  },
  {
    name: "creditCard",
    pattern: /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/,
    fieldType: "pii"
  },
  {
    name: "ipv4",
    pattern:
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    fieldType: "pii"
  }
];

/**
 * Built-in PHI detection patterns
 */
export const PHI_PATTERNS: DetectionPattern[] = [
  {
    name: "patientId",
    pattern: /^(PAT|PT|PATIENT)[-_]?\d+$/i,
    fieldType: "phi"
  },
  {
    name: "medicalRecordNumber",
    pattern: /^(MRN|MR)[-_]?\d+$/i,
    fieldType: "phi"
  },
  {
    name: "healthPlanId",
    pattern: /^(HP|HEALTH)[-_]?\d+$/i,
    fieldType: "phi"
  }
];

/**
 * Common PII field names
 */
export const COMMON_PII_FIELDS = [
  "email",
  "emailAddress",
  "phone",
  "phoneNumber",
  "mobile",
  "ssn",
  "socialSecurityNumber",
  "creditCard",
  "cardNumber",
  "password",
  "secret",
  "token",
  "apiKey",
  "accessToken",
  "refreshToken",
  "address",
  "streetAddress",
  "zipCode",
  "postalCode",
  "dateOfBirth",
  "dob",
  "birthDate",
  "ipAddress",
  "ip"
];

/**
 * Common PHI field names
 */
export const COMMON_PHI_FIELDS = [
  "patientId",
  "patientName",
  "medicalRecordNumber",
  "mrn",
  "diagnosis",
  "medication",
  "prescription",
  "healthPlanId",
  "insuranceId",
  "treatmentPlan",
  "labResults",
  "vitalSigns",
  "allergies"
];

/**
 * Detector class for identifying PII/PHI in data
 */
export class Detector {
  private piiPatterns: DetectionPattern[];
  private phiPatterns: DetectionPattern[];
  private customPatterns: CustomPattern[];

  constructor(customPatterns: CustomPattern[] = []) {
    this.piiPatterns = [...PII_PATTERNS];
    this.phiPatterns = [...PHI_PATTERNS];
    this.customPatterns = [...customPatterns];
  }

  /**
   * Check if a field name matches common PII patterns
   */
  public isPIIFieldName(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return COMMON_PII_FIELDS.some((piiField) => {
      const pattern = new RegExp(`\\b${piiField.toLowerCase()}\\b`);
      return pattern.test(lowerFieldName);
    });
  }

  /**
   * Check if a field name matches common PHI patterns
   */
  public isPHIFieldName(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return COMMON_PHI_FIELDS.some((phiField) => {
      const pattern = new RegExp(`\\b${phiField.toLowerCase()}\\b`);
      return pattern.test(lowerFieldName);
    });
  }

  /**
   * Detect if a value matches PII patterns
   */
  public detectPIIValue(value: any): DetectionPattern | null {
    if (typeof value !== "string") {
      return null;
    }

    for (const pattern of this.piiPatterns) {
      if (pattern.pattern.test(value)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Detect if a value matches PHI patterns
   */
  public detectPHIValue(value: any): DetectionPattern | null {
    if (typeof value !== "string") {
      return null;
    }

    for (const pattern of this.phiPatterns) {
      if (pattern.pattern.test(value)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Detect if a value matches custom patterns
   */
  public detectCustomValue(value: any): CustomPattern | null {
    if (typeof value !== "string") {
      return null;
    }

    for (const pattern of this.customPatterns) {
      if (pattern.pattern.test(value)) {
        return pattern;
      }
    }

    return null;
  }
  /**
   * Detect if a value exactly matches custom patterns (for field-level detection)
   */
  public detectExactCustomValue(value: any): CustomPattern | null {
    if (typeof value !== "string") {
      return null;
    }

    for (const pattern of this.customPatterns) {
      // Only return if the entire value matches the pattern exactly
      if (
        pattern.pattern.test(value) &&
        pattern.pattern.test(value.trim()) &&
        value.trim().match(pattern.pattern)?.[0] === value.trim()
      ) {
        return pattern;
      }
    }

    return null;
  }
  /**
   * Detect field type based on name and value
   */
  public detectFieldType(fieldName: string, value: any): FieldType | null {
    // Check field name first
    if (this.isPHIFieldName(fieldName)) {
      return "phi";
    }
    if (this.isPIIFieldName(fieldName)) {
      return "pii";
    }

    // Check custom patterns first (user-defined take precedence)
    const customPattern = this.detectCustomValue(value);
    if (customPattern) {
      return customPattern.fieldType;
    }

    // Check value patterns
    const phiPattern = this.detectPHIValue(value);
    if (phiPattern) {
      return "phi";
    }

    const piiPattern = this.detectPIIValue(value);
    if (piiPattern) {
      return "pii";
    }

    return null;
  }

  /**
   * Get the custom pattern that matches a given value (exact match for field context)
   */
  public getMatchingCustomPattern(value: any): CustomPattern | null {
    return this.detectExactCustomValue(value);
  }

  /**
   * Add custom PII pattern
   */
  public addPIIPattern(pattern: DetectionPattern): void {
    this.piiPatterns.push(pattern);
  }

  /**
   * Add custom PHI pattern
   */
  public addPHIPattern(pattern: DetectionPattern): void {
    this.phiPatterns.push(pattern);
  }

  /**
   * Add a custom pattern for detection
   */
  public addCustomPattern(pattern: CustomPattern): void {
    // Validate pattern name is unique
    const existingPattern = this.customPatterns.find((p) => p.name === pattern.name);
    if (existingPattern) {
      throw new Error(`Custom pattern with name '${pattern.name}' already exists`);
    }

    this.customPatterns.push(pattern);
  }

  /**
   * Remove a custom pattern by name
   */
  public removeCustomPattern(name: string): boolean {
    const index = this.customPatterns.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.customPatterns.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all custom patterns
   */
  public getCustomPatterns(): CustomPattern[] {
    return [...this.customPatterns];
  }

  /**
   * Clear all custom patterns
   */
  public clearCustomPatterns(): void {
    this.customPatterns = [];
  }

  /**
   * Mask PII/PHI patterns found within a string value
   * Example: "Email: test@gmail.com" → "Email: t****@gmail.com"
   *
   * @param value - The string to scan and mask
   * @param strategy - Masking strategy to apply
   * @returns Masked string with PII/PHI patterns replaced
   */
  public maskStringValue(value: string, strategy: "partial" | "full" | "hash" = "partial"): string {
    if (typeof value !== "string" || value.length === 0) {
      return value;
    }

    let maskedValue = value;

    // Check custom patterns first (user-defined patterns take precedence)
    for (const customPattern of this.customPatterns) {
      // Remove start/end anchors for string context matching and add word boundaries if not present
      let patternSource = customPattern.pattern.source;

      // Remove start and end anchors as they prevent matching embedded patterns
      if (patternSource.startsWith("^")) {
        patternSource = patternSource.slice(1);
      }
      if (patternSource.endsWith("$")) {
        patternSource = patternSource.slice(0, -1);
      }

      // Add word boundaries if the pattern doesn't already have boundaries
      if (!patternSource.startsWith("\\\\b") && !patternSource.startsWith("\\\\W")) {
        patternSource = "\\b" + patternSource;
      }
      if (!patternSource.endsWith("\\\\b") && !patternSource.endsWith("\\\\W")) {
        patternSource = patternSource + "\\b";
      }

      const globalPattern = new RegExp(patternSource, customPattern.pattern.flags + "g");

      maskedValue = maskedValue.replace(globalPattern, (matchedText) => {
        if (customPattern.customMask) {
          return customPattern.customMask(matchedText);
        } else if (customPattern.maskingStrategy) {
          return this.applyMaskingToMatch(matchedText, customPattern.maskingStrategy);
        } else {
          return this.applyMaskingToMatch(matchedText, strategy);
        }
      });
    }

    // Pattern for finding emails in text (more lenient than exact match)
    const emailInTextPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    maskedValue = maskedValue.replace(emailInTextPattern, (email) => {
      if (strategy === "full") return "********";
      if (strategy === "hash") {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256").update(email).digest("hex");
        return `<hashed:${hash.substring(0, 16)}>`;
      }
      // Partial masking
      const [local, domain] = email.split("@");
      const visibleChars = Math.min(2, Math.floor(local.length / 3));
      return `${local.substring(0, visibleChars)}****@${domain}`;
    });

    // Pattern for finding phone numbers in text
    const phoneInTextPattern =
      /\b[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{4,}\b/g;
    maskedValue = maskedValue.replace(phoneInTextPattern, (phone) => {
      if (strategy === "full") return "********";
      if (strategy === "hash") {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256").update(phone).digest("hex");
        return `<hashed:${hash.substring(0, 16)}>`;
      }
      // Partial masking - show last 4 digits
      const digits = phone.replace(/\D/g, "");
      if (digits.length >= 4) {
        return "*".repeat(phone.length - 4) + phone.slice(-4);
      }
      return "********";
    });

    // Pattern for SSN in text
    const ssnInTextPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    maskedValue = maskedValue.replace(ssnInTextPattern, () => {
      if (strategy === "partial") return "***-**-****";
      if (strategy === "hash") return "<hashed:ssn>";
      return "***-**-****";
    });

    // Pattern for credit cards in text
    const creditCardPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    maskedValue = maskedValue.replace(creditCardPattern, (cc) => {
      if (strategy === "partial") {
        const last4 = cc.slice(-4);
        return `****-****-****-${last4}`;
      }
      if (strategy === "hash") return "<hashed:card>";
      return "****-****-****-****";
    });

    return maskedValue;
  }

  /**
   * Apply masking strategy to a matched string
   */
  private applyMaskingToMatch(
    value: string,
    strategy: "partial" | "full" | "hash" | "remove"
  ): string {
    switch (strategy) {
      case "full":
        return "********";
      case "hash": {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256").update(value).digest("hex");
        return `<hashed:${hash.substring(0, 16)}>`;
      }
      case "remove":
        return "<removed>";
      case "partial":
      default: {
        // Generic partial masking - show first 2 chars
        const visibleChars = Math.min(2, Math.floor(value.length / 3));
        return value.substring(0, visibleChars) + "****";
      }
    }
  }
}
