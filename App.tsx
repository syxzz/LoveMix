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
import { useFonts, Niconne_400Regular } from '@expo-google-fonts/niconne';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { PlayfairDisplay_400Regular, PlayfairDisplay_500Medium, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel';

// 导入所有屏幕
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  HomeScreen,
  SettingsScreen,
  ProfileScreen,
  HistoryScreen,
  MembershipScreen,
  CommunityScreen,
} from './src/screens';
import { ScriptDetailScreen } from './src/screens/ScriptDetailScreen';
import { ScriptGeneratorScreen } from './src/screens/ScriptGeneratorScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ClueScreen } from './src/screens/ClueScreen';
import { DialogScreen } from './src/screens/DialogScreen';
import { GroupDiscussScreen } from './src/screens/GroupDiscussScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { RechargeScreen } from './src/screens/RechargeScreen';

import { RootStackParamList } from './src/types';
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from './src/store';
import { getCurrentUser, onAuthStateChanged } from './src/services/auth';
import { COLORS } from './src/utils/constants';
import { USE_FIREBASE } from './src/config';
import './src/i18n'; // 初始化 i18n
import { loadLanguage } from './src/i18n';
import { initializeAllScriptCovers, preloadCoverCache, clearCoverCache, initializeScriptCharacterAvatars } from './src/services/scriptInit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateVideoInBackground } from './src/services/videoGeneration';
import { getAllScripts, getAllScriptsSync } from './src/data/scripts';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 认证检查组件
const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  useEffect(() => {
    checkAuth();

    // 加载语言设置
    loadLanguage();

    // 后台初始化剧本封面（不阻塞主流程）
    initializeScriptCovers();

    // 如果使用 Firebase，监听认证状态变化
    if (USE_FIREBASE && onAuthStateChanged) {
      const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsAuthenticated(true);
          return;
        }
        // Firebase 返回 null 时（如冷启动尚未恢复会话），先尝试用本地存储恢复，避免清空已登录用户
        const stored = await getCurrentUser();
        if (stored) {
          setUser(stored);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const initializeScriptCovers = async () => {
    const COVER_STYLE_VERSION_KEY = 'cover_style_version';
    const CURRENT_COVER_VERSION = 'anime_v2';

    try {
      const savedVersion = await AsyncStorage.getItem(COVER_STYLE_VERSION_KEY);
      if (savedVersion !== CURRENT_COVER_VERSION) {
        console.log('🔄 封面风格版本变更，清除旧缓存重新生成...');
        await clearCoverCache();
        await AsyncStorage.setItem(COVER_STYLE_VERSION_KEY, CURRENT_COVER_VERSION);
      }

      await preloadCoverCache();

      const scripts = await getAllScripts();

      for (const script of scripts) {
        initializeAllScriptCovers([script]);
        initializeScriptCharacterAvatars(script);
        generateVideoInBackground(script);

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('初始化剧本封面失败:', error);
    }
  };

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
      <Stack.Screen name="ScriptDetail" component={ScriptDetailScreen} />
      <Stack.Screen name="ScriptGenerator" component={ScriptGeneratorScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Clue" component={ClueScreen} />
      <Stack.Screen name="Dialog" component={DialogScreen} />
      <Stack.Screen name="GroupDiscuss" component={GroupDiscussScreen} />
      <Stack.Screen name="Vote" component={VoteScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Niconne_400Regular,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    DancingScript_400Regular,
    DancingScript_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    Cinzel_400Regular,
    Cinzel_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
