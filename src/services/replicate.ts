/**
 * Replicate API服务
 * 包含AI图像生成相关的API调用和模拟数据
 */

import { MergeMode, CardData, CardResult, DateScene, DateStyle, StickerStyle } from '../types';
import { delay } from '../utils/helpers';

/**
 * 生成融合头像（AI头像融合）
 * @param image1 第一张图片URI
 * @param image2 第二张图片URI
 * @param mode 融合模式：'baby' 或 'couple'
 * @returns 生成的图片URI
 */
export const generateMergedFace = async (
  image1: string,
  image2: string,
  mode: MergeMode
): Promise<string> => {
  // 模拟API延迟
  await delay(3000);

  // 根据模式返回不同的模拟图片
  if (mode === 'baby') {
    return 'https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Future+Baby+%F0%9F%91%B6';
  } else {
    return 'https://via.placeholder.com/400x400/87CEEB/FFFFFF?text=Couple+Avatar+%F0%9F%92%91';
  }
};

/**
 * 生成纪念日卡片
 * @param cardData 卡片数据
 * @returns 卡片图片和文案
 */
export const generateCard = async (cardData: CardData): Promise<CardResult> => {
  // 模拟API延迟
  await delay(2500);

  // 根据风格生成不同的祝福文案
  let text = '';
  switch (cardData.style) {
    case 'romantic':
      text = `亲爱的${cardData.names}，\n在这个特别的${cardData.eventName}，\n愿我们的爱情如繁星般璀璨，\n永远闪耀在彼此的心中。❤️`;
      break;
    case 'humorous':
      text = `嘿！${cardData.names}！\n又到了${cardData.eventName}啦！\n感谢你一直忍受我的小毛病，\n让我们继续快乐地闹腾下去吧！😄`;
      break;
    case 'artistic':
      text = `${cardData.names}，\n时光流转，岁月如歌，\n在这${cardData.eventName}之际，\n愿我们的故事如诗般美好。🌸`;
      break;
  }

  return {
    image: 'https://via.placeholder.com/600x400/FF69B4/FFFFFF?text=Anniversary+Card+%F0%9F%8E%82',
    text,
  };
};

/**
 * 生成虚拟约会场景
 * @param image1 第一张图片URI
 * @param image2 第二张图片URI
 * @param scene 场景类型
 * @param style 风格类型
 * @returns 生成的场景图片URI
 */
export const generateDateScene = async (
  image1: string,
  image2: string,
  scene: DateScene,
  style: DateStyle
): Promise<string> => {
  // 模拟API延迟
  await delay(3500);

  // 根据场景返回不同的模拟图片
  const sceneEmojis: Record<DateScene, string> = {
    sunset: '🌅',
    cafe: '☕',
    camping: '⭐',
    home: '🏠',
    sakura: '🌸',
    beach: '🏖️',
  };

  const emoji = sceneEmojis[scene];
  return `https://via.placeholder.com/500x500/87CEEB/FFFFFF?text=Virtual+Date+${emoji}`;
};

/**
 * 生成表情包
 * @param text 输入文本
 * @param style 表情包风格
 * @returns 生成的表情包图片URI数组（4张）
 */
export const generateStickers = async (
  text: string,
  style: StickerStyle
): Promise<string[]> => {
  // 模拟API延迟
  await delay(3000);

  // 返回4张模拟表情包
  return [
    'https://via.placeholder.com/200x200/FF69B4/FFFFFF?text=%F0%9F%98%8A',
    'https://via.placeholder.com/200x200/87CEEB/FFFFFF?text=%F0%9F%A5%B0',
    'https://via.placeholder.com/200x200/FFB6C1/FFFFFF?text=%F0%9F%98%98',
    'https://via.placeholder.com/200x200/ADD8E6/FFFFFF?text=%E2%9D%A4%EF%B8%8F',
  ];
};

/**
 * 检查Replicate API密钥是否有效
 * @param apiKey API密钥
 * @returns 是否有效
 */
export const validateReplicateKey = async (apiKey: string): Promise<boolean> => {
  // 模拟验证延迟
  await delay(1000);

  // 简单的格式验证
  return apiKey.length > 10;
};
