FROM node:18-alpine

WORKDIR /app
COPY avans-keuze-kompas-frontend/package*.json ./
RUN npm install

COPY avans-keuze-kompas-frontend .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

