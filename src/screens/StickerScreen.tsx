/**
 * StickerScreen - 表情包生成页面
 * 输入文本或选择快捷标签，选择风格，生成4个表情包
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GradientButton } from '../components/GradientButton';
import { LoadingHeart } from '../components/LoadingHeart';
import { generateStickers } from '../services/replicate';
import { StickerStyle } from '../types';
import { COLORS, RADIUS, SPACING, QUICK_TAGS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export const StickerScreen: React.FC = () => {
  const navigation = useNavigation();

  const [text, setText] = useState('');
  const [style, setStyle] = useState<StickerStyle>('cute');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const styleOptions: { id: StickerStyle; label: string }[] = [
    { id: 'cute', label: '可爱卡通' },
    { id: 'funny', label: '搞怪' },
    { id: 'pet', label: '萌宠' },
  ];

  const handleQuickTagPress = (tagText: string) => {
    setText(tagText);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请输入文本或选择快捷标签');
      return;
    }

    try {
      setLoading(true);
      setResults([]);
      const generatedStickers = await generateStickers(text.trim(), style);
      setResults(generatedStickers);
    } catch (error) {
      console.error('Error generating stickers:', error);
      Alert.alert('生成失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSticker = async (imageUri: string, index: number) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能保存表情包');
        return;
      }

      if (imageUri.startsWith('http')) {
        const fileUri = FileSystem.documentDirectory + `sticker_${index}.jpg`;
        const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
        await MediaLibrary.createAssetAsync(downloadResult.uri);
      } else {
        await MediaLibrary.createAssetAsync(imageUri);
      }

      Alert.alert('保存成功', '表情包已保存到相册');
    } catch (error) {
      console.error('Error saving sticker:', error);
      Alert.alert('保存失败', '无法保存表情包，请重试');
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题栏 */}
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
        <Text style={styles.headerTitle}>表情包工坊</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 输入区域 */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>输入文本</Text>
          <TextInput
            style={styles.textInput}
            placeholder="输入一句话或关键词..."
            placeholderTextColor={COLORS.textGray}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={50}
          />
          <Text style={styles.charCount}>{text.length}/50</Text>

          {/* 快捷标签 */}
          <Text style={styles.label}>快捷标签</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {QUICK_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagButton}
                onPress={() => handleQuickTagPress(tag.text)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                <Text style={styles.tagText}>{tag.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 风格选择器 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择风格</Text>
          <View style={styles.styleSelector}>
            {styleOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.styleButton,
                  style === option.id && styles.styleButtonActive,
                ]}
                onPress={() => setStyle(option.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.styleText,
                    style === option.id && styles.styleTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 生成按钮 */}
        <View style={styles.buttonSection}>
          <GradientButton
            title="🎭 生成表情包"
            onPress={handleGenerate}
            loading={loading}
            disabled={!text.trim() || loading}
          />
        </View>

        {/* 加载动画 */}
        {loading && <LoadingHeart message="正在生成表情包..." />}

        {/* 结果展示 - 2x2网格 */}
        {results.length > 0 && !loading && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>生成的表情包</Text>
            <View style={styles.grid}>
              {results.map((uri, index) => (
                <View key={index} style={styles.stickerCard}>
                  <Image source={{ uri }} style={styles.stickerImage} />
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleSaveSticker(uri, index)}
                    activeOpacity={0.8}
                  >
                    <Feather name="download" size={16} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
    height: 120,
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
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
    padding: SPACING.lg,
  },
  inputCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    gap: SPACING.sm,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.medium,
    gap: 6,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  styleSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleButtonActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
  },
  styleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  styleTextActive: {
    color: COLORS.primary,
  },
  buttonSection: {
    marginBottom: SPACING.xl,
  },
  resultsSection: {
    marginTop: SPACING.lg,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  stickerCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBg,
    position: 'relative',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSpacer: {
    height: 40,
  },
});
