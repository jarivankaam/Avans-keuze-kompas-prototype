# Cookie Troubleshooting Guide

## Issue: Cookies not being saved after login

### Root Cause Analysis

The cookie configuration depends on `NODE_ENV` being set correctly. The controller now uses ConfigService to check if it's production.

---

## Quick Fix

### 1. Verify NODE_ENV in CapRover

Go to **CapRover** → **Apps** → **akk-backend** → **App Configs** → **Environment Variables**

Make sure this is set:
```
NODE_ENV=production
```

If not set, add it and click **Save & Update**.

---

## Cookie Configuration Explained

### Current Settings (auth.controller.ts)

```typescript
res.cookie('access_token', token.access_token, {
  httpOnly: true,                          // ✅ Prevents JavaScript access (security)
  secure: isProduction,                    // ✅ HTTPS only in production
  sameSite: isProduction ? 'none' : 'lax', // ✅ Cross-site in production
  domain: '.panel.evonix-development.tech', // ✅ Shared across subdomains
  maxAge: 24 * 60 * 60 * 1000,            // ✅ 24 hours
});
```

### How It Works

**Development (NODE_ENV=development):**
- `secure: false` - Works on HTTP
- `sameSite: 'lax'` - Same-site requests only

**Production (NODE_ENV=production):**
- `secure: true` - Requires HTTPS
- `sameSite: 'none'` - Allows cross-site requests
- Requires both frontend and backend on HTTPS

---

## Common Cookie Issues

### 1. Cookie Not Being Set

**Check in Browser DevTools:**
1. Open Network tab
2. Make login request
3. Check Response Headers
4. Look for `Set-Cookie` header

**Expected:**
```
Set-Cookie: access_token=eyJhbG...; HttpOnly; Secure; SameSite=None; Domain=.panel.evonix-development.tech; Max-Age=86400
```

**If missing `Set-Cookie` header:**
- Backend isn't setting the cookie
- Check CapRover logs for errors
- Verify login request succeeded (200 status)

---

### 2. Cookie Set But Not Saved

**Possible causes:**

#### A. HTTPS Required (Production)
If `NODE_ENV=production`, cookies require HTTPS:
- ✅ Backend must be on HTTPS
- ✅ Frontend must be on HTTPS
- ✅ `secure: true` flag is set

**Fix:**
- Ensure CapRover has SSL enabled
- Access backend via `https://` not `http://`
- Access frontend via `https://` not `http://`

#### B. Domain Mismatch
Cookie domain is `.panel.evonix-development.tech`

**This works:**
- ✅ `http://akk-frontend.panel.evonix-development.tech`
- ✅ `http://akk-backend.panel.evonix-development.tech`
- ✅ Any subdomain of `panel.evonix-development.tech`

**This doesn't work:**
- ❌ `http://localhost:3000`
- ❌ `http://different-domain.com`

**Fix for local development:**
1. Comment out domain in development
2. Or use a different config for local dev

#### C. SameSite=None Requires Secure
If `sameSite: 'none'` (cross-site), `secure: true` is required by browsers.

**This fails:**
```typescript
sameSite: 'none',
secure: false  // ❌ Not allowed by browsers
```

**Must be:**
```typescript
sameSite: 'none',
secure: true   // ✅ Required for SameSite=None
```

---

### 3. Cookie Not Being Sent on Subsequent Requests

**Check Frontend Configuration:**

#### Fetch API
```javascript
fetch('https://backend-url.com/api/endpoint', {
  credentials: 'include',  // ✅ Required to send cookies
  // ...
})
```

#### Axios
```javascript
axios.get('https://backend-url.com/api/endpoint', {
  withCredentials: true  // ✅ Required to send cookies
})
```

#### Axios Global Config
```javascript
axios.defaults.withCredentials = true;
```

---

### 4. Cookie Domain Issues

**Current domain:** `.panel.evonix-development.tech`

This means:
- Cookie is shared across ALL subdomains
- Frontend on `akk-frontend.panel.evonix-development.tech` can use it
- Backend on `akk-backend.panel.evonix-development.tech` can use it

**If your domains are different:**

Update `auth.controller.ts`:

```typescript
// Option 1: No domain (cookie only for exact domain)
res.cookie('access_token', token.access_token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  // domain: undefined,  // Cookie for exact domain only
  maxAge: 24 * 60 * 60 * 1000,
});

// Option 2: Make domain configurable
const cookieDomain = this.configService.get<string>('cookie.domain');
res.cookie('access_token', token.access_token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  domain: cookieDomain,
  maxAge: 24 * 60 * 60 * 1000,
});
```

---

## Testing Cookie Configuration

### 1. Check if Cookie is Set

**In Browser DevTools:**
1. Go to Application tab (Chrome) or Storage tab (Firefox)
2. Click Cookies
3. Select your backend domain
4. Look for `access_token` cookie

**Expected values:**
- Name: `access_token`
- Value: `eyJhbG...` (JWT token)
- Domain: `.panel.evonix-development.tech`
- Path: `/`
- Expires: (24 hours from now)
- HttpOnly: ✅
- Secure: ✅ (if production)
- SameSite: `None` (if production) or `Lax` (if dev)

---

### 2. Test Cookie Sending

**Make authenticated request:**

```javascript
// This should work if cookie is saved
fetch('https://backend-url.com/auth/me', {
  credentials: 'include'
})
.then(res => res.json())
.then(user => console.log('Current user:', user))
.catch(err => console.error('Auth failed:', err));
```

**Check Network tab:**
1. Look at the request
2. Click on it
3. Check Request Headers
4. Look for `Cookie: access_token=...`

If cookie is in the request, it's working! ✅

---

## Environment Variables Checklist

Make sure these are set in CapRover:

```
DATABASE_URL=mongodb+srv://...
JWT_SECRET=<your-32-char-secret>
JWT_EXPIRATION=1d
PORT=4000
NODE_ENV=production          ← Important for cookies!
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
N8N_WEBHOOK_URL=https://...
```

---

## Debug Mode

To see what's happening, add temporary logging:

### In auth.controller.ts

```typescript
async login(@Request() req, @Res({ passthrough: true }) res: Response) {
  const token = await this.authService.login(req.user);
  const isProduction = this.configService.get<string>('nodeEnv') === 'production';

  console.log('🍪 Cookie settings:');
  console.log('  - NODE_ENV:', this.configService.get<string>('nodeEnv'));
  console.log('  - isProduction:', isProduction);
  console.log('  - secure:', isProduction);
  console.log('  - sameSite:', isProduction ? 'none' : 'lax');

  res.cookie('access_token', token.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: '.panel.evonix-development.tech',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
}
```

Check CapRover logs after login to see these values.

---

## Local Development vs Production

### Local Development

If testing locally:

```env
# .env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Cookie settings:**
- `secure: false` - Works with HTTP
- `sameSite: 'lax'` - Same-site only
- Remove `domain` or set to `localhost`

### Production (CapRover)

```env
# CapRover Environment Variables
NODE_ENV=production
CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
```

**Cookie settings:**
- `secure: true` - Requires HTTPS
- `sameSite: 'none'` - Cross-site allowed
- `domain: '.panel.evonix-development.tech'` - Shared across subdomains

---

## Making Domain Configurable (Optional)

If you want to make the cookie domain configurable:

### 1. Add to configuration.ts

```typescript
export default () => ({
  // ... existing config
  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});
```

### 2. Update auth.controller.ts

```typescript
const cookieDomain = this.configService.get<string>('cookie.domain');

res.cookie('access_token', token.access_token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  ...(cookieDomain && { domain: cookieDomain }),  // Only set if defined
  maxAge: 24 * 60 * 60 * 1000,
});
```

### 3. Set in CapRover

```
COOKIE_DOMAIN=.panel.evonix-development.tech
```

---

## Common Error Messages

### "Cookie has been blocked by browsers"

**Cause:** SameSite=None without Secure flag, or non-HTTPS in production

**Fix:** Ensure `NODE_ENV=production` and use HTTPS

---

### "Cookie domain mismatch"

**Cause:** Frontend domain doesn't match cookie domain

**Fix:** Ensure frontend is on a subdomain of `.panel.evonix-development.tech`

---

### "Cookie not sent with request"

**Cause:** `credentials: 'include'` missing in frontend

**Fix:** Add to all fetch/axios calls:
```javascript
fetch(url, { credentials: 'include' })
axios.get(url, { withCredentials: true })
```

---

## Quick Verification Commands

```bash
# Test login and check Set-Cookie header
curl -X POST https://backend-url.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v | grep -i "set-cookie"

# Test authenticated endpoint
curl https://backend-url.com/auth/me \
  -H "Cookie: access_token=YOUR_TOKEN_HERE" \
  -v
```

---

## Summary

**Most common issue:** `NODE_ENV` not set to `production` in CapRover.

**Quick fix:**
1. Set `NODE_ENV=production` in CapRover environment variables
2. Ensure backend is on HTTPS (CapRover handles this)
3. Ensure frontend uses `credentials: 'include'`
4. Ensure domains match (both on `.panel.evonix-development.tech`)
5. Click "Save & Update" in CapRover
6. Test login again

That's it! 🍪✨
