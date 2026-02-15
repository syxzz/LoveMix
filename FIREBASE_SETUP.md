# Firebase 配置指南

本应用使用 Firebase 作为后端服务，提供用户认证和云端数据存储功能。

## 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如：LoveMix）
4. 选择是否启用 Google Analytics（可选）
5. 创建项目

## 2. 添加 Web 应用

1. 在项目概览页面，点击 Web 图标（</>）
2. 输入应用昵称（例如：LoveMix App）
3. 不需要设置 Firebase Hosting
4. 点击"注册应用"
5. 复制 Firebase 配置信息

## 3. 配置 Firebase SDK

将复制的配置信息替换到 `src/config/firebase.ts` 文件中：

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 4. 启用 Authentication

1. 在 Firebase Console 左侧菜单中，点击"Authentication"
2. 点击"开始使用"
3. 在"登录方法"标签页中，启用以下登录方式：
   - **电子邮件/密码**：点击启用，保存

## 5. 创建 Firestore 数据库

1. 在 Firebase Console 左侧菜单中，点击"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（开发阶段）
4. 选择数据库位置（建议选择离用户最近的区域）
5. 点击"启用"

## 6. 配置 Firestore 安全规则

在 Firestore 的"规则"标签页中，设置以下安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // 用户的子集合（生成历史、使用记录等）
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

发布规则后，用户数据将受到保护。

## 7. 数据结构说明

### users 集合
```
users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL?: string
  - membershipTier: 'free' | 'premium'
  - credits: number
  - membershipExpiry?: number
  - coupleProfile?: {
      partnerName: string
      userNickname: string
      partnerNickname: string
      anniversaryDate: string
      relationshipStatus: 'dating' | 'engaged' | 'married'
    }
  - createdAt: number
  - updatedAt: number
```

### users/{userId}/generations 子集合
```
generations/{generationId}
  - imageUri: string
  - timestamp: number
  - type: 'merge' | 'card' | 'date' | 'sticker'
  - createdAt: Timestamp
```

### users/{userId}/usage 子集合
```
usage/{usageId}
  - id: string
  - userId: string
  - type: 'merge' | 'card' | 'date' | 'sticker'
  - timestamp: number
  - creditsUsed: number
```

## 8. 测试配置

1. 运行应用：`npx expo start`
2. 尝试注册新用户
3. 检查 Firebase Console 中的 Authentication 和 Firestore 是否有新数据

## 9. 生产环境配置

在发布到生产环境前，请：

1. **更新 Firestore 安全规则**：将测试模式改为生产模式
2. **启用应用检查**：防止滥用
3. **配置配额和限制**：避免超出免费额度
4. **设置预算提醒**：监控使用情况

## 10. 常见问题

### Q: 为什么无法登录？
A: 检查是否已在 Firebase Console 中启用"电子邮件/密码"登录方式。

### Q: 数据无法保存到 Firestore？
A: 检查 Firestore 安全规则是否正确配置，确保用户有写入权限。

### Q: 如何查看错误日志？
A: 在 Firebase Console 的"Crashlytics"中可以查看应用崩溃日志。

## 11. 费用说明

Firebase 提供免费套餐（Spark Plan），包括：
- Authentication: 无限制
- Firestore: 1GB 存储，50K 读取/天，20K 写入/天
- 对于小型应用完全够用

如需更多资源，可升级到 Blaze Plan（按量付费）。

---

配置完成后，你的应用将拥有完整的用户认证和云端数据同步功能！
