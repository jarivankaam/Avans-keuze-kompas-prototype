# Cookie/Auth Debugging Checklist

Run through these checks to identify the exact issue.

---

## Step 1: Check CapRover Environment Variables

**Go to:** CapRover → Apps → akk-backend → App Configs → Environment Variables

**Verify ALL these are set:**

```
✅ DATABASE_URL=mongodb+srv://jari_db_user:JNOHtMfl9bJvBqR6@cluster0.7tvrpj5.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0
✅ JWT_SECRET=<your-generated-secret>
✅ JWT_EXPIRATION=1d
✅ PORT=4000
✅ NODE_ENV=production
✅ CORS_ORIGIN=http://akk-frontend.panel.evonix-development.tech
✅ N8N_WEBHOOK_URL=https://n8n.srv1048217.hstgr.cloud/webhook-test/a291d2db-bb14-4f78-b677-c0656f5bf00c
```

**If any are missing or wrong:**
- Add/fix them
- Click "Save & Update"
- Wait for restart (30 seconds)
- Continue to Step 2

---

## Step 2: Check CapRover Logs

**Go to:** CapRover → Apps → akk-backend → App Logs

**Look for:**

### A. Application Started Successfully
```
Application is running on: http://localhost:4000
```

### B. No Validation Errors
If you see errors like:
```
"DATABASE_URL" is required
"JWT_SECRET" must be at least 32 characters
```
→ Go back to Step 1 and fix environment variables

### C. Check for Login Attempts
Make a login request from your frontend, then check logs for:
```
👤 User: { _id: ..., email: ... }
🔐 Password match: true
```

**If you DON'T see these logs:**
→ Login request isn't reaching the backend
→ Check CORS (Step 3)

---

## Step 3: Test CORS

Open your frontend and open Browser Console (F12).

**Run this:**
```javascript
fetch('https://your-backend-url.com/auth/me', {
  credentials: 'include'
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected results:**

### If CORS works:
- Status: 401 (Unauthorized - expected without login)
- Response: `{ statusCode: 401, message: 'Unauthorized' }`

### If CORS is broken:
- Error: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Network tab shows request blocked

**If CORS is broken:**
1. Verify `CORS_ORIGIN` in CapRover matches your frontend URL EXACTLY
2. Include protocol: `http://` or `https://`
3. No trailing slash
4. Click "Save & Update" and wait for restart

---

## Step 4: Test Login Request

Open Browser DevTools → Network tab → Clear

**Make login request from your frontend.**

### A. Click on the login request in Network tab

**Check Request Headers:**
```
POST /auth/login
Content-Type: application/json
Origin: http://akk-frontend.panel.evonix-development.tech
```

**Check Request Payload:**
```json
{
  "email": "test@example.com",
  "password": "password"
}
```

### B. Check Response

**Status:** Should be `200` or `201`

**Response Headers - Look for Set-Cookie:**
```
Set-Cookie: access_token=eyJhbGciOiJ...; HttpOnly; Secure; SameSite=None; Domain=.panel.evonix-development.tech; Max-Age=86400
```

**If NO Set-Cookie header:**
→ Backend isn't setting the cookie
→ Check CapRover logs for errors
→ Verify login succeeded (200 status)
→ See Step 5

**Response Body:**
```json
{
  "access_token": "eyJhbGciOiJ..."
}
```

---

## Step 5: Check Cookie in Browser

**Go to:** DevTools → Application (Chrome) or Storage (Firefox) → Cookies

**Select your backend domain**

**Look for `access_token` cookie:**

### If cookie EXISTS:
```
Name: access_token
Value: eyJhbGci... (JWT token)
Domain: .panel.evonix-development.tech
Path: /
HttpOnly: ✅
Secure: ✅ (if on HTTPS)
SameSite: None (if production)
Expires: (tomorrow)
```

### If cookie is MISSING:
**Common reasons:**

#### A. Domain mismatch
- Cookie domain: `.panel.evonix-development.tech`
- Frontend domain: `http://akk-frontend.panel.evonix-development.tech` ✅
- Must be on same parent domain

#### B. Secure flag issue (if using HTTP)
- If `NODE_ENV=production`, cookies require HTTPS
- CapRover should provide HTTPS automatically
- Check if you're accessing via `https://` not `http://`

#### C. SameSite=None requires Secure
- If `SameSite=None`, then `Secure` must be true
- This means HTTPS is required

---

## Step 6: Check Frontend Configuration

**Verify your frontend is sending credentials:**

### Fetch API
```javascript
fetch('https://backend-url.com/auth/login', {
  method: 'POST',
  credentials: 'include',  // ✅ Must have this!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
})
```

### Axios
```javascript
axios.post('https://backend-url.com/auth/login',
  { email, password },
  { withCredentials: true }  // ✅ Must have this!
)
```

### Axios Global
```javascript
// Set once in your app
axios.defaults.withCredentials = true;
```

---

## Step 7: Test Authenticated Request

After successful login, test if cookie is sent:

**In Browser Console:**
```javascript
fetch('https://your-backend-url.com/auth/me', {
  credentials: 'include'  // ✅ Required!
})
.then(res => res.json())
.then(user => console.log('Current user:', user))
.catch(err => console.error('Failed:', err));
```

**Check Network tab:**
1. Click on the `/auth/me` request
2. Look at **Request Headers**
3. Should see: `Cookie: access_token=eyJhbGci...`

**Expected response:**
```json
{
  "userId": "...",
  "email": "test@example.com",
  "is_admin": false
}
```

**If cookie is NOT in request headers:**
→ Browser isn't sending the cookie
→ Check Step 5 (is cookie saved?)
→ Check Step 6 (credentials: 'include'?)

---

## Step 8: Check HTTPS/HTTP Mix

**Both frontend and backend must use same protocol in production:**

### Correct combinations:
- ✅ Frontend: HTTP + Backend: HTTP (development only)
- ✅ Frontend: HTTPS + Backend: HTTPS (production)

### Incorrect combinations:
- ❌ Frontend: HTTP + Backend: HTTPS
- ❌ Frontend: HTTPS + Backend: HTTP

**In CapRover with `NODE_ENV=production`:**
- Backend should be on HTTPS (CapRover handles this)
- Frontend should be on HTTPS
- Cookies will have `Secure` flag (requires HTTPS)

---

## Common Issues & Solutions

### Issue: "Set-Cookie header is there, but cookie not saved"

**Possible causes:**

1. **Domain mismatch**
   - Cookie: `.panel.evonix-development.tech`
   - Frontend: Different domain
   - **Fix:** Frontend must be on same parent domain

2. **Secure flag but using HTTP**
   - Cookie has `Secure` flag
   - Accessing via `http://` not `https://`
   - **Fix:** Use HTTPS or set `NODE_ENV=development`

3. **SameSite=None without Secure**
   - Not allowed by browsers
   - **Fix:** Use HTTPS in production

### Issue: "Cookie saved but not sent with requests"

**Cause:** Missing `credentials: 'include'` in frontend

**Fix:** Add to ALL fetch/axios calls:
```javascript
fetch(url, { credentials: 'include' })
axios.get(url, { withCredentials: true })
```

### Issue: "Login works locally but not in production"

**Causes:**
1. `NODE_ENV` not set to `production` in CapRover
2. Not using HTTPS in production
3. CORS_ORIGIN not set correctly

**Fix:** Verify ALL environment variables in CapRover

---

## Quick Test Script

**Copy this into your browser console on the frontend:**

```javascript
(async function testAuth() {
  console.log('🧪 Testing authentication flow...\n');

  const backendUrl = 'https://your-backend-url.com';

  // Test 1: Login
  console.log('1️⃣ Testing login...');
  try {
    const loginRes = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'yourpassword'
      })
    });

    console.log('  Status:', loginRes.status);
    console.log('  Set-Cookie header:', loginRes.headers.get('set-cookie'));
    const loginData = await loginRes.json();
    console.log('  Response:', loginData);

    if (loginRes.ok) {
      console.log('  ✅ Login successful\n');

      // Test 2: Check cookie
      console.log('2️⃣ Checking cookie...');
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('access_token='));
      console.log('  Cookie:', authCookie ? '✅ Found' : '❌ Not found');

      // Test 3: Authenticated request
      console.log('\n3️⃣ Testing authenticated request...');
      const meRes = await fetch(`${backendUrl}/auth/me`, {
        credentials: 'include'
      });

      console.log('  Status:', meRes.status);
      const meData = await meRes.json();
      console.log('  Response:', meData);

      if (meRes.ok) {
        console.log('  ✅ Authentication working!');
      } else {
        console.log('  ❌ Authentication failed');
      }
    } else {
      console.log('  ❌ Login failed');
    }
  } catch (err) {
    console.error('  ❌ Error:', err.message);
  }
})();
```

Replace `your-backend-url.com` and credentials, then run it.

---

## What to Report

If still broken after these checks, please provide:

1. **CapRover environment variables** (screenshot or list)
2. **Network tab screenshot** of login request showing:
   - Request headers
   - Response headers (especially Set-Cookie)
   - Response body
3. **Application → Cookies screenshot** showing cookie details
4. **Console errors** (if any)
5. **CapRover logs** during login attempt

This will help identify the exact issue!
