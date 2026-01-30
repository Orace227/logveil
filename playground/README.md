# LogVeil Playground

An interactive web playground to test and explore LogVeil's PII/PHI masking capabilities in real-time.

## Features

- **Interactive Playground**: Test LogVeil with custom JSON input and configuration
- **Pre-built Examples**: Explore common use cases with working code samples
- **Real-time Masking**: See results instantly as you modify configuration
- **Multiple Strategies**: Test partial, full, hash, and remove masking strategies
- **Environment Simulation**: Compare development vs production masking behavior

## Getting Started

### Installation

From the playground directory:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
npm start
```

## Playground Features

### Interactive Mode

1. **Configure Settings**: Choose environment, masking strategies, and options
2. **Edit Input**: Modify the JSON input with your test data
3. **View Output**: See masked results in real-time
4. **Copy Results**: Copy masked JSON for use in your projects

### Examples Gallery

Browse and run pre-configured examples:

- Basic PII masking (email, phone, SSN)
- Healthcare data (PHI) masking
- Custom field rules
- Nested object masking
- String value pattern detection
- Environment-based strategies

## Using LogVeil in Your Project

After testing in the playground, integrate LogVeil into your project:

```bash
npm install logveil
```

```typescript
import { Masker } from "logveil";

const masker = new Masker({
  env: "production",
  detectPII: true,
  maskStringValues: true
});

const masked = masker.mask(yourData);
```

## Documentation

For full documentation, visit the [main README](../README.md) or check out:

- [Usage Guide](../USAGE.md)
- [Quick Reference](../QUICK_REFERENCE.md)
- [Contributing](../CONTRIBUTING.md)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## License

MIT
