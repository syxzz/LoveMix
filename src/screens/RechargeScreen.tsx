/**
 * RechargeScreen - 积分充值页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtomValue } from 'jotai';
import { RootStackParamList } from '../types';
import { userAtom } from '../store';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import { RECHARGE_PACKAGES, rechargePoints } from '../services/firebase-membership';


type RechargeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recharge'>;

export const RechargeScreen: React.FC = () => {
  const navigation = useNavigation<RechargeScreenNavigationProp>();
  const user = useAtomValue(userAtom);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doRecharge = async (packageId: string, userId: string) => {
    const pkg = RECHARGE_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    try {
      setLoading(true);
      setSelectedPackage(packageId);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const { membership } = await rechargePoints(userId, packageId);
      Alert.alert(
        '充值成功',
        `成功充值 ${pkg.points + pkg.bonus} 积分\n当前余额：${membership.points} 积分`,
        [{ text: '确定', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('充值失败:', error);
      Alert.alert('充值失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const handleRecharge = (packageId: string) => {
    const pkg = RECHARGE_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const userId = user?.id;
    if (!userId) {
      Alert.alert('提示', '请先登录后再充值');
      return;
    }

    const totalPoints = pkg.points + pkg.bonus;
    const message =
      pkg.bonus > 0
        ? `充值 ${pkg.points} 积分 + 赠送 ${pkg.bonus} 积分，共 ${totalPoints} 积分\n支付金额：¥${pkg.price}\n确认支付？`
        : `充值 ${totalPoints} 积分\n支付金额：¥${pkg.price}\n确认支付？`;

    Alert.alert('确认充值', message, [
      { text: '取消', style: 'cancel' },
      { text: '确认支付', onPress: () => doRecharge(packageId, userId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#F5F5F7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>积分充值</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tipCard}>
          <Feather name="info" size={20} color={COLORS.accent} />
          <Text style={styles.tipText}>
            积分可用于生成剧本、AI对话、图片生成等功能
          </Text>
        </View>

        <Text style={styles.sectionTitle}>选择充值套餐</Text>

        <View style={styles.packagesContainer}>
          {RECHARGE_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                pkg.popular && styles.packageCardPopular,
              ]}
              onPress={() => handleRecharge(pkg.id)}
              disabled={loading}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>热门</Text>
                </View>
              )}
              {pkg.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{pkg.discount}</Text>
                </View>
              )}

              <LinearGradient
                colors={
                  pkg.popular
                    ? [COLORS.primary, COLORS.accent]
                    : ['rgba(107,92,231,0.2)', 'rgba(27,31,59,0.1)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.packageGradient}
              >
                <View style={styles.packageHeader}>
                  <Feather
                    name="zap"
                    size={28}
                    color={pkg.popular ? COLORS.textLight : COLORS.accent}
                  />
                  <View style={styles.packageInfo}>
                    <View style={styles.pointsRow}>
                      <Text
                        style={[
                          styles.packagePoints,
                          pkg.popular && styles.packagePointsPopular,
                        ]}
                      >
                        {pkg.points}
                      </Text>
                      <Text
                        style={[
                          styles.packagePointsLabel,
                          pkg.popular && styles.packagePointsLabelPopular,
                        ]}
                      >
                        积分
                      </Text>
                    </View>
                    {pkg.bonus > 0 && (
                      <View style={styles.bonusContainer}>
                        <Feather
                          name="gift"
                          size={12}
                          color={pkg.popular ? COLORS.textLight : COLORS.success}
                        />
                        <Text
                          style={[
                            styles.bonusText,
                            pkg.popular && styles.bonusTextPopular,
                          ]}
                        >
                          +{pkg.bonus}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.packageFooter}>
                  <Text
                    style={[
                      styles.packagePrice,
                      pkg.popular && styles.packagePricePopular,
                    ]}
                  >
                    ¥{pkg.price}
                  </Text>
                  {loading && selectedPackage === pkg.id ? (
                    <View style={styles.packageButtonContainer}>
                      <Text
                        style={[
                          styles.packageButton,
                          pkg.popular && styles.packageButtonPopular,
                        ]}
                      >
                        充值中...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.packageButtonContainer}>
                      <Text
                        style={[
                          styles.packageButton,
                          pkg.popular && styles.packageButtonPopular,
                        ]}
                      >
                        充值
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={16}
                        color={pkg.popular ? COLORS.textLight : COLORS.accent}
                      />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>充值说明</Text>
          <Text style={styles.noteText}>
            • 充值成功后积分立即到账{'\n'}
            • 积分永久有效，不会过期{'\n'}
            • 会员享有积分折扣优惠{'\n'}
            • 测试阶段支付默认成功{'\n'}
            • 如有问题请联系客服
          </Text>
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
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#252842',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,40,66,0.6)',
    borderWidth: 1,
    borderColor: '#252842',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F5F7',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(201,169,110,0.1)',
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.3)',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  packagesContainer: {
    gap: SPACING.md,
  },
  packageCard: {
    width: '100%',
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  packageGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packagePoints: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  packagePointsPopular: {
    color: COLORS.textLight,
  },
  packagePointsLabel: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  packagePointsLabelPopular: {
    color: COLORS.textLight,
    opacity: 0.8,
  },
  packageInfo: {
    flex: 1,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46,204,113,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bonusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  bonusTextPopular: {
    color: COLORS.textLight,
  },
  packageFooter: {
    alignItems: 'flex-end',
    gap: 6,
  },
  packagePrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  packagePricePopular: {
    color: COLORS.textLight,
  },
  packageButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageButton: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  packageButtonPopular: {
    color: COLORS.textLight,
  },
  noteSection: {
    backgroundColor: 'rgba(107,92,231,0.1)',
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  },
});
