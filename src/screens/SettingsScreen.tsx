/**
 * SettingsScreen - 设置页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom, useSetAtom } from 'jotai';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { userAtom, isAuthenticatedAtom, membershipCacheAtom } from '../store';
import { logout } from '../services/auth';
import { clearAppCache } from '../services/clearCache';
import { clearCoverCache } from '../services/scriptInit';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { keys, saveKeys, saving } = useAPIKeys();
  const [user] = useAtom(userAtom);
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setMembershipCache = useSetAtom(membershipCacheAtom);

  const [apiKey, setApiKey] = useState(keys.openaiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('错误', 'API密钥不能为空');
      return;
    }
    const success = await saveKeys({ openaiKey: apiKey.trim() });
    if (success) {
      Alert.alert('成功', 'API密钥已保存');
    } else {
      Alert.alert('错误', '保存失败');
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          await logout();
          setUser(null);
          setIsAuthenticated(false);
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      '清空缓存',
      '将清除剧本封面、角色头像、开场图、视频与会员数据的本地缓存，不影响登录与设置。确定继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          onPress: async () => {
            try {
              setClearingCache(true);
              await clearAppCache();
              setMembershipCache(null);
              Alert.alert('完成', '本地缓存已清空');
            } catch (e) {
              Alert.alert('失败', '清空缓存时出错，请重试');
            } finally {
              setClearingCache(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'user',
      title: '个人资料',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0E1A', '#141832']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 顶部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 账户管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户管理</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconCircle}>
                <Feather name="user" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.menuTitle}>个人资料</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* API 配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>配置</Text>
          <Text style={styles.sectionDescription}>
            配置 OpenAI API 密钥以使用生成功能
          </Text>

          <View style={styles.inputWrapper}>
            <Feather name="key" size={16} color={COLORS.textGray} />
            <TextInput
              style={styles.input}
              placeholder="输入 OpenAI API 密钥"
              placeholderTextColor={COLORS.textGray}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
              <Feather name={showApiKey ? 'eye' : 'eye-off'} size={16} color={COLORS.textGray} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveApiKey}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6B5CE7', '#8B7AFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Feather name="save" size={16} color={COLORS.textLight} />
              <Text style={styles.saveButtonText}>{saving ? '保存中...' : '保存'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 存储 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>存储</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleClearCache}
            disabled={clearingCache}
          >
            <View style={styles.menuLeft}>
              <Feather name="trash-2" size={20} color={COLORS.accent} />
              <Text style={styles.menuTitle}>
                {clearingCache ? '清空中...' : '清空本地缓存'}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutDivider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>类型</Text>
              <Text style={styles.aboutValue}>剧本杀推理游戏</Text>
            </View>
          </View>
        </View>

        {/* 缓存管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>缓存管理</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconCircle}>
                <Feather name="trash-2" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.menuTitle}>清除图片缓存</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* 退出 */}
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
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
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textGray,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(107,92,231,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  aboutCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  aboutLabel: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  aboutValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.medium,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
});
