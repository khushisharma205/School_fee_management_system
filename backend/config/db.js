const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
let connectionOptions;

if (connectionUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(connectionUrl);
  } catch {
    throw new Error('Invalid MySQL connection URL');
  }

  if (!['mysql:', 'mysqls:'].includes(parsedUrl.protocol)) {
    throw new Error('The database connection URL must use the mysql:// scheme');
  }

  const database = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
  if (!parsedUrl.hostname || !parsedUrl.username || !database) {
    throw new Error('The MySQL connection URL must include a host, username, and database');
  }

  connectionOptions = {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port) || 3306,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database
  };
} else {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  const port = DB_PORT ? Number(DB_PORT) : 3306;
  const missing = [
    ['DB_HOST', DB_HOST],
    ['DB_USER', DB_USER],
    ['DB_PASSWORD', DB_PASSWORD],
    ['DB_NAME', DB_NAME]
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing MySQL configuration: set ${missing.join(', ')} or DATABASE_URL`);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }

  connectionOptions = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port
  };
}

if (process.env.DB_SSL === 'true') {
  connectionOptions.ssl = process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA }
    : {};
}

const pool = mysql.createPool({
  ...connectionOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
