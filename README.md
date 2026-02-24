# LoveMix - 情侣AI创意App 💑

LoveMix 是一款专为情侣打造的AI创意应用，使用 React Native 和 Expo 开发。提供AI头像融合、纪念日卡片、虚拟约会场景和表情包生成等温馨浪漫的功能。

## ✨ 主要功能

### 1. 💑 AI头像融合
- 上传两张照片，生成未来宝宝或情侣头像
- 支持两种模式：未来宝宝 / 情侣头像
- AI智能融合面部特征

### 2. 🎂 纪念日卡片
- 定制专属祝福卡片
- 填写纪念日名称、日期和双方昵称
- 三种风格可选：浪漫 / 幽默 / 文艺
- 自动生成精美祝福文案

### 3. 🌅 虚拟约会场景
- 生成"如果我们在一起"的虚拟约会照片
- 6个浪漫场景：海边日落、浪漫咖啡馆、星空露营、未来之家、樱花树下、沙滩漫步
- 4种画面风格：写实、动漫、水彩、油画

### 4. 😊 表情包工坊
- 将聊天内容转换为表情包
- 快捷标签：想你、晚安、抱抱、生气、亲亲
- 三种风格：可爱卡通、搞怪、萌宠
- 一次生成4个表情包

## 🎨 设计特色

- **配色方案**：热情粉 (#FF69B4) + 天空蓝 (#87CEEB)
- **渐变效果**：45度线性渐变，营造浪漫氛围
- **圆角设计**：12px - 32px 多层次圆角
- **动画效果**：心跳加载动画、按钮按压动画、页面淡入淡出
- **字体系统**：Poppins 字体家族（Bold/SemiBold/Regular/Light）

## 📦 技术栈

- **框架**: React Native + Expo SDK 54
- **语言**: TypeScript
- **导航**: React Navigation (Native Stack)
- **状态管理**: Jotai
- **样式**: NativeWind (Tailwind CSS for React Native)
- **动画**: React Native Reanimated
- **手势**: React Native Gesture Handler
- **图片处理**: Expo Image Picker, Expo Media Library
- **存储**: AsyncStorage (普通数据), Expo Secure Store (API密钥)
- **API调用**: Axios

## 🚀 快速开始

### 前置要求

- Node.js 20.13.1 或更高版本
- npm 或 yarn
- Expo CLI
- iOS 模拟器 (Mac) 或 Android 模拟器 或 实体设备

### 安装步骤

1. **克隆项目**
```bash
cd LoveMix
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npx expo start
```

4. **运行应用**
- iOS: 按 `i` 或扫描二维码
- Android: 按 `a` 或扫描二维码
- Web: 按 `w` (部分功能可能不可用)

## 🔑 API密钥配置

LoveMix 支持真实的AI生成功能，需要配置以下API密钥：

### 1. Replicate API (用于图像生成)

**获取步骤：**
1. 访问 [replicate.com](https://replicate.com)
2. 注册并登录账户
3. 进入 Account Settings
4. 在 API Tokens 页面创建新的 API Token
5. 复制 API Token

**用途：**
- AI头像融合
- 虚拟约会场景生成
- 表情包生成

### 2. OpenAI API (用于文案生成)

**获取步骤：**
1. 访问 [platform.openai.com](https://platform.openai.com)
2. 注册并登录账户
3. 进入 API Keys 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥（只显示一次）

**用途：**
- 纪念日卡片文案生成
- 表情包文案优化

### 配置方式

在应用中进入"设置"页面，输入获取的API密钥并保存。密钥将使用 Expo Secure Store 加密存储在本地。

**注意：** 如果不配置API密钥，应用将使用模拟数据，所有功能仍可正常体验。

## 📁 项目结构

```
LoveMix/
├── App.tsx                          # 主入口文件，配置导航
├── babel.config.js                  # Babel配置
├── tailwind.config.js               # Tailwind CSS配置
├── package.json                     # 项目依赖
├── tsconfig.json                    # TypeScript配置
│
├── src/
│   ├── screens/                     # 页面组件
│   │   ├── HomeScreen.tsx           # 首页 - 四个功能入口
│   │   ├── FaceMergeScreen.tsx      # AI头像融合页面
│   │   ├── CardScreen.tsx           # 纪念日卡片页面
│   │   ├── DateScreen.tsx           # 虚拟约会场景页面
│   │   ├── StickerScreen.tsx        # 表情包生成页面
│   │   └── SettingsScreen.tsx       # 设置页面
│   │
│   ├── components/                  # 可复用组件
│   │   ├── ImageUploader.tsx        # 图片上传组件
│   │   ├── GradientButton.tsx       # 渐变按钮组件
│   │   ├── LoadingHeart.tsx         # 心跳加载动画
│   │   ├── ResultCard.tsx           # 结果展示卡片
│   │   ├── SceneSelector.tsx        # 场景选择器
│   │   └── TabBar.tsx               # 底部导航栏
│   │
│   ├── services/                    # 服务层
│   │   ├── replicate.ts             # Replicate API调用
│   │   ├── openai.ts                # OpenAI API调用
│   │   └── storage.ts               # 本地存储服务
│   │
│   ├── hooks/                       # 自定义Hooks
│   │   ├── useImagePicker.ts        # 图片选择Hook
│   │   └── useAPIKeys.ts            # API密钥管理Hook
│   │
│   ├── utils/                       # 工具函数
│   │   ├── constants.ts             # 常量配置
│   │   └── helpers.ts               # 辅助函数
│   │
│   ├── types/                       # TypeScript类型定义
│   │   └── index.ts                 # 全局类型
│   │
│   └── store/                       # 状态管理
│       └── index.ts                 # Jotai状态定义
│
└── assets/                          # 静态资源
    ├── fonts/                       # 字体文件
    └── images/                      # 图片资源
```

## 🎯 核心功能实现

### 图片处理流程
1. 使用 `expo-image-picker` 选择或拍摄照片
2. 图片在本地预览和编辑
3. 调用API时发送图片数据
4. 接收生成结果并展示
5. 使用 `expo-media-library` 保存到相册

### 数据存储策略
- **普通数据**: AsyncStorage (爱心值、生成历史)
- **敏感数据**: Expo Secure Store (API密钥，加密存储)
- **临时数据**: 组件状态 (useState, Jotai)

### 离线体验
- 未配置API密钥时自动使用模拟数据
- 所有功能均可离线体验
- 模拟API延迟，提供真实的加载体验

## 🎨 UI/UX 设计规范

### 颜色系统
```typescript
primary: '#FF69B4'      // 热情粉
secondary: '#87CEEB'    // 天空蓝
background: '#FFFFFF'   // 纯白
cardBg: '#F8F9FA'       // 浅灰
textDark: '#2C3E50'     // 深灰
```

### 圆角规范
```typescript
small: 12px      // 按钮内部元素
medium: 20px     // 卡片
large: 24px      // 上传框
xlarge: 32px     // 主按钮
```

### 间距规范
```typescript
xs: 8px
sm: 12px
md: 16px
lg: 20px
xl: 24px
xxl: 32px
```

### 字体规范
```typescript
small: 14px      // 小字
regular: 16px    // 正文
button: 18px     // 按钮
subtitle: 20px   // 副标题
title: 28px      // 标题
```

## 🔧 开发指南

### 添加新功能

1. **创建新页面**
```typescript
// src/screens/NewFeatureScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export const NewFeatureScreen: React.FC = () => {
  return (
    <View>
      <Text>New Feature</Text>
    </View>
  );
};
```

2. **添加路由**
```typescript
// App.tsx
<Stack.Screen name="NewFeature" component={NewFeatureScreen} />
```

3. **更新类型定义**
```typescript
// src/types/index.ts
export type RootStackParamList = {
  // ...existing routes
  NewFeature: undefined;
};
```

### 调试技巧

- 使用 `console.log` 查看日志
- Expo DevTools: 按 `m` 打开菜单
- React DevTools: 在浏览器中调试
- 网络请求: 使用 Reactotron 或 Flipper

## 📱 兼容性

- **iOS**: 13.0+
- **Android**: 5.0+ (API Level 21+)
- **Web**: 部分功能支持

## 🔒 隐私与安全

- 所有数据存储在本地设备
- API密钥使用 Expo Secure Store 加密存储
- 不上传任何个人信息到第三方服务器
- 图片处理在本地完成

## 🐛 常见问题

### Q: 为什么生成的图片是占位图？
A: 这是因为未配置API密钥，应用使用了模拟数据。请在设置页面配置 Replicate API 密钥。

### Q: 如何保存生成的图片？
A: 点击结果卡片下方的"保存"按钮，图片将保存到系统相册。首次使用需要授予相册权限。

### Q: 应用支持哪些语言？
A: 目前仅支持简体中文。

### Q: 可以在多个设备间同步数据吗？
A: 目前不支持云同步，所有数据仅存储在本地设备。

## 🚧 未来计划

- [ ] 添加更多AI生成场景
- [ ] 支持视频生成功能
- [ ] 云端数据同步
- [ ] 多语言支持
- [ ] 深色模式
- [ ] 社交分享功能
- [ ] 生成历史管理

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- Email: support@lovemix.app

---

**用爱创造，用AI实现 ❤️**

Made with ❤️ by LoveMix Team
