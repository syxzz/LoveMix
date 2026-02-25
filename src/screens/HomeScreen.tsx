/**
 * HomeScreen - 剧本选择页面
 * 显示可用剧本列表
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Script } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { getAllScripts } from '../data/scripts';
import { getGameProgress, getCompletedScripts } from '../services/storage';
import { userAtom } from '../store';
import { Feather } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [user] = useAtom(userAtom);
  const { t } = useTranslation();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, any>>({});

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    const allScripts = getAllScripts();
    setScripts(allScripts);

    // 加载进度和完成状态
    const progress: Record<string, any> = {};
    const completed = await getCompletedScripts();

    for (const script of allScripts) {
      const scriptProgress = await getGameProgress(script.id);
      if (scriptProgress) {
        progress[script.id] = scriptProgress;
      }
    }

    setProgressMap(progress);
    setCompletedMap(completed);
  };

  const handleScriptPress = (script: Script) => {
    navigation.navigate('ScriptDetail', { scriptId: script.id });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#27AE60';
      case 'medium':
        return '#F39C12';
      case 'hard':
        return '#E74C3C';
      default:
        return COLORS.textGray;
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部渐变区域 */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Text style={styles.greeting}>
              {t('home.greeting', { name: user?.username || t('home.defaultName') })}
            </Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSettingsPress}
            >
              <Feather name="settings" size={22} color={COLORS.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleProfilePress}
            >
              <Feather name="user" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* 剧本列表 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {scripts.map((script) => {
          const hasProgress = !!progressMap[script.id];
          const isCompleted = !!completedMap[script.id];
          const success = completedMap[script.id]?.success;

          return (
            <TouchableOpacity
              key={script.id}
              style={styles.scriptCard}
              onPress={() => handleScriptPress(script)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(139, 71, 137, 0.2)', 'rgba(44, 62, 80, 0.2)']}
                style={styles.cardGradient}
              />

              <View style={styles.cardContent}>
                {/* 标题和状态 */}
                <View style={styles.cardHeader}>
                  <Text style={styles.scriptTitle}>{script.title}</Text>
                  {isCompleted && (
                    <View style={[styles.statusBadge, { backgroundColor: success ? COLORS.success : COLORS.error }]}>
                      <Text style={styles.statusText}>
                        {success ? '✓ ' : '✗ '}{t('home.completed')}
                      </Text>
                    </View>
                  )}
                  {hasProgress && !isCompleted && (
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
                      <Text style={styles.statusText}>{t('home.continueGame')}</Text>
                    </View>
                  )}
                </View>

                {/* 描述 */}
                <Text style={styles.scriptDescription} numberOfLines={2}>
                  {script.description}
                </Text>

                {/* 信息标签 */}
                <View style={styles.infoRow}>
                  <View style={styles.infoTag}>
                    <Feather name="clock" size={14} color={COLORS.accent} />
                    <Text style={styles.infoText}>{script.duration}</Text>
                  </View>

                  <View style={styles.infoTag}>
                    <Feather name="users" size={14} color={COLORS.accent} />
                    <Text style={styles.infoText}>{script.characterCount} {t('home.characters')}</Text>
                  </View>

                  <View style={[styles.infoTag, { borderColor: getDifficultyColor(script.difficulty) }]}>
                    <Text style={[styles.infoText, { color: getDifficultyColor(script.difficulty) }]}>
                      {t(`home.difficulty.${script.difficulty}`)}
                    </Text>
                  </View>
                </View>

                {/* 开始按钮 */}
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleScriptPress(script)}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>
                      {hasProgress && !isCompleted ? t('home.continueGame') : t('home.startGame')}
                    </Text>
                    <Feather name="arrow-right" size={18} color={COLORS.textLight} />
                  </LinearGradient>
                </TouchableOpacity>
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
    paddingBottom: 30,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rightSection: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  scriptCard: {
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scriptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  scriptDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: 20,
  },
});
