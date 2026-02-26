# Firebase 集成指南

## 1. 安装依赖

```bash
npm install firebase
# 或
yarn add firebase
```

## 2. Firebase 项目配置

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 添加 Web 应用
4. 复制配置信息到 `src/config/firebase.ts`

## 3. 启用 Firestore 数据库

1. 在 Firebase Console 中，进入 "Firestore Database"
2. 点击 "创建数据库"
3. 选择测试模式（开发阶段）或生产模式
4. 选择数据库位置（建议选择亚洲区域）

## 4. 配置 Firestore 安全规则

在 Firebase Console 的 Firestore 规则中设置：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 会员信息 - 用户只能读写自己的数据
    match /memberships/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 交易记录 - 用户只能读写自己的数据
    match /transactions/{transactionId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }

    // 订单 - 用户只能读写自己的数据
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

## 5. 启用 Firebase Authentication（可选）

如果需要用户认证：

1. 在 Firebase Console 中，进入 "Authentication"
2. 启用登录方法（邮箱/密码、Google、匿名等）
3. 使用 `src/services/auth.ts` 中的认证方法

## 6. 数据结构

### Memberships Collection
```
memberships/{userId}
  - userId: string
  - tier: 'free' | 'basic' | 'premium' | 'vip'
  - points: number
  - expireDate: timestamp (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Transactions Collection
```
transactions/{transactionId}
  - id: string
  - userId: string
  - type: 'recharge' | 'consume' | 'reward' | 'refund'
  - amount: number
  - balance: number
  - description: string
  - relatedId: string (optional)
  - timestamp: timestamp
```

### Orders Collection
```
orders/{orderId}
  - id: string
  - userId: string
  - type: 'recharge' | 'membership'
  - amount: number
  - points: number (optional)
  - membershipTier: string (optional)
  - status: 'pending' | 'success' | 'failed' | 'cancelled'
  - paymentMethod: string (optional)
  - createdAt: timestamp
  - paidAt: timestamp (optional)
  - cancelledAt: timestamp (optional)
```

## 7. 使用方法

替换现有的 `membership.ts` 服务：

```typescript
// 旧方式 (AsyncStorage)
import { getMembership } from '../services/membership';

// 新方式 (Firebase)
import { getMembership } from '../services/firebase-membership';
```

## 8. 测试

在开发阶段，可以使用匿名认证进行测试：

```typescript
import { signInAnonymously } from '../services/auth';

// 在应用启动时
await signInAnonymously();
```

## 9. 注意事项

- Firebase 免费套餐限制：
  - Firestore: 每天 50,000 次读取，20,000 次写入
  - 存储: 1 GB
  - 网络流量: 10 GB/月

- 生产环境建议：
  - 启用 Firebase Authentication
  - 配置严格的安全规则
  - 监控使用量
  - 考虑升级到付费套餐

## 10. 迁移现有数据

如果已有 AsyncStorage 数据需要迁移：

```typescript
import { migrateFromAsyncStorage } from '../services/firebase-membership';

// 在应用启动时执行一次
await migrateFromAsyncStorage(userId);
```
