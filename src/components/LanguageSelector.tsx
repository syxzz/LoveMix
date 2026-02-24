/**
 * LanguageSelector - 语言选择组件
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { saveLanguage } from '../i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    await saveLanguage(languageCode);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorGlass}>
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
            style={styles.selectorGradient}
          />
          <View style={styles.selectorContent}>
            <View style={styles.selectorLeft}>
              <Feather name="globe" size={22} color="#FFFFFF" />
              <View style={styles.selectorText}>
                <Text style={styles.selectorTitle}>{t('settings.language')}</Text>
                <Text style={styles.selectorSubtitle}>{currentLanguage.nativeName}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF6B9D', '#C471ED', '#12C2E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.language')}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={styles.languageItem}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <View style={styles.languageItemGlass}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                      style={styles.languageItemGradient}
                    />
                    <View style={styles.languageItemContent}>
                      <View>
                        <Text style={styles.languageName}>{language.nativeName}</Text>
                        <Text style={styles.languageEnglishName}>{language.name}</Text>
                      </View>
                      {i18n.language === language.code && (
                        <Feather name="check" size={24} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    marginBottom: 16,
  },
  selectorGlass: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  selectorGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  selectorText: {
    gap: 2,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  selectorSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 32 : 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'DancingScript_700Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageList: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  languageItem: {
    marginBottom: 0,
  },
  languageItemGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  languageItemGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  languageEnglishName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins_400Regular',
  },
});
