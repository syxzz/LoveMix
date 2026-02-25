/**
 * ClueScreen - 线索查看页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Clue } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

type ClueScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Clue'>;

export const ClueScreen: React.FC = () => {
  const navigation = useNavigation<ClueScreenNavigationProp>();
  const { t } = useTranslation();

  // 示例线索数据（实际应从游戏进度中获取）
  const [clues, setClues] = useState<Clue[]>([
    {
      id: 'clue_1',
      name: '毒药瓶',
      type: 'key',
      location: '书房',
      description: '在书房的抽屉里发现了一个空的毒药瓶，上面有指纹。',
      discovered: true,
    },
    {
      id: 'clue_2',
      name: '遗嘱草稿',
      type: 'important',
      location: '卧室',
      description: '威廉最近修改的遗嘱草稿，显示他打算把大部分财产留给"L.R."。',
      discovered: true,
    },
  ]);

  const getClueTypeColor = (type: string) => {
    switch (type) {
      case 'key':
        return COLORS.clueKey;
      case 'important':
        return COLORS.clueImportant;
      case 'normal':
        return COLORS.clueNormal;
      default:
        return COLORS.textGray;
    }
  };

  const getClueTypeIcon = (type: string) => {
    switch (type) {
      case 'key':
        return '⭐';
      case 'important':
        return '❗';
      case 'normal':
        return '📝';
      default:
        return '📄';
    }
  };

  const discoveredClues = clues.filter(c => c.discovered);

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
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
        <Text style={styles.headerTitle}>{t('clue.title')}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* 统计信息 */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {t('clue.discovered')}: {discoveredClues.length} / {clues.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {discoveredClues.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={64} color={COLORS.textGray} />
            <Text style={styles.emptyText}>{t('clue.noClues')}</Text>
            <Text style={styles.emptyHint}>{t('clue.searchMore')}</Text>
          </View>
        ) : (
          discoveredClues.map((clue) => (
            <View key={clue.id} style={styles.clueCard}>
              <View style={styles.clueHeader}>
                <View style={styles.clueTypeContainer}>
                  <Text style={styles.clueTypeIcon}>{getClueTypeIcon(clue.type)}</Text>
                  <Text
                    style={[
                      styles.clueType,
                      { color: getClueTypeColor(clue.type) },
                    ]}
                  >
                    {t(`clue.types.${clue.type}`)}
                  </Text>
                </View>
                <View style={styles.locationTag}>
                  <Feather name="map-pin" size={14} color={COLORS.accent} />
                  <Text style={styles.locationText}>{clue.location}</Text>
                </View>
              </View>

              <Text style={styles.clueName}>{clue.name}</Text>
              <Text style={styles.clueDescription}>{clue.description}</Text>
            </View>
          ))
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  placeholder: {
    width: 40,
  },
  statsBar: {
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  clueCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clueTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clueTypeIcon: {
    fontSize: 16,
  },
  clueType: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  clueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  clueDescription: {
    fontSize: 15,
    color: COLORS.textGray,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textGray,
    marginTop: SPACING.lg,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
