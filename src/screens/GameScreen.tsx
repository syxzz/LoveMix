/**
 * GameScreen - 游戏主界面
 * 显示游戏阶段、角色信息、操作按钮
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Script, Character, GameProgress, GamePhase } from '../types';
import { COLORS, SPACING, RADIUS, GAME_PHASES } from '../utils/constants';
import { getScriptById } from '../data/scripts';
import { getGameProgress, saveGameProgress } from '../services/storage';
import { generateIntroduction } from '../services/ai';
import { ensureIntroductionImage, getCachedIntroImageSync } from '../services/scriptInit';
import { Feather } from '@expo/vector-icons';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { t } = useTranslation();
  const { scriptId, characterId } = route.params;

  const [script, setScript] = useState<Script | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('intro');
  const [introduction, setIntroduction] = useState<string>('');
  const [streamingIntro, setStreamingIntro] = useState<string>(''); // 流式显示的开场白
  const [loading, setLoading] = useState(true);
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false); // 是否正在生成开场白
  const [discoveredCluesCount, setDiscoveredCluesCount] = useState(0);
  const [introImage, setIntroImage] = useState<string | null>(null); // 开场场景图片
  const [isLoadingIntroImage, setIsLoadingIntroImage] = useState(false);

  // 加载动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadGame();
  }, []);

  // 加载动画效果
  useEffect(() => {
    if (isGeneratingIntro) {
      // 淡入动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 脉冲动画
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 点点跳动动画
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 200),
        createDotAnimation(dot3Anim, 400),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      pulseAnim.setValue(1);
      dot1Anim.setValue(0.3);
      dot2Anim.setValue(0.3);
      dot3Anim.setValue(0.3);
    }
  }, [isGeneratingIntro]);

  const loadGame = async () => {
    try {
      const scriptData = await getScriptById(scriptId);
      if (!scriptData) {
        Alert.alert(t('common.error'), '剧本未找到');
        navigation.goBack();
        return;
      }

      const characterData = scriptData.characters.find(c => c.id === characterId);
      if (!characterData) {
        Alert.alert(t('common.error'), '角色未找到');
        navigation.goBack();
        return;
      }

      setScript(scriptData);
      setCharacter(characterData);
      setLoading(false); // 立即停止加载，显示页面

      // 加载开场场景图片
      loadIntroImage(scriptData, characterData);

      // 检查是否有保存的进度
      const progress = await getGameProgress(scriptId);
      if (progress && progress.selectedCharacterId === characterId && progress.currentPhase !== 'intro') {
        // 恢复进度（非首次进入）
        setCurrentPhase(progress.currentPhase);
        setDiscoveredCluesCount(progress.discoveredClues.length);
        const restoredIntro = '🎮 游戏进度已恢复\n\n你之前的游戏进度已经加载完成，可以继续你的推理之旅。';
        setIntroduction(restoredIntro);
        setStreamingIntro(restoredIntro);
      } else {
        // 首次进入或从开场阶段重新开始 - 生成开场介绍（流式输出）
        setStreamingIntro(''); // 初始化为空，准备接收流式内容
        setIsGeneratingIntro(true); // 开始生成
        try {
          const intro = await generateIntroduction(
            scriptData,
            characterData,
            (content) => {
              // 流式更新开场白
              console.log('🎨 更新开场白:', content.length, '字符');
              requestAnimationFrame(() => {
                setStreamingIntro(content);
              });
            }
          );
          setIntroduction(intro);
          setStreamingIntro(intro);
        } catch (error) {
          console.error('生成开场介绍失败:', error);
          const fallbackIntro = `欢迎来到《${scriptData.title}》。\n\n你扮演的是${characterData.name}，${characterData.occupation}。\n\n${scriptData.storyBackground}`;
          setIntroduction(fallbackIntro);
          setStreamingIntro(fallbackIntro);
        } finally {
          setIsGeneratingIntro(false); // 生成完成
        }

        // 保存初始进度
        const initialProgress: GameProgress = {
          scriptId,
          selectedCharacterId: characterId,
          currentPhase: 'intro',
          discoveredClues: [],
          conversationHistory: [],
          completed: false,
        };
        await saveGameProgress(initialProgress);
      }
    } catch (error) {
      console.error('加载游戏失败:', error);
      Alert.alert(t('common.error'), '加载游戏失败');
      setLoading(false);
    }
  };

  const loadIntroImage = async (scriptData: Script, characterData: Character) => {
    // 优先从内存缓存同步读取
    const cachedImage = getCachedIntroImageSync(scriptData.id, characterData.id);
    if (cachedImage) {
      setIntroImage(cachedImage);
      return;
    }

    // 异步生成或加载
    setIsLoadingIntroImage(true);
    try {
      const image = await ensureIntroductionImage(scriptData, characterData);
      if (image) {
        setIntroImage(image);
      }
    } catch (error) {
      console.error('加载开场场景图片失败:', error);
    } finally {
      setIsLoadingIntroImage(false);
    }
  };

  const handleNextPhase = async () => {
    const phases: GamePhase[] = ['intro', 'search', 'discuss', 'vote', 'result'];
    const currentIndex = phases.indexOf(currentPhase);

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setCurrentPhase(nextPhase);

      // 保存进度
      const progress = await getGameProgress(scriptId);
      if (progress) {
        progress.currentPhase = nextPhase;
        await saveGameProgress(progress);
      }
    }
  };

  const handlePreviousPhase = async () => {
    const phases: GamePhase[] = ['intro', 'search', 'discuss', 'vote', 'result'];
    const currentIndex = phases.indexOf(currentPhase);

    if (currentIndex > 0) {
      const previousPhase = phases[currentIndex - 1];
      setCurrentPhase(previousPhase);

      // 保存进度
      const progress = await getGameProgress(scriptId);
      if (progress) {
        progress.currentPhase = previousPhase;
        await saveGameProgress(progress);
      }
    }
  };

  const handleViewClues = () => {
    navigation.navigate('Clue');
  };

  const handleDialog = (targetCharacterId?: string) => {
    navigation.navigate('Dialog', {
      characterId: targetCharacterId,
      scriptId: scriptId, // 传递 scriptId
    });
  };

  const handleVote = () => {
    navigation.navigate('Vote');
  };

  const handleViewCharacter = () => {
    if (!character) return;

    Alert.alert(
      character.name,
      `${t('scriptDetail.age')}: ${character.age}\n${t('scriptDetail.gender')}: ${character.gender}\n${t('scriptDetail.occupation')}: ${character.occupation}\n\n${t('scriptDetail.personality')}: ${character.personality}\n\n${character.background}\n\n秘密: ${character.secret}\n\n目标: ${character.goal}`,
      [{ text: t('common.confirm') }]
    );
  };

  if (loading || !script || !character) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const currentPhaseIndex = GAME_PHASES.findIndex(p => p.id === currentPhase);

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
        <Text style={styles.headerTitle}>{script.title}</Text>
        <TouchableOpacity
          style={styles.characterButton}
          onPress={handleViewCharacter}
        >
          <Feather name="user" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </LinearGradient>

      {/* 阶段指示器 */}
      <View style={styles.phaseIndicator}>
        {GAME_PHASES.map((phase, index) => (
          <View key={phase.id} style={styles.phaseItem}>
            <View
              style={[
                styles.phaseCircle,
                index <= currentPhaseIndex && styles.phaseCircleActive,
              ]}
            >
              <Text style={styles.phaseIcon}>{phase.icon}</Text>
            </View>
            <Text
              style={[
                styles.phaseLabel,
                index === currentPhaseIndex && styles.phaseLabelActive,
              ]}
            >
              {t(`game.phases.${phase.id}`)}
            </Text>
            {index < GAME_PHASES.length - 1 && (
              <View
                style={[
                  styles.phaseLine,
                  index < currentPhaseIndex && styles.phaseLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 开场介绍 */}
        {currentPhase === 'intro' && (
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>📖 {t('game.phases.intro')}</Text>

            {/* 开场场景图片 */}
            {introImage && (
              <View style={styles.introImageContainer}>
                <Image
                  source={{ uri: introImage }}
                  style={styles.introImage}
                  resizeMode="cover"
                />
              </View>
            )}
            {isLoadingIntroImage && !introImage && (
              <View style={styles.introImagePlaceholder}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingImageText}>生成场景图片中...</Text>
              </View>
            )}

            <View style={styles.introCard}>
              {isGeneratingIntro && !streamingIntro ? (
                // 加载动画
                <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Text style={styles.loadingIcon}>✨</Text>
                  </Animated.View>
                  <Text style={styles.loadingHint}>AI 正在为你生成专属开场白...</Text>
                  <View style={styles.dotsContainer}>
                    <Animated.Text style={[styles.dot, { opacity: dot1Anim }]}>●</Animated.Text>
                    <Animated.Text style={[styles.dot, { opacity: dot2Anim }]}>●</Animated.Text>
                    <Animated.Text style={[styles.dot, { opacity: dot3Anim }]}>●</Animated.Text>
                  </View>
                </Animated.View>
              ) : (
                <Text style={styles.introText}>
                  {streamingIntro}
                  {streamingIntro && streamingIntro !== introduction && (
                    <Text style={styles.cursor}>▊</Text>
                  )}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* 角色信息卡片 */}
        <TouchableOpacity
          style={styles.characterCard}
          onPress={handleViewCharacter}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(139, 71, 137, 0.3)', 'rgba(44, 62, 80, 0.3)']}
            style={styles.cardGradient}
          />
          <View style={styles.characterCardContent}>
            <Text style={styles.characterCardTitle}>{t('game.myCharacter')}</Text>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterMeta}>
              {character.occupation} · {character.age}{t('scriptDetail.age')}
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color={COLORS.accent} />
        </TouchableOpacity>

        {/* 操作按钮区域 */}
        <View style={styles.actionsSection}>
          {/* 搜证阶段 */}
          {currentPhase === 'search' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleViewClues}
              >
                <LinearGradient
                  colors={[COLORS.clueKey, COLORS.clueImportant]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="search" size={24} color={COLORS.textLight} />
                  <Text style={styles.actionButtonText}>
                    {t('game.viewClues')} ({discoveredCluesCount}/{script.clues.length})
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDialog()}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="message-circle" size={24} color={COLORS.textLight} />
                  <Text style={styles.actionButtonText}>{t('game.talkTo')} DM</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* 讨论阶段 */}
          {currentPhase === 'discuss' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleViewClues}
              >
                <LinearGradient
                  colors={[COLORS.clueKey, COLORS.clueImportant]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="file-text" size={24} color={COLORS.textLight} />
                  <Text style={styles.actionButtonText}>{t('game.viewClues')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 进入群聊讨论 */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('GroupDiscuss', { scriptId })}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="users" size={24} color={COLORS.textLight} />
                  <Text style={styles.actionButtonText}>进入群聊讨论</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* 投票阶段 */}
          {currentPhase === 'vote' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVote}
            >
              <LinearGradient
                colors={[COLORS.error, COLORS.warning]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Feather name="check-square" size={24} color={COLORS.textLight} />
                <Text style={styles.actionButtonText}>{t('game.vote')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* 阶段导航按钮 */}
        <View style={styles.phaseNavigationContainer}>
          {/* 上一阶段按钮 */}
          {currentPhase !== 'intro' && (
            <TouchableOpacity
              style={[styles.phaseNavButton, styles.previousPhaseButton]}
              onPress={handlePreviousPhase}
            >
              <Feather name="arrow-left" size={20} color={COLORS.accent} />
              <Text style={styles.phaseNavText}>上一阶段</Text>
            </TouchableOpacity>
          )}

          {/* 下一阶段按钮 */}
          {currentPhase !== 'result' && currentPhase !== 'vote' && (
            <TouchableOpacity
              style={[styles.phaseNavButton, styles.nextPhaseButton]}
              onPress={handleNextPhase}
            >
              <Text style={styles.phaseNavText}>{t('game.nextPhase')}</Text>
              <Feather name="arrow-right" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>

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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  characterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseIndicator: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBg,
  },
  phaseItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  phaseCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseCircleActive: {
    backgroundColor: COLORS.accent,
  },
  phaseIcon: {
    fontSize: 20,
  },
  phaseLabel: {
    fontSize: 10,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  phaseLabelActive: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  phaseLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: COLORS.border,
  },
  phaseLineActive: {
    backgroundColor: COLORS.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  introSection: {
    marginBottom: SPACING.xl,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  introImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  introImage: {
    width: '100%',
    height: '100%',
  },
  introImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingImageText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.accent,
  },
  introCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  introText: {
    fontSize: 15,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  characterCardContent: {
    flex: 1,
  },
  characterCardTitle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  characterMeta: {
    fontSize: 14,
    color: COLORS.accent,
  },
  actionsSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 100,
  },
  cursor: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  loadingHint: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm,
  },
  dot: {
    fontSize: 20,
    color: COLORS.accent,
  },
  phaseNavigationContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  phaseNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.medium,
    borderWidth: 2,
    borderColor: COLORS.accent,
    gap: 8,
  },
  previousPhaseButton: {
    borderColor: COLORS.textGray,
  },
  nextPhaseButton: {
    // Uses default accent color
  },
  phaseNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
