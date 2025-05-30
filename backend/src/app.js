require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jobFeedRouter = require('./routes/jobFeed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000'
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import database connection
const { connectDB } = require('./database/connection');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
try {
  const authRoutes = require('./routes/auth');
  const jobRoutes = require('./routes/jobs');
  const userRoutes = require('./routes/users');
  const skillRoutes = require('./routes/skills');
  const jobFeedRouter = require('./routes/jobFeed');

  // Use routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs/feed', jobFeedRouter);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/skills', skillRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    details: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    // Import job scheduler after database is connected
    const feedUpdater = require('./jobs/feedUpdater');
    feedUpdater.start();
    console.log('Job feed updater started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;