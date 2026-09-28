const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const messages = [];
const activeUsers = new Map();

// ============================================================
// 🤖 NATURAL CONVERSATIONAL AI CHATBOT ENGINE
// ============================================================
function getNaturalBotReply(userInput, senderName) {
  const text = userInput.toLowerCase().trim();
  const name = senderName ? senderName.charAt(0).toUpperCase() + senderName.slice(1) : 'friend';

  // 1. GREETINGS & TIME OF DAY
  if (text.includes('good morning') || text === 'morning') {
    return `Good morning, ${name}! ☀️ Hope you have a wonderful and productive day ahead!`;
  }
  if (text.includes('good afternoon')) {
    return `Good afternoon, ${name}! 🌤️ Hope your day is going smoothly!`;
  }
  if (text.includes('good evening')) {
    return `Good evening, ${name}! 🌆 Unwinding for the day?`;
  }
  if (text.includes('good night') || text === 'gn') {
    return `Good night, ${name}! 🌙 Rest well and talk to you tomorrow!`;
  }
  if (text.includes('hello') || text.includes('hi') || text === 'hey' || text === 'yo' || text === 'sup') {
    const greetings = [
      `Hey ${name}! How's your day going? 😊`,
      `Hello ${name}! Great to see you in the chat! 👋`,
      `Hi there, ${name}! What's on your mind today? 🚀`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. SHORT REACTION WORDS (Nice, Cool, Great, Haha, etc.)
  if (text === 'nice' || text === 'cool' || text === 'awesome' || text === 'great' || text === 'sweet' || text === 'perfect') {
    const reactions = [
      `Glad you think so, ${name}! 😎`,
      `Awesome! Anything else you'd like to chat about? 🌟`,
      `Yeah, totally! 🚀 What else is on your mind?`,
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
  }
  if (text === 'ok' || text === 'okay' || text === 'k' || text === 'alright' || text === 'got it') {
    return `Sounds good, ${name}! Let me know if you need anything else! 👍`;
  }
  if (text.includes('haha') || text.includes('lol') || text.includes('lmao') || text.includes('funny')) {
    return `Haha, glad I could bring a smile! 😂`;
  }

  // 3. STATUS & WELL-BEING
  if (text.includes('how are you') || text.includes('how r u') || text.includes('how are u') || text.includes('how you doing')) {
    return `I'm feeling great and running smoothly on WebSockets, ${name}! ⚡ How are you doing today?`;
  }
  if (text.includes('fine') || text.includes('good') || text.includes('doing well') || text.includes('i am good') || text.includes('i\'m good')) {
    return `That's wonderful to hear, ${name}! 😊 Always good to stay positive.`;
  }
  if (text.includes('bad') || text.includes('sad') || text.includes('tired') || text.includes('bored')) {
    return `Ah, I'm sorry to hear that, ${name}. 💙 Take a breath and take it easy today!`;
  }

  // 4. BOT IDENTITY
  if (text.includes('who are you') || text.includes('what are you') || text.includes('your name')) {
    return `I'm ChatBot! 🤖 A real-time conversational AI assistant connected live via Node.js and Socket.io.`;
  }
  if (text.includes('who made you') || text.includes('who created you') || text.includes('who built you')) {
    return `I was built right here by ${name} using React Native, Node.js, Express, and Socket.io! 💻⚡`;
  }

  // 5. GRATITUDE & FAREWELLS
  if (text.includes('thank') || text.includes('thanks') || text === 'thx') {
    return `You're very welcome, ${name}! Always happy to chat! 🙌`;
  }
  if (text.includes('bye') || text.includes('goodbye') || text.includes('see ya')) {
    return `Catch you later, ${name}! Have an awesome rest of your day! 👋`;
  }

  // 6. TIME & DATE
  if (text.includes('time') || text.includes('clock')) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `The current local time is ${timeStr}. ⏰`;
  }
  if (text.includes('date') || text.includes('day') || text.includes('today')) {
    const dateStr = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `Today is ${dateStr}. 📅`;
  }

  // 7. TECH & CODING QUESTIONS
  if (text.includes('react') || text.includes('native') || text.includes('expo')) {
    return `React Native & Expo allow us to build cross-platform apps for Web, Android, and iOS using single JavaScript codebases! 📱`;
  }
  if (text.includes('node') || text.includes('express') || text.includes('socket')) {
    return `Node.js + Express handles the server logic, while Socket.io establishes bidirectional WebSockets for instant messaging! 🔌`;
  }
  if (text.includes('joke') || text.includes('tell me a joke')) {
    const jokes = [
      `Why do programmers prefer dark mode? Because light attracts bugs! 🐛`,
      `There are 10 types of people in the world: those who understand binary, and those who don't! 😂`,
      `Why did the JavaScript developer wear glasses? Because they didn't C#! 🤓`,
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 8. NATURAL CONVERSATIONAL FALLBACK (No annoying template!)
  const naturalFallbacks = [
    `That's interesting, ${name}! Tell me more about what you're working on. 💡`,
    `I hear you! What else is happening today, ${name}? 😊`,
    `Got it! Feel free to ask me questions, ask for a joke, or check the current time! 🚀`,
    `I'm all ears, ${name}! What would you like to talk about next? 💬`,
  ];
  return naturalFallbacks[Math.floor(Math.random() * naturalFallbacks.length)];
}

// REST APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeUsers: activeUsers.size, messagesCount: messages.length });
});

app.get('/api/messages', (req, res) => {
  res.json({ success: true, data: messages });
});

// SOCKET.IO REAL-TIME LOGIC
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('user_join', ({ username, room = 'general' }) => {
    if (!username) return;
    const cleanUser = username.trim().toLowerCase();
    
    socket.username = cleanUser;
    socket.room = room;
    socket.join(room);

    activeUsers.set(socket.id, { username: cleanUser, room });
    const onlineList = Array.from(activeUsers.values()).map(u => u.username);

    io.to(room).emit('user_online', {
      username: cleanUser,
      onlineUsers: [...new Set(onlineList)],
    });

    const joinMsg = {
      messageId: uuidv4(),
      sender: 'system',
      content: `${cleanUser} joined the chat`,
      room,
      type: 'system',
      timestamp: new Date().toISOString(),
    };
    messages.push(joinMsg);
    io.to(room).emit('new_message', joinMsg);
  });

  socket.on('send_message', (data) => {
    const sender = data.sender || socket.username || 'Anonymous';
    const content = data.content;
    const room = data.room || socket.room || 'general';
    const msgId = data.messageId || uuidv4();

    if (!content || !content.trim()) return;

    const msgObj = {
      messageId: msgId,
      sender: sender.toLowerCase(),
      content: content.trim(),
      room,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    messages.push(msgObj);
    io.to(room).emit('new_message', msgObj);

    // 🤖 SMART AI CHATBOT RESPONSE
    if (sender.toLowerCase() !== 'chatbot') {
      // 1. Show "ChatBot is typing..." indicator after 400ms
      setTimeout(() => {
        socket.emit('user_typing', { username: 'chatbot', isTyping: true });
      }, 400);

      // 2. Deliver ChatBot response after 1.2s
      setTimeout(() => {
        socket.emit('user_typing', { username: 'chatbot', isTyping: false });

        const replyContent = getNaturalBotReply(content, sender);
        const botMsg = {
          messageId: uuidv4(),
          sender: 'chatbot',
          content: replyContent,
          room,
          type: 'text',
          timestamp: new Date().toISOString(),
        };

        messages.push(botMsg);
        io.to(room).emit('new_message', botMsg);
      }, 1200);
    }
  });

  socket.on('typing_start', ({ room = 'general' }) => {
    if (socket.username) {
      socket.to(room).emit('user_typing', { username: socket.username, isTyping: true });
    }
  });

  socket.on('typing_stop', ({ room = 'general' }) => {
    if (socket.username) {
      socket.to(room).emit('user_typing', { username: socket.username, isTyping: false });
    }
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      const onlineList = Array.from(activeUsers.values()).map(u => u.username);

      io.to(user.room).emit('user_offline', {
        username: user.username,
        onlineUsers: [...new Set(onlineList)],
      });

      const leaveMsg = {
        messageId: uuidv4(),
        sender: 'system',
        content: `${user.username} left the chat`,
        room: user.room,
        type: 'system',
        timestamp: new Date().toISOString(),
      };
      messages.push(leaveMsg);
      io.to(user.room).emit('new_message', leaveMsg);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Natural AI ChatBot Server running on http://localhost:${PORT}`);
});