/**
 * Firebase 会员和积分管理服务
 *
 * 使用 Firestore 云端存储替代 AsyncStorage
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Membership,
  MembershipTier,
  MembershipTierConfig,
  Transaction,
  TransactionType,
  Order,
  OrderType,
} from '../types/membership';
import {
  MEMBERSHIP_TIERS,
  RECHARGE_PACKAGES,
  POINTS_COST,
} from './membership';

// 导出配置供其他模块使用
export { MEMBERSHIP_TIERS, RECHARGE_PACKAGES, POINTS_COST };

// Collection 名称
const MEMBERSHIPS_COLLECTION = 'memberships';
const TRANSACTIONS_COLLECTION = 'transactions';
const ORDERS_COLLECTION = 'orders';

/**
 * 获取会员信息
 */
export const getMembership = async (userId: string): Promise<Membership> => {
  try {
    const membershipRef = doc(db, MEMBERSHIPS_COLLECTION, userId);
    const membershipSnap = await getDoc(membershipRef);

    if (membershipSnap.exists()) {
      const data = membershipSnap.data();
      return {
        userId,
        tier: data.tier,
        points: data.points,
        expireDate: data.expireDate?.toMillis(),
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      };
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

/**
 * 保存会员信息
 */
export const saveMembership = async (membership: Membership): Promise<void> => {
  try {
    const membershipRef = doc(db, MEMBERSHIPS_COLLECTION, membership.userId);

    const data: any = {
      tier: membership.tier,
      points: membership.points,
      updatedAt: serverTimestamp(),
    };

    if (membership.expireDate) {
      data.expireDate = Timestamp.fromMillis(membership.expireDate);
    }

    if (!membership.createdAt) {
      data.createdAt = serverTimestamp();
    }

    await setDoc(membershipRef, data, { merge: true });
  } catch (error) {
    console.error('保存会员信息失败:', error);
    throw error;
  }
};

/**
 * 更新积分
 */
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
    const transaction: Omit<Transaction, 'id'> = {
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

/**
 * 充值积分
 */
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
    const orderData: Omit<Order, 'id'> = {
      userId,
      type: 'recharge',
      amount: pkg.price,
      points: pkg.points + pkg.bonus,
      status: 'pending',
      createdAt: Date.now(),
    };

    // 模拟支付（测试阶段直接成功）
    orderData.status = 'success';
    orderData.paidAt = Date.now();
    orderData.paymentMethod = 'test';

    const orderId = await saveOrder(orderData);
    const order: Order = { ...orderData, id: orderId };

    // 增加积分
    const totalPoints = pkg.points + pkg.bonus;
    const membership = await updatePoints(
      userId,
      totalPoints,
      'recharge',
      `充值 ${pkg.points} 积分${pkg.bonus > 0 ? ` + 赠送 ${pkg.bonus} 积分` : ''}`,
      orderId
    );

    return { membership, order };
  } catch (error) {
    console.error('充值失败:', error);
    throw error;
  }
};

/**
 * 消费积分
 */
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

/**
 * 检查积分是否足够
 */
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

/**
 * 升级会员
 */
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
    const orderData: Omit<Order, 'id'> = {
      userId,
      type: 'membership',
      amount: tierConfig.price,
      membershipTier: tier,
      status: 'pending',
      createdAt: Date.now(),
    };

    // 模拟支付（测试阶段直接成功）
    orderData.status = 'success';
    orderData.paidAt = Date.now();
    orderData.paymentMethod = 'test';

    const orderId = await saveOrder(orderData);
    const order: Order = { ...orderData, id: orderId };

    // 更新会员等级和到期时间
    membership.tier = tier;
    const currentExpire = membership.expireDate || Date.now();
    const newExpire = Math.max(currentExpire, Date.now()) + duration * 24 * 60 * 60 * 1000;
    membership.expireDate = newExpire;

    await saveMembership(membership);

    // 记录交易
    await addTransaction({
      userId,
      type: 'reward',
      amount: 0,
      balance: membership.points,
      description: `升级为${tierConfig.name}`,
      relatedId: orderId,
      timestamp: Date.now(),
    });

    return { membership, order };
  } catch (error) {
    console.error('升级会员失败:', error);
    throw error;
  }
};

/**
 * 获取交易记录
 */
export const getTransactions = async (
  userId: string,
  limitCount: number = 100
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        balance: data.balance,
        description: data.description,
        relatedId: data.relatedId,
        timestamp: data.timestamp?.toMillis() || Date.now(),
      });
    });

    return transactions;
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return [];
  }
};

/**
 * 添加交易记录
 */
const addTransaction = async (
  transaction: Omit<Transaction, 'id'>
): Promise<string> => {
  try {
    const transactionData: any = {
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      balance: transaction.balance,
      description: transaction.description,
      timestamp: Timestamp.fromMillis(transaction.timestamp),
    };

    // 只在 relatedId 有值时才添加该字段
    if (transaction.relatedId) {
      transactionData.relatedId = transaction.relatedId;
    }

    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transactionData);
    return docRef.id;
  } catch (error) {
    console.error('添加交易记录失败:', error);
    throw error;
  }
};

/**
 * 获取订单列表
 */
export const getOrders = async (
  userId: string,
  limitCount: number = 50
): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        points: data.points,
        membershipTier: data.membershipTier,
        status: data.status,
        paymentMethod: data.paymentMethod,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        paidAt: data.paidAt?.toMillis(),
        cancelledAt: data.cancelledAt?.toMillis(),
      });
    });

    return orders;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return [];
  }
};

/**
 * 保存订单
 */
const saveOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  try {
    const orderData: any = {
      userId: order.userId,
      type: order.type,
      amount: order.amount,
      status: order.status,
      createdAt: Timestamp.fromMillis(order.createdAt),
    };

    if (order.points) orderData.points = order.points;
    if (order.membershipTier) orderData.membershipTier = order.membershipTier;
    if (order.paymentMethod) orderData.paymentMethod = order.paymentMethod;
    if (order.paidAt) orderData.paidAt = Timestamp.fromMillis(order.paidAt);
    if (order.cancelledAt) orderData.cancelledAt = Timestamp.fromMillis(order.cancelledAt);

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id;
  } catch (error) {
    console.error('保存订单失败:', error);
    throw error;
  }
};

/**
 * 获取会员等级配置
 */
export const getTierConfig = (tier: MembershipTier): MembershipTierConfig | undefined => {
  return MEMBERSHIP_TIERS.find(t => t.tier === tier);
};

/**
 * 检查会员是否过期
 */
export const isMembershipExpired = (membership: Membership): boolean => {
  if (membership.tier === 'free') return false;
  if (!membership.expireDate) return true;
  return Date.now() > membership.expireDate;
};

/**
 * 获取会员剩余天数
 */
export const getMembershipDaysLeft = (membership: Membership): number => {
  if (membership.tier === 'free') return 0;
  if (!membership.expireDate) return 0;
  const daysLeft = Math.ceil((membership.expireDate - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, daysLeft);
};

/**
 * 从 AsyncStorage 迁移数据到 Firebase（仅执行一次）
 */
export const migrateFromAsyncStorage = async (userId: string): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    // 检查是否已迁移
    const migrationKey = `@migration_completed_${userId}`;
    const migrated = await AsyncStorage.getItem(migrationKey);
    if (migrated) return;

    // 迁移会员信息
    const membershipData = await AsyncStorage.getItem(`@membership_${userId}`);
    if (membershipData) {
      const membership = JSON.parse(membershipData);
      await saveMembership(membership);
    }

    // 标记为已迁移
    await AsyncStorage.setItem(migrationKey, 'true');
    console.log('数据迁移完成');
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
};
