# LogVeil

**Privacy-first logging utility that masks PII and PHI data before logs are written.**

LogVeil is a TypeScript library that provides automatic detection and masking of sensitive data in your application logs. It integrates seamlessly with popular logging frameworks like Winston while maintaining zero runtime dependencies for the core masking engine.

## Features

✨ **Automatic PII/PHI Detection** - Detects emails, phone numbers, SSNs, patient IDs, and more  
🔒 **Multiple Masking Strategies** - Partial, full, hash, or remove sensitive fields  
🌍 **Environment-Aware** - Different masking levels for dev, staging, and production  
🎯 **Deep Object Traversal** - Handles nested objects and arrays automatically  
🛡️ **Immutable** - Never mutates your original log objects  
🔌 **Logger-Agnostic Core** - Works with any logging library  
📦 **Zero Dependencies** - Core engine has no external dependencies  
🎨 **Fully Typed** - Complete TypeScript support

## Installation

```bash
npm install logveil
```

For Winston integration:

```bash
npm install logveil winston
```

## Quick Start

### Basic Usage

```typescript
import { mask } from 'logveil';

const data = {
  email: 'john@gmail.com',
  phone: '+919999999999',
  message: 'Hello world'
};

const masked = mask(data);
console.log(masked);
// { email: '<hashed:abc123...>', phone: '********', message: 'Hello world' }
```

### With Winston

```typescript
import winston from 'winston';
import { createMaskedWinstonLogger } from 'logveil';

const baseLogger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  piiFields: ['email', 'phone', 'ssn'],
  phiFields: ['patientId', 'diagnosis', 'medication']
});

logger.info('User created', {
  email: 'john@gmail.com',
  phone: '+919999999999',
  patientId: 'PAT-12345',
  name: 'John Doe' // Not masked
});

// Output:
// {
//   level: 'info',
//   message: 'User created',
//   email: '<hashed:a1b2c3d4...>',
//   phone: '********',
//   patientId: '<hashed:e5f6g7h8...>',
//   name: 'John Doe'
// }
```

## Masking Strategies

LogVeil supports four masking strategies:

### 1. Partial Masking

Shows part of the data (useful for development):

```typescript
email: 'john@gmail.com' → 'jo****@gmail.com'
phone: '+919999999999' → '********9999'
```

### 2. Full Masking

Replaces with asterisks:

```typescript
email: 'john@gmail.com' → '********'
```

### 3. Hash Masking

Creates a SHA-256 hash:

```typescript
email: 'john@gmail.com' → '<hashed:a1b2c3d4e5f6g7h8>'
```

### 4. Remove

Deletes the field entirely:

```typescript
{ email: 'john@gmail.com', name: 'John' } → { name: 'John' }
```

## String Value Masking

LogVeil can detect and mask PII/PHI patterns **within string values** - not just field names!

### The Problem

```typescript
logger.info('User created', {
  description: 'User email is testing@gmail.com and phone is +919999999999'
});
```

The `description` field isn't sensitive, but the **value contains PII**!

### The Solution

```typescript
import { createMasker } from 'logveil';

const masker = createMasker({
  env: 'development',
  maskStringValues: true // Enable value-level masking (default: true)
});

const data = {
  description: 'Contact at john@gmail.com or call +919999999999',
  notes: 'SSN: 123-45-6789, Card: 4532-1234-5678-9010'
};

const result = masker.mask(data);
console.log(result.masked);
```

**Output (development mode):**

```typescript
{
  description: 'Contact at jo****@gmail.com or call ********9999',
  notes: 'SSN: ***-**-****, Card: ****-****-****-9010'
}
```

**Output (production mode):**

```typescript
{
  description: 'Contact at <hashed:a1b2c3d4> or call <hashed:e5f6g7h8>',
  notes: 'SSN: <hashed:ssn>, Card: <hashed:card>'
}
```

### Detected Patterns in Strings

- ✅ Email addresses (`test@example.com`)
- ✅ Phone numbers (`+1-555-1234`, `919999999999`)
- ✅ SSN (`123-45-6789`)
- ✅ Credit card numbers (`4532-1234-5678-9010`)

### Disable if Needed

```typescript
const masker = createMasker({
  maskStringValues: false // Only field-level masking
});
```

## Environment-Based Masking

Different environments can use different strategies:

```typescript
import { createMaskedWinstonLogger } from 'logveil';

const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: process.env.NODE_ENV as 'development' | 'staging' | 'production',
  piiFields: ['email', 'phone']
  // Default mappings:
  // development → partial
  // staging → full
  // production → hash
});
```

Custom environment mappings:

```typescript
const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  piiFields: ['email'],
  piiEnvironmentMapping: {
    development: 'partial',
    staging: 'hash',
    production: 'remove'
  }
});
```

## Configuration

### Core Masker

```typescript
import { Masker } from 'logveil';

const masker = new Masker({
  env: 'production',
  piiFields: ['email', 'phone', 'ssn', /.*password.*/i],
  phiFields: ['patientId', 'diagnosis', 'medicalRecordNumber'],
  detectPII: true, // Auto-detect common PII patterns
  hashAlgorithm: 'sha256',
  preserveStructure: true, // Keep removed fields with '<removed>' placeholder

  // Custom per-field rules
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => {
        // Show last 4 digits only
        const cleaned = value.replace(/\D/g, '');
        return '**** **** **** ' + cleaned.slice(-4);
      }
    }
  ]
});

const result = masker.mask(data);
console.log(result.masked);
console.log(result.fieldsProcessed); // Number of fields masked
console.log(result.detectedFields); // Details of detected fields
```

### Field Patterns

Use RegExp for flexible field matching:

```typescript
const masker = new Masker({
  piiFields: [
    'email',
    /.*password.*/i, // Matches: password, userPassword, PASSWORD
    /^api[_-]?key$/i // Matches: apiKey, api_key, API-KEY
  ]
});
```

## Built-in Detectors

LogVeil automatically detects common patterns:

### PII Patterns

- Email addresses
- Phone numbers (international formats)
- SSNs (123-45-6789)
- Credit cards (1234-5678-9012-3456)
- IPv4 addresses

### PHI Patterns

- Patient IDs (PAT-12345, PT-123)
- Medical record numbers (MRN-12345)
- Health plan IDs (HP-12345)

### Common Field Names

- `email`, `emailAddress`, `phone`, `phoneNumber`
- `ssn`, `socialSecurityNumber`, `password`
- `patientId`, `diagnosis`, `medication`
- `creditCard`, `apiKey`, `token`

## Advanced Usage

### Custom Masking Functions

```typescript
import { createMasker } from 'logveil';

const masker = createMasker({
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => {
        const last4 = value.slice(-4);
        return `**** **** **** ${last4}`;
      }
    },
    {
      field: 'dateOfBirth',
      strategy: 'partial',
      customMask: (value) => {
        // Show only year
        return value.split('-')[0] + '-**-**';
      }
    }
  ]
});
```

### Deep Object Masking

LogVeil automatically handles nested structures:

```typescript
const data = {
  user: {
    profile: {
      email: 'john@gmail.com',
      phone: '+919999999999'
    },
    preferences: {
      theme: 'dark'
    }
  },
  contacts: [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' }
  ]
};

const masked = mask(data, {
  piiFields: ['email', 'phone']
});

// All email fields are masked, regardless of depth
```

### Winston Format Integration

Use as a Winston format for more control:

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

## API Reference

### `mask(data, config?)`

Quick one-off masking function.

**Parameters:**

- `data: any` - Data to mask
- `config?: MaskingConfig` - Optional configuration

**Returns:** Masked data

---

### `createMasker(config?)`

Create a reusable masker instance.

**Parameters:**

- `config?: MaskingConfig` - Configuration options

**Returns:** `Masker` instance

---

### `createMaskedWinstonLogger(options)`

Create a Winston logger with automatic masking.

**Parameters:**

- `options.logger` - Winston logger instance
- `options.env?` - Environment ('development' | 'staging' | 'production')
- `options.piiFields?` - Array of PII field names/patterns
- `options.phiFields?` - Array of PHI field names/patterns
- `options.maskingRules?` - Custom masking rules
- `options.detectPII?` - Enable auto-detection (default: true)

**Returns:** Masked logger instance

---

### `MaskingConfig`

```typescript
interface MaskingConfig {
  env?: 'development' | 'staging' | 'production';
  piiFields?: Array<string | RegExp>;
  phiFields?: Array<string | RegExp>;
  maskingRules?: FieldMaskingRule[];
  piiEnvironmentMapping?: EnvironmentMaskingConfig;
  phiEnvironmentMapping?: EnvironmentMaskingConfig;
  detectPII?: boolean;
  hashAlgorithm?: string;
  preserveStructure?: boolean;
}
```

## Examples

### Example 1: Healthcare Application

```typescript
import { createMaskedWinstonLogger } from 'logveil';
import winston from 'winston';

const logger = createMaskedWinstonLogger({
  logger: winston.createLogger({
    transports: [new winston.transports.File({ filename: 'app.log' })]
  }),
  env: 'production',
  phiFields: ['patientId', 'medicalRecordNumber', 'diagnosis', 'medication', 'labResults'],
  piiFields: ['email', 'phone', 'ssn', 'address']
});

logger.info('Patient record accessed', {
  patientId: 'PAT-12345',
  diagnosis: 'Hypertension',
  email: 'patient@email.com',
  accessedBy: 'Dr. Smith' // Not masked
});
```

### Example 2: E-commerce Platform

```typescript
import { createMasker } from 'logveil';

const masker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone', 'address'],
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => {
        const last4 = value.slice(-4);
        return `****-****-****-${last4}`;
      }
    }
  ]
});

app.post('/checkout', (req, res) => {
  const result = masker.mask(req.body);
  logger.info('Checkout initiated', result.masked);
});
```

### Example 3: Development Mode

```typescript
const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'development',
  piiFields: ['email', 'phone'],
  piiEnvironmentMapping: {
    development: 'partial' // Show partial data in dev for debugging
  }
});

logger.debug('User login', {
  email: 'developer@company.com', // → 'de****@company.com'
  loginTime: new Date()
});
```

## Best Practices

1. **Configure fields explicitly** - Don't rely solely on auto-detection
2. **Use environment variables** - `env: process.env.NODE_ENV`
3. **Test masking rules** - Verify sensitive data is properly masked
4. **Review logs regularly** - Ensure no PII/PHI leaks through
5. **Use hash in production** - Irreversible masking for production logs
6. **Combine with access controls** - Logging is one layer of security

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
