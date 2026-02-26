/**
 * DialogScreen - 对话系统页面
 * 支持显示 AI 思考过程，集成真实 AI API
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message, Script, Character } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import { talkToDM, talkToCharacter } from '../services/ai';
import { getScriptById } from '../data/scripts';
import { getGameProgress, saveGameProgress } from '../services/storage';
import { usePointsConsumer } from '../hooks/usePointsConsumer';

type DialogScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dialog'>;
type DialogScreenRouteProp = RouteProp<RootStackParamList, 'Dialog'>;

export const DialogScreen: React.FC = () => {
  const navigation = useNavigation<DialogScreenNavigationProp>();
  const route = useRoute<DialogScreenRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const pc = usePointsConsumer('aiConversation');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReasoning, setShowReasoning] = useState<{ [key: string]: boolean }>({});
  const [enableReasoning, setEnableReasoning] = useState(true); // 是否启用思考链
  const [script, setScript] = useState<Script | null>(null);
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null);
  const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    reasoning?: string;
  } | null>(null);

  // 加载动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadGameContext();
  }, []);

  // 加载动画效果
  useEffect(() => {
    if (sending && (!streamingMessage || !streamingMessage.content)) {
      // 淡入动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 点点跳动动画
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 200),
        createDotAnimation(dot3Anim, 400),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      dot1Anim.setValue(0.3);
      dot2Anim.setValue(0.3);
      dot3Anim.setValue(0.3);
    }
  }, [sending, streamingMessage]);

  // 加载游戏上下文
  const loadGameContext = async () => {
    try {
      const { characterId, scriptId } = route.params;

      const progress = await getGameProgress(scriptId);

      if (!progress) {
        Alert.alert('错误', '未找到游戏进度');
        navigation.goBack();
        return;
      }

      const scriptData = await getScriptById(progress.scriptId);
      if (!scriptData) {
        Alert.alert('错误', '未找到剧本');
        navigation.goBack();
        return;
      }

      const playerChar = scriptData.characters.find(
        c => c.id === progress.selectedCharacterId
      );
      if (!playerChar) {
        Alert.alert('错误', '未找到玩家角色');
        navigation.goBack();
        return;
      }

      setScript(scriptData);
      setPlayerCharacter(playerChar);

      // 如果有目标角色ID，则是与角色对话
      if (characterId) {
        const targetChar = scriptData.characters.find(c => c.id === characterId);
        if (targetChar) {
          setTargetCharacter(targetChar);

          // 加载历史对话
          const existingHistory = progress.conversationHistory?.filter(
            msg => msg.characterId === targetChar.id
          ) || [];

          if (existingHistory.length > 0) {
            setMessages(existingHistory);
          } else {
            // 首次对话，AI生成开场白
            setMessages([
              {
                id: '1',
                role: 'character',
                characterId: targetChar.id,
                content: `你好，我是${targetChar.name}。有什么想问我的吗？`,
                timestamp: Date.now(),
              },
            ]);
          }
        }
      } else {
        // 与DM对话
        setMessages([
          {
            id: '1',
            role: 'dm',
            content: '我是游戏主持人。你可以向我询问关于案件的问题，我会给你一些提示。',
            timestamp: Date.now(),
          },
        ]);
      }

      // 加载历史对话
      if (progress.conversationHistory && progress.conversationHistory.length > 0) {
        const filteredHistory = characterId
          ? progress.conversationHistory.filter(
              msg => !msg.characterId || msg.characterId === characterId
            )
          : progress.conversationHistory.filter(msg => msg.role === 'dm' || msg.role === 'user');

        if (filteredHistory.length > 0) {
          setMessages(filteredHistory);
        }
      }
    } catch (error) {
      console.error('加载游戏上下文失败:', error);
      Alert.alert('错误', '加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading, streamingMessage]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !script || !playerCharacter) return;
    if (!pc.ensurePoints()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSending(true);
    setStreamingMessage(null); // 确保清空之前的流式消息

    try {
      let result: { content: string; reasoning?: string };

      // 流式回调函数
      const handleStream = (content: string, reasoning?: string) => {
        console.log('🎨 UI 更新流式消息:', content.length, '字符');
        // 使用 requestAnimationFrame 确保 UI 更新
        requestAnimationFrame(() => {
          setStreamingMessage({ content, reasoning });
        });
      };

      if (targetCharacter) {
        // 与角色对话
        result = await talkToCharacter(
          targetCharacter,
          playerCharacter,
          script,
          messages,
          userMessage.content,
          handleStream,
          enableReasoning
        );
      } else {
        // 与DM对话
        result = await talkToDM(
          script,
          playerCharacter,
          messages,
          userMessage.content,
          handleStream,
          enableReasoning
        );
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: targetCharacter ? 'character' : 'dm',
        characterId: targetCharacter?.id,
        content: result.content,
        reasoning: result.reasoning,
        timestamp: Date.now(),
      };

      // 先清除流式消息和发送状态，再添加完整消息
      setStreamingMessage(null);
      setSending(false);
      setMessages(prev => [...prev, aiMessage]);

      // AI 回复成功后扣除积分
      await pc.consume();

      // 保存对话历史（使用更新后的消息列表）
      const progress = await getGameProgress(script.id);
      if (progress) {
        // 移除当前角色的旧对话记录
        const otherConversations = progress.conversationHistory.filter(
          msg => targetCharacter ? msg.characterId !== targetCharacter.id : msg.role !== 'dm'
        );

        // 添加当前对话的所有消息
        const currentConversation = [...messages, userMessage, aiMessage];

        // 合并所有对话
        progress.conversationHistory = [...otherConversations, ...currentConversation];
        await saveGameProgress(progress);
      }
    } catch (error: any) {
      console.error('AI 对话失败:', error);
      Alert.alert('错误', error.message || '对话失败，请重试');

      // 添加错误提示消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'dm',
        content: '抱歉，我现在无法回答。请稍后再试。',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage(null); // 清除流式消息
    } finally {
      setSending(false);
    }
  };

  const toggleReasoning = (messageId: string) => {
    setShowReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const hasReasoning = enableReasoning && !!message.reasoning; // 只有启用思考链时才显示
    const isReasoningVisible = showReasoning[message.id];

    return (
      <View
        key={message.id}
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
        ]}
      >
        {/* 消息气泡 */}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <LinearGradient
            colors={
              isUser
                ? ['rgba(107,92,231,0.3)', 'rgba(201,169,110,0.2)']
                : ['rgba(27,31,59,0.4)', 'rgba(107,92,231,0.2)']
            }
            style={styles.bubbleGradient}
          />

          {/* 角色标识 */}
          {!isUser && (
            <View style={styles.roleTag}>
              <Feather
                name={message.role === 'dm' ? 'user' : 'users'}
                size={12}
                color={COLORS.accent}
              />
              <Text style={styles.roleText}>
                {message.role === 'dm'
                  ? 'DM'
                  : targetCharacter?.name || '角色'}
              </Text>
            </View>
          )}

          {/* 消息内容 */}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>

          {/* 思考过程按钮 - 只在启用思考链时显示 */}
          {hasReasoning && (
            <TouchableOpacity
              style={styles.reasoningButton}
              onPress={() => toggleReasoning(message.id)}
            >
              <Feather
                name={isReasoningVisible ? 'eye-off' : 'eye'}
                size={14}
                color={COLORS.accent}
              />
              <Text style={styles.reasoningButtonText}>
                {isReasoningVisible ? '隐藏思考过程' : '查看思考过程'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 思考过程展开区域 - 只在启用思考链时显示 */}
        {hasReasoning && isReasoningVisible && (
          <View style={styles.reasoningContainer}>
            <LinearGradient
              colors={['rgba(201,169,110,0.15)', 'rgba(107,92,231,0.1)']}
              style={styles.reasoningGradient}
            />
            <View style={styles.reasoningHeader}>
              <Feather name="cpu" size={14} color={COLORS.accent} />
              <Text style={styles.reasoningTitle}>AI 思考过程</Text>
            </View>
            <Text style={styles.reasoningText}>{message.reasoning}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.background, COLORS.secondary]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 顶部导航 */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {targetCharacter ? `与 ${targetCharacter.name} 对话` : '与 DM 对话'}
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setEnableReasoning(!enableReasoning)}
        >
          <Feather
            name={enableReasoning ? "zap" : "zap-off"}
            size={20}
            color={enableReasoning ? COLORS.accent : COLORS.textGray}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* 思考链提示 */}
      {enableReasoning && (
        <View style={styles.reasoningBanner}>
          <Feather name="info" size={14} color={COLORS.accent} />
          <Text style={styles.reasoningBannerText}>
            思考链已启用 - AI 会展示推理过程
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* 消息列表 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}

          {/* 流式输出中的消息 */}
          {sending && streamingMessage && streamingMessage.content && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={[styles.messageBubble, styles.aiBubble, styles.streamingBubble]}>
                <LinearGradient
                  colors={['rgba(27,31,59,0.4)', 'rgba(107,92,231,0.2)']}
                  style={styles.bubbleGradient}
                />

                {/* 角色标识 */}
                <View style={styles.roleTag}>
                  <Feather
                    name={targetCharacter ? 'users' : 'user'}
                    size={12}
                    color={COLORS.accent}
                  />
                  <Text style={styles.roleText}>
                    {targetCharacter ? targetCharacter.name : 'DM'}
                  </Text>
                  <View style={styles.streamingIndicator}>
                    <Text style={styles.streamingDot}>●</Text>
                  </View>
                </View>

                {/* 流式内容 */}
                <Text style={styles.messageText}>
                  {streamingMessage.content}
                  <Text style={styles.cursor}>▊</Text>
                </Text>

                {/* 流式思考过程 - 只在启用思考链时显示 */}
                {enableReasoning && streamingMessage.reasoning && (
                  <View style={styles.streamingReasoningContainer}>
                    <View style={styles.reasoningHeader}>
                      <Feather name="cpu" size={12} color={COLORS.accent} />
                      <Text style={styles.streamingReasoningTitle}>思考中...</Text>
                    </View>
                    <Text style={styles.streamingReasoningText}>
                      {streamingMessage.reasoning}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 等待 AI 响应的加载动画 */}
          {sending && (!streamingMessage || !streamingMessage.content) && (
            <Animated.View style={[styles.sendingContainer, { opacity: fadeAnim }]}>
              <View style={styles.sendingContent}>
                <Text style={styles.sendingIcon}>✨</Text>
                <Text style={styles.sendingText}>正在思考</Text>
                <View style={styles.dotsContainer}>
                  <Animated.Text style={[styles.dot, { opacity: dot1Anim }]}>●</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dot2Anim }]}>●</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dot3Anim }]}>●</Animated.Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* 输入框 */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['rgba(107,92,231,0.2)', 'rgba(27,31,59,0.15)']}
            style={styles.inputGradient}
          />
          <TextInput
            style={styles.input}
            placeholder="输入你的问题..."
            placeholderTextColor={COLORS.textGray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <LinearGradient
              colors={
                !inputText.trim() || sending
                  ? ['rgba(107,92,231,0.3)', 'rgba(201,169,110,0.2)']
                  : [COLORS.primary, COLORS.accent]
              }
              style={styles.sendButtonGradient}
            >
              <Feather name="send" size={20} color={COLORS.textLight} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasoningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(201,169,110,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,169,110,0.3)',
  },
  reasoningBannerText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: SPACING.lg,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: RADIUS.large,
    padding: SPACING.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  userBubble: {
    borderColor: 'rgba(107,92,231,0.5)',
  },
  aiBubble: {
    borderColor: 'rgba(27,31,59,0.5)',
  },
  bubbleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.textLight,
  },
  reasoningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,169,110,0.2)',
  },
  reasoningButtonText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  reasoningContainer: {
    marginTop: 8,
    maxWidth: '85%',
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.3)',
    overflow: 'hidden',
  },
  reasoningGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reasoningTitle: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  reasoningText: {
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  sendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING.md,
  },
  sendingText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(22,26,45,0.6)',
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textDark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursor: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  streamingReasoningContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,169,110,0.2)',
  },
  streamingReasoningTitle: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
  },
  streamingReasoningText: {
    fontSize: 12,
    color: COLORS.textGray,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  streamingBubble: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  streamingIndicator: {
    marginLeft: 6,
  },
  streamingDot: {
    fontSize: 8,
    color: COLORS.accent,
  },
  sendingContent: {
    alignItems: 'center',
  },
  sendingIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    fontSize: 16,
    color: COLORS.accent,
  },
});
