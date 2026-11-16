require('dotenv').config();

const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Listening at port ${port}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
