/**
 * Firebase 连接管理
 * 处理网络状态检测和自动重连
 */

import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';

let isNetworkEnabled = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * 初始化 Firebase 连接
 */
export const initFirebaseConnection = async () => {
  console.log('🔄 初始化 Firebase 连接...');

  // 延迟启动，确保 Firebase 完全初始化
  await new Promise(resolve => setTimeout(resolve, 500));

  await reconnectFirebase();
};

/**
 * 重连 Firebase
 */
const reconnectFirebase = async () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Firebase 重连失败次数过多，停止重试');
    return;
  }

  try {
    await enableNetwork(db);
    isNetworkEnabled = true;
    reconnectAttempts = 0;
    console.log('✅ Firebase 网络已启用');
  } catch (error: any) {
    console.warn(`⚠️ Firebase 重连失败 (尝试 ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}):`, error.message);
    isNetworkEnabled = false;
    reconnectAttempts++;

    // 指数退避重试：1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 16000);
    reconnectTimer = setTimeout(() => {
      reconnectFirebase();
    }, delay);
  }
};

/**
 * 手动重连
 */
export const manualReconnect = async (): Promise<boolean> => {
  reconnectAttempts = 0; // 重置重试计数
  try {
    await enableNetwork(db);
    isNetworkEnabled = true;
    console.log('✅ Firebase 手动重连成功');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase 手动重连失败:', error.message);
    // 启动自动重连
    reconnectFirebase();
    return false;
  }
};

/**
 * 检查是否在线
 */
export const isFirebaseOnline = (): boolean => {
  return isNetworkEnabled;
};
