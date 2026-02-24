/**
 * 开发配置文件
 * 包含 Debug 模式、环境变量等配置
 */

// Debug 模式配置
export const DEBUG_CONFIG = {
  // 是否启用 Debug 模式
  ENABLED: __DEV__, // 开发环境自动启用

  // 管理员账号（Debug 模式下可免登录）
  ADMIN_EMAIL: 'admin@lovemix.app',
  ADMIN_PASSWORD: 'admin123',

  // 是否显示 Debug 入口
  SHOW_DEBUG_BUTTON: __DEV__,

  // 是否跳过认证检查
  SKIP_AUTH: false, // 手动设置为 true 可跳过所有认证

  // 模拟数据
  USE_MOCK_DATA: true, // 未配置 API 时使用模拟数据

  // 日志级别
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
};

// Firebase 配置（需要替换为你的实际配置）
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// 是否启用 Firebase
export const USE_FIREBASE = Boolean(FIREBASE_CONFIG.apiKey);

// API 端点配置
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
};

// 功能开关
export const FEATURE_FLAGS = {
  // 是否启用游客模式
  ENABLE_GUEST_MODE: true,

  // 是否启用社区功能
  ENABLE_COMMUNITY: true,

  // 是否启用会员系统
  ENABLE_MEMBERSHIP: true,

  // 是否启用支付功能
  ENABLE_PAYMENT: false, // 暂未实现真实支付
};

// 日志工具
export const logger = {
  debug: (...args: any[]) => {
    if (DEBUG_CONFIG.LOG_LEVEL === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    console.log('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
