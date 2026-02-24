/**
 * WelcomeScreen - 欢迎引导页
 * 应用首次启动时展示，介绍核心功能
 * 支持游客登录和 Debug 模式
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { RootStackParamList } from '../types';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { DEBUG_CONFIG, FEATURE_FLAGS } from '../config';
import { guestLogin, debugAdminLogin } from '../services/auth';
import { userAtom, isAuthenticatedAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const [loading, setLoading] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);

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

  // Debug 入口 - 连续点击 Logo 5次
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

    // 3秒后重置计数
    setTimeout(() => setDebugTapCount(0), 3000);
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo区域 - 支持 Debug 入口 */}
        <TouchableOpacity
          style={styles.logoSection}
          onPress={handleLogoPress}
          activeOpacity={1}
        >
          <Text style={styles.logo}>❤️</Text>
          <Text style={styles.appName}>LoveMix</Text>
          <Text style={styles.tagline}>AI赋能，记录每一个甜蜜瞬间</Text>
          {DEBUG_CONFIG.SHOW_DEBUG_BUTTON && debugTapCount > 0 && (
            <Text style={styles.debugHint}>
              再点击 {5 - debugTapCount} 次进入 Debug 模式
            </Text>
          )}
        </TouchableOpacity>

        {/* 功能介绍 */}
        <View style={styles.featuresSection}>
          <FeatureItem
            emoji="✨"
            title="AI头像融合"
            description="生成未来宝宝或情侣头像"
          />
          <FeatureItem
            emoji="🎨"
            title="纪念日卡片"
            description="定制专属祝福卡片"
          />
          <FeatureItem
            emoji="🌟"
            title="虚拟约会"
            description="创造浪漫约会场景"
          />
          <FeatureItem
            emoji="😊"
            title="表情包生成"
            description="制作专属情侣表情包"
          />
        </View>

        {/* 按钮区域 */}
        <View style={styles.buttonSection}>
          <GradientButton
            title="立即注册"
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          />

          {FEATURE_FLAGS.ENABLE_GUEST_MODE && (
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.guestButtonContent}>
                <View style={styles.guestIconContainer}>
                  <Feather name="user" size={18} color={COLORS.textLight} />
                </View>
                <View style={styles.guestTextContainer}>
                  <Text style={styles.guestButtonTitle}>游客快速体验</Text>
                  <Text style={styles.guestButtonSubtitle}>无需注册，立即使用</Text>
                </View>
                <Feather name="arrow-right" size={20} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>已有账号？</Text>
            <Text style={styles.loginLink}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const FeatureItem: React.FC<{
  emoji: string;
  title: string;
  description: string;
}> = ({ emoji, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  debugHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  featuresSection: {
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonSection: {
    gap: SPACING.md,
  },
  guestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: RADIUS.xlarge,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  guestIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTextContainer: {
    flex: 1,
  },
  guestButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  guestButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
