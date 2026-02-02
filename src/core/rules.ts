import * as crypto from "crypto";
import { MaskingStrategy, FieldMaskingRule, Environment, FieldType } from "./types";

/**
 * Default environment-to-strategy mappings
 */
export const DEFAULT_PII_ENVIRONMENT_MAPPING = {
  development: "partial" as MaskingStrategy,
  staging: "full" as MaskingStrategy,
  production: "hash" as MaskingStrategy
};

export const DEFAULT_PHI_ENVIRONMENT_MAPPING = {
  development: "full" as MaskingStrategy,
  staging: "full" as MaskingStrategy,
  production: "hash" as MaskingStrategy
};

/**
 * Apply partial masking to a string value
 */
export function partialMask(value: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return "********";
  }

  // Email handling
  if (value.includes("@")) {
    const [localPart, domain] = value.split("@");
    const visibleChars = Math.min(2, Math.floor(localPart.length / 3));
    const maskedLocal = localPart.substring(0, visibleChars) + "****";
    return `${maskedLocal}@${domain}`;
  }

  // Phone number handling
  if (/^[\+\-\(\)\s\d]+$/.test(value)) {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) {
      const lastFour = digits.slice(-4);
      return "*".repeat(digits.length - 4) + lastFour;
    }
  }

  // Generic string - show first 2 chars
  const visibleChars = Math.min(2, Math.floor(value.length / 3));
  return value.substring(0, visibleChars) + "****";
}

/**
 * Apply full masking
 */
export function fullMask(_value: any): string {
  return "********";
}

/**
 * Apply hash masking using SHA-256
 */
export function hashMask(value: any, algorithm: string = "sha256"): string {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const hash = crypto.createHash(algorithm).update(stringValue).digest("hex");
  return `<hashed:${hash.substring(0, 16)}>`;
}

/**
 * Remove field (returns undefined for removal)
 */
export function removeMask(): undefined {
  return undefined;
}

/**
 * Apply masking strategy to a value
 */
export function applyMaskingStrategy(
  value: any,
  strategy: MaskingStrategy,
  hashAlgorithm: string = "sha256"
): any {
  switch (strategy) {
    case "partial":
      return typeof value === "string" ? partialMask(value) : fullMask(value);
    case "full":
      return fullMask(value);
    case "hash":
      return hashMask(value, hashAlgorithm);
    case "remove":
      return removeMask();
    default:
      return fullMask(value);
  }
}

/**
 * Determine masking strategy based on environment and field type
 */
export function getMaskingStrategy(
  fieldType: FieldType,
  env: Environment,
  customPIIMapping?: Record<string, MaskingStrategy>,
  customPHIMapping?: Record<string, MaskingStrategy>
): MaskingStrategy {
  if (fieldType === "phi") {
    const mapping = customPHIMapping || DEFAULT_PHI_ENVIRONMENT_MAPPING;
    return mapping[env] || DEFAULT_PHI_ENVIRONMENT_MAPPING[env];
  }

  if (fieldType === "pii") {
    const mapping = customPIIMapping || DEFAULT_PII_ENVIRONMENT_MAPPING;
    return mapping[env] || DEFAULT_PII_ENVIRONMENT_MAPPING[env];
  }

  // Default for custom fields
  return "full";
}

/**
 * Rules engine for managing field masking rules
 */
export class MaskingRules {
  private rules: FieldMaskingRule[];
  private env: Environment;
  private hashAlgorithm: string;
  private piiMapping: Record<string, MaskingStrategy>;
  private phiMapping: Record<string, MaskingStrategy>;

  constructor(
    rules: FieldMaskingRule[] = [],
    env: Environment = "production",
    hashAlgorithm: string = "sha256",
    piiMapping?: Record<string, MaskingStrategy>,
    phiMapping?: Record<string, MaskingStrategy>
  ) {
    this.rules = rules;
    this.env = env;
    this.hashAlgorithm = hashAlgorithm;
    this.piiMapping = piiMapping || DEFAULT_PII_ENVIRONMENT_MAPPING;
    this.phiMapping = phiMapping || DEFAULT_PHI_ENVIRONMENT_MAPPING;
  }

  /**
   * Find matching rule for a field
   */
  public findRule(fieldName: string): FieldMaskingRule | null {
    for (const rule of this.rules) {
      if (typeof rule.field === "string") {
        if (rule.field.toLowerCase() === fieldName.toLowerCase()) {
          return rule;
        }
      } else if (rule.field instanceof RegExp) {
        if (rule.field.test(fieldName)) {
          return rule;
        }
      }
    }
    return null;
  }

  /**
   * Get masking strategy for a field
   */
  public getStrategy(fieldName: string, fieldType?: FieldType): MaskingStrategy {
    // Check for custom rule first
    const rule = this.findRule(fieldName);
    if (rule) {
      return rule.strategy;
    }

    // Use environment-based strategy
    if (fieldType) {
      return getMaskingStrategy(fieldType, this.env, this.piiMapping, this.phiMapping);
    }

    // Default
    return "full";
  }

  /**
   * Mask a value according to rules
   */
  public maskValue(fieldName: string, value: any, fieldType?: FieldType): any {
    const rule = this.findRule(fieldName);

    // Use custom masking function if provided
    if (rule?.customMask) {
      return rule.customMask(value);
    }

    const strategy = this.getStrategy(fieldName, fieldType);
    return applyMaskingStrategy(value, strategy, this.hashAlgorithm);
  }

  /**
   * Add a new rule
   */
  public addRule(rule: FieldMaskingRule): void {
    this.rules.push(rule);
  }

  /**
   * Get all rules
   */
  public getRules(): FieldMaskingRule[] {
    return [...this.rules];
  }

  /**
   * Apply a specific masking strategy to a value (for custom patterns)
   */
  public applyCustomStrategy(value: any, strategy: MaskingStrategy, hashAlgorithm?: string): any {
    return applyMaskingStrategy(value, strategy, hashAlgorithm || this.hashAlgorithm);
  }
}
