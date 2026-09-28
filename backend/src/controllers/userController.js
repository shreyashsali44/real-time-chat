const User = require('../models/User');

// @desc    Login / Register user (dummy auth)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 2 and 20 characters',
      });
    }

    let user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      user = new User({
        username: trimmedUsername,
        isOnline: true,
        lastSeen: new Date(),
      });
      await user.save();
    } else {
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key - user exists, just return it
      const user = await User.findOne({ username: req.body.username.trim().toLowerCase() });
      if (user) {
        user.isOnline = true;
        await user.save();
        return res.json({
          success: true,
          data: {
            username: user.username,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          },
        });
      }
    }
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

// @desc    Get online users
// @route   GET /api/users/online
const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('username isOnline lastSeen')
      .lean();

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online users',
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username isOnline lastSeen')
      .sort({ isOnline: -1, lastSeen: -1 })
      .lean();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

module.exports = {
  loginUser,
  getOnlineUsers,
  getAllUsers,
};