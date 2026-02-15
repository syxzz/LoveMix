/**
 * TypeScript类型定义文件
 * 定义整个应用中使用的所有类型接口
 */

// 图片选择结果类型
export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

// AI头像融合模式
export type MergeMode = 'baby' | 'couple';

// 纪念日卡片风格
export type CardStyle = 'romantic' | 'humorous' | 'artistic';

// 虚拟约会场景
export type DateScene = 'sunset' | 'cafe' | 'camping' | 'home' | 'sakura' | 'beach';

// 虚拟约会风格
export type DateStyle = 'realistic' | 'anime' | 'watercolor' | 'oil';

// 表情包风格
export type StickerStyle = 'cute' | 'funny' | 'pet';

// API密钥配置
export interface APIKeys {
  replicateKey?: string;
  openaiKey?: string;
}

// 生成结果接口
export interface GenerationResult {
  imageUri: string;
  timestamp: number;
  type: 'merge' | 'card' | 'date' | 'sticker';
}

// 纪念日卡片数据
export interface CardData {
  eventName: string;
  date: string;
  names: string;
  style: CardStyle;
}

// 纪念日卡片生成结果
export interface CardResult {
  image: string;
  text: string;
}

// 导航参数类型
export type RootStackParamList = {
  Home: undefined;
  FaceMerge: undefined;
  Card: undefined;
  Date: undefined;
  Sticker: undefined;
  Settings: undefined;
};

// 场景选项
export interface SceneOption {
  id: DateScene;
  emoji: string;
  label: string;
}

// 快捷标签
export interface QuickTag {
  id: string;
  text: string;
  emoji: string;
}
