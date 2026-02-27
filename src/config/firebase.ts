/**
 * Firebase 配置
 * 从环境变量读取配置信息
 *
 * 在 Expo/React Native 中使用 experimentalForceLongPolling 避免
 * "Failed to get document because the client is offline"（WebSocket 连接不稳定时发生）
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// 从环境变量读取 Firebase 配置
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 验证配置
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase 配置缺失，请检查 .env 文件');
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 使用 initializeFirestore + 长轮询，在 Expo/RN 下更稳定（避免 client is offline）
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  // 增加缓存大小，避免频繁网络请求
  cacheSizeBytes: 40000000, // 40MB
});

// 使用 AsyncStorage 持久化认证状态，避免每次重启都需要重新登录
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 延迟初始化连接管理（在 App.tsx 中调用）
export const initConnection = async () => {
  const { initFirebaseConnection } = await import('../services/firebaseConnection');
  await initFirebaseConnection();
};

export default app;
