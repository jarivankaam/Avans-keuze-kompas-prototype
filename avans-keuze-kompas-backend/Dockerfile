FROM node:18-alpine

WORKDIR /app

COPY avans-keuze-kompas-backend/package*.json ./

# ✅ install ALL dependencies including Nest CLI
RUN npm install

COPY avans-keuze-kompas-backend .

# ✅ run nest build using CLI from devDependencies
RUN npm run build

# ✅ after build, remove dev deps for smaller image (optional)
RUN npm prune --production

CMD ["node", "dist/main.js"]
]

