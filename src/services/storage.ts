/**
 * 本地存储服务
 * 使用AsyncStorage进行数据持久化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';
import { GameProgress, APIKeys } from '../types';

/**
 * 保存API密钥（加密存储）- 兼容旧版本
 */
export const saveAPIKeys = async (keys: APIKeys): Promise<void> => {
  try {
    if (keys.openaiKey) {
      await SecureStore.setItemAsync(STORAGE_KEYS.OPENAI_KEY, keys.openaiKey);
    }
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
};

/**
 * 获取API密钥 - 兼容旧版本
 */
export const getAPIKeys = async (): Promise<APIKeys> => {
  try {
    const openaiKey = await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_KEY);
    return {
      openaiKey: openaiKey || undefined,
    };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return {};
  }
};

/**
 * 删除API密钥 - 兼容旧版本
 */
export const deleteAPIKeys = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.OPENAI_KEY);
  } catch (error) {
    console.error('Error deleting API keys:', error);
  }
};

/**
 * 保存OpenAI API密钥（加密存储）
 */
export const saveAPIKey = async (key: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.OPENAI_KEY, key);
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
};

/**
 * 获取OpenAI API密钥
 */
export const getAPIKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_KEY);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

/**
 * 删除API密钥
 */
export const deleteAPIKey = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.OPENAI_KEY);
  } catch (error) {
    console.error('Error deleting API key:', error);
  }
};

/**
 * 保存游戏进度
 */
export const saveGameProgress = async (progress: GameProgress): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.GAME_PROGRESS}_${progress.scriptId}`;
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving game progress:', error);
    throw error;
  }
};

/**
 * 获取游戏进度
 */
export const getGameProgress = async (scriptId: string): Promise<GameProgress | null> => {
  try {
    const key = `${STORAGE_KEYS.GAME_PROGRESS}_${scriptId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting game progress:', error);
    return null;
  }
};

/**
 * 删除游戏进度
 */
export const deleteGameProgress = async (scriptId: string): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.GAME_PROGRESS}_${scriptId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting game progress:', error);
    throw error;
  }
};

/**
 * 保存已完成的剧本
 */
export const saveCompletedScript = async (scriptId: string, success: boolean): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_SCRIPTS);
    const completed = data ? JSON.parse(data) : {};
    completed[scriptId] = { completed: true, success, timestamp: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_SCRIPTS, JSON.stringify(completed));
  } catch (error) {
    console.error('Error saving completed script:', error);
    throw error;
  }
};

/**
 * 获取已完成的剧本
 */
export const getCompletedScripts = async (): Promise<Record<string, any>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_SCRIPTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting completed scripts:', error);
    return {};
  }
};

/**
 * 获取用户统计数据
 */
export const getUserStats = async (): Promise<{
  gamesPlayed: number;
  successCount: number;
  successRate: number;
}> => {
  try {
    const completed = await getCompletedScripts();
    const games = Object.values(completed);
    const gamesPlayed = games.length;
    const successCount = games.filter((g: any) => g.success).length;
    const successRate = gamesPlayed > 0 ? Math.round((successCount / gamesPlayed) * 100) : 0;

    return { gamesPlayed, successCount, successRate };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { gamesPlayed: 0, successCount: 0, successRate: 0 };
  }
};
