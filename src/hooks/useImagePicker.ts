/**
 * 图片选择自定义Hook
 * 封装expo-image-picker的功能
 */

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { ImagePickerResult } from '../types';

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);

  /**
   * 请求相机权限
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能拍照');
      return false;
    }
    return true;
  };

  /**
   * 请求相册权限
   */
  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相册权限才能选择照片');
      return false;
    }
    return true;
  };

  /**
   * 从相册选择图片
   */
  const pickImage = async (): Promise<ImagePickerResult | null> => {
    try {
      setLoading(true);

      // 请求权限
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        return null;
      }

      // 打开图片选择器（mediaTypes 使用新 API，避免 MediaTypeOptions 弃用警告）
      // iOS：preferredAssetRepresentationMode.Current 尽量不转码，可减轻相册打开慢
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode?.Current,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('错误', '选择图片失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 拍照
   */
  const takePhoto = async (): Promise<ImagePickerResult | null> => {
    try {
      setLoading(true);

      // 请求权限
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return null;
      }

      // 打开相机
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('错误', '拍照失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 显示选择对话框（相册或相机）
   */
  const showImagePickerOptions = (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        '选择图片',
        '请选择图片来源',
        [
          {
            text: '相册',
            onPress: async () => {
              const result = await pickImage();
              resolve(result);
            },
          },
          {
            text: '拍照',
            onPress: async () => {
              const result = await takePhoto();
              resolve(result);
            },
          },
          {
            text: '取消',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  };

  return {
    loading,
    pickImage,
    takePhoto,
    showImagePickerOptions,
  };
};
