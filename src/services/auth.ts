/**
 * 用户认证服务
 * 处理登录、注册、密码重置等功能
 * 支持 Firebase 和本地认证，支持 Debug 模式和游客登录
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginForm, RegisterForm } from '../types';
import { DEBUG_CONFIG, logger, USE_FIREBASE } from '../config';
import * as firebaseAuth from './firebaseAuth';
import * as localAuth from './localAuth';

const AUTH_TOKEN_KEY = '@lovemix_auth_token';
const USER_DATA_KEY = '@lovemix_user_data';
const IS_GUEST_KEY = '@lovemix_is_guest';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debug 模式 - 管理员登录
 */
export const debugAdminLogin = async (): Promise<User> => {
  logger.debug('Debug admin login');

  const adminUser: User = {
    id: 'admin_debug',
    email: DEBUG_CONFIG.ADMIN_EMAIL,
    username: '管理员(Debug)',
    createdAt: new Date().toISOString(),
    membershipType: 'vip',
    lovePoints: 999999,
    usageCount: {
      faceMerge: 0,
      card: 0,
      date: 0,
      sticker: 0,
    },
  };

  const token = `debug_token_${Date.now()}`;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(adminUser));
  await AsyncStorage.setItem(IS_GUEST_KEY, 'false');

  return adminUser;
};

/**
 * 游客登录
 */
export const guestLogin = async (): Promise<User> => {
  logger.info('Guest login');

  let guestUser: User;

  if (USE_FIREBASE) {
    // 使用 Firebase 匿名登录
    guestUser = await firebaseAuth.firebaseGuestLogin();
  } else {
    // 使用本地游客登录
    await delay(500);
    guestUser = await localAuth.localGuestLogin();
  }

  // 保存到本地存储
  const token = `guest_token_${Date.now()}`;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(guestUser));
  await AsyncStorage.setItem(IS_GUEST_KEY, 'true');

  return guestUser;
};

/**
 * 检查是否为游客
 */
export const isGuestUser = async (): Promise<boolean> => {
  const isGuest = await AsyncStorage.getItem(IS_GUEST_KEY);
  return isGuest === 'true';
};

/**
 * 游客转正式用户
 */
export const convertGuestToUser = async (form: RegisterForm): Promise<User> => {
  logger.info('Convert guest to user');

  // 先注册新用户
  const newUser = await register(form);

  // 清除游客标记
  await AsyncStorage.setItem(IS_GUEST_KEY, 'false');

  return newUser;
};

/**
 * 用户登录
 */
export const login = async (form: LoginForm): Promise<User> => {
  logger.info('User login:', form.email);

  // Debug 模式 - 管理员快速登录
  if (
    DEBUG_CONFIG.ENABLED &&
    form.email === DEBUG_CONFIG.ADMIN_EMAIL &&
    form.password === DEBUG_CONFIG.ADMIN_PASSWORD
  ) {
    return debugAdminLogin();
  }

  let user: User;

  if (USE_FIREBASE) {
    // 使用 Firebase 登录
    user = await firebaseAuth.firebaseLogin(form);
  } else {
    // 使用本地登录
    await delay(1000);
    user = await localAuth.localLogin(form);
  }

  // 保存到本地存储
  const token = `token_${Date.now()}_${Math.random()}`;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(IS_GUEST_KEY, 'false');

  return user;
};

/**
 * 用户注册
 */
export const register = async (form: RegisterForm): Promise<User> => {
  logger.info('User register:', form.email);

  // 验证密码
  if (form.password !== form.confirmPassword) {
    throw new Error('两次输入的密码不一致');
  }

  if (form.password.length < 6) {
    throw new Error('密码长度至少6位');
  }

  let user: User;

  if (USE_FIREBASE) {
    // 使用 Firebase 注册
    user = await firebaseAuth.firebaseRegister(form);
  } else {
    // 使用本地注册
    await delay(1000);
    user = await localAuth.localRegister(form);
  }

  // 保存到本地存储
  const token = `token_${Date.now()}_${Math.random()}`;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(IS_GUEST_KEY, 'false');

  return user;
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  logger.info('User logout');

  // 如果使用 Firebase，先登出 Firebase
  if (USE_FIREBASE) {
    await firebaseAuth.firebaseLogout();
  }

  // 清除本地存储
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(USER_DATA_KEY);
  await AsyncStorage.removeItem(IS_GUEST_KEY);
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
  // 优先从本地存储获取
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return null;
  }

  const userData = await AsyncStorage.getItem(USER_DATA_KEY);
  if (userData) {
    return JSON.parse(userData);
  }

  // 如果本地没有，尝试从 Firebase 获取
  if (USE_FIREBASE) {
    const firebaseUser = firebaseAuth.getCurrentFirebaseUser();
    if (firebaseUser) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(firebaseUser));
      return firebaseUser;
    }
  }

  return null;
};

/**
 * 更新用户信息
 */
export const updateUser = async (updates: Partial<User>): Promise<User> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('用户未登录');
  }

  const updatedUser = { ...currentUser, ...updates };
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));

  // 游客不需要同步到用户列表
  const isGuest = await isGuestUser();
  if (!isGuest) {
    // 同步更新到用户列表
    const storedUsers = await AsyncStorage.getItem('@lovemix_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const userIndex = users.findIndex((u: any) => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await AsyncStorage.setItem('@lovemix_users', JSON.stringify(users));
    }
  }

  return updatedUser;
};

/**
 * 重置密码
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (USE_FIREBASE) {
    // 使用 Firebase 重置密码
    await firebaseAuth.firebaseResetPassword(email);
  } else {
    // 使用本地重置密码
    await delay(1000);
    await localAuth.localResetPassword(email);
  }
};

/**
 * 检查认证状态
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
};

/**
 * 监听认证状态变化（仅 Firebase 支持）
 */
export const onAuthStateChanged = USE_FIREBASE
  ? firebaseAuth.onAuthStateChanged
  : undefined;
