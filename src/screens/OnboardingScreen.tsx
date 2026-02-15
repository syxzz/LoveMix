/**
 * 引导页面
 * 首次使用时展示应用功能介绍
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const slides = [
  {
    id: 1,
    title: '欢迎来到 LoveMix 💕',
    description: '专为情侣打造的AI创意应用\n让爱更有趣，让回忆更美好',
    emoji: '💑',
  },
  {
    id: 2,
    title: 'AI头像融合',
    description: '上传两张照片\n生成未来宝宝或情侣头像',
    emoji: '👶',
  },
  {
    id: 3,
    title: '纪念日卡片',
    description: '定制专属祝福卡片\n记录每一个重要时刻',
    emoji: '🎂',
  },
  {
    id: 4,
    title: '虚拟约会场景',
    description: '生成浪漫约会照片\n实现"如果我们在一起"的幻想',
    emoji: '🌅',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const slide = slides[currentSlide];

  return (
    <LinearGradient colors={['#FF69B4', '#87CEEB']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.slideContainer}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentSlide < slides.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>跳过</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentSlide === slides.length - 1 ? '开始使用' : '下一步'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 6,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
