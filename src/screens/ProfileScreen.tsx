/**
 * 用户资料页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, logoutUser } from '../services/auth';
import { LinearGradient } from 'expo-linear-gradient';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !displayName) {
      Alert.alert('错误', '请填写昵称');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      await refreshUserProfile();
      Alert.alert('成功', '资料已更新');
    } catch (error: any) {
      Alert.alert('更新失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
          } catch (error: any) {
            Alert.alert('退出失败', error.message);
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#FF69B4', '#87CEEB']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>个人资料</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName ? displayName[0].toUpperCase() : '?'}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>邮箱</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="输入昵称"
                editable={!loading}
              />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>会员等级</Text>
              <View style={styles.membershipRow}>
                <Text style={styles.membershipText}>
                  {userProfile?.membershipTier === 'premium' ? '高级会员 👑' : '免费会员'}
                </Text>
                {userProfile?.membershipTier === 'free' && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => navigation.navigate('Membership')}
                  >
                    <Text style={styles.upgradeText}>升级</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>剩余次数</Text>
              <Text style={styles.creditsText}>
                {userProfile?.membershipTier === 'premium'
                  ? '无限制 ∞'
                  : `${userProfile?.credits || 0} 次`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>保存修改</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.coupleButton}
              onPress={() => navigation.navigate('CoupleProfile')}
            >
              <Text style={styles.coupleButtonText}>情侣档案 💑</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  form: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 4,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditsText: {
    fontSize: 20,
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coupleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  coupleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
