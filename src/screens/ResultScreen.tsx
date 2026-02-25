/**
 * ResultScreen - 结果揭晓页面
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { t } = useTranslation();
  const { success } = route.params;

  // 示例真相数据
  const truth = {
    murderer: '莉莉安·罗斯',
    motive: '莉莉安发现威廉并不打算真的离婚娶她，而是准备解雇她并给她一笔封口费。愤怒之下，她决定毒死威廉，这样就能继承遗嘱中留给她的财产。',
    process: `真相揭晓：

凶手是莉莉安·罗斯（秘书）。

案件经过：
莉莉安与威廉有不正当关系，威廉承诺会离婚娶她，并修改遗嘱把大部分财产留给她。
然而，就在晚宴前一天，莉莉安偷听到威廉与律师的电话，得知威廉并不打算真的离婚，
而是准备解雇她并给她一笔封口费打发她离开。

愤怒和绝望之下，莉莉安决定毒死威廉。她利用自己秘书的身份，轻易地接触到了
威廉的私人物品。她从医生托马斯那里偷了毒药，并在晚宴上趁机将毒药放入威廉的酒杯中。

监控录像显示，在晚宴进行时，莉莉安曾短暂地靠近威廉的座位，并在他的酒杯旁停留。
毒药瓶上的指纹经过鉴定，正是莉莉安的。`,
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* 顶部结果横幅 */}
      <LinearGradient
        colors={success ? [COLORS.success, '#27AE60'] : [COLORS.error, '#C0392B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.resultBanner}
      >
        <View style={styles.resultIconContainer}>
          <Feather
            name={success ? 'check-circle' : 'x-circle'}
            size={64}
            color={COLORS.textLight}
          />
        </View>
        <Text style={styles.resultTitle}>
          {success ? t('result.success') : t('result.failed')}
        </Text>
        <Text style={styles.resultMessage}>
          {success ? t('result.successMessage') : t('result.failedMessage')}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 案件真相 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={24} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>{t('result.truth')}</Text>
          </View>

          <View style={styles.truthCard}>
            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.murderer')}:</Text>
              <Text style={styles.truthValue}>{truth.murderer}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.motive')}:</Text>
              <Text style={styles.truthText}>{truth.motive}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.truthItem}>
              <Text style={styles.truthLabel}>{t('result.process')}:</Text>
              <Text style={styles.truthText}>{truth.process}</Text>
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackToHome}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Feather name="home" size={20} color={COLORS.textLight} />
              <Text style={styles.actionButtonText}>{t('result.backToHome')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  resultBanner: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  resultIconContainer: {
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  resultMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  truthCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  truthItem: {
    paddingVertical: SPACING.sm,
  },
  truthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  truthValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error,
  },
  truthText: {
    fontSize: 15,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  actionsSection: {
    gap: SPACING.md,
  },
  actionButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: 40,
  },
});
