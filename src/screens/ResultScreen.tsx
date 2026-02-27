/**
 * ResultScreen - 结果揭晓页面
 * 显示投票结果、案件真相和 AI 生成的场景还原视频
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAtomValue } from 'jotai';
import { RootStackParamList, Script } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { videoTaskAtom } from '../store';
import { getScriptById } from '../data/scripts';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const VIDEO_HEIGHT = VIDEO_WIDTH * 9 / 16;

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { t } = useTranslation();
  const { success, scriptId } = route.params;
  const videoTask = useAtomValue(videoTaskAtom);
  const [script, setScript] = useState<Script | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getScriptById(scriptId).then((data) => setScript(data || null));
  }, []);

  // 调试视频任务状态
  useEffect(() => {
    console.log('📹 视频任务状态:', {
      status: videoTask.status,
      videoUrl: videoTask.videoUrl,
      error: videoTask.error,
    });
  }, [videoTask]);

  const videoSource = videoTask.status === 'success' && videoTask.videoUrl
    ? videoTask.videoUrl
    : null;

  // 只在有视频源时创建播放器
  const player = useVideoPlayer(videoSource, (p) => {
    if (videoSource) {
      p.loop = false;
      p.muted = false;
    }
  });

  // 监听播放状态
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  const murdererChar = script?.characters.find(c => c.id === script.murderer);
  const truth = {
    murderer: murdererChar ? `${murdererChar.name}（${murdererChar.occupation}）` : '未知',
    motive: script?.motive || '暂无信息',
    process: script?.truth?.trim() || '暂无信息',
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handlePlayVideo = () => {
    console.log('🎬 播放按钮被点击', {
      player: !!player,
      videoSource,
      isPlaying,
      playerStatus: player?.status,
    });

    if (!player || !videoSource) {
      console.warn('⚠️ 播放器或视频源不可用');
      return;
    }

    try {
      if (isPlaying) {
        console.log('⏸️ 暂停视频');
        player.pause();
      } else {
        console.log('▶️ 播放视频');
        player.play();
      }
    } catch (error) {
      console.error('❌ 播放视频失败:', error);
    }
  };

  const renderVideoSection = () => {
    if (videoTask.status === 'idle') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="film" size={24} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>场景还原</Text>
        </View>

        {(videoTask.status === 'submitting' || videoTask.status === 'processing') && (
          <View style={styles.videoLoadingCard}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.videoLoadingText}>
              {videoTask.status === 'submitting' ? 'AI 正在分析场景...' : 'AI 正在生成场景还原视频...'}
            </Text>
            <Text style={styles.videoLoadingHint}>视频生成需要几分钟，请耐心等待</Text>
          </View>
        )}

        {videoTask.status === 'success' && videoTask.videoUrl && (
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={true}
              allowsFullscreen={true}
              allowsPictureInPicture={false}
            />
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayVideo}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playButtonGradient}
              >
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color={COLORS.textLight}
                />
                <Text style={styles.playButtonText}>
                  {isPlaying ? '暂停播放' : '播放场景还原'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {videoTask.status === 'failed' && (
          <View style={styles.videoErrorCard}>
            <Feather name="alert-triangle" size={32} color={COLORS.warning} />
            <Text style={styles.videoErrorText}>场景还原视频生成失败</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部结果横幅 */}
      <LinearGradient
        colors={success ? [COLORS.success, '#27AE60'] : [COLORS.error, '#C0392B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.resultBanner}
      >
        <View style={styles.resultIconContainer}>
          <Feather
            name={success ? 'check-circle' : 'x-circle'}
            size={64}
            color={COLORS.textLight}
          />
        </View>
        <Text style={styles.resultTitle}>
          {success ? t('result.success') : t('result.failed')}
        </Text>
        <Text style={styles.resultMessage}>
          {success ? t('result.successMessage') : t('result.failedMessage')}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 场景还原视频 */}
        {renderVideoSection()}

        {/* 案件真相 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={24} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>{t('result.truth')}</Text>
          </View>

          <View style={styles.truthCard}>
            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.murderer')}:</Text>
              <Text style={styles.truthValue}>{truth.murderer}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.motive')}:</Text>
              <Text style={styles.truthText}>{truth.motive}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.process')}:</Text>
              <Text style={styles.truthText}>{truth.process}</Text>
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackToHome}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Feather name="home" size={20} color={COLORS.textLight} />
              <Text style={styles.actionButtonText}>{t('result.backToHome')}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  resultBanner: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  resultIconContainer: {
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  resultMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  truthCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  truthItem: {
    paddingVertical: SPACING.sm,
  },
  truthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  truthValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error,
  },
  truthText: {
    fontSize: 15,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  actionsSection: {
    gap: SPACING.md,
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
  videoContainer: {
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  video: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  playButton: {
    borderBottomLeftRadius: RADIUS.large,
    borderBottomRightRadius: RADIUS.large,
    overflow: 'hidden',
    marginTop: -1, // 确保与视频无缝连接
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  videoLoadingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  videoLoadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  videoLoadingHint: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  videoErrorCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  videoErrorText: {
    fontSize: 15,
    color: COLORS.textGray,
    textAlign: 'center',
  },
});
