import axios from 'axios';
import { Platform } from 'react-native';

// Configure base URL based on platform
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API No Response:', error.message);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API functions
export const messageAPI = {
  getMessages: async (room = 'general', page = 1, limit = 50) => {
    try {
      const response = await api.get('/messages', {
        params: { room, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error.message);
      return { success: false, data: [], pagination: {} };
    }
  },

  sendMessage: async (sender, content, room = 'general') => {
    try {
      const response = await api.post('/messages', { sender, content, room });
      return response.data;
    } catch (error) {
      console.error('Failed to send message via API:', error.message);
      throw error;
    }
  },

  updateMessageStatus: async (messageId, status, username) => {
    try {
      const response = await api.put(`/messages/${messageId}/status`, {
        status,
        username,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update message status:', error.message);
      throw error;
    }
  },
};

export const userAPI = {
  login: async (username) => {
    try {
      const response = await api.post('/users/login', { username });
      return response.data;
    } catch (error) {
      console.error('Failed to login:', error.message);
      throw error;
    }
  },

  getOnlineUsers: async () => {
    try {
      const response = await api.get('/users/online');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch online users:', error.message);
      return { success: false, data: [] };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error.message);
      return { success: false, data: [] };
    }
  },
};

export default api;