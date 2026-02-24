/**
 * HistoryScreen - 作品历史记录页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { workHistoryAtom } from '../store';
import { Feather } from '@expo/vector-icons';
import { WorkType } from '../types';

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  faceMerge: '头像融合',
  card: '纪念日卡片',
  date: '虚拟约会',
  sticker: '表情包',
};

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [workHistory] = useAtom(workHistoryAtom);
  const [selectedType, setSelectedType] = useState<WorkType | 'all'>('all');

  const filteredHistory =
    selectedType === 'all'
      ? workHistory
      : workHistory.filter((item) => item.type === selectedType);

  const renderWorkItem = ({ item }: any) => (
    <TouchableOpacity style={styles.workCard} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUri }} style={styles.workImage} />
      <View style={styles.workInfo}>
        <View style={styles.workHeader}>
          <Text style={styles.workType}>
            {WORK_TYPE_LABELS[item.type as WorkType]}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="eye" size={14} color={COLORS.textGray} />
              <Text style={styles.statText}>{item.views || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="heart" size={14} color={COLORS.textGray} />
              <Text style={styles.statText}>{item.likes || 0}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.workDate}>
          {new Date(item.createdAt).toLocaleDateString('zh-CN')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>暂无作品</Text>
      <Text style={styles.emptyDescription}>
        开始创作你的第一个作品吧
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>我的作品</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* 筛选标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedType === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType('all')}
        >
          <Text
            style={[
              styles.filterText,
              selectedType === 'all' && styles.filterTextActive,
            ]}
          >
            全部
          </Text>
        </TouchableOpacity>
        {Object.entries(WORK_TYPE_LABELS).map(([type, label]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type as WorkType)}
          >
            <Text
              style={[
                styles.filterText,
                selectedType === type && styles.filterTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 作品列表 */}
      <FlatList
        data={filteredHistory}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
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
  filterContainer: {
    maxHeight: 60,
    backgroundColor: COLORS.background,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
  },
  workCard: {
    flex: 1,
    margin: SPACING.sm,
    backgroundColor: COLORS.background,
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
  workInfo: {
    padding: SPACING.sm,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  workDate: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textGray,
  },
});
