# 腾讯云开发 CloudBase 配置指南

本应用已迁移到腾讯云开发 CloudBase，完全支持中国大陆网络环境。

## 📋 第一步：创建 CloudBase 环境

### 1. 注册腾讯云账号

访问 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)

- 可以使用微信扫码登录
- 或使用 QQ 账号登录
- 或注册新的腾讯云账号

### 2. 创建环境

1. 点击页面上的 **"新建环境"** 按钮
2. 填写环境信息：
   - **环境名称**：`lovemix-prod`（或你喜欢的名称）
   - **计费方式**：选择 **"按量计费"**
   - **地域**：建议选择离你最近的地域（如：上海、广州）
3. 点击 **"立即开通"**
4. 等待环境创建完成（约1-2分钟）

### 3. 获取环境 ID

创建完成后：
1. 在环境列表中找到你刚创建的环境
2. 记录下 **环境 ID**（格式类似：`lovemix-xxxxx`）
3. 这个 ID 很重要，后面配置时需要用到

## 🔧 第二步：启用服务

### 1. 启用用户管理（认证）

1. 在 CloudBase 控制台左侧菜单，点击 **"用户管理"**
2. 点击 **"登录方式"** 标签页
3. 找到 **"邮箱登录"**，点击右侧的开关启用
4. 保存设置

### 2. 启用数据库

1. 在左侧菜单，点击 **"数据库"**
2. 如果是第一次使用，会自动创建数据库
3. 无需额外配置，数据库已经可以使用

### 3. 配置安全规则（重要）

1. 在数据库页面，点击 **"安全规则"** 标签
2. 添加以下规则：

```json
{
  "read": "auth.uid != null && doc._id == auth.uid",
  "write": "auth.uid != null && doc._id == auth.uid"
}
```

这个规则确保用户只能访问自己的数据。

## 💻 第三步：配置应用

### 1. 更新环境 ID

打开 `src/config/firebase.ts` 文件（已改为 CloudBase 配置）：

```typescript
const app = cloudbase.init({
  env: 'YOUR_ENV_ID', // 👈 替换为你的环境 ID
  adapter: adapterReactNative,
});
```

将 `YOUR_ENV_ID` 替换为你在第一步获取的环境 ID，例如：

```typescript
const app = cloudbase.init({
  env: 'lovemix-xxxxx', // 替换为你的真实环境 ID
  adapter: adapterReactNative,
});
```

### 2. 重启应用

```bash
# 停止当前运行的应用（Ctrl+C）
# 重新启动
npx expo start
```

## ✅ 第四步：测试功能

### 1. 测试注册

1. 打开应用，进入注册页面
2. 输入邮箱和密码
3. 点击注册
4. 应该能成功注册并自动登录

### 2. 验证数据

在 CloudBase 控制台：
1. 进入 **"数据库"**
2. 查看 `users` 集合
3. 应该能看到刚注册的用户数据

### 3. 测试登录

1. 退出登录
2. 使用刚才注册的账号登录
3. 应该能成功登录并看到用户信息

## 📊 CloudBase 免费额度

CloudBase 提供慷慨的免费额度：

- **数据库**：2GB 存储，5万次读取/天，3万次写入/天
- **用户管理**：1万活跃用户/月
- **云函数**：4万次调用/月，10万GBs资源使用量/月

对于小型应用完全够用！

## 🔍 常见问题

### Q: 注册时提示"邮箱格式错误"？
A: 确保邮箱格式正确，例如：`user@example.com`

### Q: 注册后一直转圈？
A: 检查环境 ID 是否配置正确，查看控制台是否有错误信息

### Q: 数据无法保存？
A: 检查数据库安全规则是否正确配置

### Q: 如何查看错误日志？
A: 在 CloudBase 控制台 → 监控告警 → 日志查询

## 🆚 CloudBase vs Firebase 对比

| 功能 | Firebase | CloudBase |
|------|----------|-----------|
| 中国访问 | ❌ 被墙 | ✅ 完全可用 |
| 免费额度 | 较少 | 更多 |
| 文档语言 | 英文为主 | 中文文档 |
| 支付方式 | 国际信用卡 | 支付宝/微信 |
| 技术支持 | 英文社区 | 中文客服 |

## 📱 数据结构

### users 集合
```json
{
  "_id": "用户ID",
  "uid": "用户ID",
  "email": "user@example.com",
  "displayName": "昵称",
  "membershipTier": "free",
  "credits": 10,
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

### users/{userId}/generations 子集合
```json
{
  "_id": "生成记录ID",
  "imageUri": "图片地址",
  "timestamp": 1234567890,
  "type": "merge",
  "createdAt": 1234567890
}
```

## 🎯 下一步

配置完成后，你的应用将拥有：
- ✅ 完整的用户认证系统
- ✅ 云端数据存储
- ✅ 在中国大陆完全可用
- ✅ 免费额度充足

如有问题，可以查看：
- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [CloudBase 社区](https://cloudbase.net/community)

---

**配置完成后，你的应用就可以正常使用了！** 🎉
