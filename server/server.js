const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Event = require('./models/Event');
const { seedDatabase } = require('./seed');

// Load environment variables
dotenv.config();

const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS for local development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
  })
);

// Logging in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'UtsavLocal - Local Event & Festival Aggregator (Bengaluru)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount modular API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 & Global Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
let server;
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('⚡ Empty database detected. Auto-seeding initial Bengaluru demo events and accounts...');
      await seedDatabase(false);
    }

    server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🎉 UtsavLocal Server is running on port ${PORT}`);
      console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`✨ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
