/**
 * CardScreen - 纪念日卡片页面
 * 用户填写纪念日信息，选择风格，生成定制祝福卡片
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GradientButton } from '../components/GradientButton';
import { LoadingHeart } from '../components/LoadingHeart';
import { ResultCard } from '../components/ResultCard';
import { generateCard } from '../services/replicate';
import { CardStyle, CardData } from '../types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { Feather } from '@expo/vector-icons';

export const CardScreen: React.FC = () => {
  const navigation = useNavigation();

  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [names, setNames] = useState('');
  const [style, setStyle] = useState<CardStyle>('romantic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image: string; text: string } | null>(null);

  const styles_options: { id: CardStyle; label: string }[] = [
    { id: 'romantic', label: '浪漫' },
    { id: 'humorous', label: '幽默' },
    { id: 'artistic', label: '文艺' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleGenerate = async () => {
    if (!eventName.trim()) {
      Alert.alert('提示', '请输入纪念日名称');
      return;
    }
    if (!names.trim()) {
      Alert.alert('提示', '请输入双方昵称');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const cardData: CardData = {
        eventName: eventName.trim(),
        date: formatDate(date),
        names: names.trim(),
        style,
      };

      const generatedCard = await generateCard(cardData);
      setResult(generatedCard);
    } catch (error) {
      console.error('Error generating card:', error);
      Alert.alert('生成失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题栏 */}
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
        <Text style={styles.headerTitle}>纪念日卡片</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 表单区域 */}
        <View style={styles.formCard}>
          {/* 纪念日名称 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>纪念日名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：恋爱一周年"
              placeholderTextColor={COLORS.textGray}
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          {/* 选择日期 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>选择日期</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Feather name="calendar" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* 双方昵称 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>双方昵称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：小明和小红"
              placeholderTextColor={COLORS.textGray}
              value={names}
              onChangeText={setNames}
            />
          </View>

          {/* 祝福风格 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>祝福风格</Text>
            <View style={styles.styleSelector}>
              {styles_options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.styleButton,
                    style === option.id && styles.styleButtonActive,
                  ]}
                  onPress={() => setStyle(option.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.styleText,
                      style === option.id && styles.styleTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 预览区域 */}
        {result && !loading && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>生成的祝福文案</Text>
            <Text style={styles.previewText}>{result.text}</Text>
          </View>
        )}

        {/* 生成按钮 */}
        <View style={styles.buttonSection}>
          <GradientButton
            title="🎨 生成祝福卡片"
            onPress={handleGenerate}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* 加载动画 */}
        {loading && <LoadingHeart message="正在生成卡片..." />}

        {/* 结果展示 */}
        {result && !loading && (
          <View style={styles.resultSection}>
            <ResultCard imageUri={result.image} showActions={true} />
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textDark,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  styleSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleButtonActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
  },
  styleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  styleTextActive: {
    color: COLORS.primary,
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 22,
  },
  buttonSection: {
    marginBottom: SPACING.xl,
  },
  resultSection: {
    marginTop: SPACING.lg,
  },
  bottomSpacer: {
    height: 40,
  },
});
