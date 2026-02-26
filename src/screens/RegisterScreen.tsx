/**
 * RegisterScreen - 精致注册页面
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

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, tension: 40, friction: 9, useNativeDriver: true }),
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
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error: any) {
      Alert.alert(t('register.alert.registerFailed'), error.message || t('register.alert.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0E1A', '#141832', '#1B1F3B']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonContainer}>
            <Feather name="arrow-left" size={22} color={COLORS.textDark} />
          </View>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
          >
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Feather name="user-plus" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.welcomeText}>{t('register.createAccount')}</Text>
              <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.email')}</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={18} color={COLORS.textGray} />
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.username')}</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={18} color={COLORS.textGray} />
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.password')}</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={COLORS.textGray} />
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
                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={COLORS.textGray} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('register.confirmPassword')}</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={COLORS.textGray} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    placeholderTextColor={COLORS.textGray}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={18} color={COLORS.textGray} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6B5CE7', '#8B7AFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButtonGradient}
                >
                  <Text style={styles.registerButtonText}>
                    {loading ? '注册中...' : t('register.registerButton')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

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
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,40,66,0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 130 : 110,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(107,92,231,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(107,92,231,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 28,
    color: COLORS.textLight,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textGray,
    letterSpacing: 0.3,
  },
  formCard: {
    borderRadius: RADIUS.large,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.textGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(37,40,66,0.5)',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.textDark,
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  registerButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  registerButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textGray,
  },
  loginLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.primary,
  },
});
