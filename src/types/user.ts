/**
 * 用户相关类型定义
 */

// 用户信息
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  membershipType: MembershipType;
  membershipExpiry?: string;
  lovePoints: number;
  usageCount: {
    faceMerge: number;
    card: number;
    date: number;
    sticker: number;
  };
}

// 会员类型
export type MembershipType = 'free' | 'premium' | 'vip';

// 会员权益
export interface MembershipBenefits {
  type: MembershipType;
  name: string;
  price: number;
  duration: number; // 天数
  features: string[];
  dailyLimit: {
    faceMerge: number;
    card: number;
    date: number;
    sticker: number;
  };
}

// 登录表单
export interface LoginForm {
  email: string;
  password: string;
}

// 注册表单
export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
