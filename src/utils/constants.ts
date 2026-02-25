/**
 * 应用常量配置
 * 包含颜色、尺寸、游戏配置等所有常量
 */

// 颜色常量 - 剧本杀悬疑主题
export const COLORS = {
  primary: '#8B4789',      // 神秘紫
  secondary: '#2C3E50',    // 深蓝灰
  accent: '#D4AF37',       // 金色
  background: '#1A1A2E',   // 深色背景
  cardBg: '#16213E',       // 卡片背景
  textDark: '#E8E8E8',     // 浅色文字
  textLight: '#FFFFFF',    // 白色文字
  textGray: '#A0A0A0',     // 灰色文字
  border: '#3A3A52',       // 边框色
  error: '#E74C3C',        // 错误红
  success: '#27AE60',      // 成功绿
  warning: '#F39C12',      // 警告橙
  clueImportant: '#E74C3C', // 重要线索
  clueKey: '#F39C12',      // 关键线索
  clueNormal: '#3498DB',   // 普通线索
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

// 游戏难度等级
export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: '简单', color: '#27AE60' },
  { id: 'medium', label: '中等', color: '#F39C12' },
  { id: 'hard', label: '困难', color: '#E74C3C' },
];

// 游戏阶段
export const GAME_PHASES = [
  { id: 'intro', label: '开场介绍', icon: '📖' },
  { id: 'search', label: '搜证阶段', icon: '🔍' },
  { id: 'discuss', label: '讨论阶段', icon: '💬' },
  { id: 'vote', label: '投票阶段', icon: '🗳️' },
  { id: 'result', label: '结果揭晓', icon: '🎭' },
];

// 线索类型
export const CLUE_TYPES = [
  { id: 'key', label: '关键线索', color: '#F39C12', icon: '⭐' },
  { id: 'important', label: '重要线索', color: '#E74C3C', icon: '❗' },
  { id: 'normal', label: '普通线索', color: '#3498DB', icon: '📝' },
];

// 动画配置
export const ANIMATION = {
  buttonScale: 0.95,
  duration: 300,
  heartBeatDuration: 1000,
};

// 存储键名
export const STORAGE_KEYS = {
  OPENAI_KEY: 'openai_api_key',
  GAME_PROGRESS: 'game_progress',
  COMPLETED_SCRIPTS: 'completed_scripts',
  USER_STATS: 'user_stats',
  CUSTOM_SCRIPTS: 'custom_scripts',
};
