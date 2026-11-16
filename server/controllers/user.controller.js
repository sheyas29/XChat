const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth } = require('../config/firebaseAdmin');
async function userRegisterController(req, res) {
  try {
    const { fullName, username, email, password } = req.body;
    if (
      !fullName?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }
    const normalizedFullName = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const checkEmail = await User.findOne({ email: normalizedEmail });
    const checkUsername = await User.findOne({ username: normalizedUsername });
    if (checkEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }
    if (checkUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }
    const avatar = `https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${normalizedUsername}`;
    const saved = await User.create({
      fullName: normalizedFullName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: password,
      avatar: avatar,
    });

    const token = jwt.sign({ userId: saved._id }, process.env.JWT_TOKEN, {
      expiresIn: '2h',
    });

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000,
      })
      .cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        data: {
          _id: saved._id,
          fullName: saved.fullName,
          username: saved.username,
          email: saved.email,
          avatar: saved.avatar,
        },
        message: 'User created successfully',
        token: token,
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while registering the user',
    });
  }
}

async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    const normalisedEmail = email.toLowerCase().trim();
    const check = await User.findOne({ email: normalisedEmail });
    if (!check) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist with this email',
      });
    }
    const valid = await bcrypt.compare(password, check.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }
    const token = jwt.sign({ userId: check._id }, process.env.JWT_TOKEN, {
      expiresIn: '2h',
    });
    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000,
      })
      .cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        data: {
          user: {
            _id: check._id,
            fullName: check.fullName,
            username: check.username,
            email: check.email,
            avatar: check.avatar,
          },
          accessToken: token,
        },
        message: 'User logged in successfully',
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while registering the user',
    });
  }
}

async function getCurrentUserController(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      message: 'User fetched successfully',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the user',
    });
  }
}
async function userLogoutController(req, res) {
  try {
    res
      .clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .json({
        success: true,
        message: 'User logged out',
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the user',
    });
  }
}

async function getUsersbySearchController(req, res) {
  try {
    const searchTerm = req.query.searchTerm;

    if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const normalisedSearchTerm = searchTerm.trim();
    if (normalisedSearchTerm.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Search term is too long',
      });
    }
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const userId = req.userId;

    const users = await User.find({
      $or: [
        { username: { $regex: escapedSearchTerm, $options: 'i' } },
        { email: { $regex: escapedSearchTerm, $options: 'i' } },
      ],
    }).select('fullName username email avatar');

    return res.status(200).json({
      success: true,
      data: users,
      message: 'Users fetched successfully',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching users',
    });
  }
}
async function firebaseTokenController(req, res) {
  try {
    const userId = req.userId;

    const customToken = await auth.createCustomToken(userId.toString());

    return res.status(200).json({
      success: true,
      data: {
        token: customToken,
      },
      message: 'Firebase token generated successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message:
        'Something went wrong while generating the custom token from Firebase',
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
  getCurrentUserController,
  userLogoutController,
  getUsersbySearchController,
  firebaseTokenController,
};
