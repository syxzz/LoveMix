/**
 * Firebase 认证服务
 * 使用 Firebase JS SDK 进行用户认证（兼容 Expo）
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { User, LoginForm, RegisterForm } from '../types';
import { logger, FIREBASE_CONFIG } from '../config';

// 初始化 Firebase
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(FIREBASE_CONFIG);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);

// 导出 firebaseApp 供其他服务使用
export { firebaseApp };

/**
 * 将 Firebase 用户转换为应用用户格式
 */
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || (firebaseUser.isAnonymous ? '游客用户' : '用户'),
    avatar: firebaseUser.photoURL || undefined,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    membershipType: 'free',
    lovePoints: 520,
    usageCount: {
      faceMerge: 0,
      card: 0,
      date: 0,
      sticker: 0,
    },
  };
};

/**
 * Firebase 用户登录
 */
export const firebaseLogin = async (form: LoginForm): Promise<User> => {
  logger.info('Firebase login:', form.email);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      form.email,
      form.password
    );

    return convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    logger.error('Firebase login error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Firebase 用户注册
 */
export const firebaseRegister = async (form: RegisterForm): Promise<User> => {
  logger.info('Firebase register:', form.email);

  if (form.password !== form.confirmPassword) {
    throw new Error('两次输入的密码不一致');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      form.email,
      form.password
    );

    const firebaseUser = userCredential.user;

    // 更新用户名
    await updateProfile(firebaseUser, {
      displayName: form.username,
    });

    return convertFirebaseUser(firebaseUser);
  } catch (error: any) {
    logger.error('Firebase register error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Firebase 游客登录
 */
export const firebaseGuestLogin = async (): Promise<User> => {
  logger.info('Firebase guest login');

  try {
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    return {
      id: firebaseUser.uid,
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
  } catch (error: any) {
    logger.error('Firebase guest login error:', error);
    throw new Error('游客登录失败');
  }
};

/**
 * Firebase 登出
 */
export const firebaseLogout = async (): Promise<void> => {
  logger.info('Firebase logout');
  await signOut(auth);
};

/**
 * Firebase 重置密码
 */
export const firebaseResetPassword = async (email: string): Promise<void> => {
  logger.info('Firebase reset password:', email);

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    logger.error('Firebase reset password error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * 获取当前 Firebase 用户
 */
export const getCurrentFirebaseUser = (): User | null => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  return convertFirebaseUser(firebaseUser);
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(convertFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};

/**
 * 转换 Firebase 错误信息为中文
 */
function getFirebaseErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': '该邮箱已被注册',
    'auth/invalid-email': '邮箱格式不正确',
    'auth/operation-not-allowed': '操作不被允许',
    'auth/weak-password': '密码强度太弱',
    'auth/user-disabled': '该账号已被禁用',
    'auth/user-not-found': '用户不存在',
    'auth/wrong-password': '密码错误',
    'auth/too-many-requests': '请求过于频繁，请稍后再试',
    'auth/network-request-failed': '网络连接失败',
    'auth/invalid-credential': '登录凭证无效',
  };

  return errorMessages[code] || '操作失败，请稍后重试';
}
