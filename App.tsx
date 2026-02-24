/**
 * App.tsx - 主入口文件
 * 配置导航和全局状态
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as JotaiProvider, useSetAtom, useAtomValue } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// 导入所有屏幕
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  HomeScreen,
  FaceMergeScreen,
  CardScreen,
  DateScreen,
  StickerScreen,
  SettingsScreen,
  ProfileScreen,
  HistoryScreen,
  MembershipScreen,
  CommunityScreen,
} from './src/screens';

import { RootStackParamList } from './src/types';
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from './src/store';
import { getCurrentUser } from './src/services/auth';
import { COLORS } from './src/utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 认证检查组件
const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return <>{children}</>;
};

// 导航组件
const Navigation: React.FC = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      {/* 认证相关页面 */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* 主应用页面 */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FaceMerge" component={FaceMergeScreen} />
      <Stack.Screen name="Card" component={CardScreen} />
      <Stack.Screen name="Date" component={DateScreen} />
      <Stack.Screen name="Sticker" component={StickerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JotaiProvider>
        <AuthCheck>
          <NavigationContainer>
            <StatusBar style="light" />
            <Navigation />
          </NavigationContainer>
        </AuthCheck>
      </JotaiProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
