/**
 * ProfileScreen - 个人资料页面
 * 支持游客转正式用户
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom, useSetAtom } from 'jotai';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { userAtom, isAuthenticatedAtom } from '../store';
import { updateUser, isGuestUser, logout } from '../services/auth';
import { useImagePicker } from '../hooks/useImagePicker';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const { showImagePickerOptions } = useImagePicker();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkGuestStatus();
  }, []);

  const checkGuestStatus = async () => {
    const guestStatus = await isGuestUser();
    setIsGuest(guestStatus);
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('提示', '用户名不能为空');
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
      Alert.alert('更新失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    const result = await showImagePickerOptions();
    if (result) {
      try {
        const updatedUser = await updateUser({ avatar: result.uri });
        setUser(updatedUser);
        Alert.alert('成功', '头像已更新');
      } catch (error: any) {
        Alert.alert('更新失败', error.message || '请稍后重试');
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
        return { label: 'VIP会员', color: '#FFD700' };
      case 'premium':
        return { label: '高级会员', color: '#FF6B9D' };
      default:
        return { label: '免费会员', color: COLORS.textGray };
    }
  };

  const membershipBadge = getMembershipBadge();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人资料</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Feather
            name={editMode ? 'x' : 'edit-2'}
            size={20}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 头像区域 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleChangeAvatar}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={48} color={COLORS.textGray} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Feather name="camera" size={16} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>

          <View style={styles.membershipBadge}>
            <Text
              style={[styles.membershipText, { color: membershipBadge.color }]}
            >
              {membershipBadge.label}
            </Text>
          </View>
        </View>

        {/* 个人信息卡片 */}
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

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>爱心值</Text>
            <Text style={[styles.infoValue, styles.lovePoints]}>
              ❤️ {user?.lovePoints || 0}
            </Text>
          </View>
        </View>

        {/* 使用统计卡片 */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>使用统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.usageCount.faceMerge || 0}
              </Text>
              <Text style={styles.statLabel}>头像融合</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.usageCount.card || 0}</Text>
              <Text style={styles.statLabel}>纪念日卡片</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.usageCount.date || 0}</Text>
              <Text style={styles.statLabel}>虚拟约会</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.usageCount.sticker || 0}
              </Text>
              <Text style={styles.statLabel}>表情包</Text>
            </View>
          </View>
        </View>

        {/* 游客提示卡片 */}
        {isGuest && (
          <View style={styles.guestTipCard}>
            <View style={styles.guestTipHeader}>
              <Feather name="info" size={20} color={COLORS.primary} />
              <Text style={styles.guestTipTitle}>游客模式</Text>
            </View>
            <Text style={styles.guestTipText}>
              您当前使用游客模式，数据仅保存在本地。注册账号后可享受：
            </Text>
            <View style={styles.guestBenefits}>
              <Text style={styles.guestBenefitItem}>• 数据云端同步，永不丢失</Text>
              <Text style={styles.guestBenefitItem}>• 更多爱心值奖励</Text>
              <Text style={styles.guestBenefitItem}>• 社区发布作品</Text>
              <Text style={styles.guestBenefitItem}>• 升级会员享更多特权</Text>
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
          <Feather name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>
            {isGuest ? '退出游客模式' : '退出登录'}
          </Text>
        </TouchableOpacity>
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
    height: 120,
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
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
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  membershipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  lovePoints: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statsCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  buttonSection: {
    marginTop: SPACING.md,
  },
  guestTipCard: {
    backgroundColor: '#FFF9FB',
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  guestTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  guestTipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  guestTipText: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  guestBenefits: {
    marginBottom: SPACING.lg,
  },
  guestBenefitItem: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 6,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
});
