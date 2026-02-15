/**
 * DateScreen - 虚拟约会场景页面
 * 上传两张照片，选择约会场景和风格，生成虚拟约会照片
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
import { SceneSelector } from '../components/SceneSelector';
import { useImagePicker } from '../hooks/useImagePicker';
import { generateDateScene } from '../services/replicate';
import { DateScene, DateStyle } from '../types';
import { COLORS, RADIUS, SPACING, DATE_SCENES } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

export const DateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showImagePickerOptions } = useImagePicker();

  const [image1, setImage1] = useState<string>('');
  const [image2, setImage2] = useState<string>('');
  const [scene, setScene] = useState<DateScene>('sunset');
  const [style, setStyle] = useState<DateStyle>('realistic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const styleOptions: { id: DateStyle; label: string }[] = [
    { id: 'realistic', label: '写实' },
    { id: 'anime', label: '动漫' },
    { id: 'watercolor', label: '水彩' },
    { id: 'oil', label: '油画' },
  ];

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
      const generatedImage = await generateDateScene(image1, image2, scene, style);
      setResult(generatedImage);
    } catch (error) {
      console.error('Error generating date scene:', error);
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
        <Text style={styles.headerTitle}>虚拟约会</Text>
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

        {/* 场景选择器 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择约会场景</Text>
          <SceneSelector
            scenes={DATE_SCENES}
            selectedScene={scene}
            onSelectScene={(sceneId) => setScene(sceneId as DateScene)}
          />
        </View>

        {/* 风格选择器 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择画面风格</Text>
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
            title="🌌 生成约会照"
            onPress={handleGenerate}
            loading={loading}
            disabled={!image1 || !image2 || loading}
          />
        </View>

        {/* 加载动画 */}
        {loading && <LoadingHeart message="正在生成约会场景..." />}

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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  styleSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
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
  resultSection: {
    marginTop: SPACING.lg,
  },
  bottomSpacer: {
    height: 40,
  },
});
