/**
 * ID 生成工具
 * 确保生成的 ID 在应用中唯一
 */

let idCounter = 0;

/**
 * 生成唯一 ID
 * 格式: {prefix}_{timestamp}_{random}_{counter}
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const counter = idCounter++;

  return `${prefix}_${timestamp}_${random}_${counter}`;
};

/**
 * 生成消息 ID
 */
export const generateMessageId = (role: 'user' | 'ai' | 'dm' | 'character', index: number = 0): string => {
  return generateUniqueId(`msg_${role}_${index}`);
};

/**
 * 生成情报 ID
 */
export const generateIntelId = (type: 'character' | 'item'): string => {
  return generateUniqueId(`intel_${type}`);
};

/**
 * 重置计数器（用于测试）
 */
export const resetIdCounter = (): void => {
  idCounter = 0;
};
