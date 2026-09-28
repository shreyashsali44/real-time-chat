const express = require('express');
const router = express.Router();
const {
  loginUser,
  getOnlineUsers,
  getAllUsers,
} = require('../controllers/userController');

router.post('/login', loginUser);
router.get('/online', getOnlineUsers);
router.get('/', getAllUsers);

module.exports = router;