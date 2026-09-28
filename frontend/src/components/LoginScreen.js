import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ChatContext from '../context/ChatContext';

export default function LoginScreen() {
  const chatContext = useContext(ChatContext);
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  const isLoading = chatContext?.isLoading || false;
  const error = chatContext?.error || '';
  const displayError = localError || error;

  const handleLogin = async () => {
    const trimmed = username.trim();

    if (!trimmed) {
      setLocalError('Please enter a username');
      return;
    }

    if (trimmed.length < 2) {
      setLocalError('Username must be at least 2 characters');
      return;
    }

    if (trimmed.length > 20) {
      setLocalError('Username must be 20 characters or less');
      return;
    }

    setLocalError('');
    if (chatContext?.login) {
      await chatContext.login(trimmed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>💬</Text>
          </View>
          <Text style={styles.title}>Real-Time Chat</Text>
          <Text style={styles.subtitle}>Connect instantly with others</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Choose your username</Text>
          <TextInput
            style={[styles.input, displayError ? styles.inputError : null]}
            placeholder="Enter username (e.g. alex)"
            placeholderTextColor="#999"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setLocalError('');
            }}
            onSubmitEditing={handleLogin}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            editable={!isLoading}
          />

          {displayError ? (
            <Text style={styles.errorText}>{displayError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>Connecting...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Join Chat</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          No password needed • Pick a name and start chatting
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
    ...Platform.select({
      web: {
        height: '100vh',
        width: '100vw',
      },
    }),
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 38,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    outlineStyle: 'none',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 20,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
});