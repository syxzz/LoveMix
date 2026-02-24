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

    // 1. 将图片转换为 Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // 2. 生成唯一的文件名
    const timestamp = Date.now();
    const fileName = `avatar_${currentUser.uid}_${timestamp}.jpg`;

    // 3. 创建 Storage 引用
    const storageRef = ref(storage, `avatars/${currentUser.uid}/${fileName}`);

    // 4. 上传文件
    logger.info('正在上传到 Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, blob);
    logger.info('上传成功:', snapshot.metadata.fullPath);

    // 5. 获取下载 URL
    const downloadURL = await getDownloadURL(storageRef);
    logger.info('获取下载URL成功:', downloadURL);

    // 6. 更新 Firestore 中的用户资料
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
 * @param avatarUrl 要删除的头像URL
 */
export const deleteOldAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    if (!avatarUrl || !avatarUrl.includes('firebase')) {
      return; // 不是 Firebase 存储的图片，跳过
    }

    // 从 URL 中提取文件路径
    const urlParts = avatarUrl.split('/o/');
    if (urlParts.length < 2) return;

    const pathWithParams = urlParts[1].split('?')[0];
    const filePath = decodeURIComponent(pathWithParams);

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    logger.info('旧头像已删除:', filePath);
  } catch (error: any) {
    logger.warn('删除旧头像失败（可能已被删除）:', error.message);
    // 不抛出错误，因为删除失败不应该影响新头像上传
  }
};

/**
 * 上传头像并删除旧头像
 * @param imageUri 新头像的本地URI
 * @param oldAvatarUrl 旧头像的URL（可选）
 * @returns 新头像的下载URL
 */
export const updateAvatar = async (
  imageUri: string,
  oldAvatarUrl?: string
): Promise<string> => {
  try {
    // 1. 上传新头像
    const newAvatarUrl = await uploadAvatar(imageUri);

    // 2. 删除旧头像（如果存在）
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
 * @param imageUri 本地图片URI
 * @param folder 存储文件夹名称
 * @returns 上传后的下载URL
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

    // 转换为 Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // 生成文件名
    const timestamp = Date.now();
    const fileName = `${folder}_${currentUser.uid}_${timestamp}.jpg`;

    // 创建引用并上传
    const storageRef = ref(storage, `${folder}/${currentUser.uid}/${fileName}`);
    await uploadBytes(storageRef, blob);

    // 获取下载 URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error: any) {
    logger.error('上传图片失败:', error);
    throw new Error(`上传图片失败: ${error.message}`);
  }
};
