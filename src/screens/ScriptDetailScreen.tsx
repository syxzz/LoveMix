/**
 * ScriptDetailScreen - 剧本详情和角色选择页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Script, Character } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { getScriptById } from '../data/scripts';
import { getGameProgress } from '../services/storage';
import { Feather } from '@expo/vector-icons';

type ScriptDetailScreenRouteProp = RouteProp<RootStackParamList, 'ScriptDetail'>;
type ScriptDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScriptDetail'>;

export const ScriptDetailScreen: React.FC = () => {
  const navigation = useNavigation<ScriptDetailScreenNavigationProp>();
  const route = useRoute<ScriptDetailScreenRouteProp>();
  const { t } = useTranslation();
  const { scriptId } = route.params;

  const [script, setScript] = useState<Script | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    loadScript();
  }, [scriptId]);

  const loadScript = async () => {
    const scriptData = getScriptById(scriptId);
    if (scriptData) {
      setScript(scriptData);

      // 检查是否有进度
      const progress = await getGameProgress(scriptId);
      if (progress) {
        setHasProgress(true);
        const savedCharacter = scriptData.characters.find(c => c.id === progress.selectedCharacterId);
        if (savedCharacter) {
          setSelectedCharacter(savedCharacter);
        }
      }
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartGame = () => {
    if (!selectedCharacter) {
      Alert.alert(t('common.error'), '请先选择一个角色');
      return;
    }

    if (!script) return;

    navigation.navigate('Game', {
      scriptId: script.id,
      characterId: selectedCharacter.id,
    });
  };

  if (!script) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>剧本未找到</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('scriptDetail.title')}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 剧本标题 */}
        <View style={styles.titleSection}>
          <Text style={styles.scriptTitle}>{script.title}</Text>
          <Text style={styles.scriptDescription}>{script.description}</Text>
        </View>

        {/* 故事背景 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('scriptDetail.background')}</Text>
          <View style={styles.backgroundCard}>
            <Text style={styles.backgroundText}>{script.storyBackground}</Text>
          </View>
        </View>

        {/* 角色选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('scriptDetail.selectCharacter')}</Text>
          {script.characters.map((character) => (
            <TouchableOpacity
              key={character.id}
              style={[
                styles.characterCard,
                selectedCharacter?.id === character.id && styles.characterCardSelected,
              ]}
              onPress={() => handleCharacterSelect(character)}
              activeOpacity={0.8}
            >
              <View style={styles.characterHeader}>
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterMeta}>
                    {character.age}{t('scriptDetail.age')} · {character.gender} · {character.occupation}
                  </Text>
                </View>
                {selectedCharacter?.id === character.id && (
                  <View style={styles.selectedBadge}>
                    <Feather name="check" size={18} color={COLORS.textLight} />
                  </View>
                )}
              </View>

              <Text style={styles.characterPersonality}>
                {t('scriptDetail.personality')}: {character.personality}
              </Text>
              <Text style={styles.characterBackground} numberOfLines={3}>
                {character.background}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 开始按钮 */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          disabled={!selectedCharacter}
        >
          <LinearGradient
            colors={selectedCharacter ? [COLORS.primary, COLORS.accent] : ['#666', '#444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>
              {hasProgress ? t('home.continueGame') : t('scriptDetail.startGame')}
            </Text>
            <Feather name="arrow-right" size={20} color={COLORS.textLight} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  titleSection: {
    marginBottom: SPACING.xl,
  },
  scriptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  scriptDescription: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  backgroundCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backgroundText: {
    fontSize: 15,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  characterCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  characterCardSelected: {
    borderColor: COLORS.accent,
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  characterMeta: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterPersonality: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  characterBackground: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
