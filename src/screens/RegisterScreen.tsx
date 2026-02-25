/**
 * RegisterScreen - 剧本杀主题注册页面
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
import { COLORS, RADIUS } from '../utils/constants';
import { register } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

// 漂浮符号组件
const FloatingSymbol: React.FC<{ symbol: string; delay: number }> = ({ symbol, delay }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0.4,
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
        Animated.timing(rotate, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingSymbol,
        {
          left: Math.random() * width,
          transform: [{ translateY }, { rotate: rotation }],
          opacity,
        },
      ]}
    >
      {symbol}
    </Animated.Text>
  );
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('register.alert.title'), t('register.alert.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('register.alert.title'), t('register.alert.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        email: email.trim(),
        username: username.trim(),
        password,
        confirmPassword,
      });
      setUser(user);
      setIsAuthenticated(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      Alert.alert(t('register.alert.registerFailed'), error.message || t('register.alert.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const symbols = ['🔍', '🎭', '🗝️', '📜', '🕯️', '⚖️'];

  return (
    <View style={styles.container}>
      {/* 深色渐变背景 */}
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 漂浮符号效果 */}
      {symbols.map((symbol, i) => (
        <FloatingSymbol key={i} symbol={symbol} delay={i * 1000} />
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
                <Text style={styles.icon}>🎭</Text>
              </View>
              <Text style={styles.welcomeText}>{t('register.createAccount')}</Text>
              <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
            </View>

            {/* 表单卡片 */}
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(139, 71, 137, 0.2)', 'rgba(44, 62, 80, 0.2)']}
                style={styles.glassGradient}
              />

              {/* 邮箱输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.email')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.emailPlaceholder')}
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

              {/* 用户名输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.username')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.usernamePlaceholder')}
                      placeholderTextColor={COLORS.textGray}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* 密码输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.password')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.passwordPlaceholder')}
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

              {/* 确认密码输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.confirmPassword')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={COLORS.accent} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      placeholderTextColor={COLORS.textGray}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={COLORS.accent}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 注册按钮 */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButtonGradient}
                >
                  <Feather name="user-plus" size={20} color={COLORS.textLight} />
                  <Text style={styles.registerButtonText}>
                    {loading ? '注册中...' : t('register.registerButton')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 登录链接 */}
              <View style={styles.loginSection}>
                <Text style={styles.loginText}>{t('register.hasAccount')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>{t('register.loginNow')}</Text>
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
  floatingSymbol: {
    position: 'absolute',
    fontSize: 30,
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
    marginBottom: 32,
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
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
