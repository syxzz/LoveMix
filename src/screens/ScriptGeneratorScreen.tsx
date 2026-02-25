/**
 * ScriptGeneratorScreen - AI 剧本生成界面
 * 用户选择剧本类型，AI 生成完整剧本
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, ScriptGenre } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { generateScript } from '../services/ai';
import { saveCustomScript } from '../services/storage';
import { Feather } from '@expo/vector-icons';

type ScriptGeneratorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// 剧本类型选项
const GENRE_OPTIONS: Array<{
  id: ScriptGenre;
  emoji: string;
  title: string;
  description: string;
}> = [
  {
    id: 'ancient_romance',
    emoji: '🏯',
    title: '古装爱情',
    description: '宫廷恩怨、江湖情仇、才子佳人',
  },
  {
    id: 'modern_urban',
    emoji: '🏙️',
    title: '现代都市',
    description: '职场争斗、豪门恩怨、都市悬疑',
  },
  {
    id: 'horror_thriller',
    emoji: '👻',
    title: '惊悚恐怖',
    description: '密室逃脱、灵异事件、心理惊悚',
  },
  {
    id: 'fantasy_wuxia',
    emoji: '⚔️',
    title: '玄幻武侠',
    description: '江湖门派、武林秘籍、侠义恩仇',
  },
  {
    id: 'sci_fi',
    emoji: '🚀',
    title: '科幻未来',
    description: '太空探索、人工智能、未来世界',
  },
  {
    id: 'historical_mystery',
    emoji: '📜',
    title: '历史悬疑',
    description: '历史谜案、朝堂权谋、古代探案',
  },
  {
    id: 'campus_youth',
    emoji: '🎓',
    title: '校园青春',
    description: '校园悬案、青春秘密、学生推理',
  },
  {
    id: 'business_intrigue',
    emoji: '💼',
    title: '商战谍战',
    description: '商业阴谋、间谍暗战、企业争斗',
  },
];

export const ScriptGeneratorScreen: React.FC = () => {
  const navigation = useNavigation<ScriptGeneratorNavigationProp>();
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState<ScriptGenre | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const handleGenreSelect = (genre: ScriptGenre) => {
    setSelectedGenre(genre);
  };

  const handleGenerate = async () => {
    if (!selectedGenre) {
      Alert.alert('提示', '请先选择一个剧本类型');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressText('准备生成剧本...');

    try {
      const script = await generateScript(selectedGenre, (stage, prog) => {
        setProgressText(stage);
        setProgress(prog);
      });

      // 保存到本地
      await saveCustomScript(script);

      Alert.alert(
        '生成成功！',
        `剧本《${script.title}》已生成完成！`,
        [
          {
            text: '查看剧本',
            onPress: () => {
              navigation.goBack();
              // 导航到剧本详情页
              setTimeout(() => {
                navigation.navigate('ScriptDetail', { scriptId: script.id });
              }, 100);
            },
          },
          {
            text: '继续生成',
            onPress: () => {
              setSelectedGenre(null);
              setProgress(0);
              setProgressText('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('生成剧本失败:', error);
      Alert.alert('生成失败', error.message || '生成剧本时出现错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

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
        <Text style={styles.headerTitle}>AI 剧本生成</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 说明文字 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✨</Text>
          <Text style={styles.infoTitle}>AI 智能创作</Text>
          <Text style={styles.infoText}>
            选择你喜欢的剧本类型，AI 将为你生成一个完整的剧本杀剧本，包含角色、线索、真相等所有内容。
          </Text>
        </View>

        {/* 类型选择 */}
        <Text style={styles.sectionTitle}>选择剧本类型</Text>
        <View style={styles.genreGrid}>
          {GENRE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.genreCard,
                selectedGenre === option.id && styles.genreCardSelected,
              ]}
              onPress={() => handleGenreSelect(option.id)}
              activeOpacity={0.8}
              disabled={isGenerating}
            >
              <Text style={styles.genreEmoji}>{option.emoji}</Text>
              <Text style={styles.genreTitle}>{option.title}</Text>
              <Text style={styles.genreDescription}>{option.description}</Text>
              {selectedGenre === option.id && (
                <View style={styles.selectedBadge}>
                  <Feather name="check" size={16} color={COLORS.textLight} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 生成按钮 */}
        {!isGenerating && (
          <TouchableOpacity
            style={[
              styles.generateButton,
              !selectedGenre && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!selectedGenre}
          >
            <LinearGradient
              colors={
                selectedGenre
                  ? [COLORS.primary, COLORS.accent]
                  : ['#555', '#666']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButtonGradient}
            >
              <Feather name="zap" size={24} color={COLORS.textLight} />
              <Text style={styles.generateButtonText}>开始生成剧本</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* 生成进度 */}
        {isGenerating && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.progressText}>{progressText}</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

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
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  genreCard: {
    width: '47%',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
  },
  genreCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  genreEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  genreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  genreDescription: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  progressCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});