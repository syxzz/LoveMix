# 🔧 API 调试指南

## 500 错误排查步骤

### 1. 检查控制台日志

运行应用后，查看控制台输出：

```
🚀 发送 AI 请求: { ... }
📡 API 响应状态: 500
❌ API 错误响应: { ... }
```

### 2. 常见 500 错误原因

#### 原因 1: 模型不支持某些参数

**问题**: MiniMax M2.1 可能不支持某些参数组合

**解决方案**: 尝试简化请求参数

```typescript
// 在 generateIntroduction 中临时禁用思考链
const result = await sendMessageToAI(messages, systemPrompt, {
  enableReasoning: false,  // 改为 false
  temperature: 0.9,
  maxTokens: 500,
});
```

#### 原因 2: 系统提示词过长

**问题**: 提示词包含太多信息导致超出限制

**解决方案**: 简化系统提示词

```typescript
// 简化版开场介绍提示词
const systemPrompt = `
你是剧本杀游戏《${script.title}》的DM。

请为玩家生成简短的开场介绍（150字以内）：
1. 案件基本情况
2. 玩家角色：${playerCharacter.name}
3. 游戏目标

要求简洁、悬疑。
`;
```

#### 原因 3: API Key 权限问题

**问题**: API Key 可能没有访问该模型的权限

**解决方案**: 尝试使用其他模型

```typescript
// 在 ai.ts 中修改
const GPT_TYPE = 8204; // 尝试其他模型
```

#### 原因 4: 请求头配置问题

**问题**: 某些请求头可能不正确

**解决方案**: 简化请求头

```typescript
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  // 尝试移除这些可选头
  // 'x-app-id': '4',
  // 'x-platform-id': '5',
  // 'x-trace-id': `req_${Date.now()}`,
  // 'x-max-time': '60',
});
```

### 3. 测试 API 连接

在 GameScreen 或任何地方添加测试按钮：

```typescript
import { testAPIConnection } from '../services/ai';

const handleTestAPI = async () => {
  const result = await testAPIConnection();
  Alert.alert(
    result.success ? '成功' : '失败',
    result.message,
    [{ text: '确定' }]
  );
  console.log('测试结果:', result);
};

// 在界面添加测试按钮
<TouchableOpacity onPress={handleTestAPI}>
  <Text>测试 API</Text>
</TouchableOpacity>
```

### 4. 逐步调试

#### 步骤 1: 测试最简单的请求

```typescript
// 在 ai.ts 中创建最简单的测试
export const testSimpleRequest = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        gpt_type: 8602,
        messages: [
          { role: 'user', content: '你好' }
        ],
        max_tokens: 50,
      }),
    });

    const text = await response.text();
    console.log('响应状态:', response.status);
    console.log('响应内容:', text);

    return { status: response.status, body: text };
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};
```

#### 步骤 2: 检查响应内容

查看控制台的 `❌ API 错误响应:` 输出，可能包含：

```json
{
  "error": {
    "message": "具体错误信息",
    "type": "invalid_request_error",
    "code": "xxx"
  }
}
```

#### 步骤 3: 根据错误信息调整

常见错误码：
- `invalid_model`: 模型不存在或无权限
- `invalid_request`: 请求参数错误
- `rate_limit_exceeded`: 超出速率限制
- `insufficient_quota`: 配额不足

### 5. 临时解决方案

如果 API 持续失败，可以先使用模拟数据：

```typescript
// 在 generateIntroduction 中添加降级逻辑
export const generateIntroduction = async (
  script: Script,
  playerCharacter: Character
): Promise<string> => {
  try {
    // 尝试调用 API
    const systemPrompt = `...`;
    const messages: Message[] = [];
    const result = await sendMessageToAI(messages, systemPrompt, {
      enableReasoning: false,
      temperature: 0.9,
      maxTokens: 500,
    });
    return result.content;
  } catch (error) {
    console.error('生成开场介绍失败，使用默认文本:', error);

    // 降级：返回默认开场介绍
    return `欢迎来到《${script.title}》。

你扮演的是${playerCharacter.name}，${playerCharacter.occupation}。

${script.storyBackground}

现在，游戏开始了。你需要通过搜集线索、与其他角色对话，找出隐藏在迷雾中的真相。

记住，每个人都有自己的秘密，而真相往往藏在最不起眼的地方...`;
  }
};
```

### 6. 检查网络连接

```typescript
// 测试网络连接
const testNetwork = async () => {
  try {
    const response = await fetch('https://api-chat.charaboard.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    console.log('网络测试:', response.status);
    const data = await response.json();
    console.log('可用模型:', data);
  } catch (error) {
    console.error('网络错误:', error);
  }
};
```

### 7. 联系 API 支持

如果以上方法都不行，可能需要：

1. 检查 API Key 是否有效
2. 确认账户是否有足够配额
3. 查看 API 文档是否有更新
4. 联系 CharaBoard 技术支持

### 8. 快速修复建议

**立即尝试这个修改**:

在 `src/services/ai.ts` 中，找到 `generateIntroduction` 函数，修改为：

```typescript
export const generateIntroduction = async (
  script: Script,
  playerCharacter: Character
): Promise<string> => {
  const systemPrompt = `你是剧本杀DM。为《${script.title}》生成150字开场介绍。玩家是${playerCharacter.name}。要求简洁悬疑。`;

  const messages: Message[] = [];

  try {
    const result = await sendMessageToAI(messages, systemPrompt, {
      enableReasoning: false,  // 关闭思考链
      temperature: 0.7,        // 降低随机性
      maxTokens: 300,          // 减少 token 数
    });
    return result.content;
  } catch (error) {
    console.error('AI 生成失败，使用默认文本:', error);
    // 返回默认文本
    return `欢迎来到《${script.title}》。\n\n你扮演${playerCharacter.name}，${playerCharacter.occupation}。\n\n${script.storyBackground}\n\n游戏开始，寻找真相吧...`;
  }
};
```

### 9. 检查清单

- [ ] 查看控制台完整错误信息
- [ ] 尝试禁用 reasoning 参数
- [ ] 简化系统提示词
- [ ] 减少 max_tokens
- [ ] 测试简单请求
- [ ] 检查 API Key 权限
- [ ] 尝试其他模型 (gpt_type)
- [ ] 添加降级逻辑
- [ ] 测试网络连接
- [ ] 查看 API 文档

### 10. 获取帮助

如果问题持续，请提供：

1. 完整的控制台错误日志
2. API 响应的完整内容
3. 使用的模型 ID (gpt_type)
4. 请求的完整参数

这样可以更准确地定位问题！
