const express = require('express');
const router = express.Router();
const {
  userRegisterController,
  userLoginController,
  getCurrentUserController,
  userLogoutController,
  getUsersbySearchController,
  firebaseTokenController,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', userRegisterController);
router.post('/login', userLoginController);
router.get('/logout', authMiddleware, userLogoutController);
router.get('/me', authMiddleware, getCurrentUserController);
router.get('/search', authMiddleware, getUsersbySearchController);
router.get('/firebase-token', authMiddleware, firebaseTokenController);

module.exports = router;
