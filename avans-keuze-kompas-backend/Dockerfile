FROM node:18-alpine

WORKDIR /app
COPY avans-keuze-kompas-backend/package*.json ./
RUN npm install --production

COPY avans-keuze-kompas-backend .
RUN npm run build

CMD ["node", "dist/main.js"]

