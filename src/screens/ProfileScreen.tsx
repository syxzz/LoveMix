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
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { GradientButton } from '../components/GradientButton';
import { userAtom, isAuthenticatedAtom, membershipCacheAtom } from '../store';
import { getCachedMembership } from '../services/membershipCache';
import { updateUser, isGuestUser, logout } from '../services/auth';
import { useImagePicker } from '../hooks/useImagePicker';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import type { MembershipTier } from '../types/membership';

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
  const membershipCache = useAtomValue(membershipCacheAtom);
  const setMembershipCache = useSetAtom(membershipCacheAtom);
  const { showImagePickerOptions } = useImagePicker();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // 当 user 从异步恢复（如 Firebase/AsyncStorage）后，同步到本地表单项
  useEffect(() => {
    setUsername(user?.username || '');
    setPhone(user?.phone || '');
  }, [user?.username, user?.phone]);

  useEffect(() => {
    checkGuestStatus();
  }, []);

  // 从本地缓存水合会员信息，便于个人中心显示等级（即使用户未先打开会员中心）
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    getCachedMembership(userId).then(cached => {
      if (cached) setMembershipCache(cached);
    });
  }, [user?.id, setMembershipCache]);

  useEffect(() => {
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
      Alert.alert('错误', '用户名不能为空');
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
      Alert.alert('成功', '个人资料已更新');
    } catch (error: any) {
      Alert.alert('更新失败', error.message || '请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    const result = await showImagePickerOptions();
    if (result) {
      try {
        setLoading(true);
        const updatedUser = await updateUser({ avatar: result.uri });
        setUser(updatedUser);
        Alert.alert('成功', '头像已更新');
      } catch (error: any) {
        Alert.alert('更新失败', error.message || '请重试');
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

  const getMembershipBadge = (): { label: string; color: string } => {
    const tier: MembershipTier | undefined = membershipCache?.tier ?? (user?.membershipType as MembershipTier | undefined);
    switch (tier) {
      case 'vip':
        return { label: 'VIP会员', color: '#FFD700' };
      case 'premium':
        return { label: '高级会员', color: '#FF6B9D' };
      case 'basic':
        return { label: '基础会员', color: '#3498db' };
      case 'free':
      default:
        return { label: '普通会员', color: 'rgba(232,232,232,0.7)' };
    }
  };

  const membershipBadge = getMembershipBadge();

  return (
    <View style={styles.container}>
      {/* 深色悬疑渐变背景 */}
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 神秘浮动气泡 */}
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
              colors={['rgba(139,71,137,0.4)', 'rgba(44,62,80,0.3)']}
              style={styles.navButtonGradient}
            />
            <Feather name="arrow-left" size={24} color="#D4AF37" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>个人中心</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setEditMode(!editMode)}
        >
          <View style={styles.navButtonGlass}>
            <LinearGradient
              colors={['rgba(139,71,137,0.4)', 'rgba(44,62,80,0.3)']}
              style={styles.navButtonGradient}
            />
            <Feather
              name={editMode ? 'x' : 'edit-2'}
              size={20}
              color="#D4AF37"
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
                  colors={['rgba(139,71,137,0.5)', 'rgba(212,175,55,0.3)']}
                  style={styles.avatarRingGradient}
                />
              </View>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <LinearGradient
                    colors={['rgba(139,71,137,0.4)', 'rgba(44,62,80,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Feather name="user" size={56} color="#D4AF37" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <LinearGradient
                  colors={['#8B4789', '#D4AF37']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Feather name="camera" size={18} color="#1A1A2E" />
              </View>
            </TouchableOpacity>

            <View style={styles.membershipBadge}>
              <LinearGradient
                colors={['rgba(139,71,137,0.4)', 'rgba(44,62,80,0.3)']}
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
              colors={['rgba(139,71,137,0.2)', 'rgba(44,62,80,0.15)']}
              style={styles.cardGradient}
            />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>邮箱</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>用户名</Text>
              {editMode ? (
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139,71,137,0.3)', 'rgba(44,62,80,0.2)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.infoInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="请输入用户名"
                    placeholderTextColor="rgba(212,175,55,0.5)"
                  />
                </View>
              ) : (
                <Text style={styles.infoValue}>{user?.username}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>手机号</Text>
              {editMode ? (
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={['rgba(139,71,137,0.3)', 'rgba(44,62,80,0.2)']}
                    style={styles.inputGradient}
                  />
                  <TextInput
                    style={styles.infoInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="请输入手机号"
                    placeholderTextColor="rgba(212,175,55,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <Text style={styles.infoValue}>{user?.phone || '未设置'}</Text>
              )}
            </View>
          </View>

          {/* 游客提示卡片 */}
          {isGuest && (
            <View style={styles.guestTipCard}>
              <LinearGradient
                colors={['rgba(139,71,137,0.25)', 'rgba(44,62,80,0.2)']}
                style={styles.cardGradient}
              />
              <View style={styles.guestTipHeader}>
                <Feather name="info" size={22} color="#D4AF37" />
                <Text style={styles.guestTipTitle}>游客模式</Text>
              </View>
              <Text style={styles.guestTipText}>
                您当前以游客身份登录，注册后可享受更多功能
              </Text>
              <View style={styles.guestBenefits}>
                <Text style={styles.guestBenefitItem}>✓ 数据云端保存</Text>
                <Text style={styles.guestBenefitItem}>✓ 多设备同步</Text>
                <Text style={styles.guestBenefitItem}>✓ 更多游戏剧本</Text>
                <Text style={styles.guestBenefitItem}>✓ 专属会员特权</Text>
              </View>
              <GradientButton
                title="立即注册"
                onPress={handleRegisterFromGuest}
              />
            </View>
          )}

          {editMode && (
            <View style={styles.buttonSection}>
              <GradientButton
                title="保存修改"
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
                colors={['rgba(139,71,137,0.2)', 'rgba(44,62,80,0.15)']}
                style={styles.cardGradient}
              />
              <Feather name="log-out" size={20} color="#E74C3C" />
              <Text style={styles.logoutText}>
                {isGuest ? '退出游客模式' : '退出登录'}
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
    backgroundColor: '#1A1A2E',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(139,71,137,0.15)',
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
    borderColor: 'rgba(139,71,137,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  navButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    fontFamily: 'DancingScript_700Bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    borderColor: 'rgba(139,71,137,0.6)',
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
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#D4AF37',
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
    borderColor: '#D4AF37',
    shadowColor: '#8B4789',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  membershipBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(139,71,137,0.6)',
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
    borderColor: 'rgba(139,71,137,0.4)',
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(22,33,62,0.6)',
    shadowColor: '#8B4789',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
    color: 'rgba(212,175,55,0.9)',
    fontFamily: 'Poppins_600SemiBold',
  },
  infoValue: {
    fontSize: 15,
    color: '#E8E8E8',
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,71,137,0.5)',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  infoInput: {
    fontSize: 15,
    color: '#E8E8E8',
    fontWeight: '600',
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  lovePoints: {
    color: '#D4AF37',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,71,137,0.3)',
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  guestTipCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139,71,137,0.5)',
    padding: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(22,33,62,0.6)',
    shadowColor: '#8B4789',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
    color: '#D4AF37',
    fontFamily: 'DancingScript_700Bold',
  },
  guestTipText: {
    fontSize: 15,
    color: 'rgba(232,232,232,0.9)',
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  guestBenefits: {
    marginBottom: 20,
  },
  guestBenefitItem: {
    fontSize: 14,
    color: 'rgba(232,232,232,0.85)',
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
    borderColor: 'rgba(231,76,60,0.5)',
    overflow: 'hidden',
    backgroundColor: 'rgba(22,33,62,0.4)',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
    fontFamily: 'Poppins_700Bold',
  },
});
