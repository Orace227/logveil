/**
 * LogVeil - Privacy-first logging utility
 * Masks PII and PHI data before logs are written
 */

// Core exports
export { Masker } from "./core/masker";
export { Detector } from "./core/detectors";
export { MaskingRules } from "./core/rules";

// Type exports
export type {
  MaskingStrategy,
  Environment,
  FieldType,
  FieldMaskingRule,
  EnvironmentMaskingConfig,
  MaskingConfig,
  CreateMaskedLoggerOptions,
  DetectedField,
  MaskingResult,
  DetectionPattern,
  CustomPattern
} from "./core/types";

// Adapter exports
export { createMaskedWinstonLogger, createMaskingFormat } from "./adapters/winston";

// Utility exports
export {
  partialMask,
  fullMask,
  hashMask,
  removeMask,
  applyMaskingStrategy,
  getMaskingStrategy
} from "./core/rules";

export { PII_PATTERNS, PHI_PATTERNS, COMMON_PII_FIELDS, COMMON_PHI_FIELDS } from "./core/detectors";

/**
 * Convenience function to create a masker instance
 */
import { Masker } from "./core/masker";
import { MaskingConfig } from "./core/types";

export function createMasker(config?: MaskingConfig): Masker {
  return new Masker(config);
}

/**
 * Quick mask function for one-off masking
 */
export function mask(data: any, config?: MaskingConfig): any {
  const masker = new Masker(config);
  const result = masker.mask(data);
  return result.masked;
}
