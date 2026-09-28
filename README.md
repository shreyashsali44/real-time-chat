# 💬 Real-Time Chat Application & AI ChatBot

A full-stack, real-time chat application built with **React Native (Expo)** for the frontend and **Node.js, Express, and Socket.io** for the backend. 

This project includes a fully functional bidirectional WebSockets implementation, an intelligent AI ChatBot for solo testing, and a responsive web-ready UI.

---

## ✨ Features Implemented

### Core Requirements Completed
- ✅ **React Native (Expo Web)** frontend with a clean, user-friendly UI.
- ✅ **Node.js + Express** REST API backend.
- ✅ **Socket.io** integration for instant, page-refresh-free message delivery.
- ✅ Broadcast new messages to all connected users instantly.
- ✅ Fetch previous chat history upon login/refresh.
- ✅ Display message timestamps (`HH:MM` format).
- ✅ Graceful handling of user connections and disconnections.
- ✅ Clean architecture and reusable coding practices.

### 🌟 Bonus Features Completed
- ✅ **Username-based dummy authentication** (No passwords required).
- ✅ **Typing Indicators** (Shows when a user or the ChatBot is typing).
- ✅ **Online/Offline Status** (Live count of active users in the room).
- ✅ **Smart AI ChatBot** (Detects greetings, questions, and replies dynamically).
- ✅ **In-Memory & Database Ready Storage** (Messages persist without crashing if DB goes offline).
- ✅ **System Messages** (Broadcasts when users join or leave the chat).

---
### Folder Structure
Ensure your project is structured as follows:
```text
real-time-chat/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── (expo configurations)
└── README.md


## 🛠️ Project Setup Instructions

### Prerequisites
Before running this project, ensure you have the following installed on your machine:
- **Node.js** (v16.x or higher)
- **npm** (comes with Node.js)
- **Expo CLI** (`npm install -g expo-cli`)

 Steps to Run the Backend
Open a terminal and navigate to the backend folder:
Bash

cd backend
Install backend dependencies:
Bash

npm install express socket.io cors dotenv uuid
Create a .env file (see Environment Variables section below).
Start the backend server:
Bash

node server.js
You should see: 🚀 Natural AI ChatBot Server running on http://localhost:3001
📱 Steps to Run the Frontend
Open a second terminal window and navigate to the frontend folder:
Bash

cd frontend
Install frontend dependencies:
Bash

npm install socket.io-client axios @expo/webpack-config react-native-web react-dom
Start the Expo server (clearing cache is recommended):
Bash

npx expo start -c
When the QR code appears in the terminal, press w on your keyboard to open the app in your Web Browser.
(It will run on http://localhost:19006 or http://localhost:8081)
🔐 Environment Variables Required
Create a .env file inside the backend/ folder with the following variables:

env

PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:19006
# Optional: Add MongoDB URI if transitioning from In-Memory to DB
# MONGODB_URI=mongodb://localhost:27017/realtime_chat
