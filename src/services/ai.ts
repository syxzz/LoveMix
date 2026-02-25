/**
 * AI对话服务
 * 使用 CharaBoard API 实现 DM 和角色对话
 * 支持思考链功能和流式输出
 */

import { Character, Message, Script } from '../types';
import { getAPIKey } from './storage';
import { fetch as fetchPolyfill } from 'react-native-fetch-api';

// API 配置
const API_BASE_URL = 'https://api-chat.charaboard.com/v1';
const IMAGE_API_BASE_URL = 'https://api-image.charaboard.com/v2';
const API_KEY = 'cky_KQYbDHquDRJZBD27f09L';
const GPT_TYPE = 8602; // MiniMax M2.1 支持思考链

// 请求头配置
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'x-app-id': '4', // CharaBoard
  'x-platform-id': '5', // Web
  'x-trace-id': `req_${Date.now()}`,
  'x-max-time': '60',
});

// API 响应类型
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning_content?: string; // 思考过程
}

// 流式响应数据块类型
interface StreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      reasoning_content?: string;
    };
    finish_reason: string | null;
  }>;
}

// DM系统提示词
const getDMSystemPrompt = (script: Script, character: Character) => `
你是一个剧本杀游戏的DM（主持人）。当前剧本是《${script.title}》。

剧本背景：${script.storyBackground}

玩家扮演的角色是：${character.name}（${character.occupation}）
角色背景：${character.background}

你的职责：
1. 引导游戏进程，介绍案件背景
2. 回答玩家关于案件的问题（但不能直接透露答案）
3. 根据玩家的推理给予适当的提示
4. 保持神秘和悬疑的氛围
5. 营造紧张刺激的游戏体验

注意：
- 不要直接告诉玩家谁是凶手
- 可以根据玩家的推理方向给予暗示
- 保持中立，不要偏袒任何角色
- 回答要简洁有力，营造悬疑感
- 使用第二人称"你"来称呼玩家
`;

// 角色系统提示词
const getCharacterSystemPrompt = (
  character: Character,
  playerCharacter: Character,
  script: Script
) => `
你正在扮演剧本杀游戏《${script.title}》中的角色：${character.name}

你的基本信息：
- 姓名：${character.name}
- 年龄：${character.age}
- 职业：${character.occupation}
- 性格：${character.personality}
- 背景：${character.background}
- 秘密：${character.secret}
- 目标：${character.goal}

对方是：${playerCharacter.name}（${playerCharacter.occupation}）

你的行为准则：
1. 完全按照角色的性格和背景来回答问题
2. 保护自己的秘密，不要轻易透露
3. 可以适当撒谎或隐瞒信息
4. 如果被问到敏感问题，要表现出紧张或回避
5. 保持角色的一致性和真实感
6. 根据对方的态度调整自己的回应

注意：
- 不要说出"我是AI"或"我在扮演"这样的话
- 完全沉浸在角色中
- 回答要简洁自然，像真实对话
- 如果是凶手，要更加小心，不要露出破绽
- 可以表现出情绪波动（紧张、愤怒、悲伤等）
`;

// 发送消息给AI（支持思考链和流式输出）
export const sendMessageToAI = async (
  messages: Message[],
  systemPrompt: string,
  options: {
    enableReasoning?: boolean; // 是否启用思考链
    temperature?: number;
    maxTokens?: number;
    onStream?: (content: string, reasoning?: string) => void; // 流式回调
  } = {}
): Promise<{
  content: string;
  reasoning?: string; // 思考过程
  usage?: {
    totalTokens: number;
    reasoningTokens?: number;
  };
}> => {
  const {
    enableReasoning = true,
    temperature = 0.8,
    maxTokens = 1000,
    onStream,
  } = options;

  // 首次尝试：带思考链
  try {
    return await sendMessageToAIInternal(
      messages,
      systemPrompt,
      { enableReasoning, temperature, maxTokens, onStream }
    );
  } catch (error: any) {
    console.warn('⚠️ 带思考链的请求失败，尝试降级到普通模式:', error.message);

    // 如果启用了思考链且失败，尝试不带思考链重试
    if (enableReasoning) {
      console.log('🔄 重试：禁用思考链');
      return await sendMessageToAIInternal(
        messages,
        systemPrompt,
        { enableReasoning: false, temperature, maxTokens, onStream }
      );
    }

    // 如果已经是普通模式还失败，直接抛出错误
    throw error;
  }
};

// 内部实现：实际发送请求
const sendMessageToAIInternal = async (
  messages: Message[],
  systemPrompt: string,
  options: {
    enableReasoning?: boolean;
    temperature?: number;
    maxTokens?: number;
    onStream?: (content: string, reasoning?: string) => void;
  }
): Promise<{
  content: string;
  reasoning?: string;
  usage?: {
    totalTokens: number;
    reasoningTokens?: number;
  };
}> => {
  try {
    const {
      enableReasoning = true,
      temperature = 0.8,
      maxTokens = 1000,
      onStream,
    } = options;

    // 转换消息格式
    const chatMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => {
        const message: AIMessage = {
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        };
        // 如果有思考过程，保留它
        if (msg.reasoning) {
          message.reasoning_content = msg.reasoning;
        }
        return message;
      }),
    ];

    const requestBody = {
      gpt_type: GPT_TYPE,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true, // 启用流式输出
      // 只在明确启用时才添加思考链参数
      ...(enableReasoning && {
        reasoning: {
          enabled: true,
          output_reasoning: true,
        },
      }),
    };

    console.log('🚀 发送 AI 请求 (流式):', {
      url: `${API_BASE_URL}/chat/completions`,
      gpt_type: GPT_TYPE,
      messageCount: chatMessages.length,
      temperature,
      max_tokens: maxTokens,
      enableReasoning,
    });

    // 使用 react-native-fetch-api 支持真正的流式读取
    const response = await fetchPolyfill(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
      reactNative: { textStreaming: true }, // 启用流式文本
    });

    console.log('📡 API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 错误响应:', errorText);

      let errorMessage = '未知错误';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }

      throw new Error(`API请求失败: ${response.status} - ${errorMessage}`);
    }

    // 检查是否支持流式读取
    if (!response.body) {
      throw new Error('响应体不支持流式读取');
    }

    // 使用 ReadableStream 进行真正的流式读取
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullContent = '';
    let fullReasoning = '';
    let buffer = '';

    console.log('🎬 开始流式读取...');

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('✅ 流式读取完成');
          break;
        }

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        console.log('📦 收到数据块:', chunk.length, '字节');

        // 按行分割（SSE 格式）
        const lines = buffer.split('\n');
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          // 跳过空行和注释
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;

          // 解析 data: 前缀
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);

            // 检查是否是结束标记
            if (data === '[DONE]') {
              console.log('🏁 收到结束标记');
              continue;
            }

            try {
              const streamChunk: StreamChunk = JSON.parse(data);
              const delta = streamChunk.choices[0]?.delta;

              if (delta?.content) {
                fullContent += delta.content;
                console.log('💬 内容更新:', fullContent.length, '字符');

                // 触发流式回调
                if (onStream) {
                  onStream(fullContent, fullReasoning || undefined);
                }
              }

              if (delta?.reasoning_content) {
                fullReasoning += delta.reasoning_content;
                console.log('🧠 推理更新:', fullReasoning.length, '字符');

                // 触发流式回调（包含推理内容）
                if (onStream) {
                  onStream(fullContent, fullReasoning);
                }
              }
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, '数据:', data.substring(0, 100));
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log('✨ AI 流式响应完成:', {
      contentLength: fullContent.length,
      hasReasoning: !!fullReasoning,
    });

    return {
      content: fullContent,
      reasoning: fullReasoning || undefined,
      usage: {
        totalTokens: 0,
        reasoningTokens: 0,
      },
    };
  } catch (error: any) {
    console.error('❌ AI对话错误:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// 与DM对话（支持流式输出）
export const talkToDM = async (
  script: Script,
  playerCharacter: Character,
  conversationHistory: Message[],
  userMessage: string,
  onStream?: (content: string, reasoning?: string) => void,
  enableReasoning?: boolean
): Promise<{ content: string; reasoning?: string }> => {
  const systemPrompt = getDMSystemPrompt(script, playerCharacter);
  const messages = [
    ...conversationHistory,
    {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
    },
  ];

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: enableReasoning ?? true,
    temperature: 0.8,
    maxTokens: 800,
    onStream,
  });

  return {
    content: result.content,
    reasoning: result.reasoning,
  };
};

// 与角色对话（支持流式输出）
export const talkToCharacter = async (
  character: Character,
  playerCharacter: Character,
  script: Script,
  conversationHistory: Message[],
  userMessage: string,
  onStream?: (content: string, reasoning?: string) => void,
  enableReasoning?: boolean
): Promise<{ content: string; reasoning?: string }> => {
  const systemPrompt = getCharacterSystemPrompt(
    character,
    playerCharacter,
    script
  );
  const messages = [
    ...conversationHistory.filter(msg => msg.characterId === character.id),
    {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
    },
  ];

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: enableReasoning ?? true,
    temperature: 0.9, // 角色对话更随机一些
    maxTokens: 600,
    onStream,
  });

  return {
    content: result.content,
    reasoning: result.reasoning,
  };
};

// 生成开场介绍（支持流式输出）
export const generateIntroduction = async (
  script: Script,
  playerCharacter: Character,
  onStream?: (content: string) => void
): Promise<string> => {
  // 简化的系统提示词
  const systemPrompt = `你是剧本杀游戏DM，擅长营造悬疑氛围。请直接生成开场介绍，不要进行思考或分析。`;

  // 必须有 user 消息，否则 MiniMax 会报错
  const messages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: `请为剧本杀游戏《${script.title}》生成开场介绍。

剧本背景：${script.storyBackground}

玩家角色：${playerCharacter.name}（${playerCharacter.occupation}）
角色背景：${playerCharacter.background}

要求：
1. 150-200字
2. 营造悬疑氛围
3. 介绍案件基本情况和玩家处境
4. 激发探索欲望
5. 使用第二人称"你"
6. 直接输出开场白，不要有任何前置说明或思考过程`,
      timestamp: Date.now(),
    },
  ];

  console.log('🎬 开始生成开场介绍...');

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: false,
    temperature: 0.8, // 提高温度，让输出更有创意
    maxTokens: 500, // 增加 token 限制
    onStream: onStream ? (content) => onStream(content) : undefined,
  });

  console.log('✅ 开场介绍生成成功, 长度:', result.content.length);

  // 如果没有内容但有推理，使用推理内容（降级处理）
  if (!result.content && result.reasoning) {
    console.warn('⚠️ API 只返回了推理内容，使用推理内容作为开场白');
    return result.reasoning;
  }

  return result.content;
};

// 分析线索（使用思考链）
export const analyzeClues = async (
  script: Script,
  clues: string[]
): Promise<{ analysis: string; reasoning: string }> => {
  const systemPrompt = `你是剧本杀游戏《${script.title}》的推理助手。`;

  const messages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: `请分析以下线索：

${clues.map((clue, index) => `${index + 1}. ${clue}`).join('\n')}

请给出：
1. 线索之间的逻辑关系
2. 可能的推理方向
3. 还需要寻找什么线索
4. 当前推理的可信度

注意：不要直接说出答案，引导玩家自己思考。`,
      timestamp: Date.now(),
    },
  ];

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: true, // 启用思考链，展示推理过程
    temperature: 0.7,
    maxTokens: 1000,
  });

  return {
    analysis: result.content,
    reasoning: result.reasoning || '暂无推理过程',
  };
};

// 生成线索提示
export const generateClueHint = async (
  script: Script,
  playerCharacter: Character,
  currentClues: string[],
  playerQuestion: string
): Promise<string> => {
  const systemPrompt = `你是剧本杀游戏《${script.title}》的DM。`;

  const messages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: `玩家角色：${playerCharacter.name}

已发现的线索：
${currentClues.map((clue, i) => `${i + 1}. ${clue}`).join('\n')}

玩家的问题：${playerQuestion}

请给出一个巧妙的提示（50-100字）：
- 不要直接说出答案
- 引导玩家思考
- 可以暗示下一步该做什么
- 保持神秘感`,
      timestamp: Date.now(),
    },
  ];

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: false,
    temperature: 0.8,
    maxTokens: 200,
  });

  return result.content;
};

// 生成结局总结
export const generateEnding = async (
  script: Script,
  playerCharacter: Character,
  isCorrect: boolean,
  playerReasoning: string
): Promise<string> => {
  const systemPrompt = `你是剧本杀游戏《${script.title}》的DM。`;

  const messages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: `游戏已经结束。

玩家角色：${playerCharacter.name}
玩家的推理：${playerReasoning}
推理结果：${isCorrect ? '正确' : '错误'}

请生成结局总结（300-400字）：
1. 揭示真相
2. 评价玩家的推理过程
3. 解释关键线索
4. ${isCorrect ? '祝贺玩家' : '鼓励玩家'}

要求：揭示所有秘密，解释案件的来龙去脉。`,
      timestamp: Date.now(),
    },
  ];

  const result = await sendMessageToAI(messages, systemPrompt, {
    enableReasoning: false,
    temperature: 0.7,
    maxTokens: 800,
  });

  return result.content;
};

// 生成剧本封面图片
export const generateScriptCoverImage = async (
  script: Script
): Promise<string> => {
  try {
    console.log('🎨 开始生成剧本封面图片...');

    // 构建图片生成提示词（纯英文，避免乱码）
    // 不包含任何中文，避免 AI 在图片中生成中文文字导致乱码
    const prompt = `Create a dark atmospheric manga-style illustration for a murder mystery visual novel.
Scene: A luxurious Victorian mansion at night during a thunderstorm, dramatic lighting through windows, mysterious shadows
Style: Japanese manga/anime art style with film noir aesthetic, high contrast lighting, moody atmosphere
Composition: Wide cinematic establishing shot, emphasis on architectural details and ominous mood
Color palette: Deep blues, purples, and blacks with dramatic highlights, noir color grading
Quality: Professional manga illustration, highly detailed
CRITICAL: Absolutely NO text, NO words, NO letters, NO Chinese characters, NO Japanese characters - pure visual artwork only`;

    const requestBody = {
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
        temperature: 0.8,
        n: 1
      }
    };

    console.log('📤 发送图片生成请求:', {
      url: `${IMAGE_API_BASE_URL}/nanobanana/txt2Image`,
      scriptTitle: script.title,
    });

    const response = await fetch(`${IMAGE_API_BASE_URL}/nanobanana/txt2Image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log('📡 图片生成响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 图片生成错误:', errorText);
      throw new Error(`图片生成失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 图片生成成功');

    // 提取图片 URL
    const imageUrl = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    )?.inlineData?.data;

    if (!imageUrl) {
      throw new Error('未能从响应中提取图片 URL');
    }

    console.log('🖼️ 图片 URL:', imageUrl);
    return imageUrl;
  } catch (error: any) {
    console.error('❌ 生成剧本封面图片失败:', error);
    throw error;
  }
};

// 生成角色头像
export const generateCharacterAvatar = async (
  character: Character
): Promise<string> => {
  try {
    console.log(`🎨 开始生成角色头像: ${character.name}`);

    // 根据角色信息构建提示词（纯英文）
    const genderMap: Record<string, string> = {
      '男': 'male',
      '女': 'female',
      '其他': 'androgynous'
    };

    const occupationMap: Record<string, string> = {
      '艺术家': 'artist',
      '商业伙伴': 'business partner',
      '家庭主妇': 'housewife',
      '私人医生': 'doctor',
      '秘书': 'secretary',
      '管家': 'butler'
    };

    const personalityMap: Record<string, string> = {
      '敏感、细腻、有艺术气质': 'sensitive, delicate, artistic temperament',
      '精明、冷静、善于算计': 'shrewd, calm, calculating',
      '优雅、传统、有些神经质': 'elegant, traditional, slightly neurotic',
      '专业、谨慎、有同情心': 'professional, cautious, compassionate',
      '聪明、野心勃勃、神秘': 'intelligent, ambitious, mysterious',
      '忠诚、细心、守旧': 'loyal, meticulous, conservative'
    };

    const gender = genderMap[character.gender] || 'person';
    const occupation = occupationMap[character.occupation] || character.occupation;
    const personality = personalityMap[character.personality] || 'mysterious';

    const prompt = `Create a manga-style character portrait for a murder mystery visual novel.
Character: ${gender}, age ${character.age}, ${occupation}
Personality: ${personality}
Style: Japanese anime/manga art style, detailed facial features, expressive eyes
Composition: Portrait shot, shoulders and head visible, neutral background
Mood: Mysterious and intriguing, fitting for a murder mystery character
Art quality: High detail, professional anime character design
CRITICAL: Absolutely NO text, NO words, NO letters, NO Chinese characters, NO Japanese characters - pure character portrait only`;

    const requestBody = {
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '1:1' }, // 头像使用 1:1 比例
        temperature: 0.8,
        n: 1
      }
    };

    console.log('📤 发送角色头像生成请求:', {
      url: `${IMAGE_API_BASE_URL}/nanobanana/txt2Image`,
      characterName: character.name,
    });

    const response = await fetch(`${IMAGE_API_BASE_URL}/nanobanana/txt2Image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log('📡 头像生成响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 头像生成错误:', errorText);
      throw new Error(`头像生成失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 头像生成成功');

    // 提取图片 URL
    const imageUrl = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    )?.inlineData?.data;

    if (!imageUrl) {
      throw new Error('未能从响应中提取头像 URL');
    }

    console.log('🖼️ 头像 URL:', imageUrl);
    return imageUrl;
  } catch (error: any) {
    console.error(`❌ 生成角色头像失败: ${character.name}`, error);
    throw error;
  }
};

// 生成开场场景图片
export const generateIntroductionImage = async (
  script: Script,
  character: Character
): Promise<string> => {
  try {
    console.log(`🎨 开始生成开场场景图片: ${script.title} - ${character.name}`);

    // 根据角色信息构建场景提示词
    const genderMap: Record<string, string> = {
      '男': 'male',
      '女': 'female',
      '其他': 'person'
    };

    const occupationMap: Record<string, string> = {
      '艺术家': 'artist',
      '商业伙伴': 'business partner',
      '家庭主妇': 'housewife',
      '私人医生': 'doctor',
      '秘书': 'secretary',
      '管家': 'butler'
    };

    const gender = genderMap[character.gender] || 'person';
    const occupation = occupationMap[character.occupation] || character.occupation;

    const prompt = `Create a dramatic manga-style opening scene illustration for a murder mystery visual novel.
Setting: Victorian mansion interior during a stormy night, luxurious but ominous atmosphere
Main character: ${gender} ${occupation}, age ${character.age}, standing in the scene
Perspective: First-person view showing the character from behind or side, looking into the mysterious mansion
Mood: Dark, atmospheric, suspenseful, with dramatic lighting from lightning and candles
Style: Japanese manga/anime art style with film noir aesthetic, cinematic composition
Details: Rich interior details, shadows, rain visible through windows, mysterious ambiance
Color palette: Deep blues, purples, blacks with dramatic highlights
Quality: Professional manga illustration, highly detailed
CRITICAL: Absolutely NO text, NO words, NO letters, NO Chinese characters, NO Japanese characters - pure visual scene only`;

    const requestBody = {
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' }, // 开场场景使用 16:9 比例
        temperature: 0.8,
        n: 1
      }
    };

    console.log('📤 发送开场场景生成请求:', {
      url: `${IMAGE_API_BASE_URL}/nanobanana/txt2Image`,
      scriptTitle: script.title,
      characterName: character.name,
    });

    const response = await fetch(`${IMAGE_API_BASE_URL}/nanobanana/txt2Image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log('📡 开场场景生成响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 开场场景生成错误:', errorText);
      throw new Error(`开场场景生成失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 开场场景生成成功');

    // 提取图片 URL
    const imageUrl = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    )?.inlineData?.data;

    if (!imageUrl) {
      throw new Error('未能从响应中提取开场场景 URL');
    }

    console.log('🖼️ 开场场景 URL:', imageUrl);
    return imageUrl;
  } catch (error: any) {
    console.error(`❌ 生成开场场景失败: ${script.title} - ${character.name}`, error);
    throw error;
  }
};

// 测试 API 连接
export const testAPIConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🧪 开始测试 API 连接...');

    const testMessages: Message[] = [];
    const testPrompt = '你是一个测试助手。请简单回复"测试成功"。';

    const result = await sendMessageToAI(testMessages, testPrompt, {
      enableReasoning: false,
      temperature: 0.7,
      maxTokens: 50,
    });

    console.log('✅ API 测试成功:', result);

    return {
      success: true,
      message: 'API 连接正常',
      details: {
        response: result.content,
        tokens: result.usage?.totalTokens,
      },
    };
  } catch (error: any) {
    console.error('❌ API 测试失败:', error);

    return {
      success: false,
      message: error.message || 'API 连接失败',
      details: {
        error: error.toString(),
      },
    };
  }
};
