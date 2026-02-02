# LogVeil Quick Reference

## Installation

```bash
npm install logveil
```

## Import

```typescript
// ES6/TypeScript
import { mask, createMasker, createMaskedWinstonLogger } from "logveil";

// CommonJS
const { mask, createMasker, createMaskedWinstonLogger } = require("logveil");
```

## Quick Masking

```typescript
const masked = mask(data, { env: "production", piiFields: ["email"] });
```

## Reusable Masker

```typescript
const masker = createMasker({
  env: "production",
  piiFields: ["email", "phone"],
  phiFields: ["patientId"]
});

const result = masker.mask(data);
console.log(result.masked);
```

## Winston Integration

```typescript
const logger = createMaskedWinstonLogger({
  logger: winstonLogger,
  env: "production",
  piiFields: ["email", "phone"]
});

logger.info("Message", { email: "test@example.com" });
```

## Masking Strategies

| Strategy  | Output             | Use Case        |
| --------- | ------------------ | --------------- |
| `partial` | `jo****@gmail.com` | Development     |
| `full`    | `********`         | Staging         |
| `hash`    | `<hashed:abc123>`  | Production      |
| `remove`  | Field deleted      | Ultra-sensitive |

## Configuration Options

```typescript
{
  env: 'production',                    // Environment
  piiFields: ['email', 'phone'],        // PII fields
  phiFields: ['patientId'],             // PHI fields
  detectPII: true,                      // Auto-detect
  hashAlgorithm: 'sha256',              // Hash algorithm
  preserveStructure: true,              // Keep removed fields
  maskingRules: [                       // Custom rules
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => '****' + value.slice(-4)
    }
  ],
  piiEnvironmentMapping: {              // Environment mapping
    development: 'partial',
    staging: 'full',
    production: 'hash'
  }
}
```

## RegExp Patterns

```typescript
piiFields: [
  /.*password.*/i, // Matches: password, PASSWORD, userPassword
  /^api[_-]?key$/i, // Matches: apiKey, api_key, API-KEY
  /token$/i // Matches: authToken, accessToken
];
```

## Custom Masking

```typescript
maskingRules: [
  {
    field: "creditCard",
    strategy: "partial",
    customMask: (value) => {
      const last4 = value.slice(-4);
      return `****-****-****-${last4}`;
    }
  }
];
```

## Built-in Detectors

### PII Fields

- email, phone, ssn, creditCard
- password, apiKey, token
- address, ipAddress

### PHI Fields

- patientId, diagnosis, medication
- medicalRecordNumber, healthPlanId

## Environment Defaults

| Environment | PII Strategy | PHI Strategy |
| ----------- | ------------ | ------------ |
| development | partial      | full         |
| staging     | full         | full         |
| production  | hash         | hash         |

## Common Patterns

### Healthcare App

```typescript
createMasker({
  env: "production",
  phiFields: ["patientId", "diagnosis", "medication"],
  piiFields: ["email", "phone", "ssn"]
});
```

### E-commerce

```typescript
createMasker({
  env: "production",
  piiFields: ["email", "phone"],
  maskingRules: [{ field: /credit.*card/i, strategy: "remove" }]
});
```

### API Service

```typescript
createMasker({
  env: "production",
  piiFields: [/.*password.*/i, /.*key$/i, /.*token$/i]
});
```

## Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode
npm test           # Run tests
```

## API Methods

### `mask(data, config?)`

Quick one-off masking.

### `createMasker(config?)`

Create reusable masker instance.

### `createMaskedWinstonLogger(options)`

Create masked Winston logger.

### `masker.mask(data)`

Mask data and get results.

### `masker.updateConfig(config)`

Update masker configuration.

### `masker.getConfig()`

Get current configuration.

## TypeScript Types

```typescript
import type {
  MaskingConfig,
  MaskingStrategy,
  Environment,
  FieldMaskingRule,
  MaskingResult
} from "logveil";
```

## Examples Location

- `examples/basic-usage.ts` - Core masker examples
- `examples/winston-example.ts` - Winston integration
- `test.js` - Quick verification tests

## Documentation

- [README.md](README.md) - Main documentation
- [USAGE.md](USAGE.md) - Detailed usage guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

## Support

- GitHub: https://github.com/Orace227/logveil
- Issues: https://github.com/Orace227/logveil/issues

---

**Version**: 1.0.0  
**License**: MIT  
**Node**: >= 14.0.0
