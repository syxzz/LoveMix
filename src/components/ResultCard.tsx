/**
 * ResultCard组件
 * 结果展示卡片，带保存和分享功能
 */

import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface ResultCardProps {
  imageUri: string;
  onSave?: () => void;
  onShare?: () => void;
  showActions?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  imageUri,
  onSave,
  onShare,
  showActions = true,
}) => {
  const handleSave = async () => {
    try {
      // 请求媒体库权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能保存图片');
        return;
      }

      // 保存图片到相册
      if (imageUri.startsWith('http')) {
        // 如果是网络图片，先下载
        const fileUri = FileSystem.documentDirectory + 'temp_image.jpg';
        const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
        await MediaLibrary.createAssetAsync(downloadResult.uri);
      } else {
        // 本地图片直接保存
        await MediaLibrary.createAssetAsync(imageUri);
      }

      Alert.alert('保存成功', '图片已保存到相册');
      onSave?.();
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('保存失败', '无法保存图片，请重试');
    }
  };

  const handleShare = () => {
    // 分享功能（可以后续扩展）
    Alert.alert('分享', '分享功能开发中...');
    onShare?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Feather name="download" size={20} color={COLORS.textLight} />
            <Text style={styles.actionText}>保存</Text>
          </TouchableOpacity>

          {onShare && (
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Feather name="share-2" size={20} color={COLORS.textLight} />
              <Text style={styles.actionText}>分享</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    gap: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
  },
  actionText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
