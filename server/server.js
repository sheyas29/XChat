const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');

require('dotenv').config();
const port = process.env.PORT || 5000;

connectDB();

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
