# GitHub Secrets Setup Guide

This document explains how to configure GitHub Secrets for the Avans Keuze Kompas Backend CI/CD pipeline.

## Required Secrets

Navigate to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. DATABASE_URL
- **Description**: MongoDB connection string
- **Example**: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0`
- **Required**: Yes
- **Used in**: Build, Test, Deploy

### 2. JWT_SECRET
- **Description**: Secret key for JWT token signing (minimum 32 characters)
- **Example**: `your-super-secret-jwt-key-minimum-32-chars-long-for-security`
- **Required**: Yes
- **Security**: Must be a strong, randomly generated string
- **Used in**: Build, Test, Deploy

### 3. JWT_EXPIRATION
- **Description**: JWT token expiration time
- **Example**: `1d` (1 day), `7d` (7 days), `24h` (24 hours)
- **Required**: No (defaults to `1d`)
- **Used in**: Build, Test, Deploy

### 4. CORS_ORIGIN
- **Description**: Allowed CORS origin URL
- **Example**: `http://akk-frontend.panel.evonix-development.tech`
- **Required**: Yes
- **Used in**: Build, Test, Deploy

### 5. N8N_WEBHOOK_URL
- **Description**: N8n webhook URL for data synchronization
- **Example**: `https://n8n.srv1048217.hstgr.cloud/webhook-test/your-webhook-id`
- **Required**: Yes
- **Used in**: Build, Test, Deploy

### 6. PORT
- **Description**: Server port number
- **Example**: `4000`
- **Required**: No (defaults to `4000`)
- **Used in**: Build, Test, Deploy

## Optional Deployment Secrets

If you're deploying to a server via SSH, you'll also need:

### 7. DEPLOY_HOST
- **Description**: Deployment server hostname or IP
- **Example**: `123.45.67.89` or `myserver.example.com`

### 8. DEPLOY_USER
- **Description**: SSH username for deployment
- **Example**: `deploy-user`

### 9. DEPLOY_SSH_KEY
- **Description**: Private SSH key for deployment (full key including headers)
- **Example**:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
  ...
  -----END OPENSSH PRIVATE KEY-----
  ```

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings**
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name (e.g., `DATABASE_URL`)
6. Paste the secret value
7. Click **Add secret**
8. Repeat for all required secrets

## Note on NestJS 11 Compatibility

This project uses `@nestjs/config@3.3.0` which is compatible with NestJS 11. The Dockerfile uses `npm install --legacy-peer-deps` to handle peer dependency resolution.

## Environment-Specific Secrets

You can create different secrets for different environments:

### Production Environment
- Use production database URL
- Use strong JWT secret
- Use production CORS origin
- Use production N8n webhook

### Development Environment
- Use development database URL
- Use different JWT secret
- Use development CORS origin
- Use test N8n webhook

To set up environment-specific secrets:
1. Go to **Settings** → **Environments**
2. Create environments (e.g., `production`, `development`)
3. Add secrets specific to each environment
4. Update the workflow to use the appropriate environment

## Security Best Practices

1. **Never commit secrets to git** - Always use environment variables and GitHub Secrets
2. **Use strong secrets** - JWT_SECRET should be at least 32 characters with high entropy
3. **Rotate secrets regularly** - Change secrets periodically, especially after team member changes
4. **Limit secret access** - Only give repository access to people who need it
5. **Use environment protection rules** - Require approvals for production deployments
6. **Monitor secret usage** - Check GitHub Actions logs for unauthorized access attempts

## Verifying Your Setup

After adding all secrets, push a commit to trigger the GitHub Actions workflow:

```bash
git add .
git commit -m "test: verify GitHub Actions secrets"
git push
```

Check the **Actions** tab in your repository to see if the workflow runs successfully.

## Troubleshooting

### Build fails with "DATABASE_URL is required"
- Ensure you've added the `DATABASE_URL` secret in GitHub
- Check that the secret name matches exactly (case-sensitive)

### JWT validation errors
- Verify `JWT_SECRET` is at least 32 characters
- Ensure the same secret is used across all environments

### CORS errors
- Confirm `CORS_ORIGIN` matches your frontend URL exactly
- Include the protocol (http:// or https://)
- Don't include trailing slashes

## Need Help?

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all required secrets are added
3. Ensure secret values don't have extra spaces or newlines
4. Review the `.github/workflows/ci-cd.yml` file for correct secret names
