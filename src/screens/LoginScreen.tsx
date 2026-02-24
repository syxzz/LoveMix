/**
 * LoginScreen - 现代化登录页面
 * 包含动画效果、渐变背景、浮动粒子等特效
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { login } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// 浮动粒子组件
const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -height,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() * 100 - 50,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: Math.random() * width,
          top: height + Math.random() * 100,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    />
  );
};

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo 旋转动画
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('login.alert.title'), t('login.alert.fillEmailPassword'));
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email: email.trim(), password });
      setUser(user);
      setIsAuthenticated(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      Alert.alert(t('login.alert.loginFailed'), error.message || t('login.alert.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 渐变背景 */}
      <LinearGradient
        colors={['#FF6B9D', '#FFA07A', '#FFB6C1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 浮动粒子 */}
      {[...Array(15)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 500} />
      ))}

      {/* 返回按钮 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonInner}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo 区域 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoCircle,
              { transform: [{ rotate: spin }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.logoGradient}
            />
          </Animated.View>
          <View style={styles.logoInner}>
            <Text style={styles.logoEmoji}>💕</Text>
          </View>
          <Text style={styles.logoText}>LoveMix</Text>
          <Text style={styles.logoSubtext}>{t('login.logoSubtext')}</Text>
        </Animated.View>

        {/* 表单卡片 */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeText}>{t('login.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </View>

          {/* 邮箱输入 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={20} color={COLORS.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('login.emailPlaceholder')}
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 密码输入 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Feather name="lock" size={20} color={COLORS.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="rgba(0,0,0,0.4)"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 忘记密码 */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>

          {/* 登录按钮 */}
          <View style={styles.buttonContainer}>
            <GradientButton
              title={loading ? t('login.loggingIn') : t('login.loginButton')}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* 分隔线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('login.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 社交登录按钮 */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Feather name="github" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Feather name="mail" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Feather name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>

          {/* 注册链接 */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>{t('login.noAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{t('login.registerNow')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 底部装饰 */}
        <View style={styles.bottomDecoration}>
          <Text style={styles.bottomText}>© 2024 LoveMix. All rights reserved.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  formCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  cardHeader: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,157,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textGray,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bottomDecoration: {
    marginTop: 30,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
