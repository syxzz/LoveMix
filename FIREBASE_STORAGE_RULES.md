# Firebase Storage 安全规则配置

## 头像上传功能的安全规则

在 Firebase Console 中配置以下 Storage 安全规则：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // 头像文件规则
    match /avatars/{userId}/{fileName} {
      // 只允许用户上传自己的头像
      allow read: if true; // 所有人可以读取头像
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 限制文件大小为 5MB
                   && request.resource.contentType.matches('image/.*'); // 只允许图片格式

      // 允许用户删除自己的旧头像
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // 通用图片文件规则
    match /images/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024 // 限制文件大小为 10MB
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 规则说明

### 1. **读取权限**
- `allow read: if true` - 所有人都可以查看头像（公开访问）
- 如果需要私密头像，可以改为 `allow read: if request.auth != null`

### 2. **写入权限**
- 只有登录用户可以上传
- 用户只能上传到自己的文件夹（`userId` 匹配）
- 文件大小限制：头像 5MB，普通图片 10MB
- 只允许图片格式（image/*）

### 3. **删除权限**
- 用户只能删除自己上传的文件

## Firestore 用户资料规则

同时需要配置 Firestore 规则，允许用户更新自己的头像URL：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 用户资料规则
    match /users/{userId} {
      // 所有人可以读取用户资料
      allow read: if true;

      // 只有用户本人可以更新自己的资料
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.keys().hasOnly(['avatar', 'avatarUpdatedAt', 'username', 'phone']);

      // 只有用户本人可以创建自己的资料
      allow create: if request.auth != null && request.auth.uid == userId;

      // 不允许删除用户资料
      allow delete: if false;
    }
  }
}
```

## 配置步骤

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 进入 **Storage** → **Rules** 标签
4. 粘贴上述 Storage 规则
5. 点击 **发布** 按钮
6. 进入 **Firestore Database** → **Rules** 标签
7. 粘贴上述 Firestore 规则
8. 点击 **发布** 按钮

## 测试规则

可以在 Firebase Console 的 Rules Playground 中测试规则：

```javascript
// 测试场景 1: 用户上传自己的头像
Operation: write
Path: /avatars/user123/avatar_user123_1234567890.jpg
Auth: { uid: 'user123' }
Data: { size: 2000000, contentType: 'image/jpeg' }
// 结果: ✅ 允许

// 测试场景 2: 用户尝试上传到别人的文件夹
Operation: write
Path: /avatars/user456/avatar_user456_1234567890.jpg
Auth: { uid: 'user123' }
// 结果: ❌ 拒绝

// 测试场景 3: 未登录用户尝试上传
Operation: write
Path: /avatars/user123/avatar_user123_1234567890.jpg
Auth: null
// 结果: ❌ 拒绝
```

## 注意事项

1. **文件大小限制**：根据实际需求调整大小限制
2. **文件格式**：可以进一步限制为特定格式（如 `image/jpeg` 或 `image/png`）
3. **存储成本**：定期清理未使用的旧头像可以节省存储成本
4. **CDN 加速**：Firebase Storage 自动提供 CDN 加速，全球访问速度快
5. **备份策略**：重要文件建议启用 Firebase Storage 的备份功能
