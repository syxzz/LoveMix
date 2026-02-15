/**
 * 应用常量配置
 * 包含颜色、尺寸、场景选项等所有常量
 */

import { SceneOption, QuickTag } from '../types';

// 颜色常量
export const COLORS = {
  primary: '#FF69B4',
  secondary: '#87CEEB',
  background: '#FFFFFF',
  cardBg: '#F8F9FA',
  textDark: '#2C3E50',
  textLight: '#FFFFFF',
  textGray: '#6C757D',
  border: '#E0E0E0',
  error: '#FF6B6B',
  success: '#51CF66',
};

// 圆角常量
export const RADIUS = {
  small: 12,
  medium: 20,
  large: 24,
  xlarge: 32,
};

// 间距常量
export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// 字体大小常量
export const FONT_SIZES = {
  small: 14,
  regular: 16,
  button: 18,
  subtitle: 20,
  title: 28,
};

// 图标大小常量
export const ICON_SIZES = {
  small: 20,
  medium: 24,
  large: 48,
  xlarge: 72,
};

// 虚拟约会场景选项
export const DATE_SCENES: SceneOption[] = [
  { id: 'sunset', emoji: '🌅', label: '海边日落' },
  { id: 'cafe', emoji: '☕', label: '浪漫咖啡馆' },
  { id: 'camping', emoji: '⭐', label: '星空露营' },
  { id: 'home', emoji: '🏠', label: '未来之家' },
  { id: 'sakura', emoji: '🌸', label: '樱花树下' },
  { id: 'beach', emoji: '🏖️', label: '沙滩漫步' },
];

// 表情包快捷标签
export const QUICK_TAGS: QuickTag[] = [
  { id: '1', text: '想你', emoji: '❤️' },
  { id: '2', text: '晚安', emoji: '🌙' },
  { id: '3', text: '抱抱', emoji: '🤗' },
  { id: '4', text: '生气', emoji: '😤' },
  { id: '5', text: '亲亲', emoji: '😘' },
];

// 首页功能卡片数据
export const HOME_FEATURES = [
  {
    id: 'merge',
    emoji: '💑',
    title: 'AI头像融合',
    description: '生成未来宝宝或情侣头像',
    screen: 'FaceMerge',
  },
  {
    id: 'card',
    emoji: '🎂',
    title: '纪念日卡片',
    description: '定制专属祝福卡片',
    screen: 'Card',
  },
  {
    id: 'date',
    emoji: '🌅',
    title: '虚拟约会',
    description: '如果我们在一起',
    screen: 'Date',
  },
  {
    id: 'sticker',
    emoji: '😊',
    title: '表情包工坊',
    description: '聊天内容变表情',
    screen: 'Sticker',
  },
];

// 动画配置
export const ANIMATION = {
  buttonScale: 0.95,
  duration: 300,
  heartBeatDuration: 1000,
};

// 存储键名
export const STORAGE_KEYS = {
  REPLICATE_KEY: 'replicate_api_key',
  OPENAI_KEY: 'openai_api_key',
  LOVE_POINTS: 'love_points',
  GENERATION_HISTORY: 'generation_history',
};
