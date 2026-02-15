/**
 * 全局状态管理
 * 使用Jotai进行轻量级状态管理
 */

import { atom } from 'jotai';
import { APIKeys, GenerationResult } from '../types';

/**
 * 爱心值状态
 */
export const lovePointsAtom = atom<number>(520);

/**
 * API密钥状态
 */
export const apiKeysAtom = atom<APIKeys>({});

/**
 * 生成历史状态
 */
export const generationHistoryAtom = atom<GenerationResult[]>([]);

/**
 * 加载状态
 */
export const loadingAtom = atom<boolean>(false);

/**
 * 当前选中的Tab
 */
export const currentTabAtom = atom<string>('home');
