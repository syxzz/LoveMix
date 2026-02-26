/**
 * 剧本初始化服务
 * 负责在应用启动时自动生成缺失的封面图片
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Script, Character } from '../types';
import { generateScriptCoverImage, generateCharacterAvatar, generateIntroductionImage } from './ai';

const COVER_CACHE_KEY = 'script_covers';
const AVATAR_CACHE_KEY = 'character_avatars';
const INTRO_IMAGE_CACHE_KEY = 'introduction_images';

// 封面图片缓存
interface CoverCache {
  [scriptId: string]: string; // scriptId -> imageUrl
}

// 角色头像缓存
interface AvatarCache {
  [characterId: string]: string; // characterId -> imageUrl
}

// 开场场景图片缓存
interface IntroImageCache {
  [key: string]: string; // `${scriptId}_${characterId}` -> imageUrl
}

// 内存缓存，避免重复读取 AsyncStorage
let memoryCache: CoverCache | null = null;
let avatarMemoryCache: AvatarCache | null = null;
let introImageMemoryCache: IntroImageCache | null = null;

// 初始化内存缓存
const initMemoryCache = async (): Promise<void> => {
  if (memoryCache !== null) return;

  try {
    const cacheJson = await AsyncStorage.getItem(COVER_CACHE_KEY);
    memoryCache = cacheJson ? JSON.parse(cacheJson) : {};
    console.log('📦 封面缓存已加载到内存');
  } catch (error) {
    console.error('初始化内存缓存失败:', error);
    memoryCache = {};
  }
};

// 初始化头像内存缓存
const initAvatarMemoryCache = async (): Promise<void> => {
  if (avatarMemoryCache !== null) return;

  try {
    const cacheJson = await AsyncStorage.getItem(AVATAR_CACHE_KEY);
    avatarMemoryCache = cacheJson ? JSON.parse(cacheJson) : {};
    console.log('📦 头像缓存已加载到内存');
  } catch (error) {
    console.error('初始化头像内存缓存失败:', error);
    avatarMemoryCache = {};
  }
};

// 初始化开场场景图片内存缓存
const initIntroImageMemoryCache = async (): Promise<void> => {
  if (introImageMemoryCache !== null) return;

  try {
    const cacheJson = await AsyncStorage.getItem(INTRO_IMAGE_CACHE_KEY);
    introImageMemoryCache = cacheJson ? JSON.parse(cacheJson) : {};
    console.log('📦 开场场景缓存已加载到内存');
  } catch (error) {
    console.error('初始化开场场景内存缓存失败:', error);
    introImageMemoryCache = {};
  }
};

// 同步获取缓存的封面图片（从内存读取，零延迟）
export const getCachedCoverSync = (scriptId: string): string | null => {
  // 如果内存缓存未初始化，返回 null
  if (!memoryCache) return null;

  return memoryCache[scriptId] || null;
};

// 异步获取缓存的封面图片（确保缓存已加载）
export const getCachedCover = async (scriptId: string): Promise<string | null> => {
  // 确保内存缓存已初始化
  await initMemoryCache();

  // 从内存缓存读取
  return memoryCache?.[scriptId] || null;
};

// 保存封面图片到缓存（同时更新内存和持久化存储）
export const saveCoverToCache = async (scriptId: string, imageUrl: string): Promise<void> => {
  try {
    // 确保内存缓存已初始化
    await initMemoryCache();

    // 更新内存缓存
    if (memoryCache) {
      memoryCache[scriptId] = imageUrl;
    }

    // 持久化到 AsyncStorage
    await AsyncStorage.setItem(COVER_CACHE_KEY, JSON.stringify(memoryCache));

    console.log(`✅ 封面已缓存: ${scriptId}`);
  } catch (error) {
    console.error('保存封面缓存失败:', error);
  }
};

// 为剧本生成封面图片（如果还没有）
export const ensureScriptCover = async (script: Script): Promise<string | null> => {
  // 1. 如果剧本数据中已有封面，直接返回
  if (script.coverImage) {
    console.log(`📸 剧本 ${script.title} 已有预设封面`);
    return script.coverImage;
  }

  // 2. 检查缓存中是否有封面
  const cachedCover = await getCachedCover(script.id);
  if (cachedCover) {
    console.log(`📦 从缓存加载封面: ${script.title}`);
    return cachedCover;
  }

  // 3. 生成新封面
  try {
    console.log(`🎨 为剧本 ${script.title} 生成封面...`);
    const imageUrl = await generateScriptCoverImage(script);

    // 保存到缓存
    await saveCoverToCache(script.id, imageUrl);

    console.log(`✅ 封面生成成功: ${script.title}`);
    return imageUrl;
  } catch (error) {
    console.error(`❌ 生成封面失败: ${script.title}`, error);
    return null;
  }
};

// 批量初始化所有剧本的封面（后台静默执行）
export const initializeAllScriptCovers = async (scripts: Script[]): Promise<void> => {
  console.log('🚀 开始初始化剧本封面...');

  for (const script of scripts) {
    // 跳过已有封面的剧本
    if (script.coverImage) {
      continue;
    }

    // 检查缓存
    const cachedCover = await getCachedCover(script.id);
    if (cachedCover) {
      continue;
    }

    // 后台生成封面（不阻塞主流程）
    ensureScriptCover(script).catch(error => {
      console.error(`后台生成封面失败: ${script.title}`, error);
    });

    // 避免同时发起太多请求，每个请求间隔 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ 剧本封面初始化完成');
};

// 清除封面缓存（用于调试）
export const clearCoverCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(COVER_CACHE_KEY);
    memoryCache = {};
    console.log('🗑️ 封面缓存已清除');
  } catch (error) {
    console.error('清除封面缓存失败:', error);
  }
};

export const clearAvatarCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AVATAR_CACHE_KEY);
    avatarMemoryCache = {};
    console.log('🗑️ 头像缓存已清除');
  } catch (error) {
    console.error('清除头像缓存失败:', error);
  }
};

export const clearIntroImageCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(INTRO_IMAGE_CACHE_KEY);
    introImageMemoryCache = {};
    console.log('🗑️ 开场图缓存已清除');
  } catch (error) {
    console.error('清除开场图缓存失败:', error);
  }
};

/** 清除剧本相关全部缓存（封面、角色头像、开场图） */
export const clearAllScriptCaches = async (): Promise<void> => {
  await clearCoverCache();
  await clearAvatarCache();
  await clearIntroImageCache();
};

// 预加载内存缓存（在应用启动时调用）
export const preloadCoverCache = async (): Promise<void> => {
  await initMemoryCache();
  await initAvatarMemoryCache();
  await initIntroImageMemoryCache();
  console.log('🚀 封面、头像和开场场景缓存预加载完成');
};

// ==================== 角色头像相关函数 ====================

// 同步获取缓存的角色头像（从内存读取，零延迟）
export const getCachedAvatarSync = (characterId: string): string | null => {
  if (!avatarMemoryCache) return null;
  return avatarMemoryCache[characterId] || null;
};

// 异步获取缓存的角色头像
export const getCachedAvatar = async (characterId: string): Promise<string | null> => {
  await initAvatarMemoryCache();
  return avatarMemoryCache?.[characterId] || null;
};

// 保存角色头像到缓存
export const saveAvatarToCache = async (characterId: string, imageUrl: string): Promise<void> => {
  try {
    await initAvatarMemoryCache();

    if (avatarMemoryCache) {
      avatarMemoryCache[characterId] = imageUrl;
    }

    await AsyncStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(avatarMemoryCache));
    console.log(`✅ 头像已缓存: ${characterId}`);
  } catch (error) {
    console.error('保存头像缓存失败:', error);
  }
};

// 为角色生成头像（如果还没有）
export const ensureCharacterAvatar = async (character: Character): Promise<string | null> => {
  // 1. 如果角色数据中已有头像，直接返回
  if (character.avatar) {
    console.log(`📸 角色 ${character.name} 已有预设头像`);
    return character.avatar;
  }

  // 2. 检查缓存中是否有头像
  const cachedAvatar = await getCachedAvatar(character.id);
  if (cachedAvatar) {
    console.log(`📦 从缓存加载头像: ${character.name}`);
    return cachedAvatar;
  }

  // 3. 生成新头像
  try {
    console.log(`🎨 为角色 ${character.name} 生成头像...`);
    const imageUrl = await generateCharacterAvatar(character);

    // 保存到缓存
    await saveAvatarToCache(character.id, imageUrl);

    console.log(`✅ 头像生成成功: ${character.name}`);
    return imageUrl;
  } catch (error) {
    console.error(`❌ 生成头像失败: ${character.name}`, error);
    return null;
  }
};

// 批量初始化剧本中所有角色的头像
export const initializeScriptCharacterAvatars = async (script: Script): Promise<void> => {
  console.log(`🚀 开始初始化剧本 ${script.title} 的角色头像...`);

  for (const character of script.characters) {
    // 跳过已有头像的角色
    if (character.avatar) {
      continue;
    }

    // 检查缓存
    const cachedAvatar = await getCachedAvatar(character.id);
    if (cachedAvatar) {
      continue;
    }

    // 后台生成头像
    ensureCharacterAvatar(character).catch(error => {
      console.error(`后台生成头像失败: ${character.name}`, error);
    });

    // 避免同时发起太多请求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ 剧本 ${script.title} 的角色头像初始化完成`);
};

// ==================== 开场场景图片相关函数 ====================

// 生成开场场景图片的缓存键
const getIntroImageKey = (scriptId: string, characterId: string): string => {
  return `${scriptId}_${characterId}`;
};

// 同步获取缓存的开场场景图片（从内存读取，零延迟）
export const getCachedIntroImageSync = (scriptId: string, characterId: string): string | null => {
  if (!introImageMemoryCache) return null;
  const key = getIntroImageKey(scriptId, characterId);
  return introImageMemoryCache[key] || null;
};

// 异步获取缓存的开场场景图片
export const getCachedIntroImage = async (scriptId: string, characterId: string): Promise<string | null> => {
  await initIntroImageMemoryCache();
  const key = getIntroImageKey(scriptId, characterId);
  return introImageMemoryCache?.[key] || null;
};

// 保存开场场景图片到缓存
export const saveIntroImageToCache = async (scriptId: string, characterId: string, imageUrl: string): Promise<void> => {
  try {
    await initIntroImageMemoryCache();

    const key = getIntroImageKey(scriptId, characterId);
    if (introImageMemoryCache) {
      introImageMemoryCache[key] = imageUrl;
    }

    await AsyncStorage.setItem(INTRO_IMAGE_CACHE_KEY, JSON.stringify(introImageMemoryCache));
    console.log(`✅ 开场场景已缓存: ${scriptId} - ${characterId}`);
  } catch (error) {
    console.error('保存开场场景缓存失败:', error);
  }
};

// 为剧本和角色生成开场场景图片（如果还没有）
export const ensureIntroductionImage = async (script: Script, character: Character): Promise<string | null> => {
  // 1. 检查缓存中是否有开场场景
  const cachedImage = await getCachedIntroImage(script.id, character.id);
  if (cachedImage) {
    console.log(`📦 从缓存加载开场场景: ${script.title} - ${character.name}`);
    return cachedImage;
  }

  // 2. 生成新的开场场景图片
  try {
    console.log(`🎨 为 ${script.title} - ${character.name} 生成开场场景...`);
    const imageUrl = await generateIntroductionImage(script, character);

    // 保存到缓存
    await saveIntroImageToCache(script.id, character.id, imageUrl);

    console.log(`✅ 开场场景生成成功: ${script.title} - ${character.name}`);
    return imageUrl;
  } catch (error) {
    console.error(`❌ 生成开场场景失败: ${script.title} - ${character.name}`, error);
    return null;
  }
};
