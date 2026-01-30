import { DetectionPattern, FieldType } from './types';

/**
 * Built-in PII detection patterns
 */
export const PII_PATTERNS: DetectionPattern[] = [
  {
    name: 'email',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    fieldType: 'pii'
  },
  {
    name: 'phone',
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    fieldType: 'pii'
  },
  {
    name: 'ssn',
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    fieldType: 'pii'
  },
  {
    name: 'creditCard',
    pattern: /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/,
    fieldType: 'pii'
  },
  {
    name: 'ipv4',
    pattern:
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    fieldType: 'pii'
  }
];

/**
 * Built-in PHI detection patterns
 */
export const PHI_PATTERNS: DetectionPattern[] = [
  {
    name: 'patientId',
    pattern: /^(PAT|PT|PATIENT)[-_]?\d+$/i,
    fieldType: 'phi'
  },
  {
    name: 'medicalRecordNumber',
    pattern: /^(MRN|MR)[-_]?\d+$/i,
    fieldType: 'phi'
  },
  {
    name: 'healthPlanId',
    pattern: /^(HP|HEALTH)[-_]?\d+$/i,
    fieldType: 'phi'
  }
];

/**
 * Common PII field names
 */
export const COMMON_PII_FIELDS = [
  'email',
  'emailAddress',
  'phone',
  'phoneNumber',
  'mobile',
  'ssn',
  'socialSecurityNumber',
  'creditCard',
  'cardNumber',
  'password',
  'secret',
  'token',
  'apiKey',
  'accessToken',
  'refreshToken',
  'address',
  'streetAddress',
  'zipCode',
  'postalCode',
  'dateOfBirth',
  'dob',
  'birthDate',
  'ipAddress',
  'ip'
];

/**
 * Common PHI field names
 */
export const COMMON_PHI_FIELDS = [
  'patientId',
  'patientName',
  'medicalRecordNumber',
  'mrn',
  'diagnosis',
  'medication',
  'prescription',
  'healthPlanId',
  'insuranceId',
  'treatmentPlan',
  'labResults',
  'vitalSigns',
  'allergies'
];

/**
 * Detector class for identifying PII/PHI in data
 */
export class Detector {
  private piiPatterns: DetectionPattern[];
  private phiPatterns: DetectionPattern[];

  constructor() {
    this.piiPatterns = [...PII_PATTERNS];
    this.phiPatterns = [...PHI_PATTERNS];
  }

  /**
   * Check if a field name matches common PII patterns
   */
  public isPIIFieldName(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return COMMON_PII_FIELDS.some((piiField) => lowerFieldName.includes(piiField.toLowerCase()));
  }

  /**
   * Check if a field name matches common PHI patterns
   */
  public isPHIFieldName(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return COMMON_PHI_FIELDS.some((phiField) => lowerFieldName.includes(phiField.toLowerCase()));
  }

  /**
   * Detect if a value matches PII patterns
   */
  public detectPIIValue(value: any): DetectionPattern | null {
    if (typeof value !== 'string') {
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
    if (typeof value !== 'string') {
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
   * Detect field type based on name and value
   */
  public detectFieldType(fieldName: string, value: any): FieldType | null {
    // Check field name first
    if (this.isPHIFieldName(fieldName)) {
      return 'phi';
    }
    if (this.isPIIFieldName(fieldName)) {
      return 'pii';
    }

    // Check value patterns
    const phiPattern = this.detectPHIValue(value);
    if (phiPattern) {
      return 'phi';
    }

    const piiPattern = this.detectPIIValue(value);
    if (piiPattern) {
      return 'pii';
    }

    return null;
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
   * Mask PII/PHI patterns found within a string value
   * Example: "Email: test@gmail.com" → "Email: t****@gmail.com"
   *
   * @param value - The string to scan and mask
   * @param strategy - Masking strategy to apply
   * @returns Masked string with PII/PHI patterns replaced
   */
  public maskStringValue(value: string, strategy: 'partial' | 'full' | 'hash' = 'partial'): string {
    if (typeof value !== 'string' || value.length === 0) {
      return value;
    }

    let maskedValue = value;

    // Pattern for finding emails in text (more lenient than exact match)
    const emailInTextPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    maskedValue = maskedValue.replace(emailInTextPattern, (email) => {
      if (strategy === 'full') return '********';
      if (strategy === 'hash') {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(email).digest('hex');
        return `<hashed:${hash.substring(0, 16)}>`;
      }
      // Partial masking
      const [local, domain] = email.split('@');
      const visibleChars = Math.min(2, Math.floor(local.length / 3));
      return `${local.substring(0, visibleChars)}****@${domain}`;
    });

    // Pattern for finding phone numbers in text
    const phoneInTextPattern =
      /\b[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{4,}\b/g;
    maskedValue = maskedValue.replace(phoneInTextPattern, (phone) => {
      if (strategy === 'full') return '********';
      if (strategy === 'hash') {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(phone).digest('hex');
        return `<hashed:${hash.substring(0, 16)}>`;
      }
      // Partial masking - show last 4 digits
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 4) {
        return '*'.repeat(phone.length - 4) + phone.slice(-4);
      }
      return '********';
    });

    // Pattern for SSN in text
    const ssnInTextPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    maskedValue = maskedValue.replace(ssnInTextPattern, () => {
      if (strategy === 'partial') return '***-**-****';
      if (strategy === 'hash') return '<hashed:ssn>';
      return '***-**-****';
    });

    // Pattern for credit cards in text
    const creditCardPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    maskedValue = maskedValue.replace(creditCardPattern, (cc) => {
      if (strategy === 'partial') {
        const last4 = cc.slice(-4);
        return `****-****-****-${last4}`;
      }
      if (strategy === 'hash') return '<hashed:card>';
      return '****-****-****-****';
    });

    return maskedValue;
  }
}
