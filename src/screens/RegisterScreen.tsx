/**
 * RegisterScreen - 注册页面
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
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { register } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

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
            toValue: 0.3,
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
      {[...Array(6)].map((_, i) => (
        <FloatingBubble
          key={i}
          delay={i * 800}
          size={50 + Math.random() * 80}
        />
      ))}

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
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.backButtonGradient}
            />
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
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
              <Text style={styles.welcomeText}>{t('register.createAccount')}</Text>
              <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
            </View>

            {/* 表单卡片 - 液态玻璃效果 */}
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.glassGradient}
              />

              {/* 邮箱输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.email')}</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="rgba(255,255,255,0.8)" />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.emailPlaceholder')}
                      placeholderTextColor="rgba(255,255,255,0.6)"
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
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="rgba(255,255,255,0.8)" />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.usernamePlaceholder')}
                      placeholderTextColor="rgba(255,255,255,0.6)"
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
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="rgba(255,255,255,0.8)" />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.passwordPlaceholder')}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="rgba(255,255,255,0.8)"
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
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="rgba(255,255,255,0.8)" />
                    <TextInput
                      style={styles.input}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      placeholderTextColor="rgba(255,255,255,0.6)"
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
                        color="rgba(255,255,255,0.8)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 注册按钮 */}
              <View style={styles.buttonSection}>
                <GradientButton
                  title={t('register.registerButton')}
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                />
              </View>

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
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
  welcomeText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    fontFamily: 'DancingScript_700Bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Poppins_400Regular',
  },
  formCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
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
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loginText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins_400Regular',
  },
  loginLink: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins_700Bold',
  },
});
