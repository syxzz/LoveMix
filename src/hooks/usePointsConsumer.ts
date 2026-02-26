/**
 * usePointsConsumer
 *
 * 负责 AI 功能的积分检查、展示与扣除，统一管理各功能的积分消费逻辑：
 *  - 自动从缓存或服务端加载当前会员信息
 *  - 根据会员等级折扣计算实际消耗
 *  - ensurePoints()  ：积分不足时弹窗引导充值，返回是否可继续
 *  - consume()       ：生成成功后扣除积分并更新全局缓存
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { userAtom, membershipCacheAtom } from '../store';
import { setCachedMembership, getCachedMembership } from '../services/membershipCache';
import {
  MEMBERSHIP_TIERS,
  POINTS_COST,
  FEATURE_NAMES,
  getMembership as localGetMembership,
  consumePoints as localConsumePoints,
} from '../services/membership';
import { USE_FIREBASE } from '../config';
import type { PointsCostKey } from '../types/membership';
import type { RootStackParamList } from '../types';

// 根据 USE_FIREBASE 路由到对应后端
const getMembershipService: (userId: string) => Promise<any> = USE_FIREBASE
  ? (uid) => require('../services/firebase-membership').getMembership(uid)
  : localGetMembership;

const consumePointsService: (
  userId: string,
  amount: number,
  description: string
) => Promise<any> = USE_FIREBASE
  ? (uid, amount, desc) =>
      require('../services/firebase-membership').consumePoints(uid, amount, desc)
  : localConsumePoints;

export interface PointsConsumer {
  /** 该功能的基础积分成本（未打折） */
  baseCost: number;
  /** 当前会员折扣后的实际积分成本 */
  actualCost: number;
  /** 当前积分余额 */
  points: number;
  /** 当前会员等级 */
  tier: string;
  /** 积分是否充足 */
  hasEnoughPoints: boolean;
  /** 是否正在加载会员信息 */
  loadingMembership: boolean;
  /**
   * 检查积分是否充足
   * 不足时自动弹窗提示并引导去充值，返回 false；
   * 充足时返回 true，调用方可直接执行生成逻辑。
   */
  ensurePoints: () => boolean;
  /**
   * 扣除积分（在生成成功后调用）
   * 内部会自动更新全局缓存 atom 与 AsyncStorage。
   */
  consume: (description?: string) => Promise<void>;
}

export function usePointsConsumer(feature: PointsCostKey): PointsConsumer {
  const [user] = useAtom(userAtom);
  const membershipCache = useAtomValue(membershipCacheAtom);
  const setMembershipCache = useSetAtom(membershipCacheAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loadingMembership, setLoadingMembership] = useState(false);

  // 若全局缓存为空，自动从服务端拉取并回填
  useEffect(() => {
    if (!user?.id || membershipCache !== null || loadingMembership) return;

    let cancelled = false;
    setLoadingMembership(true);

    const load = async () => {
      try {
        // 优先读本地缓存
        const cached = await getCachedMembership(user.id);
        if (cached) {
          if (!cancelled) setMembershipCache(cached);
          return;
        }
        // 再从服务端获取
        const m = await getMembershipService(user.id);
        if (!cancelled) {
          setMembershipCache(m);
          await setCachedMembership(user.id, m);
        }
      } catch (err) {
        console.warn('[usePointsConsumer] 加载会员信息失败:', err);
      } finally {
        if (!cancelled) setLoadingMembership(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id, membershipCache]);

  const baseCost = POINTS_COST[feature];
  const tier = membershipCache?.tier ?? 'free';
  const tierConfig = MEMBERSHIP_TIERS.find(t => t.tier === tier);
  const actualCost = Math.ceil(baseCost * (tierConfig?.pointsDiscount ?? 1.0));
  const points = membershipCache?.points ?? 0;
  const hasEnoughPoints = points >= actualCost;

  const ensurePoints = (): boolean => {
    if (!user?.id) {
      Alert.alert('请先登录', '登录后即可使用 AI 生成功能');
      return false;
    }
    if (loadingMembership) {
      Alert.alert('加载中', '正在获取账户信息，请稍后重试');
      return false;
    }
    if (!hasEnoughPoints) {
      Alert.alert(
        '积分不足',
        `此操作需要 ${actualCost} 积分\n当前余额：${points} 积分\n\n充值后即可使用`,
        [
          {
            text: '去充值',
            onPress: () => navigation.navigate('Recharge'),
          },
          { text: '取消', style: 'cancel' },
        ]
      );
      return false;
    }
    return true;
  };

  const consume = async (description?: string): Promise<void> => {
    if (!user?.id) return;
    const desc = description ?? FEATURE_NAMES[feature] ?? feature;
    try {
      const newMembership = await consumePointsService(user.id, baseCost, desc);
      setMembershipCache(newMembership);
      await setCachedMembership(user.id, newMembership);
    } catch (err) {
      console.warn('[usePointsConsumer] 积分扣除失败:', err);
    }
  };

  return {
    baseCost,
    actualCost,
    points,
    tier,
    hasEnoughPoints,
    loadingMembership,
    ensurePoints,
    consume,
  };
}
