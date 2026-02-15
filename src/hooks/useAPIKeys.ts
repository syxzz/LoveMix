/**
 * API密钥管理Hook
 * 管理API密钥的获取、保存和验证
 */

import { useState, useEffect } from 'react';
import { APIKeys } from '../types';
import { getAPIKeys, saveAPIKeys, deleteAPIKeys } from '../services/storage';
import { validateReplicateKey } from '../services/replicate';
import { validateOpenAIKey } from '../services/openai';

export const useAPIKeys = () => {
  const [keys, setKeys] = useState<APIKeys>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * 加载API密钥
   */
  const loadKeys = async () => {
    try {
      setLoading(true);
      const loadedKeys = await getAPIKeys();
      setKeys(loadedKeys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存API密钥
   */
  const saveKeys = async (newKeys: APIKeys): Promise<boolean> => {
    try {
      setSaving(true);
      await saveAPIKeys(newKeys);
      setKeys(newKeys);
      return true;
    } catch (error) {
      console.error('Error saving API keys:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * 删除API密钥
   */
  const removeKeys = async (): Promise<boolean> => {
    try {
      setSaving(true);
      await deleteAPIKeys();
      setKeys({});
      return true;
    } catch (error) {
      console.error('Error deleting API keys:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * 验证Replicate密钥
   */
  const validateReplicate = async (key: string): Promise<boolean> => {
    try {
      return await validateReplicateKey(key);
    } catch (error) {
      console.error('Error validating Replicate key:', error);
      return false;
    }
  };

  /**
   * 验证OpenAI密钥
   */
  const validateOpenAI = async (key: string): Promise<boolean> => {
    try {
      return await validateOpenAIKey(key);
    } catch (error) {
      console.error('Error validating OpenAI key:', error);
      return false;
    }
  };

  /**
   * 检查是否已配置密钥
   */
  const hasKeys = (): boolean => {
    return !!(keys.replicateKey || keys.openaiKey);
  };

  /**
   * 检查是否已配置Replicate密钥
   */
  const hasReplicateKey = (): boolean => {
    return !!keys.replicateKey;
  };

  /**
   * 检查是否已配置OpenAI密钥
   */
  const hasOpenAIKey = (): boolean => {
    return !!keys.openaiKey;
  };

  // 组件挂载时加载密钥
  useEffect(() => {
    loadKeys();
  }, []);

  return {
    keys,
    loading,
    saving,
    saveKeys,
    removeKeys,
    loadKeys,
    validateReplicate,
    validateOpenAI,
    hasKeys,
    hasReplicateKey,
    hasOpenAIKey,
  };
};
