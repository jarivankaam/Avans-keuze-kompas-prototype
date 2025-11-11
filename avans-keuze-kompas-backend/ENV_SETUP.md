# Environment Setup Guide

This guide will help you set up the Avans Keuze Kompas Backend with proper environment configuration.

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Production Setup](#production-setup)
- [GitHub Actions Setup](#github-actions-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including `@nestjs/config` and `joi` for configuration management.

### 2. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Configure Your Environment

Edit `.env` and replace the placeholder values with your actual configuration:

```bash
# Database Configuration
DATABASE_URL=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=generate-a-strong-secret-at-least-32-characters-long
JWT_EXPIRATION=1d

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# N8n Webhook Configuration
N8N_WEBHOOK_URL=https://n8n.srv1048217.hstgr.cloud/webhook-test/your-webhook-id
```

### 4. Start the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/VKM` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `your-super-secret-key-min-32-chars` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `N8N_WEBHOOK_URL` | N8n webhook URL for sync | `https://n8n.example.com/webhook/xxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_EXPIRATION` | JWT token lifetime | `1d` |

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd avans-keuze-kompas-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Local Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local values:
   ```env
   DATABASE_URL=mongodb://localhost:27017/VKM
   JWT_SECRET=local-dev-secret-change-me-in-production-minimum-32-chars
   JWT_EXPIRATION=1d
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/your-id
   ```

### Step 4: Generate a Strong JWT Secret

Generate a secure random string for `JWT_SECRET`:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and use it as your `JWT_SECRET`.

### Step 5: Start Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:4000` (or the port you specified).

---

## Production Setup

### Step 1: Set Environment Variables

**IMPORTANT:** Never commit `.env` files to git in production. Use your hosting platform's environment variable management:

#### For Traditional Servers
```bash
# Set environment variables
export DATABASE_URL="mongodb+srv://..."
export JWT_SECRET="your-production-secret"
export CORS_ORIGIN="https://your-production-domain.com"
export N8N_WEBHOOK_URL="https://n8n.production.com/webhook/xxx"
export NODE_ENV="production"
export PORT="4000"
```

#### For Docker
Create a `.env` file (excluded from git):
```bash
DATABASE_URL=mongodb+srv://...
JWT_SECRET=production-secret
NODE_ENV=production
```

Then use in `docker-compose.yml`:
```yaml
services:
  backend:
    env_file:
      - .env
```

#### For Cloud Platforms

**Heroku:**
```bash
heroku config:set DATABASE_URL="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret"
```

**AWS / Azure / GCP:**
Use their respective secret management services (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager).

### Step 2: Build the Application

```bash
npm run build
```

### Step 3: Start Production Server

```bash
npm run start:prod
```

---

## GitHub Actions Setup

The repository includes a CI/CD pipeline that uses GitHub Secrets for environment variables.

### Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `DATABASE_URL` | Production MongoDB connection string |
| `JWT_SECRET` | Production JWT secret (min 32 chars) |
| `CORS_ORIGIN` | Production frontend URL |
| `N8N_WEBHOOK_URL` | Production N8n webhook URL |
| `JWT_EXPIRATION` | Optional: Token expiration (default: 1d) |
| `PORT` | Optional: Server port (default: 4000) |

### Workflow Triggers

The CI/CD pipeline runs on:
- Push to `main`, `develop`, or `back-end` branches
- Pull requests to `main` or `develop`

### What the Pipeline Does

1. **Build and Test** (runs on every push/PR)
   - Installs dependencies
   - Runs linter
   - Builds the application
   - Runs tests

2. **Deploy** (runs only on main branch)
   - Builds production bundle
   - Deploys to your server (configure deployment steps)

For detailed GitHub Secrets setup, see [`.github/GITHUB_SECRETS_SETUP.md`](.github/GITHUB_SECRETS_SETUP.md).

---

## Troubleshooting

### Application Won't Start

**Error: "DATABASE_URL is required"**
- Solution: Make sure you've created a `.env` file with `DATABASE_URL` set
- Verify the variable name is exactly `DATABASE_URL` (case-sensitive)

**Error: "JWT_SECRET must be at least 32 characters long"**
- Solution: Generate a longer secret using one of the methods in Step 4 above

### CORS Errors

**Error: "CORS policy blocked"**
- Solution: Ensure `CORS_ORIGIN` in `.env` matches your frontend URL exactly
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes

### Database Connection Issues

**Error: "Could not connect to MongoDB"**
- Verify your `DATABASE_URL` is correct
- Check network connectivity to MongoDB
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username and password are correct

### N8n Webhook Failures

**Error: "Failed to send to N8n"**
- Verify `N8N_WEBHOOK_URL` is accessible
- Test the webhook URL manually with curl:
  ```bash
  curl -X POST https://your-n8n-url/webhook-test/xxx -d '{"test": "data"}'
  ```

### Port Already in Use

**Error: "Port 4000 is already in use"**
- Solution: Change the `PORT` in your `.env` file
- Or kill the process using port 4000:
  ```bash
  # Find process
  lsof -i :4000

  # Kill process
  kill -9 <PID>
  ```

---

## Configuration Validation

The application validates all environment variables on startup using Joi schema validation:

- `DATABASE_URL`: Required, must be a string
- `JWT_SECRET`: Required, minimum 32 characters
- `JWT_EXPIRATION`: Optional, defaults to `1d`
- `PORT`: Optional, must be a number, defaults to 4000
- `NODE_ENV`: Optional, must be `development`, `production`, or `test`
- `CORS_ORIGIN`: Required, must be a string
- `N8N_WEBHOOK_URL`: Required, must be a valid URL

If validation fails, you'll see a detailed error message on startup.

---

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters, high entropy
3. **Rotate secrets regularly** - Change production secrets periodically
4. **Use different secrets per environment** - Dev, staging, and production should have different secrets
5. **Restrict CORS origins** - Only allow your actual frontend domains
6. **Use environment-specific databases** - Don't share databases between dev and production

---

## Additional Resources

- [NestJS Configuration Documentation](https://docs.nestjs.com/techniques/configuration)
- [MongoDB Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Need Help?

If you encounter issues not covered here:
1. Check the application logs for detailed error messages
2. Verify all required environment variables are set
3. Ensure your `.env` file has no syntax errors
4. Review the configuration files in `src/config/`
5. Open an issue in the repository with details about your problem
