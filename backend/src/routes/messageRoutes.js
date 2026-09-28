const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:messageId/status', updateMessageStatus);
router.delete('/:messageId', deleteMessage);

module.exports = router;