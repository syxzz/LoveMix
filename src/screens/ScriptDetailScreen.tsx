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
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Script, Character } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { getScriptById } from '../data/scripts';
import { getGameProgress } from '../services/storage';
import { ensureScriptCover, getCachedCoverSync, ensureCharacterAvatar, getCachedAvatarSync } from '../services/scriptInit';
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
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [characterAvatars, setCharacterAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    loadScript();
  }, [scriptId]);

  const loadScript = async () => {
    const scriptData = getScriptById(scriptId);
    if (scriptData) {
      setScript(scriptData);

      // 优先级1: 预设封面，立即显示
      if (scriptData.coverImage) {
        setCoverImage(scriptData.coverImage);
      } else {
        // 优先级2: 从内存缓存同步读取（零延迟）
        const cachedCover = getCachedCoverSync(scriptData.id);
        if (cachedCover) {
          setCoverImage(cachedCover);
          setImageLoading(false); // 缓存的图片，标记为已加载
        } else {
          // 优先级3: 异步生成（首次访问）
          loadCover(scriptData);
        }
      }

      // 加载角色头像
      loadCharacterAvatars(scriptData.characters);

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

  const loadCharacterAvatars = (characters: Character[]) => {
    const avatars: Record<string, string> = {};

    characters.forEach(character => {
      // 优先使用预设头像
      if (character.avatar) {
        avatars[character.id] = character.avatar;
      } else {
        // 从内存缓存同步读取
        const cachedAvatar = getCachedAvatarSync(character.id);
        if (cachedAvatar) {
          avatars[character.id] = cachedAvatar;
        } else {
          // 异步生成头像
          loadCharacterAvatar(character);
        }
      }
    });

    setCharacterAvatars(avatars);
  };

  const loadCharacterAvatar = async (character: Character) => {
    try {
      const avatar = await ensureCharacterAvatar(character);
      if (avatar) {
        setCharacterAvatars(prev => ({
          ...prev,
          [character.id]: avatar
        }));
      }
    } catch (error) {
      console.error(`加载角色头像失败: ${character.name}`, error);
    }
  };

  const loadCover = async (scriptData: Script) => {
    setIsLoadingCover(true);
    try {
      const cover = await ensureScriptCover(scriptData);
      if (cover) {
        setCoverImage(cover);
      }
    } catch (error) {
      console.error('加载封面失败:', error);
    } finally {
      setIsLoadingCover(false);
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
        {/* 封面图片 */}
        <View style={styles.coverSection}>
          {isLoadingCover ? (
            <View style={styles.coverPlaceholder}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>生成封面中...</Text>
            </View>
          ) : coverImage ? (
            <>
              {imageLoading && (
                <View style={[styles.coverPlaceholder, { position: 'absolute', zIndex: 1 }]}>
                  <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
              )}
              <Image
                source={{ uri: coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </>
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather name="image" size={48} color={COLORS.textGray} />
              <Text style={styles.placeholderText}>暂无封面</Text>
            </View>
          )}
        </View>

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
          {script.characters.map((character) => {
            const avatar = characterAvatars[character.id];

            return (
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
                  {/* 角色头像 */}
                  <View style={styles.avatarContainer}>
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Feather name="user" size={32} color={COLORS.textGray} />
                      </View>
                    )}
                  </View>

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
            );
          })}
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
    paddingBottom: SPACING.xl,
  },
  coverSection: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.cardBg,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.accent,
  },
  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textGray,
  },
  titleSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardBg,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
