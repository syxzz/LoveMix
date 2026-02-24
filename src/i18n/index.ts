/**
 * i18n 国际化配置
 * 支持中文、英文、日文
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import zh from './locales/zh';
import en from './locales/en';
import ja from './locales/ja';

const LANGUAGE_KEY = '@lovemix_language';

// 语言资源
const resources = {
  zh: { translation: zh },
  en: { translation: en },
  ja: { translation: ja },
};

// 初始化 i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

// 从本地存储加载语言设置
export const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && ['zh', 'en', 'ja'].includes(savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Failed to load language:', error);
  }
};

// 保存语言设置
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
};

export default i18n;
