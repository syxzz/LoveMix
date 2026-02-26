/**
 * SettingsScreen - 剧本杀主题设置页面
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
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
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
      ]
    );
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
        colors={[COLORS.background, COLORS.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 顶部导航 */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 快捷菜单 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户管理</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Feather name={item.icon as any} size={20} color={COLORS.accent} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* API密钥设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI配置</Text>
          <Text style={styles.sectionDescription}>
            配置OpenAI API密钥以使用AI生成功能
          </Text>

          <View style={styles.inputWrapper}>
            <LinearGradient
              colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
              style={styles.inputGradient}
            />
            <View style={styles.inputContainer}>
              <Feather name="key" size={20} color={COLORS.accent} />
              <TextInput
                style={styles.input}
                placeholder="输入OpenAI API密钥"
                placeholderTextColor={COLORS.textGray}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                <Feather
                  name={showApiKey ? 'eye' : 'eye-off'}
                  size={20}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveApiKey}
            disabled={saving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Feather name="save" size={18} color={COLORS.textLight} />
              <Text style={styles.saveButtonText}>
                {saving ? '保存中...' : '保存'}
              </Text>
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
            <Text style={styles.aboutText}>版本: 1.0.0</Text>
            <Text style={styles.aboutText}>剧本杀推理游戏</Text>
          </View>
        </View>

        {/* 退出登录 */}
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={COLORS.error} />
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
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  placeholder: {
    width: 40,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
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
  saveButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  aboutCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
});
