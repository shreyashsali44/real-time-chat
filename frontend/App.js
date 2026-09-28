import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { registerRootComponent } from 'expo';
import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);

  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getUserColor = (name) => {
    if (name === 'chatbot') return '#059669'; // Green for ChatBot
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleLogin = async () => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      alert('Please enter a username');
      return;
    }

    setLoading(true);

    try {
      // Fetch history
      try {
        const res = await axios.get(`${SERVER_URL}/api/messages`, { timeout: 3000 });
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.warn('Backend REST API note:', err.message);
      }

      // Connect Socket
      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setConnectionStatus(`Connected (${socket.id.slice(0, 5)}...)`);
        socket.emit('user_join', { username: trimmed, room: 'general' });
      });

      socket.on('disconnect', () => {
        setConnectionStatus('Disconnected');
      });

      // SINGLE SOURCE OF TRUTH FOR MESSAGES (Prevents Double Messages)
      socket.on('new_message', (newMsg) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.messageId === newMsg.messageId);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      });

      socket.on('user_online', (data) => {
        if (data?.onlineUsers) setOnlineUsers(data.onlineUsers);
      });

      socket.on('user_offline', (data) => {
        if (data?.onlineUsers) setOnlineUsers(data.onlineUsers);
      });

      socket.on('user_typing', (data) => {
        setTypingUsers((prev) => {
          if (data.isTyping && !prev.includes(data.username)) {
            return [...prev, data.username];
          }
          if (!data.isTyping) {
            return prev.filter((u) => u !== data.username);
          }
          return prev;
        });
      });

      setIsLoggedIn(true);
      scrollToBottom();
    } catch (error) {
      alert('Login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;

    const currentSender = username.trim().toLowerCase();
    const uniqueId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Send via socket (socket event will render it ONCE)
    socketRef.current.emit('send_message', {
      messageId: uniqueId,
      sender: currentSender,
      content: text,
      room: 'general',
    });

    socketRef.current.emit('typing_stop', { room: 'general' });
    setInputText('');
  };

  // ------------------ LOGIN SCREEN ------------------
  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.appLogo}>🤖</Text>
          <Text style={styles.appTitle}>AI ChatBot App</Text>
          <Text style={styles.appSubtitle}>Real-Time Chat powered by Socket.io</Text>

          <TextInput
            style={styles.loginInput}
            placeholder="Enter your username (e.g. shreyash)"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={handleLogin}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Start Chatting</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ------------------ CHAT SCREEN ------------------
  const otherTyping = typingUsers.filter((u) => u !== username.toLowerCase());
  const isOnline = connectionStatus.startsWith('Connected');

  return (
    <SafeAreaView style={styles.chatContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}># General Chat (AI ChatBot Active)</Text>
          <Text style={styles.headerStatusText}>
            {isOnline ? `🟢 ${connectionStatus}` : `🔴 ${connectionStatus}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => {
            socketRef.current?.disconnect();
            setIsLoggedIn(false);
            setMessages([]);
          }}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Messages ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScrollView}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((item) => {
          const isOwn = item.sender === username.toLowerCase();
          const isSystem = item.type === 'system' || item.sender === 'system';

          if (isSystem) {
            return (
              <View key={item.messageId} style={styles.systemBubble}>
                <Text style={styles.systemText}>{item.content}</Text>
              </View>
            );
          }

          return (
            <View
              key={item.messageId}
              style={[styles.bubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}
            >
              {!isOwn && (
                <Text style={[styles.senderName, { color: getUserColor(item.sender) }]}>
                  {item.sender === 'chatbot' ? '🤖 ChatBot' : item.sender}
                </Text>
              )}
              <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isOwn ? styles.ownTime : styles.otherTime]}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Typing Indicator */}
      {otherTyping.length > 0 && (
        <View style={styles.typingBox}>
          <Text style={styles.typingText}>
            ✍️ {otherTyping.includes('chatbot') ? '🤖 ChatBot is typing...' : `${otherTyping.join(', ')} is typing...`}
          </Text>
        </View>
      )}

      {/* Message Input Box */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask ChatBot anything (e.g. How are you? / What time is it?)"
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (socketRef.current?.connected) {
                socketRef.current.emit('typing_start', { room: 'general' });
              }
            }}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() ? styles.sendButtonDisabled : null]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  appLogo: { fontSize: 48, marginBottom: 8 },
  appTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  appSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  loginInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  chatContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  headerStatusText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  leaveButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  leaveButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  messagesScrollView: { flex: 1 },
  messagesContent: { padding: 16 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '80%' },
  ownWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2, marginLeft: 4 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  ownBubble: { backgroundColor: '#667eea', borderBottomRightRadius: 2 },
  otherBubble: { backgroundColor: '#ffffff', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 15 },
  ownMessageText: { color: '#ffffff' },
  otherMessageText: { color: '#1e293b' },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  ownTime: { color: 'rgba(255,255,255,0.7)' },
  otherTime: { color: '#94a3b8' },
  systemBubble: { alignSelf: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginVertical: 6 },
  systemText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  typingBox: { paddingHorizontal: 16, paddingVertical: 4 },
  typingText: { fontSize: 12, color: '#059669', fontStyle: 'italic', fontWeight: 'bold' },
  inputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  chatInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendButton: { backgroundColor: '#667eea', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  sendButtonDisabled: { backgroundColor: '#cbd5e1' },
  sendButtonText: { color: '#ffffff', fontWeight: 'bold' },
});

registerRootComponent(App);