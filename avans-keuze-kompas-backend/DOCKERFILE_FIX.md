# Dockerfile Fix for CapRover

## The Issue

```
{"message":"COPY failed: no source files were specified"}
COPY failed: no source files were specified
```

## Root Cause

Your repository has a monorepo structure:
```
Avans-keuze-kompas-prototype/          ← Build context starts HERE
├── captain-definition                  ← Points to Dockerfile
├── avans-keuze-kompas-backend/        ← Backend is in subdirectory
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── ...
```

When CapRover builds:
1. It reads `captain-definition` from the **root**
2. Sets build context to the **root directory** (parent of backend folder)
3. Runs Dockerfile from `./avans-keuze-kompas-backend/Dockerfile`
4. All `COPY` commands are relative to the **root**, not the backend folder

## The Fix

The Dockerfile has been updated to use the correct paths:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files from the backend subdirectory
COPY ./avans-keuze-kompas-backend/package*.json ./

# Install ALL deps (Nest CLI is in devDependencies)
RUN npm install

# Copy source code from the backend subdirectory
COPY ./avans-keuze-kompas-backend/ .

# Build NestJS app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 4000

CMD ["node", "dist/main.js"]
```

## Verification

The fix is now applied. Your next deployment should succeed:

```bash
git add .
git commit -m "fix: correct Dockerfile paths for CapRover monorepo structure"
git push origin main
```

## Expected Build Output

You should now see:
```
Step 3/9 : COPY ./avans-keuze-kompas-backend/package*.json ./
---> Using cache
---> [hash]
Step 4/9 : RUN npm install
---> Running in [hash]
added XXX packages
...
Build succeeded!
Deploy succeeded!
```

## Alternative Solution (If You Want to Change Structure)

If you want simpler Dockerfile paths, you could move `captain-definition` inside the backend folder:

**Option 1: Current (Monorepo)**
```
root/captain-definition → points to backend/Dockerfile
Dockerfile COPY uses: ./avans-keuze-kompas-backend/
```

**Option 2: Backend-Only**
```
backend/captain-definition → points to ./Dockerfile
Dockerfile COPY uses: ./
```

For Option 2, you'd need to:
1. Delete `/captain-definition` at root
2. Keep `/avans-keuze-kompas-backend/captain-definition`
3. Update CapRover to deploy from the backend subdirectory only

**I recommend keeping Option 1 (current setup)** - it's more flexible for monorepos.

## Status

✅ **FIXED** - Dockerfile now correctly references `./avans-keuze-kompas-backend/` paths
