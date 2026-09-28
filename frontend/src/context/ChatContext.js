import React, { createContext, Component } from 'react';
import socketService from '../services/socket';
import { messageAPI, userAPI } from '../services/api';

const ChatContext = createContext();

export class ChatProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      messages: [],
      onlineUsers: [],
      typingUsers: [],
      isConnected: false,
      isLoading: false,
      error: null,
      hasMoreMessages: false,
      currentPage: 1,
    };
    this.typingTimeout = null;
  }

  login = async (username) => {
    try {
      this.setState({ isLoading: true, error: null });

      // Login via REST API
      let loginSuccess = false;
      try {
        const result = await userAPI.login(username);
        if (result.success) {
          loginSuccess = true;
        }
      } catch (apiError) {
        console.log('API login failed, proceeding with socket only');
      }

      // Connect socket
      const socket = socketService.connect();

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        if (socket.connected) {
          clearTimeout(timeout);
          resolve();
        } else {
          socket.once('connect', () => {
            clearTimeout(timeout);
            resolve();
          });
          socket.once('connect_error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        }
      });

      // Setup socket listeners
      this.setupSocketListeners();

      // Join room
      socketService.joinRoom(username);

      // Load chat history
      await this.loadMessages();

      this.setState({
        currentUser: username.trim().toLowerCase(),
        isConnected: true,
        isLoading: false,
      });

    } catch (error) {
      console.error('Login error:', error);
      this.setState({
        error: `Failed to connect: ${error.message}`,
        isLoading: false,
      });
    }
  };

  logout = () => {
    socketService.disconnect();
    this.setState({
      currentUser: null,
      messages: [],
      onlineUsers: [],
      typingUsers: [],
      isConnected: false,
      currentPage: 1,
    });
  };

  setupSocketListeners = () => {
    // New message
    socketService.on('new_message', (message) => {
      this.setState((prevState) => {
        // Avoid duplicates
        const exists = prevState.messages.some(
          (m) => m.messageId === message.messageId
        );
        if (exists) return null;

        return {
          messages: [...prevState.messages, message],
        };
      });
    });

    // Join success
    socketService.on('join_success', (data) => {
      this.setState({
        onlineUsers: data.onlineUsers || [],
        isConnected: true,
      });
    });

    // User online
    socketService.on('user_online', (data) => {
      this.setState({
        onlineUsers: data.onlineUsers || [],
      });
    });

    // User offline
    socketService.on('user_offline', (data) => {
      this.setState({
        onlineUsers: data.onlineUsers || [],
        typingUsers: this.state.typingUsers.filter(
          (u) => u !== data.username
        ),
      });
    });

    // Typing indicator
    socketService.on('user_typing', (data) => {
      this.setState((prevState) => {
        const { username, isTyping } = data;
        let typingUsers = [...prevState.typingUsers];

        if (isTyping && !typingUsers.includes(username)) {
          typingUsers.push(username);
        } else if (!isTyping) {
          typingUsers = typingUsers.filter((u) => u !== username);
        }

        return { typingUsers };
      });
    });

    // Message status update
    socketService.on('message_status_update', (data) => {
      this.setState((prevState) => ({
        messages: prevState.messages.map((msg) =>
          msg.messageId === data.messageId
            ? { ...msg, status: data.status }
            : msg
        ),
      }));
    });

    // Message deleted
    socketService.on('message_deleted', (data) => {
      this.setState((prevState) => ({
        messages: prevState.messages.filter(
          (msg) => msg.messageId !== data.messageId
        ),
      }));
    });

    // Error handling
    socketService.on('error', (data) => {
      console.error('Socket error:', data.message);
      this.setState({ error: data.message });
      setTimeout(() => this.setState({ error: null }), 3000);
    });
  };

  loadMessages = async (page = 1) => {
    try {
      const result = await messageAPI.getMessages('general', page, 50);
      if (result.success) {
        this.setState((prevState) => ({
          messages: page === 1
            ? result.data
            : [...result.data, ...prevState.messages],
          hasMoreMessages: result.pagination?.hasMore || false,
          currentPage: page,
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  loadMoreMessages = async () => {
    if (this.state.hasMoreMessages) {
      await this.loadMessages(this.state.currentPage + 1);
    }
  };

  sendMessage = (content) => {
    if (content && content.trim().length > 0) {
      socketService.sendMessage(content.trim());
      this.handleStopTyping();
    }
  };

  handleStartTyping = () => {
    socketService.startTyping();

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.handleStopTyping();
    }, 3000);
  };

  handleStopTyping = () => {
    socketService.stopTyping();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  };

  clearError = () => {
    this.setState({ error: null });
  };

  render() {
    const contextValue = {
      ...this.state,
      login: this.login,
      logout: this.logout,
      sendMessage: this.sendMessage,
      handleStartTyping: this.handleStartTyping,
      handleStopTyping: this.handleStopTyping,
      loadMoreMessages: this.loadMoreMessages,
      clearError: this.clearError,
    };

    return (
      <ChatContext.Provider value={contextValue}>
        {this.props.children}
      </ChatContext.Provider>
    );
  }
}

export const ChatConsumer = ChatContext.Consumer;

export default ChatContext;