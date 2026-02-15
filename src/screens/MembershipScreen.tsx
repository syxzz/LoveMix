/**
 * 会员订阅页面
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SubscriptionPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { upgradeMembership } from '../services/auth';
import { LinearGradient } from 'expo-linear-gradient';

type MembershipScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Membership'
>;

interface Props {
  navigation: MembershipScreenNavigationProp;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '免费版',
    tier: 'free',
    price: 0,
    duration: 0,
    features: [
      '每月10次免费使用',
      '基础AI生成功能',
      '标准生成速度',
      '本地存储',
    ],
  },
  {
    id: 'premium',
    name: '高级会员',
    tier: 'premium',
    price: 29.9,
    duration: 30,
    features: [
      '无限次使用 ∞',
      '所有AI生成功能',
      '优先生成速度',
      '云端同步',
      '高清图片导出',
      '专属客服支持',
      '提前体验新功能',
    ],
  },
];

export const MembershipScreen: React.FC<Props> = ({ navigation }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) return;

    if (plan.tier === 'free') {
      Alert.alert('提示', '你当前已是免费会员');
      return;
    }

    // 这里应该集成真实的支付系统（如Stripe、支付宝等）
    Alert.alert(
      '升级会员',
      `确定要升级到${plan.name}吗？\n价格：¥${plan.price}/月`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              // 模拟支付成功
              await upgradeMembership(user.uid, plan.tier);
              await refreshUserProfile();
              Alert.alert('升级成功', '恭喜你成为高级会员！🎉');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('升级失败', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#FF69B4', '#87CEEB']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>会员订阅</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>选择适合你的计划 ✨</Text>
          <Text style={styles.subtitle}>
            升级高级会员，解锁所有功能
          </Text>

          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isCurrentPlan = userProfile?.membershipTier === plan.tier;
              const isPremium = plan.tier === 'premium';

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isPremium && styles.premiumCard,
                  ]}
                >
                  {isPremium && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>推荐</Text>
                    </View>
                  )}

                  <Text style={[styles.planName, isPremium && styles.premiumText]}>
                    {plan.name}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, isPremium && styles.premiumText]}>
                      ¥{plan.price}
                    </Text>
                    {plan.duration > 0 && (
                      <Text style={[styles.duration, isPremium && styles.premiumTextLight]}>
                        /{plan.duration}天
                      </Text>
                    )}
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureRow}>
                        <Text style={[styles.checkmark, isPremium && styles.premiumText]}>
                          ✓
                        </Text>
                        <Text style={[styles.featureText, isPremium && styles.premiumText]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      isPremium && styles.premiumButton,
                      isCurrentPlan && styles.currentButton,
                    ]}
                    onPress={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan}
                  >
                    <Text
                      style={[
                        styles.subscribeButtonText,
                        isPremium && !isCurrentPlan && styles.premiumButtonText,
                      ]}
                    >
                      {isCurrentPlan ? '当前计划' : isPremium ? '立即升级' : '当前使用'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>💡 温馨提示</Text>
            <Text style={styles.noteText}>
              • 高级会员支持自动续费{'\n'}
              • 可随时取消订阅{'\n'}
              • 支持支付宝、微信支付{'\n'}
              • 7天无理由退款
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumCard: {
    backgroundColor: '#2C3E50',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#2C3E50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  premiumText: {
    color: '#fff',
  },
  premiumTextLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  duration: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 18,
    color: '#FF69B4',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
  },
  currentButton: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumButtonText: {
    color: '#2C3E50',
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    opacity: 0.9,
  },
});
