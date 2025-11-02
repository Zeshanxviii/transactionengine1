import express from "express";
import "dotenv/config";
// import userRoutes from "./routes/userRoutes.js"; 
import walletRoutes from './routes/walletRoute.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoute.js'
const app = express();
const PORT = 3000;

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
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);


// app.use('/users',userRoutes)


app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
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