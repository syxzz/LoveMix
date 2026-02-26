/**
 * Firebase Authentication 服务
 * 用于会员系统的用户认证
 */

import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * 匿名登录（用于测试）
 */
export const signInAnonymously = async (): Promise<User> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('匿名登录失败:', error);
    throw error;
  }
};

/**
 * 邮箱密码登录
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 邮箱密码注册
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 退出登录
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('退出登录失败:', error);
    throw error;
  }
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * 获取当前用户
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * 获取当前用户ID
 */
export const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('用户未登录');
  }
  return user.uid;
};
