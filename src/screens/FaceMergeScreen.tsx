/**
 * FaceMergeScreen - AI头像融合页面
 * 支持上传两张照片，选择融合模式（未来宝宝/情侣头像），生成融合结果
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ImageUploader } from '../components/ImageUploader';
import { GradientButton } from '../components/GradientButton';
import { LoadingHeart } from '../components/LoadingHeart';
import { ResultCard } from '../components/ResultCard';
import { useImagePicker } from '../hooks/useImagePicker';
import { generateMergedFace } from '../services/replicate';
import { MergeMode } from '../types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

export const FaceMergeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showImagePickerOptions } = useImagePicker();

  const [image1, setImage1] = useState<string>('');
  const [image2, setImage2] = useState<string>('');
  const [mode, setMode] = useState<MergeMode>('baby');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleImage1Select = async () => {
    const result = await showImagePickerOptions();
    if (result) {
      setImage1(result.uri);
    }
  };

  const handleImage2Select = async () => {
    const result = await showImagePickerOptions();
    if (result) {
      setImage2(result.uri);
    }
  };

  const handleGenerate = async () => {
    if (!image1 || !image2) {
      Alert.alert('提示', '请先上传两张照片');
      return;
    }

    try {
      setLoading(true);
      setResult('');
      const generatedImage = await generateMergedFace(image1, image2, mode);
      setResult(generatedImage);
    } catch (error) {
      console.error('Error generating merged face:', error);
      Alert.alert('生成失败', '请稍后重试');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>AI头像融合</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 图片上传区域 */}
        <View style={styles.uploadSection}>
          <ImageUploader
            imageUri={image1}
            onImageSelect={handleImage1Select}
            onImageRemove={() => setImage1('')}
            placeholder="上传照片1"
          />
          <ImageUploader
            imageUri={image2}
            onImageSelect={handleImage2Select}
            onImageRemove={() => setImage2('')}
            placeholder="上传照片2"
          />
        </View>

        {/* 模式选择器 */}
        <View style={styles.modeSection}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'baby' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('baby')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'baby' && styles.modeTextActive,
              ]}
            >
              未来宝宝
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'couple' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('couple')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'couple' && styles.modeTextActive,
              ]}
            >
              情侣头像
            </Text>
          </TouchableOpacity>
        </View>

        {/* 生成按钮 */}
        <View style={styles.buttonSection}>
          <GradientButton
            title="✨ AI生成"
            onPress={handleGenerate}
            loading={loading}
            disabled={!image1 || !image2 || loading}
          />
        </View>

        {/* 加载动画 */}
        {loading && <LoadingHeart message="正在生成中..." />}

        {/* 结果展示 */}
        {result && !loading && (
          <View style={styles.resultSection}>
            <ResultCard imageUri={result} showActions={true} />
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
  uploadSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  modeSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  modeTextActive: {
    color: COLORS.primary,
  },
  buttonSection: {
    marginBottom: SPACING.xl,
  },
  resultSection: {
    marginTop: SPACING.lg,
  },
  bottomSpacer: {
    height: 40,
  },
});
