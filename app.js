require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const whatsappRoutes = require('./src/routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB
connectDB();


// app.get('/webhook', (req, res) => {
//   console.log('QUERY:', req.query);
//   res.status(200).send(req.query['hub.challenge'] || 'OK');
// });
// Routes
app.use('/', whatsappRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'WhatsApp Session Scheduler API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
});

module.exports = app;
