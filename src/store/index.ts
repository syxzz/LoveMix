/**
 * 全局状态管理
 * 使用Jotai进行轻量级状态管理
 */

import { atom } from 'jotai';
import { APIKeys, GenerationResult, User, WorkHistory } from '../types';
import type { Membership } from '../types/membership';
import { VideoTaskState } from '../services/videoGeneration';

/**
 * 用户认证状态
 */
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);
export const authLoadingAtom = atom<boolean>(true);

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
 * 作品历史状态
 */
export const workHistoryAtom = atom<WorkHistory[]>([]);

/**
 * 加载状态
 */
export const loadingAtom = atom<boolean>(false);

/**
 * 当前选中的Tab
 */
export const currentTabAtom = atom<string>('home');

/**
 * 视频生成任务状态（跨屏幕共享）
 */
export const videoTaskAtom = atom<VideoTaskState>({
  taskId: null,
  status: 'idle',
  videoUrl: null,
  error: null,
});

/**
 * 当前用户会员信息缓存（本地 + 内存）
 * 会员中心先展示此数据，请求返回后更新；个人中心会员等级也读此数据
 */
export const membershipCacheAtom = atom<Membership | null>(null);
