/**
 * CommunityScreen - 社区作品广场
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

// 模拟社区数据
const MOCK_COMMUNITY_WORKS = [
  {
    id: '1',
    imageUri: 'https://picsum.photos/400/400?random=1',
    username: '甜蜜情侣',
    avatar: 'https://picsum.photos/100/100?random=10',
    likes: 128,
    views: 456,
    type: '头像融合',
  },
  {
    id: '2',
    imageUri: 'https://picsum.photos/400/400?random=2',
    username: '浪漫约会',
    avatar: 'https://picsum.photos/100/100?random=11',
    likes: 89,
    views: 234,
    type: '虚拟约会',
  },
  {
    id: '3',
    imageUri: 'https://picsum.photos/400/400?random=3',
    username: '幸福时光',
    avatar: 'https://picsum.photos/100/100?random=12',
    likes: 256,
    views: 789,
    type: '纪念日卡片',
  },
  {
    id: '4',
    imageUri: 'https://picsum.photos/400/400?random=4',
    username: '可爱表情',
    avatar: 'https://picsum.photos/100/100?random=13',
    likes: 167,
    views: 523,
    type: '表情包',
  },
];

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [likedWorks, setLikedWorks] = useState<Set<string>>(new Set());

  const handleLike = (workId: string) => {
    setLikedWorks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workId)) {
        newSet.delete(workId);
      } else {
        newSet.add(workId);
      }
      return newSet;
    });
  };

  const renderWorkItem = ({ item }: any) => {
    const isLiked = likedWorks.has(item.id);

    return (
      <TouchableOpacity style={styles.workCard} activeOpacity={0.8}>
        <Image source={{ uri: item.imageUri }} style={styles.workImage} />

        {/* 作品信息覆盖层 */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.workOverlay}
        >
          <View style={styles.workInfo}>
            <View style={styles.userInfo}>
              <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.workType}>{item.type}</Text>
              </View>
            </View>

            <View style={styles.workStats}>
              <View style={styles.statItem}>
                <Feather name="eye" size={16} color={COLORS.textLight} />
                <Text style={styles.statText}>{item.views}</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => handleLike(item.id)}
              >
                <Feather
                  name={isLiked ? 'heart' : 'heart'}
                  size={16}
                  color={isLiked ? '#FF6B9D' : COLORS.textLight}
                  fill={isLiked ? '#FF6B9D' : 'none'}
                />
                <Text style={styles.statText}>
                  {item.likes + (isLiked ? 1 : 0)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>作品广场</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View style={styles.tipBanner}>
        <Feather name="info" size={16} color={COLORS.primary} />
        <Text style={styles.tipText}>
          升级为高级会员即可发布作品到社区
        </Text>
      </View>

      <FlatList
        data={MOCK_COMMUNITY_WORKS}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
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
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFF9FB',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  listContent: {
    padding: SPACING.md,
  },
  workCard: {
    flex: 1,
    margin: SPACING.sm,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.cardBg,
  },
  workOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  workInfo: {
    gap: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  workType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  workStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
