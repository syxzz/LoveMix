/**
 * SettingsScreen - 设置页面
 * 管理API密钥、语言设置和应用配置
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { GradientButton } from '../components/GradientButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { userAtom, isAuthenticatedAtom } from '../store';
import { logout } from '../services/auth';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const { width, height } = Dimensions.get('window');

// 浮动气泡组件
const FloatingBubble: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -300,
            duration: 15000,
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
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: Math.random() * width,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { keys, saveKeys, removeKeys, saving } = useAPIKeys();
  const [user] = useAtom(userAtom);
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const { t } = useTranslation();

  const [replicateKey, setReplicateKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (keys.replicateKey) {
      setReplicateKey(keys.replicateKey);
    }
    if (keys.openaiKey) {
      setOpenaiKey(keys.openaiKey);
    }

    // 入场动画
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
  }, [keys]);

  const handleSave = async () => {
    if (!replicateKey.trim() && !openaiKey.trim()) {
      Alert.alert(t('common.error'), '请至少输入一个API密钥');
      return;
    }

    const success = await saveKeys({
      replicateKey: replicateKey.trim() || undefined,
      openaiKey: openaiKey.trim() || undefined,
    });

    if (success) {
      Alert.alert(t('common.success'), 'API密钥已安全保存');
    } else {
      Alert.alert('保存失败', '请重试');
    }
  };

  const handleClear = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有API密钥吗？',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            const success = await removeKeys();
            if (success) {
              setReplicateKey('');
              setOpenaiKey('');
              Alert.alert(t('common.success'), 'API密钥已清除');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          setUser(null);
          setIsAuthenticated(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'user',
      title: t('settings.profile') || '个人资料',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      icon: 'clock',
      title: '我的作品',
      onPress: () => navigation.navigate('History'),
    },
    {
      icon: 'award',
      title: '会员订阅',
      badge: user?.membershipType === 'free' ? '升级' : undefined,
      onPress: () => navigation.navigate('Membership'),
    },
    {
      icon: 'users',
      title: '作品广场',
      onPress: () => navigation.navigate('Community'),
    },
  ];

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
      {[...Array(5)].map((_, i) => (
        <FloatingBubble
          key={i}
          delay={i * 1000}
          size={60 + Math.random() * 80}
        />
      ))}

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.navButtonGlass}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.navButtonGradient}
            />
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('settings.title')}</Text>

        <View style={styles.navButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          {/* 语言选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            <LanguageSelector />
          </View>

          {/* 快捷菜单 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>账户管理</Text>
            <View style={styles.menuCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
              />
              {menuItems.map((item, index) => (
                <React.Fragment key={item.title}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuLeft}>
                      <Feather
                        name={item.icon as any}
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.menuTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.menuRight}>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* API密钥设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API密钥配置</Text>
            <Text style={styles.sectionDescription}>
              配置API密钥后可使用真实的AI生成功能。未配置时将使用模拟数据。
            </Text>

            <View style={styles.card}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
              />
              {/* Replicate API Key */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Replicate API Key</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Replicate API',
                        '用于AI图像生成功能。\n\n获取方式：\n1. 访问 replicate.com\n2. 注册并登录\n3. 在账户设置中获取API密钥'
                      )
                    }
                  >
                    <Feather name="help-circle" size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="输入Replicate API密钥"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={replicateKey}
                    onChangeText={setReplicateKey}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* OpenAI API Key */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>OpenAI API Key</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'OpenAI API',
                        '用于文案生成功能。\n\n获取方式：\n1. 访问 platform.openai.com\n2. 注册并登录\n3. 在API Keys页面创建新密钥'
                      )
                    }
                  >
                    <Feather name="help-circle" size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="输入OpenAI API密钥"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={openaiKey}
                    onChangeText={setOpenaiKey}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 按钮区域 */}
          <View style={styles.buttonSection}>
            <GradientButton
              title="💾 保存设置"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <View style={styles.clearButtonGlass}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                  style={styles.clearButtonGradient}
                />
                <Text style={styles.clearButtonText}>清除所有密钥</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 关于信息 */}
          <View style={styles.aboutCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.cardGradient}
            />
            <Text style={styles.aboutTitle}>{t('settings.about')}</Text>
            <Text style={styles.aboutText}>
              LoveMix 是一款专为情侣打造的AI创意应用，提供头像融合、纪念日卡片、虚拟约会场景和表情包生成等功能。
            </Text>
            <Text style={styles.aboutText}>{t('settings.version')}: 1.0.0</Text>
            <Text style={styles.aboutText}>
              所有数据均存储在本地，保护您的隐私安全。
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    width: 48,
    height: 48,
  },
  navButtonGlass: {
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
  navButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'DancingScript_700Bold',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'DancingScript_700Bold',
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  menuCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: 'rgba(255,107,157,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
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
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
  },
  buttonSection: {
    marginBottom: 24,
  },
  clearButton: {
    marginTop: 16,
  },
  clearButtonGlass: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  clearButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  aboutCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'DancingScript_700Bold',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
});
