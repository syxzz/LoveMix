/**
 * App.tsx - 主入口文件
 * 配置导航和全局状态
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as JotaiProvider } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 导入所有屏幕
import { HomeScreen } from './src/screens/HomeScreen';
import { FaceMergeScreen } from './src/screens/FaceMergeScreen';
import { CardScreen } from './src/screens/CardScreen';
import { DateScreen } from './src/screens/DateScreen';
import { StickerScreen } from './src/screens/StickerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JotaiProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="FaceMerge" component={FaceMergeScreen} />
            <Stack.Screen name="Card" component={CardScreen} />
            <Stack.Screen name="Date" component={DateScreen} />
            <Stack.Screen name="Sticker" component={StickerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </JotaiProvider>
    </GestureHandlerRootView>
  );
}
