# LoveMix - 情侣AI创意App 💑

LoveMix 是一款专为情侣打造的**商业化AI创意应用**，使用 React Native 和 Expo 开发。提供AI头像融合、纪念日卡片、虚拟约会场景和表情包生成等温馨浪漫的功能。

## ✨ 核心功能

### 🔐 用户系统
- **用户注册/登录** - 邮箱密码认证，安全可靠
- **个人资料管理** - 自定义昵称、头像
- **情侣档案** - 记录双方信息、纪念日、关系状态
- **忘记密码** - 邮件重置密码功能

### 👑 会员订阅系统
- **免费会员** - 每月10次免费使用额度
- **高级会员** - 无限次使用，优先生成速度，云端同步
- **灵活订阅** - 支持月度订阅，随时取消

### 💎 AI创意功能

#### 1. 💑 AI头像融合
- 上传两张照片，生成未来宝宝或情侣头像
- 支持两种模式：未来宝宝 / 情侣头像
- AI智能融合面部特征

#### 2. 🎂 纪念日卡片
- 定制专属祝福卡片
- 填写纪念日名称、日期和双方昵称
- 三种风格可选：浪漫 / 幽默 / 文艺
- 自动生成精美祝福文案

#### 3. 🌅 虚拟约会场景
- 生成"如果我们在一起"的虚拟约会照片
- 6个浪漫场景：海边日落、浪漫咖啡馆、星空露营、未来之家、樱花树下、沙滩漫步
- 4种画面风格：写实、动漫、水彩、油画

#### 4. 😊 表情包工坊
- 将聊天内容转换为表情包
- 快捷标签：想你、晚安、抱抱、生气、亲亲
- 三种风格：可爱卡通、搞怪、萌宠
- 一次生成4个表情包

### ☁️ 云端服务
- **数据同步** - 生成历史自动同步到云端
- **多设备访问** - 随时随地访问你的创作
- **安全存储** - Firebase 加密存储，保护隐私

### 📊 使用统计
- **额度管理** - 实时显示剩余使用次数
- **使用记录** - 查看历史使用情况
- **统计分析** - 了解各功能使用频率

## 🎨 设计特色

- **配色方案**：热情粉 (#FF69B4) + 天空蓝 (#87CEEB)
- **渐变效果**：45度线性渐变，营造浪漫氛围
- **圆角设计**：12px - 32px 多层次圆角
- **动画效果**：心跳加载动画、按钮按压动画、页面淡入淡出
- **字体系统**：Poppins 字体家族（Bold/SemiBold/Regular/Light）

## 📦 技术栈

### 前端框架
- **React Native** + **Expo SDK 54**
- **TypeScript** - 类型安全
- **NativeWind** - Tailwind CSS for React Native

### 导航与状态
- **React Navigation** - Native Stack 导航
- **Jotai** - 轻量级状态管理

### 后端服务
- **腾讯云开发 CloudBase** - 用户认证 + 云端数据库
- **Expo Secure Store** - 本地加密存储

### UI组件
- **Expo Linear Gradient** - 渐变效果
- **React Native Reanimated** - 流畅动画
- **React Native Gesture Handler** - 手势交互

### 工具库
- **Axios** - API调用
- **AsyncStorage** - 本地存储
- **Expo Image Picker** - 图片选择
- **Expo Media Library** - 相册管理

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

3. **配置 CloudBase**
   - 参考 [CLOUDBASE_SETUP.md](./CLOUDBASE_SETUP.md) 配置腾讯云开发
   - 更新 `src/config/firebase.ts` 中的环境 ID

4. **启动开发服务器**
```bash
npx expo start
```

5. **运行应用**
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
├── App.tsx                          # 主入口，配置导航和认证
├── FIREBASE_SETUP.md                # Firebase 配置指南
├── babel.config.js
├── tailwind.config.js
├── package.json
├── tsconfig.json
│
├── src/
│   ├── screens/                     # 页面组件
│   │   ├── OnboardingScreen.tsx     # 引导页
│   │   ├── LoginScreen.tsx          # 登录页
│   │   ├── RegisterScreen.tsx       # 注册页
│   │   ├── ForgotPasswordScreen.tsx # 忘记密码
│   │   ├── HomeScreen.tsx           # 首页
│   │   ├── ProfileScreen.tsx        # 个人资料
│   │   ├── CoupleProfileScreen.tsx  # 情侣档案
│   │   ├── MembershipScreen.tsx     # 会员订阅
│   │   ├── FaceMergeScreen.tsx      # AI头像融合
│   │   ├── CardScreen.tsx           # 纪念日卡片
│   │   ├── DateScreen.tsx           # 虚拟约会场景
│   │   ├── StickerScreen.tsx        # 表情包生成
│   │   └── SettingsScreen.tsx       # 设置页面
│   │
│   ├── components/                  # 可复用组件
│   │   ├── ImageUploader.tsx
│   │   ├── GradientButton.tsx
│   │   ├── LoadingHeart.tsx
│   │   ├── ResultCard.tsx
│   │   ├── SceneSelector.tsx
│   │   └── TabBar.tsx
│   │
│   ├── contexts/                    # React Context
│   │   └── AuthContext.tsx          # 认证上下文
│   │
│   ├── services/                    # 服务层
│   │   ├── auth.ts                  # 认证服务
│   │   ├── cloudSync.ts             # 云端同步
│   │   ├── replicate.ts             # Replicate API
│   │   ├── openai.ts                # OpenAI API
│   │   └── storage.ts               # 本地存储
│   │
│   ├── hooks/                       # 自定义Hooks
│   │   ├── useImagePicker.ts
│   │   ├── useAPIKeys.ts
│   │   └── useCredits.ts            # 额度管理Hook
│   │
│   ├── config/                      # 配置文件
│   │   └── firebase.ts              # Firebase配置
│   │
│   ├── utils/                       # 工具函数
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── types/                       # TypeScript类型
│   │   └── index.ts
│   │
│   └── store/                       # 状态管理
│       └── index.ts
│
└── assets/                          # 静态资源
    ├── fonts/
    └── images/
```

## 🎯 核心功能实现

### 用户认证流程
1. 首次打开显示引导页
2. 用户注册/登录
3. 创建用户档案（自动赠送10次免费额度）
4. 进入主应用

### 会员系统
- **免费会员**：每月10次使用额度
- **高级会员**：无限次使用 + 云端同步 + 优先速度
- 支付集成（预留接口，可接入支付宝/微信支付）

### 额度管理
- 每次使用AI功能前检查额度
- 高级会员无限制
- 免费会员额度不足时提示升级

### 云端同步
- 生成历史自动同步到 Firestore
- 使用记录统计
- 多设备数据同步

## 🔒 隐私与安全

- **本地加密**：API密钥使用 Expo Secure Store 加密存储
- **云端安全**：Firebase 安全规则保护用户数据
- **权限控制**：用户只能访问自己的数据
- **数据隔离**：每个用户的数据完全隔离

## 🐛 常见问题

### Q: 为什么无法登录？
A: 请确保已正确配置 CloudBase，并在控制台中启用了"邮箱登录"方式。详见 [CLOUDBASE_SETUP.md](./CLOUDBASE_SETUP.md)。

### Q: 生成的图片是占位图？
A: 这是因为未配置API密钥，应用使用了模拟数据。请在设置页面配置 Replicate API 密钥。

### Q: 如何升级会员？
A: 在首页点击"升级会员"按钮，或进入"设置 > 会员订阅"页面。

### Q: 数据会丢失吗？
A: 所有用户的数据都会自动同步到腾讯云开发，不会丢失。

### Q: 为什么选择 CloudBase 而不是 Firebase？
A: Firebase 在中国大陆被墙，无法访问。CloudBase 是腾讯云提供的类似服务，在中国完全可用，且有中文文档和客服支持。

### Q: 如何取消订阅？
A: 在"会员订阅"页面可以管理订阅，支持随时取消。

## 🚧 未来计划

- [ ] 社交分享功能
- [ ] 更多AI生成场景
- [ ] 视频生成功能
- [ ] 多语言支持
- [ ] 深色模式
- [ ] 生成历史管理
- [ ] 支付宝/微信支付集成
- [ ] 推送通知

## 📊 商业化功能总结

### ✅ 已实现
- ✅ 用户注册/登录系统
- ✅ 个人资料管理
- ✅ 情侣档案功能
- ✅ 会员订阅系统（免费版/高级版）
- ✅ 使用额度管理
- ✅ 云端数据同步
- ✅ 引导页流程
- ✅ 安全的数据存储

### 🔄 待集成
- ⏳ 真实支付系统（支付宝/微信/Stripe）
- ⏳ 推送通知
- ⏳ 数据分析统计

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
