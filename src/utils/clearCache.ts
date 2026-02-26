/**
 * 清除缓存工具
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllGameProgress = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const gameProgressKeys = keys.filter(key => key.startsWith('game_progress_'));

    if (gameProgressKeys.length > 0) {
      await AsyncStorage.multiRemove(gameProgressKeys);
      console.log(`✅ 已清除 ${gameProgressKeys.length} 个游戏进度缓存`);
      return true;
    } else {
      console.log('ℹ️ 没有找到游戏进度缓存');
      return false;
    }
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return false;
  }
};

export const clearSpecificGameProgress = async (scriptId: string) => {
  try {
    await AsyncStorage.removeItem(`game_progress_${scriptId}`);
    console.log(`✅ 已清除剧本 ${scriptId} 的游戏进度`);
    return true;
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return false;
  }
};
