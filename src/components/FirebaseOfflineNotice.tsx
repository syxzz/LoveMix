/**
 * Firebase 离线提示组件
 * 当检测到 Firebase 离线时显示提示条
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { isFirebaseOnline, manualReconnect } from '../services/firebaseConnection';
import { COLORS } from '../utils/constants';

export const FirebaseOfflineNotice: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // 每5秒检查一次连接状态
    const checkInterval = setInterval(() => {
      const online = isFirebaseOnline();
      if (online !== !isOffline) {
        setIsOffline(!online);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isOffline]);

  useEffect(() => {
    if (isOffline) {
      // 显示提示条
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      // 隐藏提示条
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    const success = await manualReconnect();
    setIsReconnecting(false);

    if (success) {
      setIsOffline(false);
    }
  };

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>网络连接异常</Text>
          <Text style={styles.message}>部分功能可能无法使用</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleReconnect}
          disabled={isReconnecting}
        >
          <Text style={styles.buttonText}>
            {isReconnecting ? '重连中...' : '重试'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
