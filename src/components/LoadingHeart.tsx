/**
 * LoadingHeart组件
 * 心跳加载动画，使用react-native-reanimated
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, ANIMATION } from '../utils/constants';

interface LoadingHeartProps {
  message?: string;
}

export const LoadingHeart: React.FC<LoadingHeartProps> = ({
  message = '正在生成...',
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    // 心跳动画：1 -> 1.2 -> 1，持续循环
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: ANIMATION.heartBeatDuration / 2,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(1, {
          duration: ANIMATION.heartBeatDuration / 2,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.heart, animatedStyle]}>
        ❤️
      </Animated.Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  heart: {
    fontSize: 64,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: COLORS.textGray,
    fontWeight: '500',
  },
});
