/**
 * ProfileScreen - 个人资料页面
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
import { COLORS, SPACING, RADIUS } from '../utils/constants';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(24)).current;

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, tension: 40, friction: 9, useNativeDriver: true }),
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
      const updatedUser = await updateUser({ username: username.trim(), phone: phone.trim() });
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
    Alert.alert('注册账号', '注册后可以享受更多功能，数据将保存到云端', [
      { text: '取消', style: 'cancel' },
      {
        text: '立即注册',
        onPress: () => {
          logout();
          setUser(null);
          setIsAuthenticated(false);
          navigation.navigate('Register');
        },
      },
    ]);
  };

  const handleLogout = () => {
    const title = isGuest ? '退出游客模式' : '退出登录';
    const message = isGuest ? '退出后游客数据将丢失，确定要退出吗？' : '确定要退出登录吗？';
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
      <LinearGradient
        colors={['#0C0E1A', '#141832', '#1B1F3B']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人中心</Text>
        <TouchableOpacity style={styles.navButton} onPress={() => setEditMode(!editMode)}>
          <Feather name={editMode ? 'x' : 'edit-2'} size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          {/* 头像 */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar} disabled={loading}>
              <View style={styles.avatarRing}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={44} color={COLORS.textGray} />
                  </View>
                )}
              </View>
              <View style={styles.cameraIcon}>
                <Feather name="camera" size={14} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>

            <View style={[styles.membershipBadge, { borderColor: `${membershipBadge.color}40` }]}>
              <Text style={[styles.membershipText, { color: membershipBadge.color }]}>
                {membershipBadge.label}
              </Text>
            </View>
          </View>

          {/* 信息卡片 */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>邮箱</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>用户名</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="请输入用户名"
                  placeholderTextColor={COLORS.textGray}
                />
              ) : (
                <Text style={styles.infoValue}>{user?.username}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>手机号</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="请输入手机号"
                  placeholderTextColor={COLORS.textGray}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{user?.phone || '未设置'}</Text>
              )}
            </View>
          </View>

          {/* 游客提示 */}
          {isGuest && (
            <View style={styles.guestTipCard}>
              <View style={styles.guestTipHeader}>
                <Feather name="info" size={18} color={COLORS.primary} />
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
              <GradientButton title="立即注册" onPress={handleRegisterFromGuest} />
            </View>
          )}

          {editMode && (
            <View style={styles.buttonSection}>
              <GradientButton title="保存修改" onPress={handleUpdateProfile} loading={loading} disabled={loading} />
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>{isGuest ? '退出游客模式' : '退出登录'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,40,66,0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
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
    marginVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: 'rgba(107,92,231,0.3)',
    borderRadius: 60,
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  membershipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(37,40,66,0.5)',
  },
  membershipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  infoInput: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(37,40,66,0.5)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  guestTipCard: {
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(107,92,231,0.25)',
    padding: 20,
    marginBottom: 20,
  },
  guestTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  guestTipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  guestTipText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 14,
    lineHeight: 20,
  },
  guestBenefits: {
    marginBottom: 18,
  },
  guestBenefitItem: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
    lineHeight: 18,
  },
  buttonSection: {
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS.medium,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
});
