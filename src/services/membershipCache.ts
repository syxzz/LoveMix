/**
 * 会员数据本地缓存
 * 用于先展示本地结果，再被请求结果替换
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Membership, Transaction } from '../types/membership';

const CACHE_PREFIX = '@membership_cache';
const TX_PREFIX = '@transactions_cache';

export async function getCachedMembership(userId: string): Promise<Membership | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}_${userId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data as Membership;
  } catch {
    return null;
  }
}

export async function setCachedMembership(userId: string, membership: Membership): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}_${userId}`, JSON.stringify(membership));
  } catch (e) {
    console.warn('写入会员缓存失败', e);
  }
}

export async function getCachedTransactions(userId: string): Promise<Transaction[] | null> {
  try {
    const raw = await AsyncStorage.getItem(`${TX_PREFIX}_${userId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function setCachedTransactions(userId: string, list: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${TX_PREFIX}_${userId}`, JSON.stringify(list));
  } catch (e) {
    console.warn('写入交易缓存失败', e);
  }
}

/** 清除所有会员/交易本地缓存（供设置页「清空缓存」使用） */
export async function clearAllMembershipCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      (k) => k.startsWith(CACHE_PREFIX) || k.startsWith(TX_PREFIX)
    );
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch (e) {
    console.warn('清除会员缓存失败', e);
  }
}
