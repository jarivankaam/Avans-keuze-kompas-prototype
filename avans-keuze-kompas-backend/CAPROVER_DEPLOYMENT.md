# CapRover Deployment Guide

This guide explains how to deploy the Avans Keuze Kompas Backend to CapRover with the new environment-based configuration.

## ✅ Compatibility

**Yes, the new configuration system is fully compatible with CapRover!**

The environment variables will be:
1. Set in CapRover's App Config
2. Available to your Docker container at runtime
3. Loaded by NestJS ConfigModule on application startup

---

## CapRover Setup

### 1. Set Environment Variables in CapRover

Log into your CapRover dashboard and navigate to your app:

1. Go to **Apps** → **Your App Name** → **App Configs**
2. Scroll to **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `DATABASE_URL` | `mongodb+srv://user:pass@...` | Your MongoDB connection string |
| `JWT_SECRET` | `your-secure-32-char-secret` | Generate with crypto (see below) |
| `JWT_EXPIRATION` | `1d` | Optional, defaults to 1d |
| `PORT` | `4000` | Optional, defaults to 4000 |
| `NODE_ENV` | `production` | Set to production |
| `CORS_ORIGIN` | `https://your-frontend.example.com` | Your frontend URL |
| `N8N_WEBHOOK_URL` | `https://n8n.example.com/webhook/xxx` | Your N8n webhook |

4. Click **Save & Update** (CapRover will restart your app)

---

### 2. Generate Secure JWT Secret

On your local machine:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the `JWT_SECRET` value in CapRover.

---

### 3. Deployment Methods

#### Option A: GitHub Webhook (Recommended)

**Setup:**
1. In CapRover, go to your app → **Deployment** tab
2. Find the **Method 3: Deploy from Github/Bitbucket/Gitlab**
3. Copy your webhook URL (looks like: `https://captain.your-domain.com/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=xxx`)

**In GitHub:**
1. Go to your repo → **Settings** → **Webhooks** → **Add webhook**
2. Paste the CapRover webhook URL
3. Set Content type: `application/json`
4. Select **Just the push event**
5. Click **Add webhook**

**Result:** Every push to your branch will auto-deploy to CapRover! 🎉

---

#### Option B: Manual Deployment via CLI

Install CapRover CLI:
```bash
npm install -g caprover
```

Deploy:
```bash
caprover deploy
```

---

#### Option C: Git Push Deployment

Link your app:
```bash
caprover deploy
# Follow prompts to link your app
```

Then deploy with git:
```bash
git push caprover main
```

---

### 4. Using GitHub Actions + CapRover

You can also use the GitHub Actions workflow to trigger CapRover deployments.

**Update `.github/workflows/ci-cd.yml`:**

Replace the deploy job with:

```yaml
deploy:
  needs: build-and-test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to CapRover
      uses: caprover/deploy-from-github@v1.0.1
      with:
        server: '${{ secrets.CAPROVER_SERVER }}'
        app: '${{ secrets.CAPROVER_APP_NAME }}'
        token: '${{ secrets.CAPROVER_APP_TOKEN }}'
```

**Required GitHub Secrets:**
- `CAPROVER_SERVER` - Your CapRover URL (e.g., `https://captain.your-domain.com`)
- `CAPROVER_APP_NAME` - Your app name in CapRover
- `CAPROVER_APP_TOKEN` - Your CapRover app token

---

## Environment Variables in CapRover

### How It Works

1. **You set variables in CapRover UI** → App Configs → Environment Variables
2. **CapRover injects them into your Docker container** at runtime
3. **NestJS ConfigModule reads them** from `process.env`
4. **Joi validates them** on application startup
5. **App uses them** via `ConfigService`

### No .env File Needed in Production

❌ **Don't include `.env` in your Docker image**
✅ **Set all variables in CapRover UI**

The `.env` file is for local development only and is already excluded by `.gitignore`.

---

## Dockerfile Explanation

Your Dockerfile is set up correctly for your repository structure:

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

**Key points:**
- ✅ The `captain-definition` at the root points to `./avans-keuze-kompas-backend/Dockerfile`
- ✅ The Docker build context is the parent directory (project root)
- ✅ COPY commands use `./avans-keuze-kompas-backend/` to access backend files
- ✅ No `.env` file is copied (excluded by `.gitignore`)
- ✅ Exposes port 4000 (configurable via `PORT` env var)
- ✅ Runs the built production code
- ✅ Environment variables come from CapRover at runtime

**Repository Structure:**
```
Avans-keuze-kompas-prototype/          (CapRover build context starts here)
├── captain-definition                  (Points to Dockerfile below)
├── avans-keuze-kompas-backend/
│   ├── Dockerfile                      (Build instructions)
│   ├── package.json                    (Dependencies)
│   ├── src/                            (Source code)
│   └── ...
└── ...
```

---

## Deployment Checklist

Before deploying:

- [ ] Set all required environment variables in CapRover
- [ ] Generated and set a secure `JWT_SECRET` (32+ chars)
- [ ] Updated `CORS_ORIGIN` to your production frontend URL
- [ ] Verified `DATABASE_URL` points to production MongoDB
- [ ] Set `NODE_ENV=production`
- [ ] Configured CapRover webhook in GitHub (if using auto-deploy)
- [ ] Tested the build locally with `npm run build`

---

## Testing Your Deployment

### 1. Check CapRover Logs

In CapRover dashboard:
1. Go to your app
2. Click **App Logs** tab
3. Look for:
   ```
   Application is running on: http://localhost:4000
   ```

### 2. Verify Environment Variables Loaded

If there's an issue with environment variables, you'll see validation errors:

```
Error: "DATABASE_URL" is required
Error: "JWT_SECRET" must be at least 32 characters long
```

Fix by updating the environment variables in CapRover.

### 3. Test API Endpoints

```bash
curl https://your-app.your-domain.com/health
```

### 4. Test CORS

From your frontend:
```javascript
fetch('https://your-app.your-domain.com/api/endpoint')
  .then(res => res.json())
  .then(console.log);
```

---

## Updating Environment Variables

To change environment variables after deployment:

1. Go to CapRover → Your App → **App Configs**
2. Update the environment variable values
3. Click **Save & Update**
4. CapRover will restart your app with new values

**No redeployment needed!** Just update and restart.

---

## Troubleshooting

### "DATABASE_URL is required" Error

**Cause:** Environment variable not set in CapRover
**Fix:** Add `DATABASE_URL` in App Configs → Environment Variables

### "JWT_SECRET must be at least 32 characters long"

**Cause:** JWT_SECRET is too short or not set
**Fix:** Generate a secure secret and add it to CapRover:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS Errors

**Cause:** `CORS_ORIGIN` doesn't match your frontend URL
**Fix:**
- Ensure `CORS_ORIGIN` in CapRover matches exactly: `https://your-frontend.com`
- Include protocol (`https://`)
- Don't include trailing slash
- Restart the app after changing

### App Crashes on Startup

**Check CapRover logs for:**
- Joi validation errors (missing/invalid env vars)
- MongoDB connection errors (check `DATABASE_URL`)
- Port conflicts (ensure `PORT` is 4000 or matches CapRover config)

### N8n Webhook Not Working

**Verify:**
- `N8N_WEBHOOK_URL` is set correctly in CapRover
- The webhook URL is accessible from your CapRover server
- Test with curl:
  ```bash
  curl -X POST https://n8n.example.com/webhook/xxx -d '{"test":"data"}'
  ```

---

## GitHub Webhook + CapRover Flow

```
┌─────────────────────────────────────────────┐
│  1. Developer pushes to GitHub              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  2. GitHub webhook triggers CapRover        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  3. CapRover pulls code and builds Docker   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  4. Docker container starts with env vars   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  5. NestJS ConfigModule loads & validates   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  6. App runs with production config ✅       │
└─────────────────────────────────────────────┘
```

---

## Rollback

If deployment fails:

1. In CapRover dashboard → Your App
2. Go to **Deployment** tab
3. Find previous successful deployment
4. Click **Redeploy** on that version

---

## Security Best Practices for CapRover

1. ✅ **Use CapRover's environment variables** (not hardcoded values)
2. ✅ **Enable HTTPS** in CapRover (force SSL)
3. ✅ **Use strong JWT secrets** (32+ characters)
4. ✅ **Separate dev/prod databases** (different `DATABASE_URL`)
5. ✅ **Enable CapRover authentication** (protect your dashboard)
6. ✅ **Rotate secrets regularly** (update env vars periodically)
7. ✅ **Backup your database** (MongoDB Atlas automated backups)

---

## Quick Reference

### CapRover Environment Variables Needed

```
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/VKM
JWT_SECRET=<generated-32-char-secret>
JWT_EXPIRATION=1d
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/xxx
```

### Deploy Command

```bash
# Option 1: Push to GitHub (auto-deploys via webhook)
git push origin main

# Option 2: Manual CLI deploy
caprover deploy

# Option 3: Git push to CapRover
git push caprover main
```

### Check Logs

```bash
caprover logs -a your-app-name
```

---

## Summary

✅ **Your new configuration system works perfectly with CapRover!**

**What changed:**
- Environment variables are now set in CapRover UI (not hardcoded)
- Application validates all variables on startup
- GitHub webhook can trigger auto-deployments
- More secure and flexible configuration

**What stays the same:**
- CapRover deployment process
- Dockerfile-based builds
- Webhook integration
- Rolling updates

**Deployment is even easier now** because you can change configuration without redeploying! 🎉
