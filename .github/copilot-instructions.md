# GitHub Copilot Instructions for LogVeil

## Project Overview

LogVeil is a privacy-first logging utility that automatically masks PII (Personally Identifiable Information) and PHI (Protected Health Information) data before logs are written. The library is written in TypeScript and designed to be logger-agnostic with adapters for popular logging frameworks.

## Architecture

### Core Modules

- **`src/core/masker.ts`** - Main masking engine with deep object traversal
- **`src/core/types.ts`** - TypeScript type definitions
- **`src/core/detectors.ts`** - PII/PHI pattern detection
- **`src/core/rules.ts`** - Masking strategy rules engine
- **`src/adapters/winston.ts`** - Winston logger adapter
- **`src/index.ts`** - Public API exports

### Key Principles

1. **Immutability** - Never mutate original objects; always return clones
2. **Type Safety** - Maintain strict TypeScript typing throughout
3. **Zero Dependencies** - Core engine has no external dependencies
4. **Extensibility** - Easy to add new adapters and detectors
5. **Performance** - Efficient deep cloning and traversal

## Code Style Guidelines

### TypeScript

- Use strict mode (`strict: true` in tsconfig)
- Prefer `interface` for object shapes, `type` for unions/aliases
- Always provide explicit return types for public methods
- Use `readonly` where appropriate to enforce immutability
- Avoid `any`; use `unknown` and type guards when needed

### Naming Conventions

- Classes: `PascalCase` (e.g., `Masker`, `Detector`)
- Functions: `camelCase` (e.g., `createMasker`, `applyMaskingStrategy`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `PII_PATTERNS`, `DEFAULT_PII_ENVIRONMENT_MAPPING`)
- Private members: prefix with `private` keyword, use `camelCase`

### Comments

- Use JSDoc comments for all public APIs
- Include `@param`, `@returns`, and description
- Add inline comments for complex logic
- Document patterns and edge cases

### Code Style Enforcement

- **ESLint** is configured for both JavaScript and TypeScript
- Run `npm run lint` to check for style violations
- Run `npm run lint:fix` to automatically fix issues
- All code must pass ESLint checks before committing
- **No emojis** in code files - use text equivalents like `[PASS]`, `[FAIL]`, `[OK]`
- Follow configured ESLint rules:
  - Indent: 2 spaces
  - Quotes: Single quotes for strings
  - Semi: Always use semicolons
  - No trailing spaces
  - No unused variables

## Common Patterns

### Adding a New Masking Strategy

1. Update `MaskingStrategy` type in `src/core/types.ts`
2. Add implementation function in `src/core/rules.ts`
3. Update `applyMaskingStrategy` switch statement
4. Add tests and documentation

### Adding a New Detector Pattern

1. Add pattern to `PII_PATTERNS` or `PHI_PATTERNS` in `src/core/detectors.ts`
2. Follow existing pattern structure: `{ name, pattern, fieldType }`
3. Add field name to `COMMON_PII_FIELDS` or `COMMON_PHI_FIELDS` if applicable
4. Update README with new detection capability

### Creating a New Logger Adapter

1. Create new file in `src/adapters/` (e.g., `bunyan.ts`)
2. Define minimal logger interface type
3. Create wrapper function that instantiates `Masker`
4. Proxy all logging methods to mask metadata
5. Export from `src/index.ts`
6. Add usage example to README

### Handling Nested Objects

- Always use `deepClone` before mutating
- Recursively process arrays and objects
- Track path for error reporting (e.g., `user.profile.email`)
- Handle circular references if needed (currently not implemented)

## Testing Scenarios

When adding features, consider these test cases:

- ✅ Primitives (strings, numbers, booleans)
- ✅ Nested objects (3+ levels deep)
- ✅ Arrays of objects
- ✅ Mixed arrays (primitives and objects)
- ✅ null and undefined values
- ✅ RegExp field patterns
- ✅ Custom masking functions
- ✅ Environment-based strategy selection
- ✅ Field detection (by name and value)
- ✅ Immutability (original object unchanged)

## Security Considerations

### What to Mask

- Email addresses, phone numbers, SSNs
- Credit card numbers, API keys, tokens
- Patient IDs, medical records, diagnoses
- IP addresses, physical addresses
- Dates of birth, biometric data

### What NOT to Mask

- Log levels, timestamps, correlation IDs
- Application state (non-user data)
- Error codes, stack traces (unless they contain PII)
- Metric names, feature flags

### Best Practices

- Default to more aggressive masking in production
- Use `hash` strategy for data that needs consistency
- Use `remove` for highly sensitive data
- Always test with real-world-like data samples
- Document any new sensitive field patterns

## Performance Guidelines

### Optimization Tips

- Cache compiled RegExp patterns
- Avoid unnecessary cloning (check if masking needed first)
- Use Set/Map for O(1) field lookups instead of arrays
- Profile deep object traversal for large objects
- Consider lazy evaluation for expensive operations

### Current Performance Characteristics

- Deep cloning: O(n) where n = total object size
- Field matching: O(1) for string fields, O(m) for m RegExp patterns
- Masking: O(1) per field

## Breaking Changes Policy

When making changes that affect the public API:

1. Increment major version
2. Add deprecation warnings in previous version
3. Update CHANGELOG.md with migration guide
4. Provide backward compatibility when possible
5. Document in README under "Breaking Changes" section

## Examples for Common Tasks

### Example: Adding a new built-in field

```typescript
// In src/core/detectors.ts
export const COMMON_PII_FIELDS = [
  // ...existing fields
  "passportNumber" // Add new field
];
```

### Example: Adding a custom hash algorithm

```typescript
// In src/core/rules.ts
export function hashMask(value: any, algorithm: string = "sha256"): string {
  // Support multiple algorithms
  const hash = crypto.createHash(algorithm).update(stringValue).digest("hex");
  return `<hashed:${hash.substring(0, 16)}>`;
}
```

### Example: Supporting a new logger

```typescript
// In src/adapters/pino.ts
import { Masker } from "../core/masker";
import { CreateMaskedLoggerOptions } from "../core/types";

export function createMaskedPinoLogger(options: CreateMaskedLoggerOptions<PinoLogger>): PinoLogger {
  const { logger, ...maskingConfig } = options;
  const masker = new Masker(maskingConfig);

  // Implement masking wrapper...
}
```

## Dependencies

### Runtime

- Node.js >= 14.0.0
- No external dependencies (core)

### Peer Dependencies

- winston >= 3.0.0 (optional)

### Dev Dependencies

- typescript >= 5.0.0
- @types/node >= 20.0.0

## Build and Development

### Commands

- `npm run build` - Compile TypeScript to dist/
- `npm run dev` - Watch mode compilation
- `npm test` - Run tests (when implemented)

### Output

- Compiled code: `dist/`
- Type declarations: `dist/*.d.ts`
- Source maps: `dist/*.map.js`

## Documentation Standards

### README Updates

- Add new features to "Features" section
- Update "API Reference" for new public APIs
- Add practical examples to "Examples" section
- Update "Configuration" for new config options

### Code Documentation

````typescript
/**
 * Brief one-line description
 *
 * Longer description with details about the function's purpose,
 * edge cases, and any important notes.
 *
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional parameter)
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = functionName('value');
 * console.log(result); // Expected output
 * ```
 */
export function functionName(paramName: string, optionalParam?: number): ReturnType {
  // Implementation
}
````

## Common Issues and Solutions

### Issue: Field not being masked

**Check:**

1. Is field name in `piiFields` or `phiFields`?
2. Is `detectPII` enabled for auto-detection?
3. Does field pattern match (case-sensitive for RegExp)?
4. Is masking rule configured correctly?

### Issue: Original object being mutated

**Check:**

1. Using `deepClone` before mutations?
2. Returning new object, not modified input?
3. Arrays are mapped, not modified in place?

### Issue: Performance degradation

**Check:**

1. Object size (very large objects may be slow)
2. Number of RegExp patterns (optimize with Set for strings)
3. Depth of nesting (consider iterative approach for very deep objects)

## Future Enhancements (v2+)

Potential features to consider:

- Async masking for large datasets
- Streaming support
- Circular reference handling
- Reversible masking with encryption keys
- Cloud storage adapters
- Log aggregation service integrations
- Performance benchmarks
- Browser support (isomorphic package)

## Questions?

When uncertain about implementation:

1. Check existing patterns in codebase
2. Refer to TypeScript strict mode rules
3. Prioritize immutability and type safety
4. Add comprehensive JSDoc comments
5. Consider backward compatibility
