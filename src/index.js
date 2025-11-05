import express from "express";
import "dotenv/config";
import walletRoutes from './routes/walletRoute.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoute.js'
import thresholdRoutes from './routes/thresholdRoutes.js'
import subscriberRoutes from './routes/subscriberRoutes.js'
import productRoutes from './routes/productRoutes.js'


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Transaction Engine API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get("/", (req, res) => {
  res.send('🚀 Transaction Engine API - Running');
});


app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/products', productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Middleware Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 Transaction Engine API                ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Server: http://localhost:${PORT}           ║`);
  console.log(`║   Health: http://localhost:${PORT}/health    ║`);
  console.log(`║   Environment: ${process.env.NODE_ENV || 'development'}                  ║`);
  console.log('╚════════════════════════════════════════════╝');
});