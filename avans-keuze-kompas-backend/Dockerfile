FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL deps (Nest CLI is in devDependencies)
RUN npm install

# Copy source
COPY . .

# Build NestJS app
RUN npm run build

# Remove dev dependencies to shrink image
RUN npm prune --production

EXPOSE 4000

CMD ["node", "dist/main.js"]
