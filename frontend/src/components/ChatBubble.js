import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, getAvatarColor, getInitials, getStatusIcon, getStatusColor } from '../utils/helpers';

const ChatBubble = ({ message, isOwn, isSystem, showSender }) => {
  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{message.content}</Text>
          <Text style={styles.systemTime}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    );
  }

  const avatarColor = getAvatarColor(message.sender);

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {/* Avatar for other users */}
      {!isOwn && showSender && (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{getInitials(message.sender)}</Text>
        </View>
      )}

      {!isOwn && !showSender && <View style={styles.avatarSpacer} />}

      <View
        style={[
          styles.bubbleWrapper,
          isOwn ? styles.ownBubbleWrapper : styles.otherBubbleWrapper,
        ]}
      >
        {/* Sender name */}
        {!isOwn && showSender && (
          <Text style={[styles.senderName, { color: avatarColor }]}>
            {message.sender}
          </Text>
        )}

        <View
          style={[
            styles.bubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {message.content}
          </Text>

          <View style={styles.metaContainer}>
            <Text
              style={[
                styles.timestamp,
                isOwn ? styles.ownTimestamp : styles.otherTimestamp,
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>

            {/* Message status for own messages */}
            {isOwn && message.status && (
              <Text
                style={[
                  styles.statusIcon,
                  { color: getStatusColor(message.status) },
                ]}
              >
                {' '}{getStatusIcon(message.status)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 4,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarSpacer: {
    width: 40,
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  ownBubbleWrapper: {
    alignItems: 'flex-end',
  },
  otherBubbleWrapper: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1A1A1A',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // System message styles
  systemContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemBubble: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  systemTime: {
    fontSize: 10,
    color: '#AAA',
    marginLeft: 8,
  },
});

export default React.memo(ChatBubble);