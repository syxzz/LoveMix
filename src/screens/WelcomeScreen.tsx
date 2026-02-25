/**
 * WelcomeScreen - 剧本杀主题欢迎页面
 * 惊悚悬疑风格 + 神秘氛围 + 特效动画
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
import { COLORS, RADIUS } from '../utils/constants';
import { DEBUG_CONFIG, FEATURE_FLAGS } from '../config';
import { guestLogin, debugAdminLogin } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

// 神秘粒子效果组件
const MysteryParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: height,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }],
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
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 30,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo 呼吸动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo 发光效果
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
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
        '是否使用管理员账号登录？',
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
      {/* 深色渐变背景 */}
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 神秘粒子效果 */}
      {[...Array(20)].map((_, i) => (
        <MysteryParticle key={i} delay={i * 400} />
      ))}

      {/* 暗纹理覆盖层 */}
      <View style={styles.textureOverlay} />

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* Logo 区域 */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
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
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              {/* 发光效果 */}
              <Animated.View
                style={[
                  styles.logoGlow,
                  {
                    opacity: glowOpacity,
                  },
                ]}
              />

              {/* Logo 图标 */}
              <View style={styles.logoIconContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.logoGradient}
                />
                <Text style={styles.logo}>🎭</Text>
              </View>
            </Animated.View>

            {/* App 名称 */}
            <Text style={styles.appName}>{t('welcome.appName')}</Text>
            <Text style={styles.tagline}>{t('welcome.tagline')}</Text>

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
          {/* 开始游戏按钮 */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Feather name="play" size={24} color={COLORS.textLight} />
              <Text style={styles.primaryButtonText}>{t('welcome.startButton')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 游客模式按钮 */}
          {FEATURE_FLAGS.ENABLE_GUEST_MODE && (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleGuestLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                style={styles.glassButtonGradient}
              />
              <View style={styles.glassButtonContent}>
                <View style={styles.iconCircle}>
                  <Feather name="zap" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.glassButtonTitle}>{t('welcome.guestLogin')}</Text>
                  <Text style={styles.glassButtonSubtitle}>{t('welcome.guestSubtitle')}</Text>
                </View>
                <Feather name="arrow-right" size={20} color={COLORS.accent} />
              </View>
            </TouchableOpacity>
          )}

          {/* 登录链接 */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              {t('welcome.hasAccount')} <Text style={styles.loginLinkText}>{t('welcome.loginNow')}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 底部装饰线 */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorationLine} />
        <Text style={styles.decorationText}>真相只有一个</Text>
        <View style={styles.decorationLine} />
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
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoTouchable: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.accent,
  },
  logoIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  logoGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  logo: {
    fontSize: 80,
  },
  appName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 12,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  debugHint: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 12,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  glassButton: {
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
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
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  glassButtonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  glassButtonSubtitle: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  loginLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  loginLinkText: {
    fontWeight: '700',
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  decorationLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.accent,
    opacity: 0.5,
  },
  decorationText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
