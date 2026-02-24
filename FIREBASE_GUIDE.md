# Firebase 集成指南

本文档介绍如何将 LoveMix 应用集成 Firebase 认证服务，替换当前的本地模拟认证。

## 为什么选择 Firebase?

- ✅ **完全免费**的认证服务
- ✅ 支持多种登录方式(邮箱、Google、Apple、匿名等)
- ✅ 内置安全性和数据加密
- ✅ 实时数据库和云存储
- ✅ 官方 React Native SDK
- ✅ 无需自建后端服务器

## 快速开始

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称: `LoveMix`
4. 选择是否启用 Google Analytics (可选)
5. 创建项目

### 2. 添加应用

#### iOS 应用
1. 在 Firebase 项目中点击"添加应用" → 选择 iOS
2. 输入 iOS Bundle ID (在 `app.json` 中查看)
3. 下载 `GoogleService-Info.plist`
4. 将文件放到项目根目录

#### Android 应用
1. 在 Firebase 项目中点击"添加应用" → 选择 Android
2. 输入 Android 包名 (在 `app.json` 中查看)
3. 下载 `google-services.json`
4. 将文件放到 `android/app/` 目录

### 3. 启用认证方式

1. 在 Firebase Console 中进入"Authentication"
2. 点击"Sign-in method"标签
3. 启用以下登录方式:
   - ✅ 电子邮件/密码
   - ✅ 匿名登录 (用于游客模式)
   - (可选) Google、Apple 等第三方登录

### 4. 安装依赖

```bash
# 安装 Firebase SDK
npm install @react-native-firebase/app @react-native-firebase/auth

# iOS 需要安装 pods
cd ios && pod install && cd ..
```

### 5. 配置环境变量

创建 `.env` 文件:

```env
# Firebase 配置
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. 创建 Firebase 认证服务

创建 `src/services/firebaseAuth.ts`:

```typescript
import auth from '@react-native-firebase/auth';
import { User, LoginForm, RegisterForm } from '../types';
import { logger } from '../config';

/**
 * Firebase 用户登录
 */
export const firebaseLogin = async (form: LoginForm): Promise<User> => {
  logger.info('Firebase login:', form.email);

  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      form.email,
      form.password
    );

    const firebaseUser = userCredential.user;

    // 转换为应用用户格式
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || '用户',
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      membershipType: 'free',
      lovePoints: 520,
      usageCount: {
        faceMerge: 0,
        card: 0,
        date: 0,
        sticker: 0,
      },
    };

    return user;
  } catch (error: any) {
    logger.error('Firebase login error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Firebase 用户注册
 */
export const firebaseRegister = async (form: RegisterForm): Promise<User> => {
  logger.info('Firebase register:', form.email);

  if (form.password !== form.confirmPassword) {
    throw new Error('两次输入的密码不一致');
  }

  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      form.email,
      form.password
    );

    const firebaseUser = userCredential.user;

    // 更新用户名
    await firebaseUser.updateProfile({
      displayName: form.username,
    });

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: form.username,
      createdAt: new Date().toISOString(),
      membershipType: 'free',
      lovePoints: 520,
      usageCount: {
        faceMerge: 0,
        card: 0,
        date: 0,
        sticker: 0,
      },
    };

    return user;
  } catch (error: any) {
    logger.error('Firebase register error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Firebase 游客登录
 */
export const firebaseGuestLogin = async (): Promise<User> => {
  logger.info('Firebase guest login');

  try {
    const userCredential = await auth().signInAnonymously();
    const firebaseUser = userCredential.user;

    const user: User = {
      id: firebaseUser.uid,
      email: '',
      username: '游客用户',
      createdAt: new Date().toISOString(),
      membershipType: 'free',
      lovePoints: 100,
      usageCount: {
        faceMerge: 0,
        card: 0,
        date: 0,
        sticker: 0,
      },
    };

    return user;
  } catch (error: any) {
    logger.error('Firebase guest login error:', error);
    throw new Error('游客登录失败');
  }
};

/**
 * Firebase 登出
 */
export const firebaseLogout = async (): Promise<void> => {
  logger.info('Firebase logout');
  await auth().signOut();
};

/**
 * Firebase 重置密码
 */
export const firebaseResetPassword = async (email: string): Promise<void> => {
  logger.info('Firebase reset password:', email);

  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error: any) {
    logger.error('Firebase reset password error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * 获取当前 Firebase 用户
 */
export const getCurrentFirebaseUser = (): User | null => {
  const firebaseUser = auth().currentUser;

  if (!firebaseUser) {
    return null;
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || '用户',
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    membershipType: 'free',
    lovePoints: 520,
    usageCount: {
      faceMerge: 0,
      card: 0,
      date: 0,
      sticker: 0,
    },
  };
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: firebaseUser.displayName || '用户',
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        membershipType: 'free',
        lovePoints: 520,
        usageCount: {
          faceMerge: 0,
          card: 0,
          date: 0,
          sticker: 0,
        },
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

/**
 * 转换 Firebase 错误信息为中文
 */
function getFirebaseErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': '该邮箱已被注册',
    'auth/invalid-email': '邮箱格式不正确',
    'auth/operation-not-allowed': '操作不被允许',
    'auth/weak-password': '密码强度太弱',
    'auth/user-disabled': '该账号已被禁用',
    'auth/user-not-found': '用户不存在',
    'auth/wrong-password': '密码错误',
    'auth/too-many-requests': '请求过于频繁，请稍后再试',
    'auth/network-request-failed': '网络连接失败',
  };

  return errorMessages[code] || '操作失败，请稍后重试';
}
```

### 7. 更新认证服务

修改 `src/services/auth.ts`，添加 Firebase 切换:

```typescript
import { USE_FIREBASE } from '../config';
import * as firebaseAuth from './firebaseAuth';
import * as localAuth from './localAuth'; // 将现有代码移到这里

// 根据配置选择认证方式
export const login = USE_FIREBASE ? firebaseAuth.firebaseLogin : localAuth.login;
export const register = USE_FIREBASE ? firebaseAuth.firebaseRegister : localAuth.register;
export const guestLogin = USE_FIREBASE ? firebaseAuth.firebaseGuestLogin : localAuth.guestLogin;
export const logout = USE_FIREBASE ? firebaseAuth.firebaseLogout : localAuth.logout;
// ... 其他方法
```

## Firestore 数据库集成

### 1. 启用 Firestore

1. 在 Firebase Console 中进入"Firestore Database"
2. 点击"创建数据库"
3. 选择"生产模式"
4. 选择数据库位置(建议选择亚洲区域)

### 2. 安装依赖

```bash
npm install @react-native-firebase/firestore
cd ios && pod install && cd ..
```

### 3. 数据结构设计

```
users/
  {userId}/
    email: string
    username: string
    membershipType: string
    lovePoints: number
    usageCount: object
    createdAt: timestamp

works/
  {workId}/
    userId: string
    type: string
    imageUri: string
    metadata: object
    isPublic: boolean
    likes: number
    views: number
    createdAt: timestamp
```

### 4. 创建 Firestore 服务

```typescript
import firestore from '@react-native-firebase/firestore';

export const saveUserData = async (userId: string, data: any) => {
  await firestore().collection('users').doc(userId).set(data, { merge: true });
};

export const getUserData = async (userId: string) => {
  const doc = await firestore().collection('users').doc(userId).get();
  return doc.data();
};

export const saveWork = async (work: any) => {
  await firestore().collection('works').add(work);
};

export const getUserWorks = async (userId: string) => {
  const snapshot = await firestore()
    .collection('works')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Firebase Storage 集成

用于存储用户上传的图片和生成的作品。

### 1. 启用 Storage

1. 在 Firebase Console 中进入"Storage"
2. 点击"开始使用"
3. 选择安全规则(建议先选择测试模式)

### 2. 安装依赖

```bash
npm install @react-native-firebase/storage
cd ios && pod install && cd ..
```

### 3. 上传图片示例

```typescript
import storage from '@react-native-firebase/storage';

export const uploadImage = async (uri: string, path: string) => {
  const reference = storage().ref(path);
  await reference.putFile(uri);
  const url = await reference.getDownloadURL();
  return url;
};
```

## 安全规则配置

### Firestore 规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户数据
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // 作品数据
    match /works/{workId} {
      allow read: if resource.data.isPublic == true || request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage 规则

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 测试

### 1. 测试认证

```bash
# 启动应用
npm start

# 测试注册
# 测试登录
# 测试游客登录
# 测试登出
```

### 2. 查看 Firebase Console

在 Firebase Console 中可以实时查看:
- Authentication: 注册的用户
- Firestore: 存储的数据
- Storage: 上传的文件

## 常见问题

### Q: iOS 编译失败?
A: 确保已运行 `cd ios && pod install`

### Q: Android 编译失败?
A: 检查 `google-services.json` 是否放在正确位置

### Q: 认证失败?
A: 检查 Firebase Console 中是否启用了对应的登录方式

### Q: 如何切换回本地认证?
A: 在 `src/config/index.ts` 中设置 `USE_FIREBASE = false`

## 成本估算

Firebase 免费额度(Spark 计划):
- Authentication: 无限制
- Firestore: 1GB 存储, 50K 读/20K 写 每天
- Storage: 5GB 存储, 1GB 下载 每天

对于小型应用完全够用,超出后可升级到 Blaze 计划(按量付费)。

## 下一步

- [ ] 实现 Firestore 数据同步
- [ ] 实现 Storage 图片上传
- [ ] 添加 Google 登录
- [ ] 添加 Apple 登录
- [ ] 实现推送通知

## 参考资料

- [Firebase 官方文档](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
