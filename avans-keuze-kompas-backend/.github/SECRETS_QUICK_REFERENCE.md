# GitHub Secrets Quick Reference

## How to Add Secrets

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add each secret below

---

## Required Secrets Checklist

### ✅ DATABASE_URL
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0
```

### ✅ JWT_SECRET
Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Minimum 32 characters.

### ✅ CORS_ORIGIN
```
http://akk-frontend.panel.evonix-development.tech
```
Or your production frontend URL.

### ✅ N8N_WEBHOOK_URL
```
https://n8n.srv1048217.hstgr.cloud/webhook-test/a291d2db-bb14-4f78-b677-c0656f5bf00c
```

---

## Optional Secrets

### JWT_EXPIRATION
```
1d
```
Default: `1d` (1 day)

### PORT
```
4000
```
Default: `4000`

---

## Verify Setup

After adding secrets:
```bash
git add .
git commit -m "test: verify GitHub secrets"
git push
```

Then check: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

---

## Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Webhook
```bash
curl -X POST YOUR_N8N_WEBHOOK_URL -d '{"test":"data"}'
```

### Check if secret is set (in Actions)
Secrets are masked in logs, but you can verify they exist by checking if validation passes.
