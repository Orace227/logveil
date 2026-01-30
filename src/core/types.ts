/**
 * Masking strategy types
 */
export type MaskingStrategy = 'partial' | 'full' | 'hash' | 'remove';

/**
 * Environment types that determine default masking behavior
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Field types for classification
 */
export type FieldType = 'pii' | 'phi' | 'custom';

/**
 * Configuration for individual field masking
 */
export interface FieldMaskingRule {
  /**
   * The field name or pattern to match
   */
  field: string | RegExp;

  /**
   * Masking strategy to apply
   */
  strategy: MaskingStrategy;

  /**
   * Optional custom masking function
   */
  customMask?: (value: any) => any;
}

/**
 * Environment-specific masking strategy mapping
 */
export interface EnvironmentMaskingConfig {
  development?: MaskingStrategy;
  staging?: MaskingStrategy;
  production?: MaskingStrategy;
}

/**
 * Main configuration for the masking engine
 */
export interface MaskingConfig {
  /**
   * Current environment
   */
  env?: Environment;

  /**
   * List of PII field names or patterns
   */
  piiFields?: Array<string | RegExp>;

  /**
   * List of PHI field names or patterns
   */
  phiFields?: Array<string | RegExp>;

  /**
   * Custom field-specific masking rules (overrides defaults)
   */
  maskingRules?: FieldMaskingRule[];

  /**
   * Environment-to-strategy mapping for PII fields
   */
  piiEnvironmentMapping?: EnvironmentMaskingConfig;

  /**
   * Environment-to-strategy mapping for PHI fields
   */
  phiEnvironmentMapping?: EnvironmentMaskingConfig;

  /**
   * Enable automatic PII detection using pattern matching
   */
  detectPII?: boolean;

  /**
   * Enable masking of PII/PHI patterns within string values
   * When enabled, scans string values for embedded sensitive data
   * Example: "Contact me at john@email.com" → "Contact me at jo****@email.com"
   */
  maskStringValues?: boolean;

  /**
   * Custom hash algorithm (default: sha256)
   */
  hashAlgorithm?: string;

  /**
   * Preserve field structure (use placeholder instead of removing)
   */
  preserveStructure?: boolean;
}

/**
 * Options for creating a masked logger
 */
export interface CreateMaskedLoggerOptions<T = any> extends MaskingConfig {
  /**
   * The underlying logger instance (e.g., winston logger)
   */
  logger: T;
}

/**
 * Detected field information
 */
export interface DetectedField {
  path: string;
  type: FieldType;
  value: any;
  strategy: MaskingStrategy;
}

/**
 * Result of masking operation
 */
export interface MaskingResult {
  masked: any;
  fieldsProcessed: number;
  detectedFields?: DetectedField[];
}

/**
 * Pattern detection rule
 */
export interface DetectionPattern {
  name: string;
  pattern: RegExp;
  fieldType: FieldType;
}
