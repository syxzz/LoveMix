/**
 * MiniMax 视频生成服务
 * 根据案件经过生成场景还原视频，支持本地缓存
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Script } from '../types';
import { logger } from '../config';

const VIDEO_API_BASE_URL = 'https://api-image.charaboard.com/v1/minimax';
const API_KEY = 'cky_KQYbDHquDRJZBD27f09L';
const VIDEO_CACHE_KEY = 'script_video_urls';

const getVideoHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'x-app-id': '4',
  'x-platform-id': '5',
});

export interface VideoTaskState {
  taskId: string | null;
  status: 'idle' | 'submitting' | 'processing' | 'success' | 'failed';
  videoUrl: string | null;
  error: string | null;
}

const INITIAL_STATE: VideoTaskState = {
  taskId: null,
  status: 'idle',
  videoUrl: null,
  error: null,
};

// ==================== 视频缓存 ====================

interface VideoCache {
  [scriptId: string]: string;
}

let videoMemoryCache: VideoCache | null = null;

async function initVideoCache(): Promise<void> {
  if (videoMemoryCache !== null) return;
  try {
    const raw = await AsyncStorage.getItem(VIDEO_CACHE_KEY);
    videoMemoryCache = raw ? JSON.parse(raw) : {};
    logger.info('📦 [Video] 视频缓存已加载, 共', Object.keys(videoMemoryCache!).length, '条');
  } catch {
    videoMemoryCache = {};
  }
}

export async function getCachedVideoUrl(scriptId: string): Promise<string | null> {
  await initVideoCache();
  return videoMemoryCache?.[scriptId] || null;
}

export function getCachedVideoUrlSync(scriptId: string): string | null {
  return videoMemoryCache?.[scriptId] || null;
}

async function saveVideoToCache(scriptId: string, url: string): Promise<void> {
  try {
    await initVideoCache();
    if (videoMemoryCache) {
      videoMemoryCache[scriptId] = url;
    }
    await AsyncStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(videoMemoryCache));
    logger.info('🎬 [Video] 视频已缓存:', scriptId);
  } catch (err: any) {
    logger.error('保存视频缓存失败:', err.message);
  }
}

/** 清除视频缓存（供设置页「清空缓存」使用） */
export async function clearVideoCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VIDEO_CACHE_KEY);
    videoMemoryCache = {};
    logger.info('🗑️ [Video] 视频缓存已清除');
  } catch (err: any) {
    logger.error('清除视频缓存失败:', err?.message);
  }
}

// ==================== 视频生成核心 ====================

let currentTask: VideoTaskState = { ...INITIAL_STATE };
let pollingTimer: ReturnType<typeof setTimeout> | null = null;
let onStateChange: ((state: VideoTaskState) => void) | null = null;
let currentScriptId: string | null = null;

function updateState(partial: Partial<VideoTaskState>) {
  currentTask = { ...currentTask, ...partial };
  onStateChange?.(currentTask);
}

function buildVideoPrompt(script: Script): string {
  const truth = script.truth.trim().slice(0, 1200);
  const murdererChar = script.characters.find(c => c.id === script.murderer);
  const murdererName = murdererChar?.name || '未知';
  const murdererOccupation = murdererChar?.occupation || '';

  return `Cinematic reenactment of a murder mystery case. ` +
    `The story: "${script.title}". ${truth} ` +
    `The murderer is ${murdererName}, a ${murdererOccupation}. ` +
    `Show the key moments: the motive, the crime being committed, and the evidence being discovered. ` +
    `Dark cinematic lighting, suspenseful atmosphere, dramatic film noir style. ` +
    `[Push in] on the critical moment, [Tracking shot] following the murderer, then [Static shot] on the evidence.`;
}

async function submitVideoTask(script: Script): Promise<string> {
  const prompt = buildVideoPrompt(script);

  const body = {
    model: 'MiniMax-Hailuo-2.3',
    prompt,
    duration: 10,
    resolution: '768P',
    prompt_optimizer: true,
    fast_pretreatment: true,
  };

  logger.info('🎬 [Video] Submitting task, prompt length:', prompt.length);

  const response = await fetch(`${VIDEO_API_BASE_URL}/video_generation`, {
    method: 'POST',
    headers: getVideoHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  if (data.base_resp?.status_code !== 0) {
    throw new Error(data.base_resp?.status_msg || 'Video generation failed');
  }

  return data.task_id;
}

async function queryTaskStatus(taskId: string): Promise<{ status: string; fileId?: string }> {
  const response = await fetch(
    `${VIDEO_API_BASE_URL}/query/video_generation?task_id=${taskId}`,
    { headers: getVideoHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Query task failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    status: data.status?.toLowerCase(),
    fileId: data.file_id,
  };
}

async function retrieveFileUrl(fileId: string): Promise<string> {
  const response = await fetch(
    `${VIDEO_API_BASE_URL}/files/retrieve?file_id=${fileId}`,
    { headers: getVideoHeaders() }
  );

  if (!response.ok) {
    throw new Error(`File retrieve failed: ${response.status}`);
  }

  const data = await response.json();
  return data.file?.download_url || '';
}

function startPolling(taskId: string) {
  stopPolling();

  let attempt = 0;
  const maxAttempts = 120;

  const poll = async () => {
    if (attempt >= maxAttempts) {
      updateState({ status: 'failed', error: 'Video generation timed out' });
      return;
    }

    attempt++;

    try {
      const result = await queryTaskStatus(taskId);
      logger.info(`🎬 [Video] Task ${taskId} status: ${result.status} (poll #${attempt})`);

      if (result.status === 'success' && result.fileId) {
        logger.info('🎬 [Video] Generation complete! Retrieving file:', result.fileId);
        const videoUrl = await retrieveFileUrl(result.fileId);
        logger.info('🎬 [Video] Video URL:', videoUrl);

        // 自动缓存到本地
        if (currentScriptId) {
          await saveVideoToCache(currentScriptId, videoUrl);
        }

        updateState({ status: 'success', videoUrl });
        return;
      }

      if (result.status === 'failed') {
        updateState({ status: 'failed', error: 'Video generation failed on server' });
        return;
      }

      pollingTimer = setTimeout(poll, 5000);
    } catch (err: any) {
      logger.error('Video polling error:', err.message);
      pollingTimer = setTimeout(poll, 8000);
    }
  };

  pollingTimer = setTimeout(poll, 5000);
}

function stopPolling() {
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
}

// ==================== 公共 API ====================

/**
 * 为剧本生成场景还原视频（优先使用缓存）
 * 有缓存则直接返回，否则异步生成
 */
export async function startVideoGeneration(
  script: Script,
  listener: (state: VideoTaskState) => void
): Promise<void> {
  stopPolling();
  currentTask = { ...INITIAL_STATE };
  onStateChange = listener;
  currentScriptId = script.id;

  // 先检查本地缓存
  const cached = await getCachedVideoUrl(script.id);
  if (cached) {
    logger.info('🎬 [Video] 命中本地缓存:', script.title);
    updateState({ status: 'success', videoUrl: cached });
    return;
  }

  // 无缓存，发起生成
  updateState({ status: 'submitting' });
  logger.info('🎬 [Video] Starting video generation for:', script.title);

  try {
    const taskId = await submitVideoTask(script);
    logger.info('🎬 [Video] Task submitted, taskId:', taskId);
    updateState({ taskId, status: 'processing' });
    startPolling(taskId);
  } catch (err: any) {
    logger.error('🎬 [Video] Submit failed:', err.message);
    updateState({ status: 'failed', error: err.message });
  }
}

/**
 * 后台静默为剧本生成视频（不关联 UI 状态）
 * 用于剧本创建后或 app 启动时的预生成
 */
export async function generateVideoInBackground(script: Script): Promise<void> {
  const cached = await getCachedVideoUrl(script.id);
  if (cached) {
    logger.info('🎬 [Video] 已有缓存，跳过:', script.title);
    return;
  }

  logger.info('🎬 [Video] 后台生成视频:', script.title);

  try {
    const taskId = await submitVideoTask(script);
    logger.info('🎬 [Video] 后台任务已提交:', taskId);

    // 独立轮询，不影响前台状态
    let attempt = 0;
    const maxAttempts = 120;

    const bgPoll = async () => {
      if (attempt >= maxAttempts) {
        logger.error('🎬 [Video] 后台生成超时:', script.title);
        return;
      }
      attempt++;
      try {
        const result = await queryTaskStatus(taskId);
        if (result.status === 'success' && result.fileId) {
          const videoUrl = await retrieveFileUrl(result.fileId);
          await saveVideoToCache(script.id, videoUrl);
          logger.info('🎬 [Video] 后台生成完成:', script.title);
          return;
        }
        if (result.status === 'failed') {
          logger.error('🎬 [Video] 后台生成失败:', script.title);
          return;
        }
        setTimeout(bgPoll, 5000);
      } catch (err: any) {
        logger.error('🎬 [Video] 后台轮询错误:', err.message);
        setTimeout(bgPoll, 8000);
      }
    };

    setTimeout(bgPoll, 5000);
  } catch (err: any) {
    logger.error('🎬 [Video] 后台提交失败:', script.title, err.message);
  }
}

export function getVideoTaskState(): VideoTaskState {
  return { ...currentTask };
}

export function cleanupVideoTask() {
  stopPolling();
  currentTask = { ...INITIAL_STATE };
  onStateChange = null;
  currentScriptId = null;
}
