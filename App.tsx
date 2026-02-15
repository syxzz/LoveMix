/**
 * App.tsx - 主入口文件
 * 配置导航和全局状态
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as JotaiProvider } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// 导入认证上下文
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// 导入所有屏幕
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { FaceMergeScreen } from './src/screens/FaceMergeScreen';
import { CardScreen } from './src/screens/CardScreen';
import { DateScreen } from './src/screens/DateScreen';
import { StickerScreen } from './src/screens/StickerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CoupleProfileScreen } from './src/screens/CoupleProfileScreen';
import { MembershipScreen } from './src/screens/MembershipScreen';

import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 导航组件
const Navigation = () => {
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      setHasSeenOnboarding(false);
    }
  };

  // 加载中状态
  if (loading || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      {!user ? (
        // 未登录流程
        <>
          {!hasSeenOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // 已登录流程
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="FaceMerge" component={FaceMergeScreen} />
          <Stack.Screen name="Card" component={CardScreen} />
          <Stack.Screen name="Date" component={DateScreen} />
          <Stack.Screen name="Sticker" component={StickerScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CoupleProfile" component={CoupleProfileScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JotaiProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Navigation />
          </NavigationContainer>
        </AuthProvider>
      </JotaiProvider>
    </GestureHandlerRootView>
  );
}
