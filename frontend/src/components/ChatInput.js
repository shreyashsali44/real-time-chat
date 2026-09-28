import React, { Component } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ChatInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      inputHeight: 40,
    };
    this.typingTimer = null;
    this.isTyping = false;
  }

  handleChangeText = (text) => {
    this.setState({ message: text });

    const { onStartTyping, onStopTyping } = this.props;

    if (text.length > 0 && !this.isTyping) {
      this.isTyping = true;
      onStartTyping?.();
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      if (this.isTyping) {
        this.isTyping = false;
        onStopTyping?.();
      }
    }, 2000);

    if (text.length === 0 && this.isTyping) {
      this.isTyping = false;
      onStopTyping?.();
    }
  };

  handleSend = () => {
    const { message } = this.state;
    const { onSend, disabled } = this.props;

    if (disabled || !message.trim()) return;

    onSend(message.trim());
    this.setState({ message: '', inputHeight: 40 });

    if (this.isTyping) {
      this.isTyping = false;
      this.props.onStopTyping?.();
    }
  };

  handleContentSizeChange = (event) => {
    const height = Math.min(
      Math.max(40, event.nativeEvent.contentSize.height),
      120
    );
    this.setState({ inputHeight: height });
  };

  componentWillUnmount() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  render() {
    const { message, inputHeight } = this.state;
    const { disabled } = this.props;
    const canSend = message.trim().length > 0 && !disabled;

    return (
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { height: Math.max(40, inputHeight) }]}
            placeholder={disabled ? 'Reconnecting...' : 'Type a message...'}
            placeholderTextColor="#999"
            value={message}
            onChangeText={this.handleChangeText}
            onContentSizeChange={this.handleContentSizeChange}
            onSubmitEditing={this.handleSend}
            multiline
            maxLength={2000}
            editable={!disabled}
            returnKeyType="send"
            blurOnSubmit={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonInactive]}
          onPress={this.handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? '#fff' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        paddingBottom: 20,
      },
      android: {
        paddingBottom: 8,
      },
    }),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#667eea',
  },
  sendButtonInactive: {
    backgroundColor: '#E8E8E8',
  },
});

export default ChatInput;