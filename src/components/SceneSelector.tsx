/**
 * SceneSelector组件
 * 场景选择器，横向滚动显示多个场景选项
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SceneOption } from '../types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface SceneSelectorProps {
  scenes: SceneOption[];
  selectedScene: string;
  onSelectScene: (sceneId: string) => void;
}

export const SceneSelector: React.FC<SceneSelectorProps> = ({
  scenes,
  selectedScene,
  onSelectScene,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {scenes.map((scene) => {
        const isSelected = selectedScene === scene.id;
        return (
          <TouchableOpacity
            key={scene.id}
            style={[
              styles.sceneCard,
              isSelected && styles.sceneCardSelected,
            ]}
            onPress={() => onSelectScene(scene.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{scene.emoji}</Text>
            <Text style={[
              styles.label,
              isSelected && styles.labelSelected,
            ]}>
              {scene.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  sceneCard: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sceneCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
