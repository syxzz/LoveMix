/**
 * useFirebaseAvatar Hook
 * 集成 Firebase Storage 的头像上传功能
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useImagePicker } from './useImagePicker';
import { uploadAvatar, deleteOldAvatar } from '../services/firebaseStorage';
import { USE_FIREBASE } from '../config';

export const useFirebaseAvatar = () => {
  const [uploading, setUploading] = useState(false);
  const { showImagePickerOptions } = useImagePicker();

  /**
   * 选择并上传头像
   * @param currentAvatarUrl 当前头像URL（用于删除旧头像）
   * @returns 新头像的URL，如果取消则返回 null
   */
  const selectAndUploadAvatar = async (
    currentAvatarUrl?: string
  ): Promise<string | null> => {
    try {
      // 1. 选择图片
      const result = await showImagePickerOptions();
      if (!result) {
        return null; // 用户取消选择
      }

      // 2. 如果启用了 Firebase，上传到 Firebase Storage
      if (USE_FIREBASE) {
        setUploading(true);

        // 删除旧头像（可选）
        if (currentAvatarUrl) {
          await deleteOldAvatar(currentAvatarUrl);
        }

        // 上传新头像
        const downloadURL = await uploadAvatar(result.uri);
        setUploading(false);

        return downloadURL;
      } else {
        // 如果未启用 Firebase，直接返回本地 URI
        return result.uri;
      }
    } catch (error: any) {
      setUploading(false);
      Alert.alert('上传失败', error.message || '请稍后重试');
      throw error;
    }
  };

  return {
    selectAndUploadAvatar,
    uploading,
  };
};
