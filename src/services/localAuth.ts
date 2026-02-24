/**
 * 本地模拟认证服务
 * 用于开发测试或作为 Firebase 的备用方案
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginForm, RegisterForm } from '../types';
import { logger } from '../config';

const STORAGE_KEY = '@lovemix_users';
const CURRENT_USER_KEY = '@lovemix_current_user';

/**
 * 本地用户登录
 */
export const localLogin = async (form: LoginForm): Promise<User> => {
  logger.info('Local login:', form.email);

  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find(
      (u) => u.email === form.email
    );

    if (!user) {
      throw new Error('用户不存在');
    }

    // 注意：实际应用中不应该明文存储密码
    // 这里仅用于演示，实际应该使用加密或 Firebase
    const storedPassword = await AsyncStorage.getItem(`@password_${user.id}`);

    if (storedPassword !== form.password) {
      throw new Error('密码错误');
    }

    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  } catch (error: any) {
    logger.error('Local login error:', error);
    throw error;
  }
};

/**
 * 本地用户注册
 */
export const localRegister = async (form: RegisterForm): Promise<User> => {
  logger.info('Local register:', form.email);

  if (form.password !== form.confirmPassword) {
    throw new Error('两次输入的密码不一致');
  }

  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // 检查邮箱是否已存在
    if (users.some((u) => u.email === form.email)) {
      throw new Error('该邮箱已被注册');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: form.email,
      username: form.username,
      createdAt: new Date().toISOString(),
      membershipType: 'free',
      lovePoints: 520,
      usageCount: {
        faceMerge: 0,
        card: 0,
        date: 0,
        sticker: 0,
      },
    };

    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(`@password_${newUser.id}`, form.password);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
  } catch (error: any) {
    logger.error('Local register error:', error);
    throw error;
  }
};

/**
 * 本地游客登录
 */
export const localGuestLogin = async (): Promise<User> => {
  logger.info('Local guest login');

  const guestUser: User = {
    id: `guest_${Date.now()}`,
    email: '',
    username: '游客用户',
    createdAt: new Date().toISOString(),
    membershipType: 'free',
    lovePoints: 100,
    usageCount: {
      faceMerge: 0,
      card: 0,
      date: 0,
      sticker: 0,
    },
  };

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
};

/**
 * 本地登出
 */
export const localLogout = async (): Promise<void> => {
  logger.info('Local logout');
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * 本地重置密码
 */
export const localResetPassword = async (email: string): Promise<void> => {
  logger.info('Local reset password:', email);

  const usersJson = await AsyncStorage.getItem(STORAGE_KEY);
  const users: User[] = usersJson ? JSON.parse(usersJson) : [];

  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 模拟发送重置邮件
  logger.info('Password reset email sent to:', email);
};

/**
 * 获取当前本地用户
 */
export const getCurrentLocalUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    logger.error('Get current user error:', error);
    return null;
  }
};
