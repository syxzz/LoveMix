/**
 * ProfileScreen - 个人资料页面
 * 支持游客转正式用户
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
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
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { userAtom, isAuthenticatedAtom } from '../store';
import { updateUser, isGuestUser, logout } from '../services/auth';
import { useImagePicker } from '../hooks/useImagePicker';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

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


export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const { showImagePickerOptions } = useImagePicker();
  const { t } = useTranslation();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    checkGuestStatus();

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
  }, []);

  const checkGuestStatus = async () => {
    const guestStatus = await isGuestUser();
    setIsGuest(guestStatus);
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert(t('common.error'), t('profile.usernameRequired'));
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateUser({
        username: username.trim(),
        phone: phone.trim(),
      });
      setUser(updatedUser);
      setEditMode(false);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (error: any) {
      Alert.alert(t('profile.updateFailed'), error.message || t('common.retry'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    const result = await showImagePickerOptions();
    if (result) {
      try {
        setLoading(true);
        // 更新用户头像
        const updatedUser = await updateUser({ avatar: result.uri });
        setUser(updatedUser);
        Alert.alert(t('common.success'), t('profile.avatarUpdated'));
      } catch (error: any) {
        Alert.alert(t('profile.updateFailed'), error.message || t('common.retry'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegisterFromGuest = () => {
    Alert.alert(
      '注册账号',
      '注册后可以享受更多功能，数据将保存到云端',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '立即注册',
          onPress: () => {
            // 先退出游客登录
            logout();
            setUser(null);
            setIsAuthenticated(false);
            // 跳转到注册页
            navigation.navigate('Register');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    const title = isGuest ? '退出游客模式' : '退出登录';
    const message = isGuest
      ? '退出后游客数据将丢失，确定要退出吗？'
      : '确定要退出登录吗？';

    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setUser(null);
          setIsAuthenticated(false);
          navigation.navigate('Welcome');
        },
      },
    ]);
  };

  const getMembershipBadge = () => {
    switch (user?.membershipType) {
      case 'vip':
        return { label: t('profile.vipMember'), color: '#FFD700' };
      case 'premium':
        return { label: t('profile.premiumMember'), color: '#FF6B9D' };
      default:
        return { label: t('profile.freeMember'), color: 'rgba(255,255,255,0.7)' };
    }
  };

  const membershipBadge = getMembershipBadge();

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

        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setEditMode(!editMode)}
        >
          <View style={styles.navButtonGlass}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.navButtonGradient}
            />
            <Feather
              name={editMode ? 'x' : 'edit-2'}
              size={20}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
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
          {/* 头像区域 */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangeAvatar}
              disabled={loading}
            >
              <View style={styles.avatarGlassRing}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                  style={styles.avatarRingGradient}
                />
              </View>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Feather name="user" size={56} color="rgba(255,255,255,0.9)" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <LinearGradient
                  colors={['#FF6B9D', '#C471ED']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Feather name="camera" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.membershipBadge}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.badgeGradient}
              />
              <Text
                style={[styles.membershipText, { color: membershipBadge.color }]}
              >
                {membershipBadge.label}
              </Text>
            </View>
          </View>

          {/* 个人信息卡片 */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.cardGradient}
            />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.email')}</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.username')}</Text>
              {editMode ? (
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.infoInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('register.usernamePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              ) : (
                <Text style={styles.infoValue}>{user?.username}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
              {editMode ? (
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.infoInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={t('profile.phonePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <Text style={styles.infoValue}>{user?.phone || t('profile.phoneNotSet')}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.lovePoints')}</Text>
              <Text style={[styles.infoValue, styles.lovePoints]}>
                ❤️ {user?.lovePoints || 0}
              </Text>
            </View>
          </View>

          {/* 使用统计卡片 */}
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.cardGradient}
            />
            <Text style={styles.statsTitle}>{t('profile.usageStats')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,107,157,0.3)', 'rgba(196,113,237,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.statValue}>
                    {user?.usageCount.faceMerge || 0}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{t('profile.faceMerge')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,107,157,0.3)', 'rgba(196,113,237,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.statValue}>{user?.usageCount.card || 0}</Text>
                </View>
                <Text style={styles.statLabel}>{t('profile.card')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,107,157,0.3)', 'rgba(196,113,237,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.statValue}>{user?.usageCount.date || 0}</Text>
                </View>
                <Text style={styles.statLabel}>{t('profile.date')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,107,157,0.3)', 'rgba(196,113,237,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.statValue}>
                    {user?.usageCount.sticker || 0}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{t('profile.sticker')}</Text>
              </View>
            </View>
          </View>

          {/* 游客提示卡片 */}
          {isGuest && (
            <View style={styles.guestTipCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.cardGradient}
              />
              <View style={styles.guestTipHeader}>
                <Feather name="info" size={22} color="#FFFFFF" />
                <Text style={styles.guestTipTitle}>{t('profile.guestMode')}</Text>
              </View>
              <Text style={styles.guestTipText}>
                {t('profile.guestTip')}
              </Text>
              <View style={styles.guestBenefits}>
                <Text style={styles.guestBenefitItem}>{t('profile.guestBenefit1')}</Text>
                <Text style={styles.guestBenefitItem}>{t('profile.guestBenefit2')}</Text>
                <Text style={styles.guestBenefitItem}>{t('profile.guestBenefit3')}</Text>
                <Text style={styles.guestBenefitItem}>{t('profile.guestBenefit4')}</Text>
              </View>
              <GradientButton
                title={t('profile.registerNow')}
                onPress={handleRegisterFromGuest}
              />
            </View>
          )}

          {editMode && (
            <View style={styles.buttonSection}>
              <GradientButton
                title={t('profile.saveChanges')}
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading}
              />
            </View>
          )}

          {/* 退出登录按钮 */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.logoutButtonGlass}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
              />
              <Feather name="log-out" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>
                {isGuest ? t('profile.logoutGuest') : t('profile.logout')}
              </Text>
            </View>
          </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlassRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -10,
    left: -10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  avatarRingGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  membershipBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  membershipText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  infoCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins_600SemiBold',
  },
  infoValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  infoInput: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  lovePoints: {
    color: '#FFD700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'DancingScript_700Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins_400Regular',
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  guestTipCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  guestTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  guestTipTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'DancingScript_700Bold',
  },
  guestTipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  guestBenefits: {
    marginBottom: 20,
  },
  guestBenefitItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    marginBottom: 20,
  },
  logoutButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
});
