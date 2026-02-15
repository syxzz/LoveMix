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
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  FaceMerge: undefined;
  Card: undefined;
  Date: undefined;
  Sticker: undefined;
  Settings: undefined;
  Profile: undefined;
  CoupleProfile: undefined;
  Membership: undefined;
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

// 会员等级
export type MembershipTier = 'free' | 'premium';

// 用户档案
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  membershipTier: MembershipTier;
  credits: number; // 免费用户的使用次数
  membershipExpiry?: number; // 会员到期时间
  coupleProfile?: CoupleProfile;
  createdAt: number;
  updatedAt: number;
}

// 情侣档案
export interface CoupleProfile {
  partnerName: string;
  userNickname: string;
  partnerNickname: string;
  anniversaryDate: string;
  relationshipStatus: 'dating' | 'engaged' | 'married';
  photoURL?: string;
}

// 使用记录
export interface UsageRecord {
  id: string;
  userId: string;
  type: 'merge' | 'card' | 'date' | 'sticker';
  timestamp: number;
  creditsUsed: number;
}

// 订阅计划
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  price: number;
  duration: number; // 天数
  features: string[];
}
