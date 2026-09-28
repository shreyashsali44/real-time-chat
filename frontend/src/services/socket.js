import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketURL();

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('Socket disconnected and cleaned up');
    }
  }

  joinRoom(username, room = 'general') {
    if (this.socket?.connected) {
      this.socket.emit('user_join', { username, room });
    } else {
      console.error('Socket not connected. Cannot join room.');
    }
  }

  sendMessage(content, room = 'general') {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { content, room });
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  }

  startTyping(room = 'general') {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { room });
    }
  }

  stopTyping(room = 'general') {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { room });
    }
  }

  markAsRead(messageId, room = 'general') {
    if (this.socket?.connected) {
      this.socket.emit('message_read', { messageId, room });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      const callback = this.listeners.get(event);
      if (callback) {
        this.socket.off(event, callback);
        this.listeners.delete(event);
      }
    }
  }

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;