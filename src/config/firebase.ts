/**
 * Firebase 配置
 * 从环境变量读取配置信息
 *
 * 在 Expo/React Native 中使用 experimentalForceLongPolling 避免
 * "Failed to get document because the client is offline"（WebSocket 连接不稳定时发生）
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore, enableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
});

// 确保使用网络（避免被判定为离线）
enableNetwork(db).catch(() => {});
export const auth = getAuth(app);

export default app;
