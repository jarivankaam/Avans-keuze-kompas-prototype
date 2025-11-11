export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://akk-frontend.panel.evonix-development.tech',
  },
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || '',
  },
});
