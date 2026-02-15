/**
 * SettingsScreen - 设置页面
 * 管理API密钥和应用设置
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientButton } from '../components/GradientButton';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { keys, saveKeys, removeKeys, saving } = useAPIKeys();
  const { userProfile } = useAuth();
  const { getCreditsText, isPremium } = useCredits();

  const [replicateKey, setReplicateKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  useEffect(() => {
    if (keys.replicateKey) {
      setReplicateKey(keys.replicateKey);
    }
    if (keys.openaiKey) {
      setOpenaiKey(keys.openaiKey);
    }
  }, [keys]);

  const handleSave = async () => {
    if (!replicateKey.trim() && !openaiKey.trim()) {
      Alert.alert('提示', '请至少输入一个API密钥');
      return;
    }

    const success = await saveKeys({
      replicateKey: replicateKey.trim() || undefined,
      openaiKey: openaiKey.trim() || undefined,
    });

    if (success) {
      Alert.alert('保存成功', 'API密钥已安全保存');
    } else {
      Alert.alert('保存失败', '请重试');
    }
  };

  const handleClear = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有API密钥吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            const success = await removeKeys();
            if (success) {
              setReplicateKey('');
              setOpenaiKey('');
              Alert.alert('清除成功', 'API密钥已清除');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题栏 */}
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
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 用户信息卡片 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {userProfile?.displayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.displayName || '未登录'}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email || ''}</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>
                  {isPremium() ? '👑 高级会员' : '免费会员'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* 快捷功能 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快捷功能</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="user" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>个人资料</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CoupleProfile')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="heart" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>情侣档案</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Membership')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="star" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>会员订阅</Text>
                <Text style={styles.creditsText}>{getCreditsText()}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* API密钥设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API密钥配置</Text>
          <Text style={styles.sectionDescription}>
            配置API密钥后可使用真实的AI生成功能。未配置时将使用模拟数据。
          </Text>

          <View style={styles.card}>
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
                  <Feather name="help-circle" size={18} color={COLORS.textGray} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="输入Replicate API密钥"
                placeholderTextColor={COLORS.textGray}
                value={replicateKey}
                onChangeText={setReplicateKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
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
                  <Feather name="help-circle" size={18} color={COLORS.textGray} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="输入OpenAI API密钥"
                placeholderTextColor={COLORS.textGray}
                value={openaiKey}
                onChangeText={setOpenaiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
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
            <Text style={styles.clearButtonText}>清除所有密钥</Text>
          </TouchableOpacity>
        </View>

        {/* 关于信息 */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>关于 LoveMix</Text>
          <Text style={styles.aboutText}>
            LoveMix 是一款专为情侣打造的AI创意应用，提供头像融合、纪念日卡片、虚拟约会场景和表情包生成等功能。
          </Text>
          <Text style={styles.aboutText}>
            版本：1.0.0
          </Text>
          <Text style={styles.aboutText}>
            所有数据均存储在本地，保护您的隐私安全。
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textDark,
  },
  buttonSection: {
    marginBottom: SPACING.xl,
  },
  clearButton: {
    marginTop: SPACING.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
  aboutSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  bottomSpacer: {
    height: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 8,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  menuTextContainer: {
    flex: 1,
  },
  creditsText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
});
