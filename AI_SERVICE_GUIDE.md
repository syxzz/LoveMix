# AI 服务使用指南

本文档说明如何在剧本杀游戏中使用 AI 对话服务。

## 功能概览

### 1. 基础对话功能
- **与 DM 对话**: 询问案件相关问题，获取提示
- **与角色对话**: 与游戏中的其他角色进行对话
- **生成开场介绍**: 自动生成引人入胜的游戏开场

### 2. 高级功能
- **思考链 (Reasoning)**: 查看 AI 的推理过程
- **线索分析**: 分析已发现的线索，获取推理建议
- **生成提示**: 根据玩家问题生成巧妙的提示
- **结局总结**: 游戏结束后生成完整的真相揭示

## API 配置

API 已经配置好，使用以下参数：
- **API Key**: `cky_5OYHvtqWH89hP57Ugu4i`
- **Base URL**: `https://api-chat.charaboard.com/v1`
- **模型**: MiniMax M2.1 (gpt_type: 8602)
- **支持思考链**: ✅

## 使用示例

### 1. 与 DM 对话

```typescript
import { talkToDM } from '../services/ai';

// 在游戏中与 DM 对话
const handleTalkToDM = async () => {
  try {
    const result = await talkToDM(
      script,              // 当前剧本
      playerCharacter,     // 玩家角色
      conversationHistory, // 对话历史
      userMessage         // 用户消息
    );

    // result.content: AI 的回复内容
    // result.reasoning: AI 的思考过程（可选展示）

    console.log('DM 回复:', result.content);
    console.log('思考过程:', result.reasoning);
  } catch (error) {
    console.error('对话失败:', error);
  }
};
```

### 2. 与角色对话

```typescript
import { talkToCharacter } from '../services/ai';

// 与游戏中的某个角色对话
const handleTalkToCharacter = async (character: Character) => {
  try {
    const result = await talkToCharacter(
      character,           // 目标角色
      playerCharacter,     // 玩家角色
      script,             // 当前剧本
      conversationHistory, // 对话历史
      userMessage         // 用户消息
    );

    console.log(`${character.name} 回复:`, result.content);
    console.log('角色思考:', result.reasoning);
  } catch (error) {
    console.error('对话失败:', error);
  }
};
```

### 3. 生成开场介绍

```typescript
import { generateIntroduction } from '../services/ai';

// 游戏开始时生成开场介绍
const loadGameIntro = async () => {
  try {
    const introduction = await generateIntroduction(
      script,
      playerCharacter
    );

    console.log('开场介绍:', introduction);
    // 显示给玩家
  } catch (error) {
    console.error('生成失败:', error);
  }
};
```

### 4. 分析线索（带思考链）

```typescript
import { analyzeClues } from '../services/ai';

// 分析已发现的线索
const handleAnalyzeClues = async () => {
  const discoveredClues = [
    '死者在晚上10点被发现',
    '现场发现一把匕首',
    '死者手中握着一张纸条',
  ];

  try {
    const result = await analyzeClues(script, discoveredClues);

    console.log('线索分析:', result.analysis);
    console.log('推理过程:', result.reasoning);

    // 展示给玩家，帮助他们推理
  } catch (error) {
    console.error('分析失败:', error);
  }
};
```

### 5. 生成线索提示

```typescript
import { generateClueHint } from '../services/ai';

// 玩家卡住时生成提示
const handleGetHint = async () => {
  try {
    const hint = await generateClueHint(
      script,
      playerCharacter,
      currentClues,
      '我不知道接下来该做什么'
    );

    console.log('提示:', hint);
  } catch (error) {
    console.error('生成提示失败:', error);
  }
};
```

### 6. 生成结局总结

```typescript
import { generateEnding } from '../services/ai';

// 游戏结束时生成结局
const handleGameEnd = async (isCorrect: boolean) => {
  try {
    const ending = await generateEnding(
      script,
      playerCharacter,
      isCorrect,
      playerReasoning // 玩家的推理过程
    );

    console.log('结局:', ending);
    // 展示完整真相
  } catch (error) {
    console.error('生成结局失败:', error);
  }
};
```

## 在 DialogScreen 中使用

DialogScreen 已经集成了思考链功能，可以：

1. **查看 AI 思考过程**: 点击消息下方的"查看思考过程"按钮
2. **自动保存思考链**: 对话历史会自动保存 reasoning 字段
3. **多轮对话支持**: 系统会自动处理包含思考过程的多轮对话

### 集成真实 API

在 DialogScreen.tsx 中找到 `handleSend` 函数，替换模拟代码：

```typescript
const handleSend = async () => {
  if (!inputText.trim() || loading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText.trim(),
    timestamp: Date.now(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setLoading(true);

  try {
    // 调用真实的 AI API
    const result = await talkToDM(
      script,
      playerCharacter,
      messages,
      userMessage.content
    );

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'dm',
      content: result.content,
      reasoning: result.reasoning, // 保存思考过程
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    console.error('AI 对话失败:', error);
    Alert.alert('错误', '对话失败，请重试');
  } finally {
    setLoading(false);
  }
};
```

## 思考链功能说明

### 什么是思考链？

思考链 (Reasoning) 是 AI 模型的推理过程，展示了 AI 是如何思考和得出答案的。

### 优势

1. **透明度**: 玩家可以看到 AI 的推理逻辑
2. **教育性**: 帮助玩家学习推理方法
3. **可信度**: 增加 AI 回答的可信度
4. **调试**: 开发时可以检查 AI 的推理是否合理

### 使用建议

- **DM 对话**: 建议显示思考过程，帮助玩家理解提示
- **角色对话**: 可选显示，增加角色的真实感
- **线索分析**: 强烈建议显示，展示推理逻辑
- **开场介绍**: 不需要显示思考过程

## 错误处理

所有 AI 函数都会抛出错误，建议使用 try-catch 处理：

```typescript
try {
  const result = await talkToDM(...);
  // 处理成功结果
} catch (error) {
  console.error('AI 错误:', error);
  Alert.alert('错误', '对话失败，请检查网络连接');
}
```

## 性能优化

1. **缓存对话历史**: 避免重复发送相同的对话
2. **限制历史长度**: 只保留最近 10-20 条消息
3. **异步加载**: 使用 loading 状态提示用户
4. **错误重试**: 网络失败时提供重试选项

## 注意事项

1. API Key 已硬编码在代码中，生产环境建议从环境变量读取
2. 思考链功能会消耗更多 token，注意成本控制
3. 建议设置合理的 max_tokens 限制（建议 500-1000）
4. 对话历史过长会影响响应速度，建议定期清理

## 下一步

1. 在 GameScreen 中集成 DM 对话
2. 在 ClueScreen 中集成线索分析
3. 在 ResultScreen 中集成结局生成
4. 添加对话历史持久化
5. 优化 UI 展示思考过程
