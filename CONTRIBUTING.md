# Contributing to LogVeil

Thank you for your interest in contributing to LogVeil! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a helpful, inclusive community.

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- TypeScript knowledge

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/logveil.git
   cd logveil
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Run tests (when available):
   ```bash
   npm test
   ```

## Development Workflow

### Project Structure

```
src/
├── core/
│   ├── masker.ts      # Main masking engine
│   ├── types.ts       # TypeScript types
│   ├── detectors.ts   # PII/PHI detection
│   └── rules.ts       # Masking strategies
├── adapters/
│   └── winston.ts     # Winston adapter
└── index.ts           # Public API
```

### Making Changes

1. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Build and test:

   ```bash
   npm run build
   node test.js
   ```

4. Commit your changes:

   ```bash
   git commit -m "feat: add new feature"
   ```

5. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

## Code Style

### TypeScript

- Use strict TypeScript (`strict: true`)
- Provide explicit return types for public methods
- Use `interface` for object shapes, `type` for unions
- Avoid `any`; prefer `unknown` with type guards
- Use `readonly` where appropriate

### Example

```typescript
/**
 * Brief description
 *
 * @param data - The data to mask
 * @param config - Configuration options
 * @returns The masked result
 */
export function mask(data: any, config?: MaskingConfig): any {
  const masker = new Masker(config);
  return masker.mask(data).masked;
}
```

### Naming Conventions

- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: prefix with `private`

## Adding Features

### Adding a New Masking Strategy

1. Add type to `MaskingStrategy` in [src/core/types.ts](src/core/types.ts)
2. Implement function in [src/core/rules.ts](src/core/rules.ts)
3. Update `applyMaskingStrategy` switch
4. Add tests
5. Update README

Example:

```typescript
// types.ts
export type MaskingStrategy = 'partial' | 'full' | 'hash' | 'remove' | 'encrypt';

// rules.ts
export function encryptMask(value: any, key: string): string {
  // Implementation
}

// Update applyMaskingStrategy
case 'encrypt':
  return encryptMask(value, hashAlgorithm);
```

### Adding a New Detector Pattern

1. Add to `PII_PATTERNS` or `PHI_PATTERNS` in [src/core/detectors.ts](src/core/detectors.ts)
2. Add field name to `COMMON_PII_FIELDS` or `COMMON_PHI_FIELDS`
3. Update README
4. Add examples

Example:

```typescript
export const PII_PATTERNS: DetectionPattern[] = [
  // ...existing patterns
  {
    name: 'passport',
    pattern: /^[A-Z]{1,2}\d{6,9}$/,
    fieldType: 'pii'
  }
];

export const COMMON_PII_FIELDS = [
  // ...existing fields
  'passport',
  'passportNumber'
];
```

### Creating a New Logger Adapter

1. Create file in `src/adapters/` (e.g., `pino.ts`)
2. Define logger interface
3. Create wrapper function
4. Export from [src/index.ts](src/index.ts)
5. Add usage example to README

Template:

```typescript
import { Masker } from '../core/masker';
import { CreateMaskedLoggerOptions } from '../core/types';

interface PinoLogger {
  info(msg: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
  // ... other methods
}

export function createMaskedPinoLogger(options: CreateMaskedLoggerOptions<PinoLogger>): PinoLogger {
  const { logger, ...maskingConfig } = options;
  const masker = new Masker(maskingConfig);

  // Implement wrapper
  return {
    info(msg: string, ...args: any[]): void {
      const masked = args.map((arg) => (typeof arg === 'object' ? masker.mask(arg).masked : arg));
      logger.info(msg, ...masked);
    }
    // ... other methods
  };
}
```

## Testing

Currently, LogVeil uses manual testing. We welcome contributions for:

- Unit tests (Jest, Mocha, etc.)
- Integration tests
- Performance benchmarks

### Manual Testing

Use the test file:

```bash
node test.js
```

Add new test cases:

```javascript
console.log('✅ Test: Your Feature');
const data = {
  /* test data */
};
const masked = mask(data, {
  /* config */
});
console.log('Result:', masked);
console.log('');
```

## Pull Request Guidelines

### PR Title Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Maintenance

Examples:

- `feat: add bunyan adapter`
- `fix: handle circular references in deep clone`
- `docs: update README with new examples`

### PR Description

Include:

- **What**: What changes did you make?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How did you test it?
- **Breaking Changes**: Any breaking changes?

Template:

```markdown
## What

Added support for Bunyan logger adapter.

## Why

Many users requested Bunyan integration.

## How

Created new adapter in src/adapters/bunyan.ts that wraps Bunyan logger methods.

## Testing

- Tested with Bunyan 1.8.15
- Added manual test case
- Verified masking works with all log levels

## Breaking Changes

None
```

### Checklist

Before submitting:

- [ ] Code follows style guidelines
- [ ] Added JSDoc comments for public APIs
- [ ] Tested manually
- [ ] Updated README if needed
- [ ] Updated CHANGELOG.md
- [ ] No TypeScript errors (`npm run build`)
- [ ] Follows immutability principle

## Reporting Issues

### Bug Reports

Include:

- LogVeil version
- Node.js version
- Minimal reproduction code
- Expected vs actual behavior
- Error messages/stack traces

### Feature Requests

Include:

- Use case
- Proposed API
- Example usage
- Why existing features don't work

## Questions?

- Open a [GitHub Discussion](https://github.com/Orace227/logveil/discussions)
- Check existing [Issues](https://github.com/Orace227/logveil/issues)
- Read the [Usage Guide](USAGE.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LogVeil! 🎉
