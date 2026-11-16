const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = express.Router();
const userRoutes = require('./routes/user.routes');
const roomRoutes = require('./routes/room.routes');
const app = express();
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);

module.exports = app;
