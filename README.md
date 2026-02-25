# 🎭 LoveMix - AI 驱动的剧本杀游戏平台

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)

一个创新的剧本杀游戏平台，结合 AI 技术提供沉浸式的推理体验

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构) • [API 配置](#-api-配置)

</div>

---

## ✨ 功能特性

### 🎮 核心游戏功能

- **AI 开场白生成** - 根据剧本和角色自动生成专属开场介绍
- **智能 DM 系统** - AI 主持人引导游戏进程，回答玩家问题
- **角色对话系统** - 与 NPC 角色进行智能对话，获取线索
- **线索搜集** - 探索场景，发现关键线索
- **推理投票** - 分析线索，投票选出真凶
- **结局揭晓** - 查看完整真相和推理评价

### 🤖 AI 增强功能

- **流式输出** - 实时显示 AI 生成内容，提供打字机效果
- **思考链可视化** - 可选展示 AI 推理过程（支持开关）
- **自动降级** - AI 请求失败时自动切换到普通模式
- **加载动画** - 优雅的等待动画，提升用户体验

### 🌍 多语言支持

- 中文（简体）
- 英文
- 日文
- 动态语言切换

### 🎨 精美 UI/UX

- **渐变设计** - 紫色到金色的优雅渐变
- **流畅动画** - 基于 Animated API 的原生动画
- **响应式布局** - 适配各种屏幕尺寸
- **暗色主题** - 沉浸式的游戏氛围

---

## 🚀 快速开始

### 前置要求

- Node.js 20.13.1+
- npm 或 yarn
- Expo CLI
- iOS 模拟器或 Android 模拟器（可选）

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd LoveMix

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start

# 4. 运行应用
# iOS: 按 'i' 或运行 npm run ios
# Android: 按 'a' 或运行 npm run android
# Web: 按 'w' 或运行 npm run web
```

### 首次运行

1. 应用启动后会显示欢迎页面
2. 可以选择登录或跳过登录
3. 进入首页查看可用剧本
4. 选择剧本和角色开始游戏

---

## 🛠 技术栈

### 核心框架

- **React Native** `0.81.5` - 跨平台移动应用框架
- **Expo** `~54.0` - React Native 开发工具链
- **TypeScript** `5.9.2` - 类型安全的 JavaScript

### 导航和状态管理

- **React Navigation** `7.x` - 导航库
  - Native Stack Navigator - 原生导航体验
- **Jotai** `2.17.1` - 原子化状态管理
- **AsyncStorage** - 本地数据持久化

### UI 和样式

- **Expo Linear Gradient** - 渐变效果
- **React Native Animated** - 原生动画
- **Vector Icons** - 图标库

### 国际化

- **i18next** `25.8.13` - 国际化框架
- **react-i18next** `16.5.4` - React 集成

### AI 集成

- **react-native-fetch-api** `3.0.0` - 支持流式响应的 Fetch API
- **CharaBoard API** - AI 对话服务（MiniMax M2.1）

### 其他工具

- **Firebase** `12.9.0` - 用户认证和数据存储
- **Axios** `1.13.5` - HTTP 客户端
- **Expo Secure Store** - 加密存储

---

## 📁 项目结构

```
LoveMix/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── GradientButton.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LoadingHeart.tsx
│   │   ├── ResultCard.tsx
│   │   ├── SceneSelector.tsx
│   │   └── TabBar.tsx
│   │
│   ├── screens/             # 页面组件
│   │   ├── WelcomeScreen.tsx      # 欢迎页
│   │   ├── LoginScreen.tsx        # 登录页
│   │   ├── RegisterScreen.tsx     # 注册页
│   │   ├── HomeScreen.tsx         # 首页（剧本列表）
│   │   ├── ScriptDetailScreen.tsx # 剧本详情
│   │   ├── GameScreen.tsx         # 游戏主界面
│   │   ├── DialogScreen.tsx       # 对话系统
│   │   ├── ClueScreen.tsx         # 线索查看
│   │   ├── VoteScreen.tsx         # 投票页面
│   │   ├── ResultScreen.tsx       # 结果页面
│   │   ├── ProfileScreen.tsx      # 个人中心
│   │   ├── SettingsScreen.tsx     # 设置页面
│   │   └── ...
│   │
│   ├── services/            # 服务层
│   │   ├── ai.ts           # AI 对话服务
│   │   ├── storage.ts      # 本地存储服务
│   │   └── firebase.ts     # Firebase 服务
│   │
│   ├── data/               # 数据层
│   │   └── scripts.ts      # 剧本数据
│   │
│   ├── i18n/               # 国际化
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.ts       # 英文
│   │       ├── zh.ts       # 中文
│   │       └── ja.ts       # 日文
│   │
│   ├── types/              # TypeScript 类型定义
│   │   ├── index.ts
│   │   └── script.ts
│   │
│   ├── utils/              # 工具函数
│   │   └── constants.ts    # 常量定义
│   │
│   └── store/              # 状态管理
│       └── index.ts
│
├── assets/                 # 静态资源
├── App.tsx                # 应用入口
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔑 API 配置

### CharaBoard API（AI 对话）

项目使用 CharaBoard API 提供 AI 对话功能。

**配置步骤：**

1. 打开 `src/services/ai.ts`
2. 找到 API 配置部分：

```typescript
const API_BASE_URL = 'https://api-chat.charaboard.com/v1';
const API_KEY = 'your_api_key_here';
const GPT_TYPE = 8602; // MiniMax M2.1
```

3. 替换 `API_KEY` 为你的密钥

**功能说明：**

- **思考链模式** - 启用后 AI 会展示推理过程
- **流式输出** - 实时显示生成内容
- **自动降级** - 失败时自动切换到普通模式

### Firebase（可选）

用于用户认证和数据同步。

**配置步骤：**

1. 在 Firebase Console 创建项目
2. 获取配置信息
3. 更新 `src/config/firebase.ts`

---

## 🎮 游戏流程

### 1. 选择剧本
- 浏览可用剧本列表
- 查看剧本详情（背景、角色、难度）
- 选择想要扮演的角色

### 2. 开场介绍
- AI 生成专属开场白
- 了解角色背景和目标
- 查看初始线索

### 3. 搜证阶段
- 与 DM 对话获取提示
- 探索场景发现线索
- 记录重要信息

### 4. 讨论阶段
- 与其他角色对话
- 分享和隐藏信息
- 推理案件真相

### 5. 投票环节
- 选择你认为的凶手
- 提交推理依据
- 等待结果揭晓

### 6. 真相大白
- 查看完整案件真相
- AI 评价你的推理
- 解锁成就和奖励

---

## 🎨 设计规范

### 配色方案

```
主色调：#8B4789 (神秘紫)
辅助色：#D4AF37 (优雅金)
背景色：#16213E (深蓝黑)
卡片背景：#1A1A2E (深灰蓝)
文字颜色：
  - 主文字：#E8E8E8 (浅灰)
  - 次要文字：#A0A0A0 (中灰)
  - 强调文字：#D4AF37 (金色)
```

### 圆角规范

```
小圆角：8px  - 标签、徽章
中圆角：12px - 按钮、输入框
大圆角：16px - 卡片
超大圆角：24px - 模态框
```

### 间距规范

```
xs: 4px   - 紧密元素
sm: 8px   - 相关元素
md: 16px  - 标准间距
lg: 24px  - 区块间距
xl: 32px  - 大区块间距
```

---

## 🔧 开发指南

### 添加新剧本

1. 在 `src/data/scripts.ts` 中添加剧本数据
2. 定义角色、线索、真相等信息
3. 配置 AI 提示词

### 自定义 AI 行为

编辑 `src/services/ai.ts` 中的系统提示词：

```typescript
const getDMSystemPrompt = (script: Script, character: Character) => `
  你是一个剧本杀游戏的DM...
  // 自定义 DM 行为
`;
```

### 添加新语言

1. 在 `src/i18n/locales/` 创建新语言文件
2. 在 `src/i18n/index.ts` 注册语言
3. 更新 `LanguageSelector` 组件

---

## 📊 性能优化

- ✅ 使用 `requestAnimationFrame` 优化流式更新
- ✅ 图片懒加载和缓存
- ✅ 组件级别的状态管理
- ✅ 避免不必要的重渲染
- ✅ 异步数据加载

---

## 🐛 已知问题

1. **思考链 API 不稳定** - 已添加自动降级机制
2. **流式输出延迟** - 网络条件影响，已优化缓冲策略
3. **iOS 键盘遮挡** - 使用 KeyboardAvoidingView 解决

---

## 🔮 未来计划

- [ ] 多人在线对战模式
- [ ] 自定义剧本编辑器
- [ ] 语音对话功能
- [ ] AR 场景探索
- [ ] 社区剧本分享
- [ ] 成就系统
- [ ] 排行榜

---

## 📄 许可证

MIT License

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">

**用 ❤️ 和 ☕ 制作**

[⬆ 回到顶部](#-lovemix---ai-驱动的剧本杀游戏平台)

</div>

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
├── App.tsx                          # 主入口文件，配置导航和认证
├── babel.config.js                  # Babel配置
├── tailwind.config.js               # Tailwind CSS配置
├── package.json                     # 项目依赖
├── tsconfig.json                    # TypeScript配置
│
├── src/
│   ├── screens/                     # 页面组件
│   │   ├── WelcomeScreen.tsx        # 欢迎引导页
│   │   ├── LoginScreen.tsx          # 登录页面
│   │   ├── RegisterScreen.tsx       # 注册页面
│   │   ├── ForgotPasswordScreen.tsx # 忘记密码页面
│   │   ├── HomeScreen.tsx           # 首页 - 四个功能入口
│   │   ├── FaceMergeScreen.tsx      # AI头像融合页面
│   │   ├── CardScreen.tsx           # 纪念日卡片页面
│   │   ├── DateScreen.tsx           # 虚拟约会场景页面
│   │   ├── StickerScreen.tsx        # 表情包生成页面
│   │   ├── ProfileScreen.tsx        # 个人资料页面
│   │   ├── MembershipScreen.tsx     # 会员订阅页面
│   │   ├── HistoryScreen.tsx        # 作品历史页面
│   │   ├── CommunityScreen.tsx      # 社区广场页面
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
│   │   ├── auth.ts                  # 认证服务
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
│   │   ├── index.ts                 # 全局类型
│   │   ├── user.ts                  # 用户相关类型
│   │   └── history.ts               # 历史记录类型
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

### 短期优化
- [ ] 接入真实支付系统(微信支付/支付宝)
- [ ] 实现真实的后端API
- [ ] 添加数据云端同步
- [ ] 实现推送通知

### 中期规划
- [ ] 添加社交功能(关注、评论)
- [ ] 实现作品分享到社交平台
- [ ] 添加每日签到和任务系统
- [ ] 实现积分商城
- [ ] 深色模式

### 长期规划
- [ ] AI模型优化和定制
- [ ] 更多创意功能
- [ ] 企业版/定制版
- [ ] 国际化支持
- [ ] 支持视频生成功能

## 📚 文档

- [升级指南](UPGRADE_GUIDE.md) - 商业化升级详细说明
- [用户指南](USER_GUIDE.md) - 完整的用户使用手册
- [快速开始](QUICKSTART.md) - 开发快速入门
- [项目总结](PROJECT_SUMMARY.md) - 项目概览

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
