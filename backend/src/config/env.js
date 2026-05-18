require('dotenv').config();

const parseList = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const parseBoolean = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  trustProxy: parseBoolean(process.env.TRUST_PROXY),
  cors: {
    origins: parseList(process.env.CORS_ORIGIN),
    allowNoOrigin: parseBoolean(process.env.CORS_ALLOW_NO_ORIGIN)
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'stock_driver_system',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: parseBoolean(process.env.DB_SSL)
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development_only_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};
