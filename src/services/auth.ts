/**
 * 认证服务（CloudBase 版本）
 * 处理用户登录、注册、登出等操作
 */

import { auth, db } from '../config/firebase';
import { UserProfile, MembershipTier } from '../types';

/**
 * 用户注册
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<any> => {
  try {
    // CloudBase 邮箱注册
    const result = await auth.signUpWithEmailAndPassword(email, password);

    if (result.user) {
      // 创建用户档案
      await createUserProfile(result.user.uid, {
        email,
        displayName,
        membershipTier: 'free',
        credits: 10, // 新用户赠送10次免费使用
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 用户登录
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 用户登出
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 发送密码重置邮件
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 创建用户档案
 */
export const createUserProfile = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    await db.collection('users').doc(uid).set({
      ...profileData,
      uid,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 获取用户档案
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const res = await db.collection('users').doc(uid).get();
    if (res.data && res.data.length > 0) {
      return res.data[0] as UserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 更新用户档案
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    await db.collection('users').doc(uid).update({
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 扣除使用次数
 */
export const deductCredits = async (uid: string, amount: number = 1): Promise<boolean> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return false;

    // 高级会员无限制
    if (profile.membershipTier === 'premium') {
      return true;
    }

    // 检查积分是否足够
    if (profile.credits < amount) {
      return false;
    }

    // 扣除积分
    await updateUserProfile(uid, {
      credits: profile.credits - amount,
    });

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * 升级会员
 */
export const upgradeMembership = async (
  uid: string,
  tier: MembershipTier
): Promise<void> => {
  try {
    await updateUserProfile(uid, {
      membershipTier: tier,
      membershipExpiry: tier === 'premium' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
