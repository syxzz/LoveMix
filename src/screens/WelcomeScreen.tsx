/**
 * WelcomeScreen - 高端沉浸式欢迎页
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

const FloatingOrb: React.FC<{ delay: number; size: number; x: number; color: string }> = ({ delay, size, x, color }) => {
  const translateY = useRef(new Animated.Value(height + 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 0.08, duration: 5000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 5000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, { toValue: -400, duration: 20000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: height + 100, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          backgroundColor: color,
          transform: [{ translateY }],
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(titleFade, { toValue: 1, duration: 1400, delay: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 1200, delay: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineFade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideUpAnim, { toValue: 0, tension: 25, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(lineWidth, { toValue: 1, duration: 2000, delay: 1200, useNativeDriver: false }).start();
  }, []);

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
          { text: '确定', onPress: () => { setDebugTapCount(0); handleDebugLogin(); } },
        ]
      );
    }
    setTimeout(() => setDebugTapCount(0), 3000);
  };

  const orbs = [
    { delay: 0, size: 200, x: -50, color: '#6B5CE7' },
    { delay: 4000, size: 140, x: width * 0.6, color: COLORS.accent },
    { delay: 8000, size: 160, x: width * 0.2, color: '#8B7AFF' },
    { delay: 2000, size: 100, x: width * 0.8, color: '#4A3CB5' },
  ];

  const animatedLineStyle = {
    width: lineWidth.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    }),
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0D24', '#0F1230', '#161A3A']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}

      <View style={styles.content}>
        {/* 品牌区域 */}
        <Animated.View style={[styles.brandSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={handleLogoPress}
            activeOpacity={0.9}
            style={styles.brandTouchable}
          >
            {/* 品牌名 */}
            <Animated.Text
              style={[
                styles.brandName,
                { opacity: titleFade, transform: [{ translateY: titleSlide }] },
              ]}
            >
              Mirrage
            </Animated.Text>

            {/* 装饰线 */}
            <Animated.View style={[styles.decorLine, animatedLineStyle]} />

            {/* 标语 */}
            <Animated.View style={[styles.taglineContainer, { opacity: taglineFade }]}>
              <Text style={styles.taglineText}>{t('welcome.tagline')}</Text>
            </Animated.View>

            {DEBUG_CONFIG.SHOW_DEBUG_BUTTON && debugTapCount > 0 && (
              <Text style={styles.debugHint}>
                再点击 {5 - debugTapCount} 次进入 Debug 模式
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* 操作区域 */}
        <Animated.View
          style={[
            styles.actionSection,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          {/* 主按钮 */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6B5CE7', '#8B7AFF', '#A594FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>{t('welcome.startButton')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 游客入口 */}
          {FEATURE_FLAGS.ENABLE_GUEST_MODE && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleGuestLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryBtnContent}>
                <View style={styles.zapIcon}>
                  <Feather name="zap" size={15} color={COLORS.accent} />
                </View>
                <View style={styles.secondaryBtnTextWrap}>
                  <Text style={styles.secondaryBtnTitle}>{t('welcome.guestLogin')}</Text>
                  <Text style={styles.secondaryBtnSub}>{t('welcome.guestSubtitle')}</Text>
                </View>
                <Feather name="chevron-right" size={15} color="rgba(107,113,148,0.4)" />
              </View>
            </TouchableOpacity>
          )}

          {/* 登录链接 */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              {t('welcome.hasAccount')}{' '}
              <Text style={styles.loginHighlight}>{t('welcome.loginNow')}</Text>
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
    paddingHorizontal: 36,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  orb: {
    position: 'absolute',
  },

  /* Brand */
  brandSection: {
    alignItems: 'center',
    marginTop: 100,
  },
  brandTouchable: {
    alignItems: 'center',
  },
  brandName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 48,
    color: '#F0ECF8',
    letterSpacing: 14,
    marginBottom: 24,
  },
  decorLine: {
    height: 1,
    backgroundColor: COLORS.accent,
    opacity: 0.5,
    marginBottom: 28,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  taglineText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(201,169,110,0.7)',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 20,
  },
  debugHint: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 24,
  },

  /* Actions */
  actionSection: {
    gap: 14,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  primaryBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  primaryBtnText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  secondaryBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107,92,231,0.15)',
    backgroundColor: 'rgba(16,20,46,0.6)',
  },
  secondaryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  zapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201,169,110,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnTextWrap: {
    flex: 1,
  },
  secondaryBtnTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 1,
  },
  secondaryBtnSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.textGray,
  },
  loginLink: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textGray,
  },
  loginHighlight: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.accent,
  },
});
