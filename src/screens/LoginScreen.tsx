/**
 * LoginScreen - 剧本杀主题登录页面
 * 悬疑风格 + 神秘特效
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
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { login } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// 神秘光点组件
const MysteryLight: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mysteryLight,
        {
          left: Math.random() * width,
          top: Math.random() * height,
          opacity,
          transform: [{ scale }],
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
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('login.alert.title'), t('login.alert.fillEmailPassword'));
      return;
    }

    try {
      setLoading(true);
      const user = await login({
        email: email.trim(),
        password,
      });
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
    <View style={styles.container}>
      {/* 深色渐变背景 */}
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 神秘光点效果 */}
      {[...Array(10)].map((_, i) => (
        <MysteryLight key={i} delay={i * 600} />
      ))}

      {/* 暗纹理覆盖层 */}
      <View style={styles.textureOverlay} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonGlass}>
            <LinearGradient
              colors={['rgba(139, 71, 137, 0.4)', 'rgba(44, 62, 80, 0.4)']}
              style={styles.backButtonGradient}
            />
            <Feather name="arrow-left" size={24} color={COLORS.textLight} />
          </View>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            {/* 标题区域 */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.iconGradient}
                />
                <Text style={styles.icon}>🔐</Text>
              </View>
              <Text style={styles.welcomeText}>{t('login.welcomeBack')}</Text>
              <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
              <Text style={styles.logoSubtext}>{t('login.logoSubtext')}</Text>
            </View>

            {/* 表单卡片 */}
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(139, 71, 137, 0.2)', 'rgba(44, 62, 80, 0.2)']}
                style={styles.glassGradient}
              />

              {/* 邮箱输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('login.email')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('login.emailPlaceholder')}
                      placeholderTextColor={COLORS.textGray}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              {/* 密码输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('login.password')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('login.passwordPlaceholder')}
                      placeholderTextColor={COLORS.textGray}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={COLORS.accent}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 忘记密码 */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
              </TouchableOpacity>

              {/* 登录按钮 */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  <Feather name="log-in" size={20} color={COLORS.textLight} />
                  <Text style={styles.loginButtonText}>
                    {loading ? t('login.loggingIn') : t('login.loginButton')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 注册链接 */}
              <View style={styles.registerSection}>
                <Text style={styles.registerText}>{t('login.noAccount')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>{t('login.registerNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mysteryLight: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  backButtonGlass: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  icon: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 2,
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
  },
  glassGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  registerText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  registerLink: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
