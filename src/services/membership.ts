/**
 * 会员和积分管理服务
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Membership,
  MembershipTier,
  MembershipTierConfig,
  RechargePackage,
  Transaction,
  TransactionType,
  Order,
  OrderType,
  OrderStatus,
  PointsCost,
} from '../types/membership';

// 存储键
const MEMBERSHIP_KEY = '@membership';
const TRANSACTIONS_KEY = '@transactions';
const ORDERS_KEY = '@orders';

// 会员等级配置
export const MEMBERSHIP_TIERS: MembershipTierConfig[] = [
  {
    tier: 'free',
    name: '免费会员',
    price: 0,
    benefits: ['每日1次免费剧本生成', '基础AI对话', '社区互动'],
    pointsDiscount: 1.0,
    color: '#95a5a6',
    icon: 'user',
  },
  {
    tier: 'basic',
    name: '基础会员',
    price: 19,
    benefits: ['每日3次剧本生成', '无限AI对话', '积分9折优惠', '优先客服'],
    pointsDiscount: 0.9,
    color: '#3498db',
    icon: 'star',
  },
  {
    tier: 'premium',
    name: '高级会员',
    price: 39,
    benefits: ['无限剧本生成', '无限AI对话', '积分8折优惠', '专属客服', '高级功能'],
    pointsDiscount: 0.8,
    color: '#9b59b6',
    icon: 'award',
  },
  {
    tier: 'vip',
    name: 'VIP会员',
    price: 99,
    benefits: ['所有高级权益', '积分7折优惠', '专属徽章', '优先体验新功能', '定制服务'],
    pointsDiscount: 0.7,
    color: '#f39c12',
    icon: 'zap',
  },
];

// 充值套餐
export const RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: 'package_1',
    points: 100,
    price: 10,
    bonus: 0,
  },
  {
    id: 'package_2',
    points: 300,
    price: 28,
    bonus: 20,
    popular: true,
  },
  {
    id: 'package_3',
    points: 500,
    price: 45,
    bonus: 50,
  },
  {
    id: 'package_4',
    points: 1000,
    price: 88,
    bonus: 150,
    discount: '超值',
  },
  {
    id: 'package_5',
    points: 2000,
    price: 168,
    bonus: 400,
    discount: '最划算',
  },
  {
    id: 'package_6',
    points: 5000,
    price: 388,
    bonus: 1200,
    discount: '土豪专享',
  },
];

/**
 * 积分消费基础配置（会员折扣在 consumePoints 中自动应用）
 *
 * 会员折扣：
 *   免费会员 × 1.0（无折扣）
 *   基础会员 × 0.9（9折）
 *   高级会员 × 0.8（8折）
 *   VIP      × 0.7（7折）
 */
export const POINTS_COST: PointsCost = {
  scriptGeneration: 120, // AI 剧本生成
  aiConversation: 10,    // AI 对话（每条消息）
};

// 功能中文名称（用于扣分描述）
export const FEATURE_NAMES: Record<string, string> = {
  scriptGeneration: 'AI剧本生成',
  aiConversation: 'AI对话',
};

// 获取会员信息
export const getMembership = async (userId: string): Promise<Membership> => {
  try {
    const data = await AsyncStorage.getItem(`${MEMBERSHIP_KEY}_${userId}`);
    if (data) {
      return JSON.parse(data);
    }

    // 创建默认会员信息
    const defaultMembership: Membership = {
      userId,
      tier: 'free',
      points: 100, // 新用户赠送100积分
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveMembership(defaultMembership);
    return defaultMembership;
  } catch (error) {
    console.error('获取会员信息失败:', error);
    throw error;
  }
};

// 保存会员信息
export const saveMembership = async (membership: Membership): Promise<void> => {
  try {
    membership.updatedAt = Date.now();
    await AsyncStorage.setItem(
      `${MEMBERSHIP_KEY}_${membership.userId}`,
      JSON.stringify(membership)
    );
  } catch (error) {
    console.error('保存会员信息失败:', error);
    throw error;
  }
};

// 更新积分
export const updatePoints = async (
  userId: string,
  amount: number,
  type: TransactionType,
  description: string,
  relatedId?: string
): Promise<Membership> => {
  try {
    const membership = await getMembership(userId);
    const newBalance = membership.points + amount;

    if (newBalance < 0) {
      throw new Error('积分不足');
    }

    membership.points = newBalance;
    await saveMembership(membership);

    // 记录交易
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      amount,
      balance: newBalance,
      description,
      relatedId,
      timestamp: Date.now(),
    };
    await addTransaction(transaction);

    return membership;
  } catch (error) {
    console.error('更新积分失败:', error);
    throw error;
  }
};

// 充值积分
export const rechargePoints = async (
  userId: string,
  packageId: string
): Promise<{ membership: Membership; order: Order }> => {
  try {
    const pkg = RECHARGE_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      throw new Error('充值套餐不存在');
    }

    // 创建订单
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'recharge',
      amount: pkg.price,
      points: pkg.points + pkg.bonus,
      status: 'pending',
      createdAt: Date.now(),
    };

    // 模拟支付（测试阶段直接成功）
    order.status = 'success';
    order.paidAt = Date.now();
    order.paymentMethod = 'test';

    await saveOrder(order);

    // 增加积分
    const totalPoints = pkg.points + pkg.bonus;
    const membership = await updatePoints(
      userId,
      totalPoints,
      'recharge',
      `充值 ${pkg.points} 积分${pkg.bonus > 0 ? ` + 赠送 ${pkg.bonus} 积分` : ''}`,
      order.id
    );

    return { membership, order };
  } catch (error) {
    console.error('充值失败:', error);
    throw error;
  }
};

// 消费积分
export const consumePoints = async (
  userId: string,
  amount: number,
  description: string,
  relatedId?: string
): Promise<Membership> => {
  try {
    const membership = await getMembership(userId);

    // 应用会员折扣
    const tierConfig = MEMBERSHIP_TIERS.find(t => t.tier === membership.tier);
    const discountedAmount = Math.ceil(amount * (tierConfig?.pointsDiscount || 1.0));

    return await updatePoints(userId, -discountedAmount, 'consume', description, relatedId);
  } catch (error) {
    console.error('消费积分失败:', error);
    throw error;
  }
};

// 检查积分是否足够
export const checkPoints = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const membership = await getMembership(userId);
    const tierConfig = MEMBERSHIP_TIERS.find(t => t.tier === membership.tier);
    const discountedAmount = Math.ceil(amount * (tierConfig?.pointsDiscount || 1.0));
    return membership.points >= discountedAmount;
  } catch (error) {
    console.error('检查积分失败:', error);
    return false;
  }
};

// 升级会员
export const upgradeMembership = async (
  userId: string,
  tier: MembershipTier,
  duration: number = 30 // 天数
): Promise<{ membership: Membership; order: Order }> => {
  try {
    const tierConfig = MEMBERSHIP_TIERS.find(t => t.tier === tier);
    if (!tierConfig) {
      throw new Error('会员等级不存在');
    }

    const membership = await getMembership(userId);

    // 创建订单
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'membership',
      amount: tierConfig.price,
      membershipTier: tier,
      status: 'pending',
      createdAt: Date.now(),
    };

    // 模拟支付（测试阶段直接成功）
    order.status = 'success';
    order.paidAt = Date.now();
    order.paymentMethod = 'test';

    await saveOrder(order);

    // 更新会员等级和到期时间
    membership.tier = tier;
    const currentExpire = membership.expireDate || Date.now();
    const newExpire = Math.max(currentExpire, Date.now()) + duration * 24 * 60 * 60 * 1000;
    membership.expireDate = newExpire;

    await saveMembership(membership);

    // 记录交易
    await addTransaction({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'reward',
      amount: 0,
      balance: membership.points,
      description: `升级为${tierConfig.name}`,
      relatedId: order.id,
      timestamp: Date.now(),
    });

    return { membership, order };
  } catch (error) {
    console.error('升级会员失败:', error);
    throw error;
  }
};

// 获取交易记录
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(`${TRANSACTIONS_KEY}_${userId}`);
    if (data) {
      const transactions: Transaction[] = JSON.parse(data);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return [];
  }
};

// 添加交易记录
const addTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions(transaction.userId);
    transactions.unshift(transaction);
    // 只保留最近100条记录
    const limitedTransactions = transactions.slice(0, 100);
    await AsyncStorage.setItem(
      `${TRANSACTIONS_KEY}_${transaction.userId}`,
      JSON.stringify(limitedTransactions)
    );
  } catch (error) {
    console.error('添加交易记录失败:', error);
    throw error;
  }
};

// 获取订单列表
export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    const data = await AsyncStorage.getItem(`${ORDERS_KEY}_${userId}`);
    if (data) {
      const orders: Order[] = JSON.parse(data);
      return orders.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return [];
  }
};

// 保存订单
const saveOrder = async (order: Order): Promise<void> => {
  try {
    const orders = await getOrders(order.userId);
    orders.unshift(order);
    // 只保留最近50条订单
    const limitedOrders = orders.slice(0, 50);
    await AsyncStorage.setItem(
      `${ORDERS_KEY}_${order.userId}`,
      JSON.stringify(limitedOrders)
    );
  } catch (error) {
    console.error('保存订单失败:', error);
    throw error;
  }
};

// 获取会员等级配置
export const getTierConfig = (tier: MembershipTier): MembershipTierConfig | undefined => {
  return MEMBERSHIP_TIERS.find(t => t.tier === tier);
};

// 检查会员是否过期
export const isMembershipExpired = (membership: Membership): boolean => {
  if (membership.tier === 'free') return false;
  if (!membership.expireDate) return true;
  return Date.now() > membership.expireDate;
};

// 获取会员剩余天数
export const getMembershipDaysLeft = (membership: Membership): number => {
  if (membership.tier === 'free') return 0;
  if (!membership.expireDate) return 0;
  const daysLeft = Math.ceil((membership.expireDate - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, daysLeft);
};
