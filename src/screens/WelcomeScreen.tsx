/**
 * WelcomeScreen - 现代化欢迎页面
 * 苹果风格设计 + 液态玻璃效果 + 丰富动画
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { DEBUG_CONFIG, FEATURE_FLAGS } from '../config';
import { guestLogin, debugAdminLogin } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

// 浮动气泡组件
const FloatingBubble: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -200,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: height,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: Math.random() * 200 - 100,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: Math.random() * width,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    />
  );
};

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const [loading, setLoading] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);
  const { t } = useTranslation();

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo 呼吸动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo 轻微旋转
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: -1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const user = await guestLogin();
      setUser(user);
      setIsAuthenticated(true);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDebugLogin = async () => {
    try {
      setLoading(true);
      const user = await debugAdminLogin();
      setUser(user);
      setIsAuthenticated(true);
      navigation.navigate('Home');
      Alert.alert('Debug 模式', '已使用管理员账号登录');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoPress = () => {
    if (!DEBUG_CONFIG.SHOW_DEBUG_BUTTON) return;

    const newCount = debugTapCount + 1;
    setDebugTapCount(newCount);

    if (newCount >= 5) {
      Alert.alert(
        'Debug 模式',
        '是否使用管理员账号登录？\n\n账号: admin@lovemix.app\n密码: admin123',
        [
          { text: '取消', style: 'cancel', onPress: () => setDebugTapCount(0) },
          {
            text: '确定',
            onPress: () => {
              setDebugTapCount(0);
              handleDebugLogin();
            },
          },
        ]
      );
    }

    setTimeout(() => setDebugTapCount(0), 3000);
  };

  return (
    <View style={styles.container}>
      {/* 动态渐变背景 */}
      <LinearGradient
        colors={['#FF6B9D', '#C471ED', '#12C2E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 浮动气泡 */}
      {[...Array(8)].map((_, i) => (
        <FloatingBubble
          key={i}
          delay={i * 1000}
          size={60 + Math.random() * 100}
        />
      ))}

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* Logo 区域 */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleLogoPress}
            activeOpacity={0.9}
            style={styles.logoTouchable}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScale }, { rotate }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              />
              <Text style={styles.logo}>💕</Text>
            </Animated.View>
            <Text style={styles.appName}>LoveMix</Text>
            {DEBUG_CONFIG.SHOW_DEBUG_BUTTON && debugTapCount > 0 && (
              <Text style={styles.debugHint}>
                再点击 {5 - debugTapCount} 次进入 Debug 模式
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* 按钮区域 */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <GradientButton
            title={t('welcome.startButton')}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          />

          {FEATURE_FLAGS.ENABLE_GUEST_MODE && (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleGuestLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.glassButtonGradient}
              />
              <View style={styles.glassButtonContent}>
                <View style={styles.iconCircle}>
                  <Feather name="zap" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.glassButtonTitle}>{t('welcome.guestLogin')}</Text>
                  <Text style={styles.glassButtonSubtitle}>{t('welcome.guestSubtitle')}</Text>
                </View>
                <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              {t('welcome.hasAccount')}<Text style={styles.loginLinkText}>{t('welcome.loginNow')}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoTouchable: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  logoGradient: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logo: {
    fontSize: 70,
  },
  appName: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 2,
    fontFamily: 'Niconne_400Regular',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  debugHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  buttonSection: {
    gap: 16,
  },
  glassButton: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glassButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glassButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  glassButtonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  glassButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins_400Regular',
  },
  loginLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins_400Regular',
  },
  loginLinkText: {
    fontWeight: '700',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins_700Bold',
  },
});
