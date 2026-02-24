/**
 * MembershipScreen - 会员订阅页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { GradientButton } from '../components/GradientButton';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { userAtom } from '../store';
import { updateUser } from '../services/auth';
import { Feather } from '@expo/vector-icons';
import { MembershipType } from '../types';

interface MembershipPlan {
  type: MembershipType;
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    type: 'free',
    name: '免费版',
    price: '¥0',
    duration: '永久',
    features: [
      '每日3次AI生成',
      '基础功能使用',
      '标准画质输出',
      '社区浏览',
    ],
  },
  {
    type: 'premium',
    name: '高级会员',
    price: '¥19.9',
    duration: '/月',
    popular: true,
    features: [
      '每日20次AI生成',
      '全部功能解锁',
      '高清画质输出',
      '优先生成队列',
      '无水印下载',
      '社区发布作品',
    ],
  },
  {
    type: 'vip',
    name: 'VIP会员',
    price: '¥99',
    duration: '/年',
    features: [
      '无限次AI生成',
      '全部功能解锁',
      '超高清画质输出',
      '最高优先级',
      '无水印下载',
      '社区发布作品',
      '专属客服支持',
      '独家模板素材',
    ],
  },
];

export const MembershipScreen: React.FC = () => {
  const navigation = useNavigation();
  const [user, setUser] = useAtom(userAtom);
  const [selectedPlan, setSelectedPlan] = useState<MembershipType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: MembershipPlan) => {
    if (plan.type === 'free') {
      Alert.alert('提示', '您已经是免费会员');
      return;
    }

    if (user?.membershipType === plan.type) {
      Alert.alert('提示', '您已经订阅了该会员');
      return;
    }

    Alert.alert(
      '确认订阅',
      `确定要订阅${plan.name}吗？\n价格：${plan.price}${plan.duration}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              setLoading(true);
              // 模拟支付流程
              await new Promise((resolve) => setTimeout(resolve, 1500));

              const expiryDate = new Date();
              if (plan.type === 'premium') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
              } else if (plan.type === 'vip') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              }

              const updatedUser = await updateUser({
                membershipType: plan.type,
                membershipExpiry: expiryDate.toISOString(),
              });
              setUser(updatedUser);

              Alert.alert('订阅成功', `恭喜您成为${plan.name}！`, [
                {
                  text: '确定',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('订阅失败', error.message || '请稍后重试');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>会员订阅</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>选择适合您的会员方案</Text>

        {MEMBERSHIP_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.type}
            style={[
              styles.planCard,
              plan.popular && styles.planCardPopular,
              user?.membershipType === plan.type && styles.planCardActive,
            ]}
            onPress={() => setSelectedPlan(plan.type)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>最受欢迎</Text>
              </View>
            )}

            {user?.membershipType === plan.type && (
              <View style={styles.activeBadge}>
                <Feather name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.activeText}>当前方案</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planDuration}>{plan.duration}</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Feather name="check" size={16} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {user?.membershipType !== plan.type && (
              <GradientButton
                title={plan.type === 'free' ? '当前方案' : '立即订阅'}
                onPress={() => handleSubscribe(plan)}
                loading={loading && selectedPlan === plan.type}
                disabled={loading}
              />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>订阅说明</Text>
          <Text style={styles.noteText}>
            • 订阅后立即生效，可享受对应会员权益{'\n'}
            • 会员到期后自动降级为免费版{'\n'}
            • 支持随时升级会员套餐{'\n'}
            • 如有问题请联系客服
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 120,
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardPopular: {
    borderColor: COLORS.primary,
  },
  planCardActive: {
    backgroundColor: '#FFF9FB',
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  planHeader: {
    marginBottom: SPACING.lg,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planDuration: {
    fontSize: 16,
    color: COLORS.textGray,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  noteSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 22,
  },
});
