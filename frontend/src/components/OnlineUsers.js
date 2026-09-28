import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { getAvatarColor, getInitials } from '../utils/helpers';

const OnlineUsers = ({ users, currentUser, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Online Users ({users.length})
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.userList}
      >
        {users.map((user, index) => {
          const username = user.username || user;
          const isCurrentUser = username === currentUser;
          const color = getAvatarColor(username);

          return (
            <View key={`${username}-${index}`} style={styles.userItem}>
              <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>
                  {getInitials(username)}
                </Text>
                <View style={styles.onlineDot} />
              </View>
              <Text
                style={[
                  styles.username,
                  isCurrentUser ? styles.currentUsername : null,
                ]}
                numberOfLines={1}
              >
                {isCurrentUser ? 'You' : username}
              </Text>
            </View>
          );
        })}

        {users.length === 0 && (
          <Text style={styles.noUsers}>No users online</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  userList: {
    paddingHorizontal: 16,
  },
  userItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 56,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  currentUsername: {
    color: '#667eea',
    fontWeight: '600',
  },
  noUsers: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default React.memo(OnlineUsers);