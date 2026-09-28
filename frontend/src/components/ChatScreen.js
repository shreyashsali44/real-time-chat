import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ChatContext from '../context/ChatContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import OnlineUsers from './OnlineUsers';
import TypingIndicator from './TypingIndicator';

class ChatScreen extends Component {
  static contextType = ChatContext;

  constructor(props) {
    super(props);
    this.state = {
      showOnlineUsers: false,
    };
    this.flatListRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    // Auto-scroll to bottom when new messages arrive
    const prevMessages = this.prevMessages || [];
    const currentMessages = this.context.messages;

    if (currentMessages.length > prevMessages.length) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }

    this.prevMessages = currentMessages;
  }

  scrollToBottom = () => {
    if (this.flatListRef.current && this.context.messages.length > 0) {
      this.flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  handleLogout = () => {
    Alert.alert(
      'Leave Chat',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => this.context.logout(),
        },
      ]
    );
  };

  toggleOnlineUsers = () => {
    this.setState((prev) => ({ showOnlineUsers: !prev.showOnlineUsers }));
  };

  renderMessage = ({ item, index }) => {
    const { currentUser, messages } = this.context;
    const isOwn = item.sender === currentUser;
    const isSystem = item.type === 'system' || item.sender === 'system';

    // Check if we should show the sender name (for grouped messages)
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showSender = !isOwn && !isSystem &&
      (!prevMessage || prevMessage.sender !== item.sender || prevMessage.type === 'system');

    return (
      <ChatBubble
        message={item}
        isOwn={isOwn}
        isSystem={isSystem}
        showSender={showSender}
      />
    );
  };

  renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>👋</Text>
      <Text style={styles.emptyTitle}>Welcome to the chat!</Text>
      <Text style={styles.emptySubtitle}>
        Send a message to start the conversation
      </Text>
    </View>
  );

  render() {
    const {
      currentUser,
      messages,
      onlineUsers,
      typingUsers,
      isConnected,
      error,
      sendMessage,
      handleStartTyping,
      handleStopTyping,
      loadMoreMessages,
      hasMoreMessages,
    } = this.context;

    const { showOnlineUsers } = this.state;
    const otherTypingUsers = typingUsers.filter((u) => u !== currentUser);

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Chat Room</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.onlineButton}
              onPress={this.toggleOnlineUsers}
            >
              <Text style={styles.onlineButtonText}>
                👥 {onlineUsers.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={this.handleLogout}
            >
              <Text style={styles.logoutText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Online users panel */}
        {showOnlineUsers && (
          <OnlineUsers
            users={onlineUsers}
            currentUser={currentUser}
            onClose={this.toggleOnlineUsers}
          />
        )}

        {/* Messages list */}
        <FlatList
          ref={this.flatListRef}
          data={messages}
          renderItem={this.renderMessage}
          keyExtractor={(item) => item.messageId || item._id || Math.random().toString()}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 ? styles.emptyList : null,
          ]}
          ListEmptyComponent={this.renderEmptyChat}
          ListHeaderComponent={
            hasMoreMessages ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreMessages}
              >
                <Text style={styles.loadMoreText}>Load older messages</Text>
              </TouchableOpacity>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              this.scrollToBottom();
            }
          }}
        />

        {/* Typing indicator */}
        {otherTypingUsers.length > 0 && (
          <TypingIndicator users={otherTypingUsers} />
        )}

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          disabled={!isConnected}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  errorBannerText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadMoreButton: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 8,
  },
  loadMoreText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;