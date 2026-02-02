# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-02-02

### Changed

- **GitHub Actions Automation** - Added comprehensive release and publishing automation
  - Automatic GitHub releases when version tags are pushed
  - Automated NPM publishing with provenance attestation
  - Quality gates with full test suite, linting, and security audits
  - Manual release workflow option for special cases
  - Enhanced release scripts and documentation

## [1.2.0] - 2026-02-02

### Added

- **Custom Pattern Matching** - Major new feature allowing users to define custom regex patterns for domain-specific sensitive data
  - `CustomPattern` interface with support for custom regex patterns, field types, and masking strategies
  - Optional custom masking functions for specialized masking logic
  - Runtime pattern management: `addCustomPattern()`, `removeCustomPattern()`, `clearCustomPatterns()`
  - Custom patterns work in both field-level detection and string value scanning
  - Support for 'pii', 'phi', and 'custom' field types
  - Environment-based strategy defaults when `maskingStrategy` is omitted
  - Complete TypeScript support with proper exports

### Fixed

- **Field Name Detection Bug** - Fixed false positives where field names containing PII keywords were incorrectly flagged
  - Example: "description" was flagged as PII because it contains "ip"
  - Now uses word boundaries for accurate field name matching
  - Affects fields like "subscription", "transcription", etc.
- **String Value Masking for Custom Patterns** - Fixed custom patterns not working in embedded string contexts
  - Custom patterns with anchors (^...$) now correctly match embedded values
  - Example: "The ID ABC123 is working" now masks only "ABC123" instead of the entire string

### Changed

- Updated field name detection to use word boundaries instead of simple string inclusion
- Enhanced string value masking to properly handle custom patterns with start/end anchors
- Improved pattern detection precedence: exact field matches vs embedded pattern matches

## [1.1.0] - 2026-01-30

### Added

- **Value-Level Masking** - New feature to detect and mask PII/PHI patterns within string values
  - Automatically scans string content for emails, phone numbers, SSNs, and credit cards
  - Configurable via `maskStringValues` option (default: `true`)
  - Works independently from field-level masking
  - Example: `"Contact at john@email.com"` → `"Contact at jo****@email.com"`
- New `maskStringValue()` method in `Detector` class
- Support for masking embedded PII in natural language text

### Changed

- Default behavior now includes value-level masking (can be disabled with `maskStringValues: false`)
- Enhanced security coverage - catches PII in both field names AND field values

### Technical Details

- Email pattern detection in strings: `/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g`
- Phone number pattern: `/\b[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{4,}\b/g`
- SSN pattern: `/\b\d{3}-\d{2}-\d{4}\b/g`
- Credit card pattern: `/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g`

## [1.0.0] - 2026-01-30

### Added

- Core masking engine with deep object traversal
- Support for four masking strategies: partial, full, hash, remove
- Automatic PII/PHI detection using pattern matching
- Environment-based masking configuration (development, staging, production)
- Winston logger adapter
- Built-in detection patterns for:
  - PII: email, phone, SSN, credit cards, IP addresses
  - PHI: patient IDs, medical record numbers, health plan IDs
- Custom masking rules with field-specific strategies
- RegExp support for field pattern matching
- Immutable masking (original objects never mutated)
- Zero runtime dependencies for core engine
- Full TypeScript support with strict type checking
- Comprehensive documentation and examples

### Features

- `createMasker()` - Create reusable masker instances
- `mask()` - Quick one-off masking function
- `createMaskedWinstonLogger()` - Winston integration
- `Detector` class for PII/PHI pattern detection
- `MaskingRules` engine for flexible rule management
- Deep cloning to ensure immutability
- Hash masking with SHA-256 (configurable)
- Partial masking with smart formatting (emails, phones)
- Custom masking functions per field
- Detailed masking results with field tracking

### Configuration Options

- `env` - Environment setting (development/staging/production)
- `piiFields` - Array of PII field names or RegExp patterns
- `phiFields` - Array of PHI field names or RegExp patterns
- `maskingRules` - Custom field-specific masking rules
- `detectPII` - Enable/disable automatic PII detection
- `hashAlgorithm` - Hash algorithm for hash masking (default: sha256)
- `preserveStructure` - Keep removed fields with placeholder
- `piiEnvironmentMapping` - Custom PII strategy per environment
- `phiEnvironmentMapping` - Custom PHI strategy per environment

[1.0.0]: https://github.com/Orace227/logveil/releases/tag/v1.0.0
