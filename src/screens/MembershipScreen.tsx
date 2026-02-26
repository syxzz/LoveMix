/**
 * MembershipScreen - 会员中心页面
 * 显示会员信息、积分余额、会员权益等
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtomValue, useSetAtom } from 'jotai';
import { RootStackParamList, Membership, Transaction } from '../types';
import { membershipCacheAtom, userAtom } from '../store';
import {
  getCachedMembership,
  setCachedMembership,
  getCachedTransactions,
  setCachedTransactions,
} from '../services/membershipCache';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import {
  getMembership,
  getTransactions,
  MEMBERSHIP_TIERS,
  getTierConfig,
  isMembershipExpired,
  getMembershipDaysLeft,
  upgradeMembership,
} from '../services/firebase-membership';
import type { MembershipTier } from '../types/membership';

// 会员等级顺序，用于判断升级/降级
const TIER_ORDER: Record<MembershipTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  vip: 3,
};

type MembershipScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Membership'>;

export const MembershipScreen: React.FC = () => {
  const navigation = useNavigation<MembershipScreenNavigationProp>();
  const setMembershipCache = useSetAtom(membershipCacheAtom);
  const user = useAtomValue(userAtom);

  const [membership, setMembership] = useState<Membership | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Reanimated 动画：卡片呼吸、shimmer 扫光、文字脉动、旋转圈
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const shimmerX = useSharedValue(-140);
  const textOpacity = useSharedValue(0.7);
  const spinnerRotate = useSharedValue(0);

  // 先展示本地缓存，再请求并用结果替换
  useFocusEffect(
    React.useCallback(() => {
      const userId = user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }
      (async () => {
        const cached = await getCachedMembership(userId);
        const cachedTx = await getCachedTransactions(userId);
        if (cached) {
          setMembership(cached);
          setTransactions(cachedTx?.slice(0, 10) ?? []);
          setLoading(false);
          setMembershipCache(cached);
        }
        await loadData();
      })();
    }, [user?.id])
  );

  useEffect(() => {
    if (!loading) return;
    const easing = Easing.bezier(0.4, 0, 0.2, 1);
    cardScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing }),
        withTiming(1, { duration: 1200, easing })
      ),
      -1,
      true
    );
    cardOpacity.value = withRepeat(
      withSequence(
        withTiming(0.92, { duration: 1200, easing }),
        withTiming(1, { duration: 1200, easing })
      ),
      -1,
      true
    );
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(280, { duration: 1400, easing }),
        withTiming(-140, { duration: 0 })
      ),
      -1,
      false
    );
    textOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing }),
        withTiming(0.6, { duration: 600, easing })
      ),
      -1,
      true
    );
    spinnerRotate.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, [loading, cardScale, cardOpacity, shimmerX, textOpacity, spinnerRotate]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));
  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));
  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotate.value}deg` }],
  }));

  const loadData = async () => {
    const userId = user?.id;
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const membershipData = await getMembership(userId);
      const transactionsData = await getTransactions(userId);
      const txSlice = transactionsData.slice(0, 10);

      setMembership(membershipData);
      setTransactions(txSlice);
      setMembershipCache(membershipData);
      await setCachedMembership(userId, membershipData);
      await setCachedTransactions(userId, transactionsData);
    } catch (error) {
      console.error('加载会员数据失败:', error);
      Alert.alert('错误', '加载失败，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRecharge = () => {
    navigation.navigate('Recharge');
  };

  const handleUpgradeTier = (tier: MembershipTier) => {
    if (!membership) return;
    const currentOrder = TIER_ORDER[membership.tier];
    const targetOrder = TIER_ORDER[tier];
    const tierConfig = MEMBERSHIP_TIERS.find(t => t.tier === tier);
    if (!tierConfig) return;

    if (currentOrder === targetOrder) {
      Alert.alert('提示', '您已是该等级会员');
      return;
    }
    if (targetOrder < currentOrder) {
      Alert.alert('提示', '暂不支持降级，如有需要请联系客服');
      return;
    }

    const message = `升级为「${tierConfig.name}」\n· 月费 ¥${tierConfig.price}/月\n· 有效期 30 天\n· 积分消费享 ${Math.round(tierConfig.pointsDiscount * 10)} 折\n确认支付？`;
    Alert.alert('确认升级', message, [
      { text: '取消', style: 'cancel' },
      {
        text: '确认支付',
        onPress: async () => {
          try {
            setUpgradeLoading(true);
            const userId = user?.id;
            if (!userId) throw new Error('用户未登录');
            await upgradeMembership(userId, tier, 30);
            await loadData();
            Alert.alert('升级成功', `您已成功升级为${tierConfig.name}，有效期 30 天`);
          } catch (error: any) {
            console.error('升级失败:', error);
            Alert.alert('升级失败', error?.message || '请稍后重试');
          } finally {
            setUpgradeLoading(false);
          }
        },
      },
    ]);
  };

  const handleUpgrade = () => {
    Alert.alert('升级会员', '请在下方向上选择要升级的会员等级，点击卡片并确认支付即可。');
  };

  if (loading || !membership) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.background, COLORS.secondary]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCardWrap, animatedCardStyle]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loadingCard}
            >
              <Animated.View style={[styles.loadingSpinnerRing, animatedSpinnerStyle]} />
              <Animated.Text style={[styles.loadingText, animatedTextStyle]}>
                正在加载会员信息...
              </Animated.Text>
              <View style={styles.loadingSkeletons} collapsable={false}>
                <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
                <View style={[styles.skeletonLine, styles.skeletonLineMid]} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                <Animated.View style={[styles.shimmerStrip, animatedShimmerStyle]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    );
  }

  const tierConfig = getTierConfig(membership.tier);
  const isExpired = isMembershipExpired(membership);
  const daysLeft = getMembershipDaysLeft(membership);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>会员中心</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* 会员卡片 */}
        <LinearGradient
          colors={[tierConfig?.color || COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.memberCard}
        >
          <View style={styles.memberCardHeader}>
            <View style={styles.memberTierBadge}>
              <Feather name={tierConfig?.icon as any || 'user'} size={20} color={COLORS.textLight} />
              <Text style={styles.memberTierText}>{tierConfig?.name}</Text>
            </View>
            {membership.tier !== 'free' && (
              <Text style={styles.memberExpireText}>
                {isExpired ? '已过期' : `剩余${daysLeft}天`}
              </Text>
            )}
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>积分余额</Text>
            <Text style={styles.pointsValue}>{membership.points}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardButton} onPress={handleRecharge}>
              <Feather name="plus-circle" size={18} color={COLORS.textLight} />
              <Text style={styles.cardButtonText}>充值</Text>
            </TouchableOpacity>
            {membership.tier !== 'vip' && (
              <TouchableOpacity style={styles.cardButton} onPress={handleUpgrade} disabled={upgradeLoading}>
                <Feather name="arrow-up-circle" size={18} color={COLORS.textLight} />
                <Text style={styles.cardButtonText}>升级</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* 会员权益 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>会员权益</Text>
          <View style={styles.benefitsContainer}>
            {tierConfig?.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Feather name="check-circle" size={16} color={COLORS.accent} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 会员等级对比 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>会员等级</Text>
            {upgradeLoading && (
              <ActivityIndicator size="small" color={COLORS.accent} style={styles.upgradeIndicator} />
            )}
          </View>
          <View style={styles.tiersContainer}>
            {MEMBERSHIP_TIERS.filter(t => t.tier !== 'free').map((tier) => (
              <TouchableOpacity
                key={tier.tier}
                style={[
                  styles.tierCard,
                  membership.tier === tier.tier && styles.tierCardActive,
                ]}
                onPress={() => handleUpgradeTier(tier.tier)}
                disabled={upgradeLoading}
              >
                <LinearGradient
                  colors={[tier.color, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tierCardGradient}
                >
                  <Feather name={tier.icon as any} size={24} color={COLORS.textLight} />
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierPrice}>¥{tier.price}/月</Text>
                  <Text style={styles.tierDiscount}>积分{Math.round((1 - tier.pointsDiscount) * 10)}折</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 交易记录 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>交易记录</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>查看全部</Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={COLORS.textGray} />
              <Text style={styles.emptyText}>暂无交易记录</Text>
            </View>
          ) : (
            <View style={styles.transactionsContainer}>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Feather
                      name={
                        transaction.type === 'recharge'
                          ? 'arrow-down-circle'
                          : transaction.type === 'consume'
                          ? 'arrow-up-circle'
                          : 'gift'
                      }
                      size={20}
                      color={
                        transaction.amount > 0 ? COLORS.success : COLORS.error
                      }
                    />
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDesc}>{transaction.description}</Text>
                      <Text style={styles.transactionTime}>
                        {new Date(transaction.timestamp).toLocaleString('zh-CN')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.amount > 0 ? styles.amountPositive : styles.amountNegative,
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,40,66,0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingCardWrap: {
    width: '100%',
    maxWidth: 320,
  },
  loadingCard: {
    width: '100%',
    borderRadius: RADIUS.large,
    padding: SPACING.xxl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingSpinnerRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    borderTopColor: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  loadingSkeletons: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 56,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '80%',
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  skeletonLineWide: {
    width: '95%',
  },
  skeletonLineMid: {
    width: '75%',
  },
  skeletonLineShort: {
    width: '60%',
  },
  shimmerStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 80,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  memberCard: {
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(107,92,231,0.2)',
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  memberTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberTierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  memberExpireText: {
    fontSize: 12,
    color: COLORS.textLight,
    opacity: 0.8,
  },
  pointsContainer: {
    marginBottom: SPACING.lg,
  },
  pointsLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    opacity: 0.8,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.medium,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  upgradeIndicator: {
    marginLeft: SPACING.sm,
  },
  sectionMore: {
    fontSize: 12,
    color: COLORS.accent,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(107,92,231,0.08)',
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.xs,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  tiersContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  tierCard: {
    flex: 1,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierCardActive: {
    borderColor: COLORS.accent,
  },
  tierCardGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  tierName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 4,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 4,
  },
  tierDiscount: {
    fontSize: 11,
    color: COLORS.textLight,
    opacity: 0.8,
  },
  transactionsContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 11,
    color: COLORS.textGray,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: COLORS.success,
  },
  amountNegative: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: SPACING.md,
  },
  bottomSpacer: {
    height: 40,
  },
});
