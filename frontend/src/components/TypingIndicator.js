import React, { Component } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

class TypingIndicator extends Component {
  constructor(props) {
    super(props);
    this.dot1 = new Animated.Value(0);
    this.dot2 = new Animated.Value(0);
    this.dot3 = new Animated.Value(0);
  }

  componentDidMount() {
    this.startAnimation();
  }

  componentWillUnmount() {
    this.dot1.stopAnimation();
    this.dot2.stopAnimation();
    this.dot3.stopAnimation();
  }

  startAnimation = () => {
    const createDotAnimation = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(this.dot1, 0),
      createDotAnimation(this.dot2, 200),
      createDotAnimation(this.dot3, 400),
    ]).start();
  };

  render() {
    const { users } = this.props;

    if (!users || users.length === 0) return null;

    const typingText =
      users.length === 1
        ? `${users[0]} is typing`
        : users.length === 2
        ? `${users[0]} and ${users[1]} are typing`
        : `${users[0]} and ${users.length - 1} others are typing`;

    const dotStyle = (anim) => ({
      opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          }),
        },
      ],
    });

    return (
      <View style={styles.container}>
        <Text style={styles.text}>{typingText}</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dotStyle(this.dot1)]} />
          <Animated.View style={[styles.dot, dotStyle(this.dot2)]} />
          <Animated.View style={[styles.dot, dotStyle(this.dot3)]} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  text: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginRight: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#999',
    marginHorizontal: 1.5,
  },
});

export default TypingIndicator;