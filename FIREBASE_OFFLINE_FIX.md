# Firebase 离线问题解决方案

## 问题描述
应用启动时出现以下错误：
```
ERROR 获取会员信息失败: [FirebaseError: Failed to get document because the client is offline.]
ERROR 消费积分失败: [FirebaseError: Failed to get document because the client is offline.]
WARN [usePointsConsumer] 积分扣除失败: [FirebaseError: Failed to get document because the client is offline.]
```

## 根本原因
在 React Native/Expo 环境中，Firebase Firestore 的 WebSocket 连接可能不稳定，导致客户端被判定为离线状态。

## 解决方案

### 1. Firebase 配置优化 ([firebase.ts](src/config/firebase.ts))
- ✅ 启用 `experimentalForceLongPolling` - 使用长轮询替代 WebSocket
- ✅ 增加缓存大小到 40MB - 减少网络请求频率
- ✅ 延迟初始化连接管理 - 确保 Firebase 完全初始化后再启用网络

### 2. 连接管理 ([firebaseConnection.ts](src/services/firebaseConnection.ts))
- ✅ 自动重连机制 - 使用指数退避策略（1s, 2s, 4s, 8s, 16s）
- ✅ 手动重连功能 - 允许用户主动触发重连
- ✅ 连接状态监控 - 实时检测 Firebase 在线状态

### 3. 错误处理 ([firebase-membership.ts](src/services/firebase-membership.ts))
- ✅ 离线降级 - 当检测到离线错误时返回默认值而不是抛出异常
- ✅ 积分扣除容错 - 离线时跳过积分扣除，避免阻塞用户操作

### 4. 用户提示 ([FirebaseOfflineNotice.tsx](src/components/FirebaseOfflineNotice.tsx))
- ✅ 离线提示条 - 当 Firebase 离线时显示顶部提示
- ✅ 重试按钮 - 允许用户手动触发重连

## 使用方法

### 在 App.tsx 中添加离线提示组件（可选）
```tsx
import { FirebaseOfflineNotice } from './src/components/FirebaseOfflineNotice';

// 在 NavigationContainer 外层添加
<View style={{ flex: 1 }}>
  <FirebaseOfflineNotice />
  <NavigationContainer>
    {/* ... */}
  </NavigationContainer>
</View>
```

### 手动触发重连
```tsx
import { manualReconnect } from './src/services/firebaseConnection';

// 在任何地方调用
const success = await manualReconnect();
if (success) {
  console.log('重连成功');
}
```

## 测试建议

1. **模拟离线场景**
   - 开启飞行模式
   - 关闭 WiFi 和移动数据
   - 使用网络限速工具

2. **验证降级行为**
   - 离线时应用应该能正常启动
   - 会员信息显示默认值（免费会员，100积分）
   - 积分扣除失败不应阻塞功能使用

3. **验证重连机制**
   - 恢复网络后应自动重连
   - 手动点击重试按钮应触发重连
   - 重连成功后数据应正常同步

## 注意事项

1. **离线模式限制**
   - 离线时无法同步数据到云端
   - 积分扣除会被跳过（需要在线时补扣）
   - 会员信息可能不是最新的

2. **网络要求**
   - 确保设备有稳定的网络连接
   - 检查 Firebase 项目配置是否正确
   - 验证 .env 文件中的 Firebase 配置

3. **调试技巧**
   - 查看控制台日志中的 Firebase 连接状态
   - 使用 `isFirebaseOnline()` 检查当前连接状态
   - 监控重连尝试次数和延迟时间

## 相关文件

- [src/config/firebase.ts](src/config/firebase.ts) - Firebase 初始化配置
- [src/services/firebaseConnection.ts](src/services/firebaseConnection.ts) - 连接管理
- [src/services/firebase-membership.ts](src/services/firebase-membership.ts) - 会员服务（含错误处理）
- [src/components/FirebaseOfflineNotice.tsx](src/components/FirebaseOfflineNotice.tsx) - 离线提示组件
- [App.tsx](App.tsx) - 应用入口（初始化连接）
