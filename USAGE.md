# LogVeil Usage Guide

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Configuration](#configuration)
5. [Winston Integration](#winston-integration)
6. [Advanced Usage](#advanced-usage)
7. [Best Practices](#best-practices)

## Installation

```bash
npm install logveil
```

For Winston support:

```bash
npm install logveil winston
```

## Quick Start

### Option 1: Quick Masking Function

```typescript
import { mask } from 'logveil';

const data = { email: 'user@example.com', name: 'John' };
const masked = mask(data, {
  env: 'production',
  piiFields: ['email']
});

console.log(masked);
// { email: '<hashed:abc123...>', name: 'John' }
```

### Option 2: Reusable Masker

```typescript
import { createMasker } from 'logveil';

const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone'],
  detectPII: true
});

const result = masker.mask(userData);
console.log(result.masked);
console.log(`Processed ${result.fieldsProcessed} fields`);
```

## Core Concepts

### Masking Strategies

#### 1. Partial Masking

Best for **development** - shows enough data for debugging while hiding sensitive parts.

```typescript
email: 'john@gmail.com' → 'jo****@gmail.com'
phone: '+1-555-1234' → '********1234'
```

#### 2. Full Masking

Best for **staging** - completely hides the value.

```typescript
email: 'john@gmail.com' → '********'
phone: '+1-555-1234' → '********'
```

#### 3. Hash Masking

Best for **production** - creates consistent hash for correlation.

```typescript
email: 'john@gmail.com' → '<hashed:a1b2c3d4e5f6g7h8>'
// Same input always produces same hash
```

#### 4. Remove

For ultra-sensitive data - deletes the field completely.

```typescript
{ email: 'john@gmail.com', name: 'John' }
→ { name: 'John' }
// Or with preserveStructure: true
→ { email: '<removed>', name: 'John' }
```

### Field Detection

#### Explicit Fields

```typescript
const masker = createMasker({
  piiFields: ['email', 'phone', 'ssn'],
  phiFields: ['patientId', 'diagnosis']
});
```

#### Pattern Matching (RegExp)

```typescript
const masker = createMasker({
  piiFields: [
    /.*password.*/i, // userPassword, PASSWORD, etc.
    /^api[_-]?key$/i, // apiKey, api_key, API-KEY
    /token$/i // authToken, accessToken, etc.
  ]
});
```

#### Auto-Detection

```typescript
const masker = createMasker({
  detectPII: true // Automatically finds emails, phones, SSNs, etc.
});
```

## Configuration

### Environment Configuration

```typescript
import { createMasker } from 'logveil';

const masker = createMasker({
  env: process.env.NODE_ENV as 'development' | 'staging' | 'production',

  // PII fields (Personally Identifiable Information)
  piiFields: ['email', 'phone', 'ssn', 'creditCard', /.*password.*/i],

  // PHI fields (Protected Health Information)
  phiFields: ['patientId', 'diagnosis', 'medication', 'medicalRecordNumber'],

  // Enable auto-detection
  detectPII: true,

  // Hash algorithm
  hashAlgorithm: 'sha256',

  // Keep removed fields with placeholder
  preserveStructure: true
});
```

### Custom Environment Mapping

```typescript
const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone'],

  // Custom strategy per environment
  piiEnvironmentMapping: {
    development: 'partial', // Show partial data in dev
    staging: 'full', // Hide completely in staging
    production: 'remove' // Delete in production
  }
});
```

### Custom Masking Rules

```typescript
const masker = createMasker({
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => {
        const last4 = value.slice(-4);
        return `****-****-****-${last4}`;
      }
    },
    {
      field: 'dateOfBirth',
      strategy: 'partial',
      customMask: (value) => {
        const year = value.split('-')[0];
        return `${year}-**-**`;
      }
    },
    {
      field: 'sensitiveData',
      strategy: 'remove' // Delete completely
    }
  ]
});
```

## Winston Integration

### Method 1: Wrapper Function

```typescript
import winston from 'winston';
import { createMaskedWinstonLogger } from 'logveil';

const baseLogger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  piiFields: ['email', 'phone'],
  phiFields: ['patientId', 'diagnosis']
});

// Use like normal Winston logger
logger.info('User action', {
  email: 'user@example.com', // Will be masked
  action: 'login' // Won't be masked
});
```

### Method 2: Winston Format

```typescript
import winston from 'winston';
import { createMaskingFormat } from 'logveil';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    createMaskingFormat({
      env: 'production',
      piiFields: ['email', 'phone']
    }) as any,
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
```

## Advanced Usage

### Deep Object Masking

LogVeil automatically traverses nested objects:

```typescript
const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone']
});

const data = {
  user: {
    profile: {
      email: 'user@example.com',
      settings: {
        phone: '+1-555-1234'
      }
    }
  },
  metadata: {
    timestamp: '2026-01-30'
  }
};

const result = masker.mask(data);
// All email and phone fields are masked, regardless of depth
```

### Array Handling

```typescript
const data = {
  users: [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' }
  ]
};

const masked = mask(data, {
  env: 'production',
  piiFields: ['email']
});

// Both emails in the array are masked
```

### Detailed Results

```typescript
const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone']
});

const result = masker.mask(userData);

console.log(result.masked); // The masked data
console.log(result.fieldsProcessed); // Number of fields masked
console.log(result.detectedFields); // Array of detected field details

// Each detected field contains:
// - path: 'user.profile.email'
// - type: 'pii' | 'phi' | 'custom'
// - value: original value
// - strategy: 'partial' | 'full' | 'hash' | 'remove'
```

### Update Configuration Dynamically

```typescript
const masker = createMasker({
  env: 'development',
  piiFields: ['email']
});

// Later, update configuration
masker.updateConfig({
  env: 'production',
  piiFields: ['email', 'phone', 'ssn']
});
```

## Best Practices

### 1. Environment Variables

```typescript
const masker = createMasker({
  env: (process.env.NODE_ENV || 'production') as Environment,
  piiFields: process.env.PII_FIELDS?.split(',') || ['email', 'phone']
});
```

### 2. Centralized Configuration

```typescript
// config/logging.ts
export const LOGGING_CONFIG = {
  env: process.env.NODE_ENV as Environment,
  piiFields: ['email', 'phone', 'ssn', 'creditCard'],
  phiFields: ['patientId', 'diagnosis', 'medication'],
  detectPII: true,
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial' as const,
      customMask: (value: string) => {
        const last4 = value.slice(-4);
        return `****-****-****-${last4}`;
      }
    }
  ]
};

// app.ts
import { LOGGING_CONFIG } from './config/logging';
const masker = createMasker(LOGGING_CONFIG);
```

### 3. Type Safety

```typescript
import { MaskingConfig, Environment } from 'logveil';

const config: MaskingConfig = {
  env: 'production',
  piiFields: ['email', 'phone'],
  detectPII: true
};

const masker = createMasker(config);
```

### 4. Testing Masking

```typescript
// test/masking.test.ts
import { mask } from 'logveil';

describe('Data Masking', () => {
  it('should mask email in production', () => {
    const data = { email: 'test@example.com' };
    const masked = mask(data, {
      env: 'production',
      piiFields: ['email']
    });

    expect(masked.email).not.toBe('test@example.com');
    expect(masked.email).toContain('<hashed:');
  });

  it('should preserve non-sensitive data', () => {
    const data = { email: 'test@example.com', id: '123' };
    const masked = mask(data, {
      env: 'production',
      piiFields: ['email']
    });

    expect(masked.id).toBe('123');
  });
});
```

### 5. Logging Strategy per Environment

```typescript
const getLogger = () => {
  const env = process.env.NODE_ENV;

  if (env === 'development') {
    return createMaskedWinstonLogger({
      logger: baseLogger,
      env: 'development',
      piiFields: ['password', 'apiKey'], // Only mask secrets
      piiEnvironmentMapping: {
        development: 'partial' // Show partial data for debugging
      }
    });
  }

  return createMaskedWinstonLogger({
    logger: baseLogger,
    env: 'production',
    piiFields: ['email', 'phone', 'ssn', 'password', 'apiKey'],
    phiFields: ['patientId', 'diagnosis', 'medication'],
    piiEnvironmentMapping: {
      production: 'hash' // Hash for production
    }
  });
};

export const logger = getLogger();
```

### 6. Compliance Checklist

- ✅ All PII fields are configured
- ✅ All PHI fields are configured (if applicable)
- ✅ Production uses `hash` or `remove` strategy
- ✅ Test logs to verify masking works
- ✅ Review logs regularly for leaks
- ✅ Document all custom masking rules
- ✅ Use environment-based configuration
- ✅ Never log sensitive data in error messages

## Common Use Cases

### Healthcare Application (HIPAA Compliance)

```typescript
const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  phiFields: [
    'patientId',
    'medicalRecordNumber',
    'diagnosis',
    'medication',
    'labResults',
    'treatmentPlan'
  ],
  piiFields: ['email', 'phone', 'ssn', 'address'],
  phiEnvironmentMapping: {
    development: 'full',
    staging: 'hash',
    production: 'remove' // Delete PHI in production logs
  }
});
```

### E-commerce Platform (PCI DSS Compliance)

```typescript
const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone', 'address'],
  maskingRules: [
    {
      field: /credit.*card/i,
      strategy: 'remove' // Never log credit cards
    },
    {
      field: 'cvv',
      strategy: 'remove' // Never log CVV
    }
  ]
});
```

### Financial Services

```typescript
const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  piiFields: ['ssn', 'accountNumber', 'routingNumber', 'taxId'],
  piiEnvironmentMapping: {
    production: 'hash'
  },
  hashAlgorithm: 'sha256'
});
```

## Troubleshooting

### Field Not Being Masked

1. Check field name matches exactly (case-insensitive for strings)
2. Enable `detectPII: true` for auto-detection
3. Verify field is in `piiFields` or `phiFields`
4. Check RegExp patterns if using patterns

### Performance Issues

1. Reduce number of RegExp patterns
2. Use string field names instead of RegExp when possible
3. Consider disabling `detectPII` if not needed
4. Mask only when needed (e.g., before external logging)

### Original Object Being Mutated

This should never happen - LogVeil uses deep cloning. If it does:

1. File a bug report
2. Check you're using latest version
3. Verify your custom masking functions don't mutate

## Need Help?

- 📖 [Full Documentation](https://github.com/Orace227/logveil)
- 🐛 [Report Issues](https://github.com/Orace227/logveil/issues)
- 💬 [Discussions](https://github.com/Orace227/logveil/discussions)
