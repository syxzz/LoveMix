/**
 * HomeScreen - 剧本选择页面
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Script } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { getAllScripts } from '../data/scripts';
import { getGameProgress, getCompletedScripts } from '../services/storage';
import { getCachedCoverSync, getCachedCoverPortraitSync, ensureScriptCover } from '../services/scriptInit';
import { userAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const COVER_WIDTH = 105;
const COVER_HEIGHT = 140;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [user] = useAtom(userAtom);
  const { t } = useTranslation();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, any>>({});
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 每次页面获得焦点时加载数据，并启动轮询刷新封面
  useFocusEffect(
    useCallback(() => {
      loadScripts();

      // 轮询：每 5 秒检查一次有没有新的封面从后台缓存生成好了
      pollingRef.current = setInterval(() => {
        refreshCovers();
      }, 5000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }, [])
  );

  const refreshCovers = async () => {
    const allScripts = await getAllScripts();
    let hasNew = false;

    setCoverMap(prev => {
      const updated = { ...prev };
      for (const script of allScripts) {
        if (updated[script.id]) continue;
        const portrait = getCachedCoverPortraitSync(script.id);
        if (portrait) {
          updated[script.id] = portrait;
          hasNew = true;
          continue;
        }
        const landscape = getCachedCoverSync(script.id);
        if (landscape) {
          updated[script.id] = landscape;
          hasNew = true;
        }
      }
      if (!hasNew) return prev;
      return updated;
    });

    // 如果所有封面都已加载完，停止轮询
    const currentMap = coverMap;
    const allLoaded = allScripts.every(s => currentMap[s.id]);
    if (allLoaded && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const loadScripts = async () => {
    const allScripts = await getAllScripts();
    setScripts(allScripts);

    const progress: Record<string, any> = {};
    const completed = await getCompletedScripts();
    const covers: Record<string, string> = {};

    for (const script of allScripts) {
      const scriptProgress = await getGameProgress(script.id);
      if (scriptProgress) {
        progress[script.id] = scriptProgress;
      }

      const portrait = script.coverImagePortrait || getCachedCoverPortraitSync(script.id);
      if (portrait) {
        covers[script.id] = portrait;
      } else if (script.coverImage) {
        covers[script.id] = script.coverImage;
      } else {
        const cached = getCachedCoverSync(script.id);
        if (cached) {
          covers[script.id] = cached;
        }
      }
    }

    setProgressMap(progress);
    setCompletedMap(completed);
    setCoverMap(covers);
  };

  const handleScriptPress = (script: Script) => {
    navigation.navigate('ScriptDetail', { scriptId: script.id });
  };

  const handleProfilePress = () => navigation.navigate('Profile');
  const handleSettingsPress = () => navigation.navigate('Settings');
  const handleCreateScript = () => navigation.navigate('ScriptGenerator');
  const handleMembershipPress = () => navigation.navigate('Membership');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'hard': return COLORS.error;
      default: return COLORS.textGray;
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部区域 */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(107,92,231,0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <View style={styles.brandRow}>
            <Text style={styles.brandMark}>Mirrage</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.greeting}>
            {t('home.greeting', { name: user?.username || t('home.defaultName') })}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} onPress={handleMembershipPress}>
            <Feather name="award" size={18} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
            <Feather name="settings" size={18} color={COLORS.textGray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
            <Feather name="user" size={18} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 创建剧本 */}
        <TouchableOpacity
          style={styles.createScriptCard}
          onPress={handleCreateScript}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6B5CE7', '#8B7AFF', '#A594FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createCardGradient}
          >
            <View style={styles.createCardContent}>
              <View style={styles.createIconCircle}>
                <Feather name="edit-3" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.createTextSection}>
                <Text style={styles.createScriptTitle}>{t('home.createScript', { defaultValue: '创作剧本' })}</Text>
                <Text style={styles.createScriptSubtitle}>{t('home.createSubtitle', { defaultValue: '构思你的专属剧本' })}</Text>
              </View>
              <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.5)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 剧本列表 */}
        {scripts.map((script) => {
          const hasProgress = !!progressMap[script.id];
          const isCompleted = !!completedMap[script.id];
          const success = completedMap[script.id]?.success;
          const coverUrl = coverMap[script.id];

          return (
            <TouchableOpacity
              key={script.id}
              style={styles.scriptCard}
              onPress={() => handleScriptPress(script)}
              activeOpacity={0.85}
            >
              <View style={styles.cardRow}>
                {/* 左侧封面 */}
                <View style={styles.coverContainer}>
                  {coverUrl ? (
                    <Image
                      source={{ uri: coverUrl }}
                      style={styles.coverImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error('❌ 图片加载失败:', script.title, error.nativeEvent.error);
                        console.log('图片 URI 前100字符:', coverUrl.substring(0, 100));
                      }}
                      onLoad={() => {
                        console.log('✅ 图片加载成功:', script.title);
                      }}
                    />
                  ) : (
                    <View style={styles.coverPlaceholder}>
                      <LinearGradient
                        colors={['rgba(107,92,231,0.2)', 'rgba(201,169,110,0.15)']}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <ActivityIndicator size="small" color={COLORS.accent} />
                    </View>
                  )}
                </View>

                {/* 右侧信息 */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.scriptTitle} numberOfLines={1}>{script.title}</Text>
                    {isCompleted && (
                      <View style={[styles.statusBadge, { backgroundColor: success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                        <Text style={[styles.statusText, { color: success ? COLORS.success : COLORS.error }]}>
                          {success ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                    {hasProgress && !isCompleted && (
                      <View style={[styles.statusBadge, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                        <Text style={[styles.statusText, { color: COLORS.warning }]}>...</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.scriptDescription} numberOfLines={2}>
                    {script.description}
                  </Text>

                  <View style={styles.infoRow}>
                    <View style={styles.infoTag}>
                      <Feather name="clock" size={10} color={COLORS.textGray} />
                      <Text style={styles.infoText}>{script.duration}</Text>
                    </View>
                    <View style={styles.infoTag}>
                      <Feather name="users" size={10} color={COLORS.textGray} />
                      <Text style={styles.infoText}>{script.characterCount}{t('home.characters')}</Text>
                    </View>
                    <View style={[styles.difficultyTag, { backgroundColor: `${getDifficultyColor(script.difficulty)}10` }]}>
                      <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(script.difficulty) }]} />
                      <Text style={[styles.infoText, { color: getDifficultyColor(script.difficulty) }]}>
                        {t(`home.difficulty.${script.difficulty}`)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleScriptPress(script)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#6B5CE7', '#8B7AFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.startButtonGradient}
                      >
                        <Text style={styles.startButtonText}>
                          {hasProgress && !isCompleted ? t('home.continueGame') : t('home.startGame')}
                        </Text>
                        <Feather name="arrow-right" size={12} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37,40,66,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandMark: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    color: 'rgba(107,92,231,0.6)',
    letterSpacing: 3,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
    opacity: 0.5,
  },
  greeting: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(22,26,45,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(37,40,66,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  createScriptCard: {
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  createCardGradient: {
    padding: SPACING.lg,
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  createIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createTextSection: {
    flex: 1,
  },
  createScriptTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  createScriptSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },

  // 剧本卡片
  scriptCard: {
    borderRadius: RADIUS.medium,
    marginBottom: 14,
    backgroundColor: 'rgba(22,26,45,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(37,40,66,0.5)',
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
  },
  coverContainer: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderTopLeftRadius: RADIUS.medium,
    borderBottomLeftRadius: RADIUS.medium,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(22,26,45,0.9)',
  },
  cardInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scriptTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: COLORS.textDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scriptDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    lineHeight: 17,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(37,40,66,0.4)',
  },
  difficultyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  infoText: {
    fontSize: 10,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  startButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    gap: 5,
  },
  startButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 24,
  },
});
