require('dotenv').config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,        
  BACKOFF_BASE: parseInt(process.env.BACKOFF_BASE || '2'),
  DEFAULT_MAX_RETRIES: parseInt(process.env.DEFAULT_MAX_RETRIES || '3'),
  WORKER_POLL_MS: parseInt(process.env.WORKER_POLL_MS || '1000')
};