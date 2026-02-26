/**
 * AI对话服务
 * 使用 CharaBoard API 实现 DM 和角色对话
 * 支持思考链功能和流式输出
 */

import { Character, Message, Script, ScriptGenre } from '../types';
import { getAPIKey } from './storage';
import { fetch as fetchPolyfill } from 'react-native-fetch-api';
import { Paths, File } from 'expo-file-system';

// API 配置
const API_BASE_URL = 'https://api-chat.charaboard.com/v1';
const IMAGE_API_BASE_URL = 'https://api-image.charaboard.com/v2';
const API_KEY = 'cky_5OYHvtqWH89hP57Ugu4i';
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

  // 首次尝试
  try {
    return await sendMessageToAIInternal(
      messages,
      systemPrompt,
      { enableReasoning, temperature, maxTokens, onStream }
    );
  } catch (error: any) {
    // 如果启用了思考链，降级到普通模式重试
    if (enableReasoning) {
      console.warn('⚠️ 带思考链的请求失败，降级到普通模式:', error.message);
      return await sendMessageToAIInternal(
        messages,
        systemPrompt,
        { enableReasoning: false, temperature, maxTokens, onStream }
      );
    }

    // 普通模式失败，等待后重试一次（可能是服务端临时问题）
    console.warn('⚠️ AI 请求失败，2s 后重试:', error.message);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await sendMessageToAIInternal(
      messages,
      systemPrompt,
      { enableReasoning: false, temperature, maxTokens, onStream }
    );
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

// 根据剧本题材生成对应的场景描述
const getGenreScenePrompt = (script: Script): string => {
  const genre = script.genre;
  switch (genre) {
    case 'ancient_romance':
      return 'ancient Chinese palace with cherry blossoms, elegant rooftops, lanterns glowing at twilight';
    case 'modern_urban':
      return 'modern city skyline at golden hour, rooftop cafe, warm sunset reflecting on glass buildings';
    case 'horror_thriller':
      return 'abandoned mansion surrounded by mist, eerie moonlight, old garden with overgrown roses';
    case 'fantasy_wuxia':
      return 'mountain temple above clouds, bamboo forest, martial arts warriors on a cliff edge at sunrise';
    case 'sci_fi':
      return 'futuristic space station with holographic displays, neon lights, vast galaxy visible through windows';
    case 'historical_mystery':
      return 'traditional Japanese detective office in Taisho era, rain outside, dim warm interior lighting';
    case 'campus_youth':
      return 'Japanese high school campus in spring, cherry blossom petals falling, warm afternoon sunlight';
    case 'business_intrigue':
      return 'luxury corporate penthouse office, city night view, dramatic interior lighting';
    default:
      return 'elegant Victorian mansion garden at golden hour, warm sunlight filtering through trees';
  }
};

// 生成剧本封面图片（横版 16:9）
export const generateScriptCoverImage = async (
  script: Script
): Promise<string> => {
  try {
    console.log('🎨 开始生成剧本封面图片（横版）...');

    const sceneDesc = getGenreScenePrompt(script);

    const prompt = `Create a vibrant Japanese anime-style illustration for a mystery visual novel cover.
Scene: ${sceneDesc}
Style: High-quality Japanese anime art, Studio Ghibli / Makoto Shinkai inspired, vivid colors, beautiful lighting, atmospheric depth
Composition: Wide cinematic landscape establishing shot, rich environmental detail, sense of wonder and intrigue
Color palette: Warm golden tones, soft pastels, vivid sky gradients, luminous highlights - bright and inviting
Quality: Professional anime key visual, highly detailed backgrounds, cinematic composition
CRITICAL: Absolutely NO text, NO words, NO letters, NO characters of any language - pure visual artwork only`;

    const imageUrl = await callImageGenAPI(prompt, '16:9');
    console.log('🖼️ 横版封面生成成功');
    return imageUrl;
  } catch (error: any) {
    console.error('❌ 生成横版封面失败:', error);
    throw error;
  }
};

// 生成剧本封面图片（竖版 9:16）
export const generateScriptCoverImagePortrait = async (
  script: Script
): Promise<string> => {
  try {
    console.log('🎨 开始生成剧本封面图片（竖版）...');

    const sceneDesc = getGenreScenePrompt(script);

    const prompt = `Create a vibrant Japanese anime-style illustration for a mystery visual novel poster.
Scene: ${sceneDesc}, with a mysterious silhouette of a character in the foreground
Style: High-quality Japanese anime art, light novel cover illustration style, vivid colors, dramatic vertical composition
Composition: Vertical poster layout, character silhouette framed by environment, depth and atmosphere
Color palette: Rich warm tones, luminous sky, soft color gradients - beautiful and captivating
Quality: Professional anime illustration, light novel cover quality, highly detailed
CRITICAL: Absolutely NO text, NO words, NO letters, NO characters of any language - pure visual artwork only`;

    const imageUrl = await callImageGenAPI(prompt, '9:16');
    console.log('🖼️ 竖版封面生成成功');
    return imageUrl;
  } catch (error: any) {
    console.error('❌ 生成竖版封面失败:', error);
    throw error;
  }
};

/**
 * 将 base64 数据保存为本地文件并返回文件 URI
 * 这样可以避免 React Native Image 组件处理超长 base64 字符串的问题
 */
const saveBase64ToFile = async (base64Data: string, mimeType: string, filename: string): Promise<string> => {
  try {
    // 确定文件扩展名
    const extension = mimeType.includes('png') ? 'png' : 'jpg';

    // 使用新的 expo-file-system API
    const file = new File(Paths.cache, `${filename}.${extension}`);

    // 将 base64 数据转换为 Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 写入文件
    await file.write(bytes);

    console.log('💾 图片已保存到本地:', file.uri);
    return file.uri;
  } catch (error) {
    console.error('❌ 保存图片到本地失败:', error);
    // 如果保存失败，返回 data URL 作为降级方案
    return `data:${mimeType};base64,${base64Data}`;
  }
};

// 通用图片生成 API 调用
const callImageGenAPI = async (prompt: string, aspectRatio: string): Promise<string> => {
  const requestBody = {
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
      temperature: 0.8,
      n: 1
    }
  };

  const response = await fetch(`${IMAGE_API_BASE_URL}/nanobanana/txt2Image`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ 图片生成错误:', errorText);
    throw new Error(`图片生成失败: ${response.status}`);
  }

  const result = await response.json();

  const inlineData = result.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.inlineData
  )?.inlineData;

  if (!inlineData?.data) {
    console.error('❌ API响应结构:', JSON.stringify(result, null, 2).substring(0, 500));
    throw new Error('未能从响应中提取图片数据');
  }

  const imageData = inlineData.data;

  // 检查返回的是 URL 还是 base64 数据
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    // 如果是 URL，直接返回
    console.log('🌐 API 返回的是 CDN URL:', imageData);
    return imageData;
  }

  // 如果是 base64 数据，保存为本地文件
  const mimeType = inlineData.mimeType || 'image/png';
  console.log('📊 图片数据信息:', {
    mimeType,
    dataLength: imageData.length,
    dataPrefix: imageData.substring(0, 50),
  });

  // 生成唯一的文件名
  const filename = `image_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // 将 base64 数据保存为本地文件
  const fileUri = await saveBase64ToFile(imageData, mimeType, filename);
  console.log('🖼️ 图片已保存，URI:', fileUri.substring(0, 100));

  return fileUri;
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

    const prompt = `Create a beautiful anime-style character portrait for a mystery visual novel.
Character: ${gender}, age ${character.age}, ${occupation}
Personality: ${personality}
Style: High-quality Japanese anime art, vivid colors, detailed expressive eyes, beautiful character design
Composition: Portrait shot from chest up, soft gradient background with warm tones
Mood: Charismatic and intriguing, vibrant and appealing anime character
Art quality: Professional anime character illustration, light novel quality
CRITICAL: Absolutely NO text, NO words, NO letters - pure character portrait only`;

    const imageUrl = await callImageGenAPI(prompt, '1:1');
    console.log(`🖼️ 角色头像生成成功: ${character.name}`);
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

    const sceneDesc = getGenreScenePrompt(script);

    const prompt = `Create a beautiful anime-style opening scene illustration for a mystery visual novel.
Setting: ${sceneDesc}
Main character: ${gender} ${occupation}, age ${character.age}, standing in the scene looking ahead
Perspective: Cinematic third-person view, character in foreground gazing into the scene
Mood: Atmospheric, intriguing, beautiful with warm lighting and dramatic sky
Style: High-quality Japanese anime art, Makoto Shinkai inspired lighting, vivid colors
Details: Rich environmental details, beautiful sky, warm ambient lighting
Color palette: Warm golden tones, soft pastels, vivid gradients
Quality: Professional anime key visual, highly detailed
CRITICAL: Absolutely NO text, NO words, NO letters - pure visual scene only`;

    const imageUrl = await callImageGenAPI(prompt, '16:9');
    console.log(`🖼️ 开场场景生成成功: ${script.title}`);
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

// 剧本类型的中文描述
const GENRE_DESCRIPTIONS: Record<ScriptGenre, string> = {
  ancient_romance: '古装爱情 - 宫廷恩怨、江湖情仇、才子佳人',
  modern_urban: '现代都市 - 职场争斗、豪门恩怨、都市悬疑',
  horror_thriller: '惊悚恐怖 - 密室逃脱、灵异事件、心理惊悚',
  fantasy_wuxia: '玄幻武侠 - 江湖门派、武林秘籍、侠义恩仇',
  sci_fi: '科幻未来 - 太空探索、人工智能、未来世界',
  historical_mystery: '历史悬疑 - 历史谜案、朝堂权谋、古代探案',
  campus_youth: '校园青春 - 校园悬案、青春秘密、学生推理',
  business_intrigue: '商战谍战 - 商业阴谋、间谍暗战、企业争斗',
};

/**
 * 从 AI 返回的文本中提取 JSON 对象
 * 处理 markdown 代码块、前后多余文字、截断等情况
 */
function extractJSON(text: string): any {
  let content = text.trim();

  // 1. 提取 ```json ... ``` 或 ``` ... ``` 代码块
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1].trim();
  }

  // 2. 直接尝试解析
  try {
    return JSON.parse(content);
  } catch (e: any) {
    console.log('📋 [extractJSON] 直接解析失败:', e.message);
  }

  // 3. 用大括号配对找到完整 JSON 对象
  const firstBrace = content.indexOf('{');
  if (firstBrace === -1) {
    console.log('📋 [extractJSON] 未找到 {，内容前200字符:', content.slice(0, 200));
    throw new Error('无法从 AI 返回内容中提取有效的 JSON 数据');
  }

  // 用配对的方式找到正确的闭合 }
  let depth = 0;
  let inString = false;
  let escape = false;
  let endPos = -1;

  for (let i = firstBrace; i < content.length; i++) {
    const ch = content[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        endPos = i;
        break;
      }
    }
  }

  if (endPos === -1) {
    // JSON 被截断，尝试补全
    console.log('📋 [extractJSON] JSON 未闭合，尝试补全...');
    let truncated = content.slice(firstBrace);
    // 补全缺失的引号
    const quoteCount = (truncated.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      truncated += '"';
    }
    // 补全缺失的括号
    while (depth > 0) {
      // 检查最后打开的是 [ 还是 {
      const lastOpen = Math.max(truncated.lastIndexOf('['), truncated.lastIndexOf('{'));
      const lastClose = Math.max(truncated.lastIndexOf(']'), truncated.lastIndexOf('}'));
      if (lastOpen > lastClose) {
        truncated += truncated[lastOpen] === '[' ? ']' : '}';
      } else {
        truncated += '}';
      }
      depth--;
    }
    try {
      return JSON.parse(truncated);
    } catch (e: any) {
      console.log('📋 [extractJSON] 补全后仍失败:', e.message);
    }
  }

  if (endPos !== -1) {
    const jsonStr = content.slice(firstBrace, endPos + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e: any) {
      console.log('📋 [extractJSON] 配对提取失败:', e.message);

      // 修复常见问题：尾部多余逗号、控制字符
      let fixed = jsonStr
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/[\x00-\x1f\x7f]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '');
      try {
        return JSON.parse(fixed);
      } catch (e2: any) {
        console.log('📋 [extractJSON] 修复后仍失败:', e2.message);
        console.log('📋 [extractJSON] JSON 前200字符:', jsonStr.slice(0, 200));
        console.log('📋 [extractJSON] JSON 后200字符:', jsonStr.slice(-200));
      }
    }
  }

  throw new Error('无法从 AI 返回内容中提取有效的 JSON 数据');
}

// 生成剧本（支持流式输出）
export const generateScript = async (
  genre: ScriptGenre,
  onProgress?: (stage: string, progress: number) => void
): Promise<Script> => {
  try {
    console.log('🎬 开始生成剧本，类型:', genre);

    const genreDesc = GENRE_DESCRIPTIONS[genre];

    // 阶段 1: 生成剧本基本信息
    onProgress?.('生成剧本框架...', 0.1);

    const systemPrompt = `你是一个专业的剧本杀剧本创作大师，擅长创作引人入胜的推理剧本。
你需要根据用户选择的题材，创作一个完整的剧本杀剧本。

要求：
1. 剧本必须包含完整的故事背景、角色设定、线索设计
2. 必须有明确的凶手和作案动机
3. 线索设计要合理，既不能太简单也不能太复杂
4. 角色性格要鲜明，每个人都有秘密和目标
5. 故事要有悬念和反转

请直接输出 JSON 格式的剧本数据，不要有任何其他说明文字。`;

    const userPrompt = `请创作一个${genreDesc}题材的剧本杀剧本。

要求：
- 6个角色，每个角色都有独特的背景、性格、秘密和目标
- 8-10条线索，包括关键线索、重要线索和普通线索
- 明确的凶手和作案动机
- 完整的真相揭示

请按以下 JSON 格式输出（必须是有效的 JSON）：

{
  "title": "剧本标题",
  "description": "剧本简介（50字以内）",
  "difficulty": "medium",
  "duration": "60-90分钟",
  "storyBackground": "故事背景（200字左右）",
  "characters": [
    {
      "name": "角色姓名",
      "age": 30,
      "gender": "男/女",
      "occupation": "职业",
      "personality": "性格特点",
      "background": "角色背景（100字）",
      "secret": "角色秘密（50字）",
      "goal": "角色目标（50字）"
    }
  ],
  "clues": [
    {
      "name": "线索名称",
      "type": "key/important/normal",
      "location": "发现地点",
      "description": "线索描述（50字）"
    }
  ],
  "murdererIndex": 0,
  "motive": "作案动机（100字）",
  "truth": "完整真相（300字）"
}

注意：
1. murdererIndex 是凶手在 characters 数组中的索引（0-5）
2. 至少要有 2 条 key 类型线索，3 条 important 类型线索
3. 确保输出的是纯 JSON，不要有任何 markdown 标记或其他文字`;

    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: userPrompt,
        timestamp: Date.now(),
      },
    ];

    onProgress?.('AI 正在创作剧本...', 0.3);

    const result = await sendMessageToAI(messages, systemPrompt, {
      enableReasoning: false,
      temperature: 0.9,
      maxTokens: 8000,
    });

    console.log('📝 AI 返回内容长度:', result.content.length);

    onProgress?.('解析剧本数据...', 0.7);

    const scriptData = extractJSON(result.content);

    onProgress?.('构建剧本对象...', 0.9);

    // 构建完整的 Script 对象
    const script: Script = {
      id: `custom_${Date.now()}`,
      title: scriptData.title,
      description: scriptData.description,
      difficulty: scriptData.difficulty || 'medium',
      duration: scriptData.duration || '60-90分钟',
      characterCount: scriptData.characters.length,
      storyBackground: scriptData.storyBackground,
      characters: scriptData.characters.map((char: any, index: number) => ({
        id: `char_${index + 1}`,
        name: char.name,
        age: char.age,
        gender: char.gender,
        occupation: char.occupation,
        personality: char.personality,
        background: char.background,
        secret: char.secret,
        goal: char.goal,
      })),
      clues: scriptData.clues.map((clue: any, index: number) => ({
        id: `clue_${index + 1}`,
        name: clue.name,
        type: clue.type,
        location: clue.location,
        description: clue.description,
        discovered: false,
      })),
      murderer: `char_${scriptData.murdererIndex + 1}`,
      motive: scriptData.motive,
      truth: scriptData.truth,
      genre,
      isCustom: true,
      createdAt: Date.now(),
    };

    // 生成封面图片（横版 + 竖版并行生成）
    onProgress?.('生成剧本封面...', 0.92);
    try {
      const [landscapeCover, portraitCover] = await Promise.all([
        generateScriptCoverImage(script).catch(() => null),
        generateScriptCoverImagePortrait(script).catch(() => null),
      ]);
      if (landscapeCover) script.coverImage = landscapeCover;
      if (portraitCover) script.coverImagePortrait = portraitCover;
    } catch (e) {
      console.error('封面生成失败，不影响剧本创建:', e);
    }

    onProgress?.('剧本生成完成！', 1.0);

    console.log('✅ 剧本生成成功:', script.title);
    return script;
  } catch (error: any) {
    console.error('❌ 生成剧本失败:', error);
    throw new Error(`生成剧本失败: ${error.message}`);
  }
};
