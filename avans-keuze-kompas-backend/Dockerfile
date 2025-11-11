FROM node:18-alpine

WORKDIR /app

# Copy package files from the backend subdirectory
COPY ./avans-keuze-kompas-backend/package*.json ./

# Install ALL deps (Nest CLI is in devDependencies)
# Use --legacy-peer-deps to handle peer dependency conflicts
RUN npm install --legacy-peer-deps

# Copy source code from the backend subdirectory
COPY ./avans-keuze-kompas-backend/ .

# Build NestJS app
RUN npm run build

# Remove dev dependencies to shrink image
RUN npm prune --production

EXPOSE 4000

CMD ["node", "dist/main.js"]
