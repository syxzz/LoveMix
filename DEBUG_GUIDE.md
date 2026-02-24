# Debug 模式和游客登录使用说明

## Debug 模式

### 功能说明
Debug 模式允许开发者和测试人员快速使用管理员账号登录,无需注册,拥有所有权限。

### 如何启用

**方法1: 连续点击 Logo (推荐)**
1. 打开应用,进入欢迎页
2. 连续快速点击 ❤️ Logo 5次
3. 会弹出确认对话框
4. 点击"确定"即可使用管理员账号登录

**方法2: 直接登录**
在登录页面输入:
- 邮箱: `admin@lovemix.app`
- 密码: `admin123`

### 管理员权限
- VIP 会员权限
- 无限爱心值 (999999)
- 无限次数生成
- 所有功能解锁

### 配置
在 `src/config/index.ts` 中可以配置:
```typescript
export const DEBUG_CONFIG = {
  ENABLED: __DEV__, // 是否启用 Debug 模式
  SHOW_DEBUG_BUTTON: __DEV__, // 是否显示 Debug 入口
  ADMIN_EMAIL: 'admin@lovemix.app',
  ADMIN_PASSWORD: 'admin123',
};
```

**注意**: 生产环境会自动禁用 Debug 模式。

---

## 游客登录

### 功能说明
游客登录允许用户无需注册即可体验应用的所有功能,降低使用门槛。

### 如何使用
1. 打开应用,进入欢迎页
2. 点击"游客体验"按钮
3. 自动登录并进入主页

### 游客权限
- 免费会员权限
- 100 爱心值
- 每日 3 次生成限制
- 可以使用所有基础功能
- 数据仅保存在本地

### 游客转正式用户
游客可以随时注册成为正式用户:
1. 进入"设置" → "个人资料"
2. 点击"注册账号"
3. 填写邮箱、用户名、密码
4. 注册成功后,游客数据会保留

### 配置
在 `src/config/index.ts` 中可以配置:
```typescript
export const FEATURE_FLAGS = {
  ENABLE_GUEST_MODE: true, // 是否启用游客模式
};
```

---

## 功能对比

| 功能 | 游客 | 免费用户 | 高级会员 | VIP会员 | Debug管理员 |
|------|------|----------|----------|---------|-------------|
| 每日生成次数 | 3次 | 3次 | 20次 | 无限 | 无限 |
| 爱心值 | 100 | 520 | 520 | 520 | 999999 |
| 数据云端同步 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 社区发布作品 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 高清画质 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 无水印下载 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 专属客服 | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 开发者工具

### 日志系统
在 `src/config/index.ts` 中配置日志级别:
```typescript
import { logger } from '../config';

logger.debug('调试信息'); // 仅开发环境
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息');
```

### 功能开关
可以通过配置快速开关功能:
```typescript
export const FEATURE_FLAGS = {
  ENABLE_GUEST_MODE: true,      // 游客模式
  ENABLE_COMMUNITY: true,        // 社区功能
  ENABLE_MEMBERSHIP: true,       // 会员系统
  ENABLE_PAYMENT: false,         // 支付功能
};
```

### 跳过认证(仅开发)
在开发时可以完全跳过认证:
```typescript
export const DEBUG_CONFIG = {
  SKIP_AUTH: true, // 跳过所有认证检查
};
```

---

## 安全提示

1. **生产环境**: Debug 模式会自动禁用
2. **管理员密码**: 上线前务必修改管理员密码
3. **游客数据**: 游客数据仅保存在本地,卸载应用会丢失
4. **日志**: 生产环境会自动关闭 debug 日志

---

## 常见问题

### Q: Debug 入口点击无反应?
A: 确保在开发环境下运行,生产环境会自动禁用。

### Q: 游客登录后如何注册?
A: 进入"设置" → "个人资料" → "注册账号"。

### Q: 游客数据会丢失吗?
A: 游客数据仅保存在本地,注册后会转为正式用户数据。

### Q: 如何禁用游客模式?
A: 在 `src/config/index.ts` 中设置 `ENABLE_GUEST_MODE: false`。

---

## 技术实现

### Debug 登录流程
```typescript
// 1. 检测连续点击
const handleLogoPress = () => {
  setDebugTapCount(count + 1);
  if (count >= 5) {
    // 显示确认对话框
  }
};

// 2. 管理员登录
export const debugAdminLogin = async (): Promise<User> => {
  const adminUser: User = {
    id: 'admin_debug',
    membershipType: 'vip',
    lovePoints: 999999,
    // ...
  };
  return adminUser;
};
```

### 游客登录流程
```typescript
export const guestLogin = async (): Promise<User> => {
  const guestUser: User = {
    id: `guest_${Date.now()}`,
    username: '游客用户',
    membershipType: 'free',
    lovePoints: 100,
    // ...
  };

  // 标记为游客
  await AsyncStorage.setItem(IS_GUEST_KEY, 'true');

  return guestUser;
};
```

### 游客转正式用户
```typescript
export const convertGuestToUser = async (form: RegisterForm) => {
  // 1. 注册新用户
  const newUser = await register(form);

  // 2. 清除游客标记
  await AsyncStorage.setItem(IS_GUEST_KEY, 'false');

  return newUser;
};
```
