# CORS Troubleshooting Guide

## Issue: CORS is broken after deployment

### Root Cause

The `CORS_ORIGIN` environment variable is not set in CapRover, so the app is using the default fallback value `http://localhost:3000` instead of your actual frontend URL.

---

## Quick Fix

### 1. Set CORS_ORIGIN in CapRover

1. Go to **CapRover Dashboard**
2. Navigate to **Apps** → **akk-backend**
3. Click **App Configs** tab
4. Scroll to **Environment Variables** section
5. Add or update:

```
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
```

6. Click **Save & Update**
7. CapRover will restart your app

---

## How to Verify

### Check Current CORS Configuration

Look at your CapRover application logs after restart:

```
Application is running on: http://localhost:4000
```

### Test CORS from Browser Console

Open your frontend application and run:

```javascript
fetch('https://your-backend-url.com/api/endpoint', {
  credentials: 'include'
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
```

If CORS is working, you should get a response (or at least not a CORS error).

---

## Common CORS Errors

### Error: "No 'Access-Control-Allow-Origin' header is present"

**Cause:** `CORS_ORIGIN` is not set or is set to wrong value

**Fix:**
1. Check `CORS_ORIGIN` in CapRover environment variables
2. Ensure it matches your frontend URL exactly
3. Include protocol (`http://` or `https://`)
4. Don't include trailing slash

**Correct:**
```
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
```

**Incorrect:**
```
CORS_ORIGIN=akk-frontend.panel.evonix-development.tech     ❌ Missing protocol
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech/  ❌ Trailing slash
```

---

### Error: "Credentials mode is 'include' but the CORS response has credentials: false"

**Cause:** CORS configuration has `credentials: true` but origin doesn't match

**Fix:** Same as above - set correct `CORS_ORIGIN`

---

### Error: CORS works but cookies aren't being sent

**Causes:**
1. Frontend and backend on different domains (not subdomains)
2. `credentials: 'include'` not set in frontend fetch
3. Backend not sending `Set-Cookie` with correct flags

**Check:**
1. Verify `credentials: true` in backend (already configured ✅)
2. Verify `credentials: 'include'` in frontend fetch calls
3. Check that cookies have `SameSite=None; Secure` if cross-domain

---

## Complete CapRover Environment Variables

Make sure ALL these are set:

```
DATABASE_URL=mongodb+srv://jari_db_user:JNOHtMfl9bJvBqR6@cluster0.7tvrpj5.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<your-generated-32-char-secret>
JWT_EXPIRATION=1d
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
N8N_WEBHOOK_URL=https://n8n.srv1048217.hstgr.cloud/webhook-test/a291d2db-bb14-4f78-b677-c0656f5bf00c
```

---

## Check Current Configuration

To see what CORS origin is currently being used, you can temporarily add logging:

1. Check CapRover logs after app starts
2. Look for the startup message: `Application is running on: http://localhost:4000`
3. The CORS configuration is applied at startup

---

## Testing CORS Locally

If you want to test locally before deploying:

1. Update your `.env` file:
   ```
   CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
   ```

2. Run locally:
   ```bash
   npm run start:dev
   ```

3. Test from your frontend

---

## Frontend Configuration

Make sure your frontend is sending credentials:

### Fetch API
```javascript
fetch('https://backend-url.com/api/endpoint', {
  method: 'POST',
  credentials: 'include',  // ✅ Important!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
```

### Axios
```javascript
axios.post('https://backend-url.com/api/endpoint', data, {
  withCredentials: true  // ✅ Important!
})
```

---

## Multiple Frontend Origins (Advanced)

If you need to allow multiple origins (e.g., dev and prod):

Update `src/main.ts`:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://akk-frontend.panel.evonix-development.tech',
      'https://production-domain.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
});
```

---

## Quick Checklist

- [ ] `CORS_ORIGIN` set in CapRover environment variables
- [ ] Value includes protocol (`http://` or `https://`)
- [ ] Value matches frontend URL exactly
- [ ] No trailing slash in the URL
- [ ] App restarted after setting variable
- [ ] Frontend uses `credentials: 'include'` or `withCredentials: true`
- [ ] Browser not caching old CORS headers (hard refresh: Ctrl+Shift+R)

---

## Still Not Working?

1. **Check CapRover logs:**
   - Apps → akk-backend → App Logs
   - Look for startup errors or validation failures

2. **Check browser console:**
   - Look for specific CORS error messages
   - Check Network tab for failed requests

3. **Verify environment variables are loaded:**
   - Add temporary logging in `main.ts`:
     ```typescript
     console.log('CORS Origin:', configService.get<string>('cors.origin'));
     ```
   - Check logs after restart

4. **Check CapRover proxy:**
   - Ensure CapRover isn't stripping CORS headers
   - Verify SSL/HTTPS configuration if using https

---

## Summary

**The most common issue:** `CORS_ORIGIN` environment variable not set in CapRover.

**Quick fix:**
1. Set `CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech` in CapRover
2. Click "Save & Update"
3. Wait for restart
4. Test from frontend

That's it! 🎉
