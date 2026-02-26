/**
 * VoteScreen - 投票页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Character, Script } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { getScriptById } from '../data/scripts';
import { Feather } from '@expo/vector-icons';

type VoteScreenRouteProp = RouteProp<RootStackParamList, 'Vote'>;
type VoteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Vote'>;

export const VoteScreen: React.FC = () => {
  const navigation = useNavigation<VoteScreenNavigationProp>();
  const route = useRoute<VoteScreenRouteProp>();
  const { t } = useTranslation();
  const { scriptId } = route.params;

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadScript();
  }, []);

  const loadScript = async () => {
    const data = await getScriptById(scriptId);
    setScript(data || null);
    setLoading(false);
  };

  const characters = script?.characters || [];

  const handleConfirmVote = () => {
    if (!selectedCharacterId || !script) {
      Alert.alert(t('common.error'), '请选择一个嫌疑人');
      return;
    }

    Alert.alert(
      t('vote.warning'),
      '确定要投票给这个人吗？投票后将无法修改。',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            const isCorrect = selectedCharacterId === script.murderer;
            navigation.navigate('Result', { success: isCorrect, scriptId });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t('vote.title')}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 说明 */}
        <View style={styles.instructionCard}>
          <Feather name="alert-circle" size={24} color={COLORS.warning} />
          <Text style={styles.instructionText}>{t('vote.subtitle')}</Text>
        </View>

        {/* 角色列表 */}
        <Text style={styles.sectionTitle}>{t('vote.selectSuspect')}</Text>
        {characters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterCard,
              selectedCharacterId === character.id && styles.characterCardSelected,
            ]}
            onPress={() => setSelectedCharacterId(character.id)}
            activeOpacity={0.8}
          >
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterMeta}>
                {character.occupation} · {character.age}岁
              </Text>
            </View>
            {selectedCharacterId === character.id && (
              <View style={styles.selectedBadge}>
                <Feather name="check" size={18} color={COLORS.textLight} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* 推理依据 */}
        <Text style={styles.sectionTitle}>{t('vote.reason')}</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder={t('vote.reasonPlaceholder')}
          placeholderTextColor={COLORS.textGray}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        {/* 确认按钮 */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmVote}
          disabled={!selectedCharacterId}
        >
          <LinearGradient
            colors={selectedCharacterId ? [COLORS.error, COLORS.warning] : ['#666', '#444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            <Feather name="check-circle" size={24} color={COLORS.textLight} />
            <Text style={styles.confirmButtonText}>{t('vote.confirm')}</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  characterCardSelected: {
    borderColor: COLORS.error,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  characterMeta: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.medium,
    padding: SPACING.lg,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  confirmButton: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: 40,
  },
});
