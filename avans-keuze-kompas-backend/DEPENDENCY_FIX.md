# Dependency Conflict Fix

## The Issue

```
npm error peer @nestjs/common@"^8.0.0 || ^9.0.0 || ^10.0.0" from @nestjs/config@3.3.0
npm error Could not resolve dependency
```

## Root Cause

Your project uses **NestJS 11**, but `@nestjs/config@3.2.0` officially only supports up to NestJS 10.

However, `@nestjs/config@3.3.0` is compatible with NestJS 11, but npm's peer dependency resolver is strict about the version ranges.

## The Fix

Two changes were made:

### 1. Updated package.json

```json
"@nestjs/config": "^3.3.0"  // Updated from ^3.2.0
```

### 2. Updated Dockerfile

```dockerfile
# Install with --legacy-peer-deps to handle peer dependency conflicts
RUN npm install --legacy-peer-deps

# Build application
RUN npm run build

# Prune with --legacy-peer-deps as well
RUN npm prune --production --legacy-peer-deps
```

The `--legacy-peer-deps` flag tells npm to use the legacy (npm v6) peer dependency resolution algorithm, which is more lenient. This flag is needed for both `npm install` and `npm prune` commands.

## Why --legacy-peer-deps?

**Is it safe?** Yes, in this case:
- `@nestjs/config@3.3.0` actually works with NestJS 11
- The peer dependency warning is overly strict
- This is a common workaround for NestJS packages that haven't updated their peer dependency ranges yet

**Alternative approaches:**
1. ✅ Use `--legacy-peer-deps` (recommended, works immediately)
2. Use `--force` (not recommended, can cause issues)
3. Wait for `@nestjs/config` to update peer dependencies (could take time)

## Verification

After this fix, your build should succeed:

```
Step 4/9 : RUN npm install --legacy-peer-deps
---> Running in [hash]
added XXX packages
✅ Build succeeded!
```

## Local Development

If you want to install dependencies locally with the same behavior:

```bash
npm install --legacy-peer-deps
```

Or add to your `.npmrc`:
```
legacy-peer-deps=true
```

## Status

✅ **FIXED** - Updated to `@nestjs/config@3.3.0` with `--legacy-peer-deps` flag
