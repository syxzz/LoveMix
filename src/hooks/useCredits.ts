/**
 * 使用额度管理Hook
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { deductCredits } from '../services/auth';

export const useCredits = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(false);

  /**
   * 检查是否有足够的额度
   */
  const checkCredits = async (amount: number = 1): Promise<boolean> => {
    if (!user || !userProfile) {
      Alert.alert('提示', '请先登录');
      return false;
    }

    // 高级会员无限制
    if (userProfile.membershipTier === 'premium') {
      return true;
    }

    // 检查免费用户额度
    if (userProfile.credits < amount) {
      Alert.alert(
        '额度不足',
        `你的剩余次数不足。\n当前剩余：${userProfile.credits}次\n需要：${amount}次\n\n升级高级会员即可无限使用！`,
        [
          { text: '取消', style: 'cancel' },
          { text: '升级会员', onPress: () => {
            // 这里应该导航到会员页面，但由于Hook中无法直接访问navigation
            // 所以返回false，让调用方处理导航
          }},
        ]
      );
      return false;
    }

    return true;
  };

  /**
   * 使用额度
   */
  const useCredits = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    setChecking(true);
    try {
      const success = await deductCredits(user.uid, amount);
      if (success) {
        await refreshUserProfile();
        return true;
      } else {
        Alert.alert(
          '额度不足',
          '升级高级会员即可无限使用！',
          [
            { text: '取消', style: 'cancel' },
            { text: '升级会员' },
          ]
        );
        return false;
      }
    } catch (error: any) {
      Alert.alert('错误', error.message);
      return false;
    } finally {
      setChecking(false);
    }
  };

  /**
   * 获取剩余额度显示文本
   */
  const getCreditsText = (): string => {
    if (!userProfile) return '未登录';

    if (userProfile.membershipTier === 'premium') {
      return '无限制 ∞';
    }

    return `${userProfile.credits} 次`;
  };

  /**
   * 是否为高级会员
   */
  const isPremium = (): boolean => {
    return userProfile?.membershipTier === 'premium';
  };

  return {
    checkCredits,
    useCredits,
    getCreditsText,
    isPremium,
    checking,
    credits: userProfile?.credits || 0,
    membershipTier: userProfile?.membershipTier || 'free',
  };
};
