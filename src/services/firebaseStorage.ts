/**
 * Firebase Storage 服务
 * 处理文件上传（头像、图片等）
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { logger } from '../config';

const storage = getStorage();
const db = getFirestore();

/**
 * 上传用户头像到 Firebase Storage
 * @param imageUri 本地图片URI
 * @returns 上传后的下载URL
 */
export const uploadAvatar = async (imageUri: string): Promise<string> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('用户未登录');
    }

    logger.info('开始上传头像:', imageUri);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const fileName = `avatar_${currentUser.uid}_${timestamp}.jpg`;
    const storageRef = ref(storage, `avatars/${currentUser.uid}/${fileName}`);

    logger.info('正在上传到 Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, blob);
    logger.info('上传成功:', snapshot.metadata.fullPath);

    const downloadURL = await getDownloadURL(storageRef);
    logger.info('获取下载URL成功:', downloadURL);

    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      avatar: downloadURL,
      avatarUpdatedAt: new Date().toISOString(),
    });
    logger.info('Firestore 用户资料已更新');

    return downloadURL;
  } catch (error: any) {
    logger.error('上传头像失败:', error);
    throw new Error(`上传头像失败: ${error.message}`);
  }
};

/**
 * 删除旧头像（可选，节省存储空间）
 */
export const deleteOldAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    if (!avatarUrl || !avatarUrl.includes('firebase')) {
      return;
    }

    const urlParts = avatarUrl.split('/o/');
    if (urlParts.length < 2) return;

    const pathWithParams = urlParts[1].split('?')[0];
    const filePath = decodeURIComponent(pathWithParams);

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    logger.info('旧头像已删除:', filePath);
  } catch (error: any) {
    logger.warn('删除旧头像失败（可能已被删除）:', error.message);
  }
};

/**
 * 上传头像并删除旧头像
 */
export const updateAvatar = async (
  imageUri: string,
  oldAvatarUrl?: string
): Promise<string> => {
  try {
    const newAvatarUrl = await uploadAvatar(imageUri);
    if (oldAvatarUrl) {
      await deleteOldAvatar(oldAvatarUrl);
    }
    return newAvatarUrl;
  } catch (error: any) {
    logger.error('更新头像失败:', error);
    throw error;
  }
};

/**
 * 上传通用图片文件
 */
export const uploadImage = async (
  imageUri: string,
  folder: string = 'images'
): Promise<string> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('用户未登录');
    }

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const fileName = `${folder}_${currentUser.uid}_${timestamp}.jpg`;
    const storageRef = ref(storage, `${folder}/${currentUser.uid}/${fileName}`);
    await uploadBytes(storageRef, blob);

    return await getDownloadURL(storageRef);
  } catch (error: any) {
    logger.error('上传图片失败:', error);
    throw new Error(`上传图片失败: ${error.message}`);
  }
};
