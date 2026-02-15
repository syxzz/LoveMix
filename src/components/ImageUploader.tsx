/**
 * ImageUploader组件
 * 图片上传组件，支持选择、预览和删除
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface ImageUploaderProps {
  onImageSelect: (uri: string) => void;
  onImageRemove: () => void;
  imageUri?: string;
  placeholder: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageRemove,
  imageUri,
  placeholder,
}) => {
  return (
    <View style={styles.container}>
      {imageUri ? (
        // 已上传图片 - 显示缩略图和删除按钮
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onImageRemove}
            activeOpacity={0.8}
          >
            <Feather name="x" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      ) : (
        // 未上传 - 显示上传提示
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => onImageSelect('')}
          activeOpacity={0.7}
        >
          <Feather name="camera" size={32} color={COLORS.primary} />
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '45%',
    aspectRatio: 1,
  },
  uploadBox: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: RADIUS.large,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
