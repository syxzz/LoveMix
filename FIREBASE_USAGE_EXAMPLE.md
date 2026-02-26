# Firebase 使用示例

## 当前状态
✅ Firebase 配置已完成（从 .env 读取）
✅ Firebase 服务文件已创建
✅ UI 已优化为单列横向布局

## 如何切换到 Firebase

### 方法 1: 直接替换导入（推荐）

在 `RechargeScreen.tsx` 中：

```typescript
// 第 20 行，将这行：
import { RECHARGE_PACKAGES, rechargePoints } from '../services/membership';

// 改为：
import { RECHARGE_PACKAGES, rechargePoints } from '../services/firebase-membership';
```

### 方法 2: 添加用户认证

如果需要真实的用户系统，在 `App.tsx` 或应用入口添加：

```typescript
import { signInAnonymously } from './src/services/firebaseAuthService';
import { useEffect } from 'react';

// 在组件中
useEffect(() => {
  // 应用启动时自动匿名登录
  signInAnonymously()
    .then(user => {
      console.log('用户已登录:', user.uid);
    })
    .catch(error => {
      console.error('登录失败:', error);
    });
}, []);
```

### 方法 3: 集成到现有认证系统

如果你已经有认证系统，可以在用户登录后初始化 Firebase：

```typescript
// 在你的登录逻辑中
import { getCurrentUserId } from './src/services/firebaseAuthService';

// 获取当前用户ID用于会员操作
const userId = getCurrentUserId();
```

## 完整的 RechargeScreen 示例

```typescript
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  RECHARGE_PACKAGES,
  rechargePoints,
  getMembership
} from '../services/firebase-membership';
import { getCurrentUserId } from '../services/firebaseAuthService';

export const RechargeScreen: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);

  // 加载当前积分
  useEffect(() => {
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const userId = getCurrentUserId(); // 从 Firebase Auth 获取
      const membership = await getMembership(userId);
      setCurrentPoints(membership.points);
    } catch (error) {
      console.error('加载会员信息失败:', error);
    }
  };

  const handleRecharge = async (packageId: string) => {
    try {
      setLoading(true);
      setSelectedPackage(packageId);

      const pkg = RECHARGE_PACKAGES.find(p => p.id === packageId);
      if (!pkg) return;

      const userId = getCurrentUserId();
      const { membership } = await rechargePoints(userId, packageId);

      Alert.alert(
        '充值成功',
        `成功充值 ${pkg.points + pkg.bonus} 积分\n当前余额：${membership.points} 积分`,
        [{ text: '确定', onPress: () => navigation.goBack() }]
      );

      // 更新显示的积分
      setCurrentPoints(membership.points);
    } catch (error: any) {
      console.error('充值失败:', error);
      Alert.alert('充值失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  // ... 其余代码保持不变
};
```

## 在 MembershipScreen 中使用

```typescript
import {
  getMembership,
  upgradeMembership,
  getTierConfig
} from '../services/firebase-membership';
import { getCurrentUserId } from '../services/firebaseAuthService';

// 加载会员信息
const userId = getCurrentUserId();
const membership = await getMembership(userId);

// 升级会员
const { membership: newMembership } = await upgradeMembership(
  userId,
  'premium',
  30 // 30天
);
```

## 数据迁移（可选）

如果你之前使用 AsyncStorage 存储了数据，可以执行一次性迁移：

```typescript
import { migrateFromAsyncStorage } from '../services/firebase-membership';

// 在应用启动时执行一次
await migrateFromAsyncStorage(userId);
```

## Firebase Console 检查

安装完成后，访问 Firebase Console 检查：

1. **Firestore Database**: https://console.firebase.google.com/project/lovemix2-61274/firestore
   - 应该能看到 `memberships`、`transactions`、`orders` 三个集合

2. **Authentication**: https://console.firebase.google.com/project/lovemix2-61274/authentication
   - 如果使用匿名登录，能看到匿名用户列表

3. **使用量监控**: https://console.firebase.google.com/project/lovemix2-61274/usage
   - 监控读写次数，避免超出免费额度

## 安全规则配置

在 Firestore 规则中添加（已在 FIREBASE_SETUP.md 中详细说明）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memberships/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 常见问题

### Q: 需要修改很多代码吗？
A: 不需要！只需要修改导入语句，API 接口完全一致。

### Q: 可以同时保留 AsyncStorage 版本吗？
A: 可以！两个服务文件可以共存，根据需要选择使用。

### Q: 免费额度够用吗？
A: Firebase 免费套餐每天 50,000 次读取，对于中小型应用足够。

### Q: 如何测试？
A: 使用匿名登录进行测试，无需真实用户账号。
