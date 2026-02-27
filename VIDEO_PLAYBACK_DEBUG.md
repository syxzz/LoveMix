# 视频播放按钮调试指南

## 问题描述
ResultScreen 中的"播放场景还原"按钮失效，无法播放视频。

## 已修复的问题

### 1. 播放器初始化
**问题：** `useVideoPlayer` 在 `videoSource` 为 `null` 时可能返回无效的播放器
**修复：** 只在有视频源时创建播放器，并正确配置播放器选项

```typescript
const player = useVideoPlayer(videoSource, (p) => {
  if (videoSource) {
    p.loop = false;
    p.muted = false;
  }
});
```

### 2. 播放状态监听
**问题：** 播放状态事件的类型不匹配
**修复：** 正确访问事件对象的 `isPlaying` 属性

```typescript
const subscription = player.addListener('playingChange', (event) => {
  setIsPlaying(event.isPlaying);
});
```

### 3. 播放控制逻辑
**问题：** 缺少错误处理和调试信息
**修复：** 添加完整的错误处理和日志

```typescript
const handlePlayVideo = () => {
  console.log('🎬 播放按钮被点击', {
    player: !!player,
    videoSource,
    isPlaying,
    playerStatus: player?.status,
  });

  if (!player || !videoSource) {
    console.warn('⚠️ 播放器或视频源不可用');
    return;
  }

  try {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  } catch (error) {
    console.error('❌ 播放视频失败:', error);
  }
};
```

### 4. 视频组件配置
**问题：** VideoView 配置可能不完整
**修复：** 使用更明确的属性配置

```typescript
<VideoView
  player={player}
  style={styles.video}
  contentFit="contain"
  nativeControls={true}
  allowsFullscreen={true}
  allowsPictureInPicture={false}
/>
```

### 5. 按钮样式优化
**问题：** 按钮可能被遮挡或无法点击
**修复：**
- 添加 `marginBottom` 到 `videoContainer`
- 添加 `backgroundColor` 到 `video`
- 调整 `playButton` 的 `marginTop` 确保无缝连接

## 调试步骤

### 1. 检查视频任务状态
打开应用控制台，查看以下日志：

```
📹 视频任务状态: {
  status: 'success',
  videoUrl: 'https://...',
  error: null
}
```

如果 `status` 不是 `'success'` 或 `videoUrl` 为空，说明视频生成失败。

### 2. 检查播放器初始化
点击播放按钮时，查看控制台日志：

```
🎬 播放按钮被点击 {
  player: true,
  videoSource: 'https://...',
  isPlaying: false,
  playerStatus: 'readyToPlay'
}
```

如果 `player` 为 `false` 或 `videoSource` 为空，说明播放器未正确初始化。

### 3. 检查播放操作
播放时应该看到：

```
▶️ 播放视频
```

如果看到错误日志：

```
❌ 播放视频失败: [错误信息]
```

说明播放器 API 调用失败。

## 可能的问题和解决方案

### 问题 1: 视频源无效
**症状：** `videoUrl` 为空或无效
**解决：**
1. 检查 [videoGeneration.ts](src/services/videoGeneration.ts) 中的视频生成逻辑
2. 确认 API 返回的视频 URL 格式正确
3. 检查网络连接

### 问题 2: 播放器未初始化
**症状：** `player` 为 `null` 或 `undefined`
**解决：**
1. 确认 `expo-video` 包已正确安装
2. 检查 `useVideoPlayer` hook 的使用是否正确
3. 尝试重启开发服务器

### 问题 3: 播放权限问题
**症状：** 播放时出现权限错误
**解决：**
1. 检查 iOS/Android 的媒体播放权限
2. 确认视频 URL 支持 HTTPS
3. 检查 CORS 设置（如果是远程视频）

### 问题 4: 原生控件冲突
**症状：** 自定义播放按钮和原生控件冲突
**解决：**
1. 考虑禁用原生控件：`nativeControls={false}`
2. 或者移除自定义播放按钮，只使用原生控件

## 测试清单

- [ ] 视频生成成功，`videoTask.status === 'success'`
- [ ] 视频 URL 有效，`videoTask.videoUrl` 不为空
- [ ] 播放器正确初始化，`player` 不为 `null`
- [ ] 点击播放按钮有日志输出
- [ ] 播放状态正确切换（播放/暂停）
- [ ] 视频画面正常显示
- [ ] 音频正常播放
- [ ] 全屏功能正常

## 相关文件

- [ResultScreen.tsx](src/screens/ResultScreen.tsx) - 结果页面（包含视频播放）
- [videoGeneration.ts](src/services/videoGeneration.ts) - 视频生成服务
- [store.ts](src/store/index.ts) - 视频任务状态管理

## 备用方案

如果自定义播放按钮仍然无法工作，可以考虑：

1. **只使用原生控件**
   ```typescript
   <VideoView
     player={player}
     style={styles.video}
     contentFit="contain"
     nativeControls={true}
   />
   // 移除自定义播放按钮
   ```

2. **使用 React Native Video 库**
   如果 `expo-video` 有问题，可以切换到 `react-native-video`

3. **使用 WebView 播放**
   作为最后的备用方案，可以使用 WebView 加载视频
