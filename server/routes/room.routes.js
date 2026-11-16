const express = require('express');

const router = express.Router();

const {
  roomInitialiserController,
  getAllRoomsController,
} = require('../controllers/room.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post('/init', authMiddleware, roomInitialiserController);
router.get('/userrooms', authMiddleware, getAllRoomsController);

module.exports = router;
