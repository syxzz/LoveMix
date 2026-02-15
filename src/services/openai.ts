/**
 * OpenAI API服务
 * 用于生成文案、对话等文本内容
 */

import { delay } from '../utils/helpers';

/**
 * 生成祝福文案
 * @param prompt 提示词
 * @returns 生成的文案
 */
export const generateBlessingText = async (prompt: string): Promise<string> => {
  // 模拟API延迟
  await delay(2000);

  // 返回模拟文案
  const blessings = [
    '愿你们的爱情如同美酒，越陈越香，永远甜蜜。',
    '在这特别的日子里，祝你们幸福美满，白头偕老。',
    '愿你们的每一天都充满欢笑和温暖，相爱到永远。',
    '祝福你们的爱情之路越走越宽广，永远幸福快乐。',
  ];

  return blessings[Math.floor(Math.random() * blessings.length)];
};

/**
 * 生成表情包文案
 * @param text 输入文本
 * @returns 优化后的表情包文案数组
 */
export const generateStickerTexts = async (text: string): Promise<string[]> => {
  // 模拟API延迟
  await delay(1500);

  // 返回4条模拟文案
  return [
    text,
    `${text}！`,
    `${text}~`,
    `${text}❤️`,
  ];
};

/**
 * 优化约会场景描述
 * @param scene 场景名称
 * @returns 优化后的场景描述
 */
export const enhanceSceneDescription = async (scene: string): Promise<string> => {
  // 模拟API延迟
  await delay(1000);

  const descriptions: Record<string, string> = {
    sunset: '在金色的海边日落下，两人牵手漫步，海风轻拂，浪漫至极。',
    cafe: '温馨的咖啡馆里，两人相对而坐，品味着香浓的咖啡和甜蜜的时光。',
    camping: '星空下的露营地，两人依偎在篝火旁，仰望璀璨的银河。',
    home: '温馨的家中，两人一起做饭、看电影，享受平凡而幸福的日常。',
    sakura: '樱花树下，粉色的花瓣随风飘落，两人在花雨中相拥。',
    beach: '阳光沙滩上，两人光着脚丫追逐嬉戏，留下一串串幸福的脚印。',
  };

  return descriptions[scene] || '美好的约会时光';
};

/**
 * 检查OpenAI API密钥是否有效
 * @param apiKey API密钥
 * @returns 是否有效
 */
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
  // 模拟验证延迟
  await delay(1000);

  // 简单的格式验证
  return apiKey.startsWith('sk-') && apiKey.length > 20;
};
