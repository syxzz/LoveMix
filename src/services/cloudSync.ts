/**
 * 云端同步服务（CloudBase 版本）
 * 处理用户数据和生成历史的云端同步
 */

import { db } from '../config/cloudbase';
import { GenerationResult, UsageRecord } from '../types';

/**
 * 保存生成结果到云端
 */
export const saveGenerationToCloud = async (
  userId: string,
  result: GenerationResult
): Promise<void> => {
  try {
    await db.collection('users').doc(userId).collection('generations').add({
      ...result,
      createdAt: Date.now(),
    });
  } catch (error: any) {
    throw new Error(`保存失败: ${error.message}`);
  }
};

/**
 * 从云端获取生成历史
 */
export const getGenerationsFromCloud = async (
  userId: string,
  limitCount: number = 50
): Promise<GenerationResult[]> => {
  try {
    const res = await db
      .collection('users')
      .doc(userId)
      .collection('generations')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    return res.data as GenerationResult[];
  } catch (error: any) {
    throw new Error(`获取历史失败: ${error.message}`);
  }
};

/**
 * 删除云端生成记录
 */
export const deleteGenerationFromCloud = async (
  userId: string,
  generationId: string
): Promise<void> => {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('generations')
      .doc(generationId)
      .remove();
  } catch (error: any) {
    throw new Error(`删除失败: ${error.message}`);
  }
};

/**
 * 记录使用历史
 */
export const recordUsage = async (
  userId: string,
  type: 'merge' | 'card' | 'date' | 'sticker',
  creditsUsed: number
): Promise<void> => {
  try {
    const record: UsageRecord = {
      id: '',
      userId,
      type,
      timestamp: Date.now(),
      creditsUsed,
    };

    await db.collection('users').doc(userId).collection('usage').add(record);
  } catch (error: any) {
    throw new Error(`记录使用失败: ${error.message}`);
  }
};

/**
 * 获取使用统计
 */
export const getUsageStats = async (
  userId: string,
  days: number = 30
): Promise<{
  total: number;
  byType: Record<string, number>;
}> => {
  try {
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const res = await db
      .collection('users')
      .doc(userId)
      .collection('usage')
      .where('timestamp', '>=', startTime)
      .get();

    let total = 0;
    const byType: Record<string, number> = {
      merge: 0,
      card: 0,
      date: 0,
      sticker: 0,
    };

    res.data.forEach((record: any) => {
      total++;
      byType[record.type] = (byType[record.type] || 0) + 1;
    });

    return { total, byType };
  } catch (error: any) {
    throw new Error(`获取统计失败: ${error.message}`);
  }
};

/**
 * 同步本地数据到云端
 */
export const syncLocalToCloud = async (
  userId: string,
  localGenerations: GenerationResult[]
): Promise<void> => {
  try {
    const promises = localGenerations.map((generation) =>
      saveGenerationToCloud(userId, generation)
    );
    await Promise.all(promises);
  } catch (error: any) {
    throw new Error(`同步失败: ${error.message}`);
  }
};
