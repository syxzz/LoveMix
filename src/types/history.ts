/**
 * 历史记录相关类型定义
 */

// 作品类型
export type WorkType = 'faceMerge' | 'card' | 'date' | 'sticker';

// 作品历史记录
export interface WorkHistory {
  id: string;
  userId: string;
  type: WorkType;
  imageUri: string;
  thumbnail?: string;
  metadata: WorkMetadata;
  createdAt: string;
  isPublic: boolean;
  likes: number;
  views: number;
}

// 作品元数据
export type WorkMetadata =
  | FaceMergeMetadata
  | CardMetadata
  | DateMetadata
  | StickerMetadata;

export interface FaceMergeMetadata {
  mode: 'baby' | 'couple';
  image1?: string;
  image2?: string;
}

export interface CardMetadata {
  eventName: string;
  date: string;
  names: string;
  style: 'romantic' | 'humorous' | 'artistic';
  text?: string;
}

export interface DateMetadata {
  scene: string;
  style: string;
  prompt?: string;
}

export interface StickerMetadata {
  style: 'cute' | 'funny' | 'pet';
  text?: string;
}
