import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const ProgressBar = ({ total, current }) => {
  // Calculate progress percentage
  const progress = (current / (total - 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressIndicator,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#4299E1',
    borderRadius: 3,
  },
});

export default ProgressBar;
