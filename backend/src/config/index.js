require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  kelly: {
    feedUrl: process.env.KELLY_FEED_URL,
    apiKey: process.env.KELLY_API_KEY
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  }
}; 