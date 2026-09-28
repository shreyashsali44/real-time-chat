const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

// @desc    Get chat history
// @route   GET /api/messages
// @query   room, page, limit
const getMessages = async (req, res) => {
  try {
    const { room = 'general', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({ room })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Message.countDocuments({ room });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

// @desc    Send a message via REST API
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { sender, content, room = 'general' } = req.body;

    if (!sender || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender and content are required',
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
    }

    const message = new Message({
      messageId: uuidv4(),
      sender: sender.trim(),
      content: content.trim(),
      room,
      type: 'text',
      status: 'sent',
      timestamp: new Date(),
    });

    const savedMessage = await message.save();

    // Emit via Socket.io to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(room).emit('new_message', savedMessage);
    }

    res.status(201).json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// @desc    Update message status
// @route   PUT /api/messages/:messageId/status
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, username } = req.body;

    const update = { status };

    if (status === 'read' && username) {
      update.$addToSet = {
        readBy: { username, readAt: new Date() },
      };
    }

    const message = await Message.findOneAndUpdate(
      { messageId },
      update,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message,
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndDelete({ messageId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(message.room).emit('message_deleted', { messageId });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  updateMessageStatus,
  deleteMessage,
};