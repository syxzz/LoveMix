# AI 服务集成完成 ✅

## 已完成的工作

### 1. AI 服务模块 ✅
- **文件**: `src/services/ai.ts`
- **API Key**: `cky_5OYHvtqWH89hP57Ugu4i` (已配置)
- **模型**: MiniMax M2.1 (gpt_type: 8602)
- **功能**:
  - ✅ 与 DM 对话
  - ✅ 与角色对话
  - ✅ 生成开场介绍
  - ✅ 分析线索
  - ✅ 生成提示
  - ✅ 生成结局
  - ✅ 思考链支持

### 2. 对话界面 ✅
- **文件**: `src/screens/DialogScreen.tsx`
- **功能**:
  - ✅ 真实 AI API 集成
  - ✅ 自动加载游戏上下文
  - ✅ 支持与 DM 对话
  - ✅ 支持与角色对话
  - ✅ 显示/隐藏思考过程
  - ✅ 保存对话历史
  - ✅ 错误处理
  - ✅ Loading 状态

### 3. 类型定义 ✅
- **文件**: `src/types/script.ts`
- **更新**: Message 接口添加 `reasoning` 字段

## 使用方法

### 在游戏中与 DM 对话

```typescript
// 在 GameScreen 中
const handleTalkToDM = () => {
  navigation.navigate('Dialog', {}); // 不传 characterId 就是与 DM 对话
};
```

### 在游戏中与角色对话

```typescript
// 在 GameScreen 中
const handleTalkToCharacter = (characterId: string) => {
  navigation.navigate('Dialog', { characterId }); // 传入角色ID
};
```

### DialogScreen 自动处理

DialogScreen 会自动:
1. 加载当前游戏进度
2. 获取剧本和角色信息
3. 根据是否有 characterId 决定与 DM 还是角色对话
4. 调用相应的 AI API
5. 显示思考过程（可展开/折叠）
6. 保存对话历史到游戏进度

## 思考链功能

### 查看思考过程

用户可以点击消息下方的"查看思考过程"按钮来展开 AI 的推理过程：

```
用户: 我觉得凶手是张三
DM: 这是一个有趣的推测。你能说说你的理由吗？
[查看思考过程] ← 点击展开

展开后显示:
┌─────────────────────────────────┐
│ 🧠 AI 思考过程                   │
│ 用户提出了对凶手的猜测。我需要   │
│ 引导他说出推理依据，而不是直接   │
│ 告诉他对错。应该询问他的证据...  │
└─────────────────────────────────┘
```

### 思考链的价值

1. **透明度**: 玩家可以理解 AI 的推理逻辑
2. **教育性**: 帮助玩家学习推理方法
3. **可信度**: 增加 AI 回答的可信度
4. **调试**: 开发时检查 AI 是否按预期工作

## API 调用示例

### 1. 与 DM 对话

```typescript
import { talkToDM } from '../services/ai';

const result = await talkToDM(
  script,              // 当前剧本
  playerCharacter,     // 玩家角色
  conversationHistory, // 对话历史
  '我不知道接下来该做什么' // 用户消息
);

console.log(result.content);   // AI 回复
console.log(result.reasoning); // 思考过程
```

### 2. 与角色对话

```typescript
import { talkToCharacter } from '../services/ai';

const result = await talkToCharacter(
  targetCharacter,     // 目标角色
  playerCharacter,     // 玩家角色
  script,             // 当前剧本
  conversationHistory, // 对话历史
  '你昨晚在哪里？'     // 用户消息
);

console.log(result.content);   // 角色回复
console.log(result.reasoning); // 角色的思考过程
```

### 3. 生成开场介绍

```typescript
import { generateIntroduction } from '../services/ai';

const introduction = await generateIntroduction(
  script,
  playerCharacter
);

console.log(introduction); // 开场介绍文本
```

### 4. 分析线索

```typescript
import { analyzeClues } from '../services/ai';

const result = await analyzeClues(
  script,
  ['死者在晚上10点被发现', '现场发现一把匕首']
);

console.log(result.analysis);  // 线索分析
console.log(result.reasoning); // 推理过程
```

## 下一步建议

### 1. 在 ClueScreen 中添加线索分析

```typescript
// src/screens/ClueScreen.tsx
import { analyzeClues } from '../services/ai';

const handleAnalyzeClues = async () => {
  const discoveredClueTexts = discoveredClues.map(c => c.description);
  const result = await analyzeClues(script, discoveredClueTexts);

  // 显示分析结果和推理过程
  Alert.alert('线索分析', result.analysis);
};
```

### 2. 在 GameScreen 中添加角色列表对话

```typescript
// src/screens/GameScreen.tsx
const handleSelectCharacter = () => {
  // 显示角色列表
  const characterOptions = script.characters
    .filter(c => c.id !== playerCharacter.id)
    .map(c => ({
      text: c.name,
      onPress: () => navigation.navigate('Dialog', { characterId: c.id })
    }));

  Alert.alert('选择对话角色', '', characterOptions);
};
```

### 3. 在 ResultScreen 中生成结局

```typescript
// src/screens/ResultScreen.tsx
import { generateEnding } from '../services/ai';

const loadEnding = async () => {
  const ending = await generateEnding(
    script,
    playerCharacter,
    isCorrect,
    playerReasoning
  );

  setEndingText(ending);
};
```

## 注意事项

### API 成本控制

1. **限制对话历史长度**: 只保留最近 10-20 条消息
2. **合理设置 max_tokens**: 建议 500-1000
3. **思考链会消耗更多 token**: 根据需要启用

### 错误处理

所有 AI 函数都会抛出错误，建议使用 try-catch:

```typescript
try {
  const result = await talkToDM(...);
  // 处理成功
} catch (error) {
  console.error('AI 错误:', error);
  Alert.alert('错误', '对话失败，请检查网络连接');
}
```

### 性能优化

1. **缓存对话**: 避免重复发送相同内容
2. **异步加载**: 使用 loading 状态
3. **错误重试**: 提供重试选项

## 测试建议

### 1. 测试与 DM 对话

1. 进入游戏
2. 点击"与 DM 对话"
3. 输入问题："我应该从哪里开始调查？"
4. 查看 AI 回复和思考过程

### 2. 测试与角色对话

1. 进入游戏
2. 选择一个角色对话
3. 输入问题："你昨晚在哪里？"
4. 查看角色回复（应该符合角色性格）

### 3. 测试思考链

1. 在对话中点击"查看思考过程"
2. 确认能看到 AI 的推理过程
3. 点击"隐藏思考过程"确认能折叠

### 4. 测试对话历史

1. 进行多轮对话
2. 退出对话界面
3. 重新进入，确认历史对话被保存

## 故障排查

### 问题: API 调用失败

**解决方案**:
1. 检查网络连接
2. 确认 API Key 正确
3. 查看控制台错误信息
4. 检查 API 配额是否用完

### 问题: 思考过程不显示

**解决方案**:
1. 确认 `reasoning` 参数设置为 `{ enabled: true, output_reasoning: true }`
2. 检查 Message 类型是否包含 `reasoning` 字段
3. 查看 API 响应是否包含 `reasoning_content`

### 问题: 对话历史丢失

**解决方案**:
1. 确认调用了 `saveGameProgress`
2. 检查 `conversationHistory` 是否正确保存
3. 确认 `getGameProgress` 能正确读取

## 完成状态

- ✅ AI 服务模块完成
- ✅ 对话界面完成
- ✅ 思考链功能完成
- ✅ 真实 API 集成完成
- ✅ 错误处理完成
- ✅ 对话历史保存完成
- ⏳ ClueScreen 线索分析（待集成）
- ⏳ ResultScreen 结局生成（待集成）
- ⏳ GameScreen 角色选择（待优化）

## 总结

所有核心 AI 功能已经完成并可以使用！DialogScreen 已经完全集成了真实的 AI API，支持：

1. **智能对话**: 与 DM 和角色进行自然对话
2. **思考链**: 查看 AI 的推理过程
3. **上下文感知**: 自动加载游戏进度和角色信息
4. **历史保存**: 自动保存对话历史
5. **错误处理**: 完善的错误提示和处理

现在可以直接运行游戏，测试 AI 对话功能！🎉
