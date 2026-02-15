/**
 * 本地存储服务
 * 使用AsyncStorage进行数据持久化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';
import { APIKeys, GenerationResult } from '../types';

/**
 * 保存API密钥（加密存储）
 */
export const saveAPIKeys = async (keys: APIKeys): Promise<void> => {
  try {
    if (keys.replicateKey) {
      await SecureStore.setItemAsync(STORAGE_KEYS.REPLICATE_KEY, keys.replicateKey);
    }
    if (keys.openaiKey) {
      await SecureStore.setItemAsync(STORAGE_KEYS.OPENAI_KEY, keys.openaiKey);
    }
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
};

/**
 * 获取API密钥
 */
export const getAPIKeys = async (): Promise<APIKeys> => {
  try {
    const replicateKey = await SecureStore.getItemAsync(STORAGE_KEYS.REPLICATE_KEY);
    const openaiKey = await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_KEY);

    return {
      replicateKey: replicateKey || undefined,
      openaiKey: openaiKey || undefined,
    };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return {};
  }
};

/**
 * 删除API密钥
 */
export const deleteAPIKeys = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REPLICATE_KEY);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.OPENAI_KEY);
  } catch (error) {
    console.error('Error deleting API keys:', error);
  }
};

/**
 * 保存爱心值
 */
export const saveLovePoints = async (points: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOVE_POINTS, points.toString());
  } catch (error) {
    console.error('Error saving love points:', error);
  }
};

/**
 * 获取爱心值
 */
export const getLovePoints = async (): Promise<number> => {
  try {
    const points = await AsyncStorage.getItem(STORAGE_KEYS.LOVE_POINTS);
    return points ? parseInt(points, 10) : 520;
  } catch (error) {
    console.error('Error getting love points:', error);
    return 520;
  }
};

/**
 * 增加爱心值
 */
export const addLovePoints = async (amount: number): Promise<number> => {
  try {
    const currentPoints = await getLovePoints();
    const newPoints = currentPoints + amount;
    await saveLovePoints(newPoints);
    return newPoints;
  } catch (error) {
    console.error('Error adding love points:', error);
    return 520;
  }
};

/**
 * 保存生成历史
 */
export const saveGenerationHistory = async (result: GenerationResult): Promise<void> => {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
    const history: GenerationResult[] = historyJson ? JSON.parse(historyJson) : [];
    history.unshift(result);

    // 只保留最近50条记录
    const trimmedHistory = history.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving generation history:', error);
  }
};

/**
 * 获取生成历史
 */
export const getGenerationHistory = async (): Promise<GenerationResult[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting generation history:', error);
    return [];
  }
};

/**
 * 清除生成历史
 */
export const clearGenerationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GENERATION_HISTORY);
  } catch (error) {
    console.error('Error clearing generation history:', error);
  }
};
