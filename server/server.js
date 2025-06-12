const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = require('./db/connection');
connectDB();

// Routes
// Assuming your routes/index.js exports a router that combines all routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/transactions', require('./routes/transaction.routes'));
app.use('/vendor', require('./routes/vendor.routes'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
