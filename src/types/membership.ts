/**
 * 会员和积分相关类型定义
 */

// 会员等级
export type MembershipTier = 'free' | 'basic' | 'premium' | 'vip';

// 会员信息
export interface Membership {
  userId: string;
  tier: MembershipTier;
  points: number; // 积分余额
  expireDate?: number; // 会员到期时间（时间戳）
  createdAt: number;
  updatedAt: number;
}

// 会员等级配置
export interface MembershipTierConfig {
  tier: MembershipTier;
  name: string;
  price: number; // 月费（元）
  benefits: string[]; // 权益列表
  pointsDiscount: number; // 积分折扣（0-1）
  color: string; // 主题色
  icon: string; // 图标名称
}

// 充值套餐
export interface RechargePackage {
  id: string;
  points: number; // 充值积分数
  price: number; // 价格（元）
  bonus: number; // 赠送积分
  popular?: boolean; // 是否热门
  discount?: string; // 折扣标签
}

// 交易记录类型
export type TransactionType =
  | 'recharge' // 充值
  | 'consume' // 消费
  | 'reward' // 奖励
  | 'refund'; // 退款

// 交易记录
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // 积分变动数量（正数为增加，负数为减少）
  balance: number; // 交易后余额
  description: string; // 交易描述
  relatedId?: string; // 关联ID（如订单ID、剧本ID等）
  timestamp: number;
}

// 订单状态
export type OrderStatus = 'pending' | 'success' | 'failed' | 'cancelled';

// 订单类型
export type OrderType = 'recharge' | 'membership';

// 订单信息
export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  amount: number; // 金额（元）
  points?: number; // 充值积分数（仅充值订单）
  membershipTier?: MembershipTier; // 会员等级（仅会员订单）
  status: OrderStatus;
  paymentMethod?: string; // 支付方式
  createdAt: number;
  paidAt?: number;
  cancelledAt?: number;
}

// 积分消费项目
export interface PointsCost {
  scriptGeneration: number; // 生成剧本
  aiConversation: number; // AI对话（每条消息）
  imageGeneration: number; // 生成图片
  groupDiscussion: number; // 群聊讨论（每轮）
}
