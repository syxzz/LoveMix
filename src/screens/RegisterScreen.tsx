/**
 * 注册页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { registerUser } from '../services/auth';
import { LinearGradient } from 'expo-linear-gradient';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少为6位');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, displayName);
      Alert.alert('注册成功', '欢迎加入LoveMix！已赠送10次免费使用机会 🎉');
      // 注册成功后，AuthContext会自动处理导航
    } catch (error: any) {
      Alert.alert('注册失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF69B4', '#87CEEB']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>创建账户 💑</Text>
            <Text style={styles.subtitle}>开启你的浪漫之旅</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="昵称"
                placeholderTextColor="#999"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="邮箱"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="密码（至少6位）"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="确认密码"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>注册</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>已有账户？</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                >
                  <Text style={styles.loginLink}>立即登录</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
  loginLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});
