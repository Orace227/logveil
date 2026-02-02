# Release and Publishing Automation Guide

This guide explains how to set up and use the automated release and publishing system for LogVeil.

## 🚀 Overview

The automation system provides:

1. **Automatic releases** when you push version tags (v1.2.0, v2.0.0, etc.)
2. **Manual releases** through GitHub Actions interface
3. **NPM publishing** with provenance attestation
4. **GitHub releases** with auto-generated release notes
5. **Comprehensive testing** before any release

## 📋 Prerequisites

### 1. NPM Token Setup

You need to create an NPM automation token and add it to GitHub secrets:

1. **Create NPM Token:**

   ```bash
   npm login
   npm token create --type automation --cidr-whitelist 0.0.0.0/0
   ```

2. **Add to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token
   - Click "Add secret"

### 2. GitHub Token (Automatic)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions - no setup needed.

## 🎯 How to Release

### Method 1: Automatic Release (Recommended)

This is the preferred method for regular releases:

1. **Make your changes** and test locally
2. **Update version and create tag:**

   ```bash
   # For patch releases (1.2.0 → 1.2.1)
   npm run release:patch

   # For minor releases (1.2.0 → 1.3.0)
   npm run release:minor

   # For major releases (1.2.0 → 2.0.0)
   npm run release:major
   ```

3. **That's it!** The automation will:
   - Run all tests and quality checks
   - Create a GitHub release with auto-generated notes
   - Publish to NPM with provenance
   - Notify you of success/failure

### Method 2: Manual Release

For special cases or when you need more control:

1. **Go to GitHub Actions tab** in your repository
2. **Click "Manual Release"** workflow
3. **Click "Run workflow"** button
4. **Fill in the form:**
   - Version: e.g., `1.3.0`
   - Release type: `patch`, `minor`, or `major`
   - Create tag: ✅ (usually yes)
   - Publish to NPM: ✅ (usually yes)
5. **Click "Run workflow"**

## 🔄 Workflow Details

### Automatic Release Workflow (`release-and-publish.yml`)

**Triggers:** When you push a version tag (v*.*.\*)

**Steps:**

1. **Test Job:**
   - Install dependencies
   - Build project
   - Run all tests (unit + custom pattern tests)
   - Run linting and formatting checks
   - Security audit

2. **GitHub Release Job:**
   - Extract version from git tag
   - Extract changelog for the version
   - Create GitHub release with notes
   - Auto-generate additional release notes

3. **NPM Publish Job:**
   - Build and verify package
   - Publish to NPM with provenance
   - Provide success notification

### Manual Release Workflow (`manual-release.yml`)

**Triggers:** Manual execution from GitHub Actions UI

**Steps:**

1. **Prepare Release:**
   - Update package.json version
   - Run full test suite
   - Commit version bump
   - Create and push git tag

2. **Create Release:**
   - Create GitHub release
   - Optionally publish to NPM
   - Provide completion summary

## 📝 Scripts Reference

### Release Scripts

```bash
# Quick release commands
npm run release:patch    # 1.2.0 → 1.2.1
npm run release:minor    # 1.2.0 → 1.3.0
npm run release:major    # 1.2.0 → 2.0.0

# Quality check (runs before every release)
npm run release:check    # Build + test + lint + format + audit

# Development scripts
npm run build           # Build TypeScript
npm run test:all        # Run all tests
npm run lint           # Check code style
npm run format         # Format code
```

### Pre-release Hooks

The `preversion` hook automatically runs quality checks before creating any version tag:

```json
{
  "scripts": {
    "preversion": "npm run release:check"
  }
}
```

## 🛡️ Security & Quality

### Automated Checks

Every release includes:

- ✅ **Full test suite** (unit + custom pattern tests)
- ✅ **Code linting** with ESLint
- ✅ **Code formatting** with Prettier
- ✅ **Security audit** for vulnerabilities
- ✅ **Build verification**
- ✅ **Package content verification**

### NPM Provenance

The workflow uses `--provenance` flag for NPM publishing, which:

- Links the package to its source code
- Provides cryptographic verification
- Improves security and trust
- Shows build environment details

## 🐛 Troubleshooting

### Common Issues

**1. NPM Token Invalid**

```
Error: This command requires you to be logged in to npm...
```

- Check that `NPM_TOKEN` secret is set correctly
- Verify token has not expired
- Ensure token has proper permissions

**2. Version Already Exists**

```
Error: Cannot publish over the previously published version...
```

- Check if version already exists on NPM
- Increment version number appropriately
- Use `npm view logveil versions --json` to see published versions

**3. Tests Failing**

```
Error: Process completed with exit code 1
```

- Check the "Test" job logs for specific failures
- Run tests locally: `npm run test:all`
- Fix issues and retry release

**4. GitHub Release Failed**

```
Error: Resource not accessible by integration
```

- Ensure repository has correct permissions
- Check that `GITHUB_TOKEN` has required scopes

### Manual Verification

Before releasing, you can manually verify:

```bash
# Check current version
npm version --no-git-tag-version

# Verify package contents
npm pack --dry-run

# Test build and publish process
npm run prepublishOnly

# Check what would be published
npm publish --dry-run
```

## 🔍 Monitoring

### GitHub Actions

Monitor your releases at:

- `https://github.com/Orace227/logveil/actions`

### NPM Package

Check published packages at:

- `https://www.npmjs.com/package/logveil`

### Release History

View all releases at:

- `https://github.com/Orace227/logveil/releases`

## 📈 Best Practices

### 1. Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (x.y.Z): Bug fixes, no breaking changes
- **Minor** (x.Y.z): New features, backward compatible
- **Major** (X.y.z): Breaking changes

### 2. Changelog Management

Keep [CHANGELOG.md](../CHANGELOG.md) updated:

- Add new entries for each release
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Include migration guides for breaking changes

### 3. Testing Strategy

Before releases:

- Test all new features thoroughly
- Run comprehensive test suite
- Test with different Node.js versions if needed
- Verify examples still work

### 4. Release Notes

Good release notes include:

- **What's new:** Features and improvements
- **What's fixed:** Bug fixes and patches
- **Breaking changes:** API changes requiring updates
- **Migration guide:** How to upgrade

## 🎉 Success!

Once set up, your release workflow will be:

1. **Develop** → Make changes
2. **Test** → `npm run test:all`
3. **Release** → `npm run release:patch`
4. **Automatic** → GitHub + NPM publishing

The automation handles all the complex steps, ensuring consistent, reliable releases every time!
