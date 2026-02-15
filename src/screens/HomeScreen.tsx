/**
 * HomeScreen - 首页
 * 显示四个功能入口卡片和顶部渐变区域
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING, HOME_FEATURES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userProfile } = useAuth();
  const { getCreditsText, isPremium } = useCredits();
  const heartScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 爱心跳动动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleFeaturePress = (screen: string) => {
    navigation.navigate(screen as keyof RootStackParamList);
  };

  return (
    <View style={styles.container}>
      {/* 顶部渐变区域 */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Hi，{userProfile?.displayName || '宝贝'}
            </Text>
            {isPremium() && (
              <Text style={styles.memberBadge}>👑 高级会员</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.displayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.creditsContainer,
            { transform: [{ scale: heartScale }] },
          ]}
        >
          <Text style={styles.creditsLabel}>剩余次数</Text>
          <Text style={styles.creditsValue}>{getCreditsText()}</Text>
          {!isPremium() && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Membership')}
            >
              <Text style={styles.upgradeText}>升级会员</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>

      {/* 功能卡片列表 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {HOME_FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.featureEmoji}>
              <Text style={styles.emojiText}>{feature.emoji}</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* 底部间距 */}
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
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  memberBadge: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    opacity: 0.9,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  creditsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    opacity: 0.9,
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  upgradeButton: {
    backgroundColor: COLORS.textLight,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  upgradeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureEmoji: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  emojiText: {
    fontSize: 48,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  bottomSpacer: {
    height: 20,
  },
});
