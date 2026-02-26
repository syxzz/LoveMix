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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message, Script, Character, Intel } from '../types';
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
  const [enableReasoning, setEnableReasoning] = useState(false); // 默认关闭思考链显示
  const [clueModalVisible, setClueModalVisible] = useState(false); // 线索弹窗
  const [clueModalTab, setClueModalTab] = useState<'clues' | 'intels'>('clues'); // 线索弹窗标签
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]); // 已发现的线索ID
  const [intels, setIntels] = useState<Intel[]>([]); // 已知情报列表
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
      setDiscoveredClues(progress.discoveredClues || []); // 加载已发现的线索
      setIntels(progress.intels || []); // 加载已知情报

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

  // 从消息中提取新线索
  const extractIntels = (content: string): Intel[] => {
    const newIntels: Intel[] = [];
    const lines = content.split('\n');
    let inClueSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 检测是否进入新线索部分
      if (trimmedLine.includes('**新线索**') || trimmedLine.includes('新线索：')) {
        inClueSection = true;
        continue;
      }

      // 检测是否离开新线索部分
      if (inClueSection && (trimmedLine.startsWith('**') || trimmedLine === '')) {
        if (!trimmedLine.includes('新线索')) {
          inClueSection = false;
        }
        continue;
      }

      // 提取线索内容
      if (inClueSection && trimmedLine.startsWith('-')) {
        const clueText = trimmedLine.substring(1).trim();

        // 提取分类信息
        const characterMatch = clueText.match(/（人物[：:](.*?)）/);
        const itemMatch = clueText.match(/（物品[：:](.*?)）/);

        if (characterMatch) {
          const target = characterMatch[1].trim();
          const content = clueText.replace(/（人物[：:].*?）/, '').trim();
          newIntels.push({
            id: `intel_${Date.now()}_${newIntels.length}`,
            content,
            type: 'character',
            target,
            timestamp: Date.now(),
          });
        } else if (itemMatch) {
          const target = itemMatch[1].trim();
          const content = clueText.replace(/（物品[：:].*?）/, '').trim();
          newIntels.push({
            id: `intel_${Date.now()}_${newIntels.length}`,
            content,
            type: 'item',
            target,
            timestamp: Date.now(),
          });
        }
      }
    }

    return newIntels;
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending || !script || !playerCharacter) return;
    if (!pc.ensurePoints()) return;

    const timestamp = Date.now();
    const userMessage: Message = {
      id: `${timestamp}_user`,
      role: 'user',
      content: inputText.trim(),
      timestamp,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSending(true);
    setStreamingMessage(null);

    try {
      let result: { content: string; reasoning?: string };
      let firstMessageComplete = false;
      let fullContent = '';

      // 流式回调函数
      const handleStream = (content: string, reasoning?: string) => {
        fullContent = content;

        // 检测是否包含分隔符
        const separatorIndex = content.indexOf('\n---\n');

        if (separatorIndex !== -1 && !firstMessageComplete) {
          // 找到第一个分隔符，只显示第一条消息
          const firstMessage = content.substring(0, separatorIndex).trim();
          firstMessageComplete = true;

          requestAnimationFrame(() => {
            setStreamingMessage({ content: firstMessage, reasoning });
          });
        } else if (!firstMessageComplete) {
          // 还没遇到分隔符，继续流式输出
          requestAnimationFrame(() => {
            setStreamingMessage({ content, reasoning });
          });
        }
      };

      if (targetCharacter) {
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
        result = await talkToDM(
          script,
          playerCharacter,
          messages,
          userMessage.content,
          handleStream,
          enableReasoning
        );
      }

      // 按分隔符拆分消息
      const messageParts = result.content
        .split(/\n---\n/)
        .map(part => part.trim())
        .filter(part => part.length > 0);

      console.log('📨 消息拆分结果:', messageParts.length, '条消息');

      // 提取新线索并保存到情报
      const newIntels = extractIntels(result.content);
      if (newIntels.length > 0) {
        console.log('🔍 提取到新线索:', newIntels.length, '条');
        setIntels(prev => [...prev, ...newIntels]);
      }

      // 清除流式消息
      setStreamingMessage(null);
      setSending(false);

      // 添加第一条消息
      if (messageParts.length > 0) {
        const baseTimestamp = Date.now();
        const firstAiMessage: Message = {
          id: `${baseTimestamp}_ai_0`,
          role: targetCharacter ? 'character' : 'dm',
          characterId: targetCharacter?.id,
          content: messageParts[0],
          reasoning: result.reasoning,
          timestamp: baseTimestamp,
        };

        setMessages(prev => [...prev, firstAiMessage]);

        // 如果有后续消息，逐条添加（延迟发送模拟群聊效果）
        if (messageParts.length > 1) {
          for (let i = 1; i < messageParts.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800)); // 延迟 800ms

            const nextMessage: Message = {
              id: `${baseTimestamp}_ai_${i}`,
              role: targetCharacter ? 'character' : 'dm',
              characterId: targetCharacter?.id,
              content: messageParts[i],
              timestamp: baseTimestamp + i,
            };

            setMessages(prev => [...prev, nextMessage]);
          }
        }

        // AI 回复成功后扣除积分
        await pc.consume();

        // 保存对话历史
        const progress = await getGameProgress(script.id);
        if (progress) {
          const otherConversations = progress.conversationHistory.filter(
            msg => targetCharacter ? msg.characterId !== targetCharacter.id : msg.role !== 'dm'
          );

          // 构建所有新消息
          const messageRole = targetCharacter ? 'character' : 'dm';
          const baseTimestamp = Date.now();
          const allNewMessages: Message[] = [
            userMessage,
            ...messageParts.map((part, index) => ({
              id: `${baseTimestamp}_msg_${index}`,
              role: messageRole as 'character' | 'dm',
              characterId: targetCharacter?.id,
              content: part,
              reasoning: index === 0 ? result.reasoning : undefined,
              timestamp: baseTimestamp + index,
            }))
          ];

          progress.conversationHistory = [...otherConversations, ...messages, ...allNewMessages];
          progress.intels = intels; // 保存情报
          await saveGameProgress(progress);
        }
      }
    } catch (error: any) {
      console.error('AI 对话失败:', error);
      Alert.alert('错误', error.message || '对话失败，请重试');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'dm',
        content: '抱歉，我现在无法回答。请稍后再试。',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage(null);
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
            <View key="streaming-message" style={[styles.messageWrapper, styles.aiMessageWrapper]}>
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
          {/* 线索按钮 */}
          <TouchableOpacity
            style={styles.clueButton}
            onPress={() => setClueModalVisible(true)}
          >
            <Feather name="file-text" size={18} color={COLORS.accent} />
          </TouchableOpacity>
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

      {/* 线索弹窗 */}
      <Modal
        visible={clueModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 弹窗头部 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>线索与情报</Text>
              <TouchableOpacity onPress={() => setClueModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* 标签切换 */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, clueModalTab === 'clues' && styles.tabActive]}
                onPress={() => setClueModalTab('clues')}
              >
                <Text style={[styles.tabText, clueModalTab === 'clues' && styles.tabTextActive]}>
                  已知线索
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, clueModalTab === 'intels' && styles.tabActive]}
                onPress={() => setClueModalTab('intels')}
              >
                <Text style={[styles.tabText, clueModalTab === 'intels' && styles.tabTextActive]}>
                  已知情报
                </Text>
              </TouchableOpacity>
            </View>

            {/* 内容区域 */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {clueModalTab === 'clues' ? (
                <View style={styles.cluesContent}>
                  {script && script.clues.length > 0 ? (
                    <>
                      {/* 关键线索 */}
                      {script.clues.filter(c => c.type === 'key').length > 0 && (
                        <View style={styles.clueSection}>
                          <Text style={styles.clueSectionTitle}>关键线索</Text>
                          {script.clues
                            .filter(c => c.type === 'key')
                            .map(clue => (
                              <View key={clue.id} style={styles.clueCard}>
                                <View style={styles.clueHeader}>
                                  <Feather name="alert-circle" size={16} color="#ff6b6b" />
                                  <Text style={styles.clueName}>{clue.name}</Text>
                                </View>
                                <Text style={styles.clueLocation}>发现地点：{clue.location}</Text>
                                <Text style={styles.clueDescription}>{clue.description}</Text>
                              </View>
                            ))}
                        </View>
                      )}

                      {/* 重要线索 */}
                      {script.clues.filter(c => c.type === 'important').length > 0 && (
                        <View style={styles.clueSection}>
                          <Text style={styles.clueSectionTitle}>重要线索</Text>
                          {script.clues
                            .filter(c => c.type === 'important')
                            .map(clue => (
                              <View key={clue.id} style={styles.clueCard}>
                                <View style={styles.clueHeader}>
                                  <Feather name="info" size={16} color="#ffa500" />
                                  <Text style={styles.clueName}>{clue.name}</Text>
                                </View>
                                <Text style={styles.clueLocation}>发现地点：{clue.location}</Text>
                                <Text style={styles.clueDescription}>{clue.description}</Text>
                              </View>
                            ))}
                        </View>
                      )}

                      {/* 普通线索 */}
                      {script.clues.filter(c => c.type === 'normal').length > 0 && (
                        <View style={styles.clueSection}>
                          <Text style={styles.clueSectionTitle}>普通线索</Text>
                          {script.clues
                            .filter(c => c.type === 'normal')
                            .map(clue => (
                              <View key={clue.id} style={styles.clueCard}>
                                <View style={styles.clueHeader}>
                                  <Feather name="file-text" size={16} color="#4a90e2" />
                                  <Text style={styles.clueName}>{clue.name}</Text>
                                </View>
                                <Text style={styles.clueLocation}>发现地点：{clue.location}</Text>
                                <Text style={styles.clueDescription}>{clue.description}</Text>
                              </View>
                            ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.emptyText}>暂无线索</Text>
                  )}
                </View>
              ) : (
                <View style={styles.intelsContent}>
                  {intels.length > 0 ? (
                    <>
                      {/* 人物情报 */}
                      {intels.filter(i => i.type === 'character').length > 0 && (
                        <View style={styles.clueSection}>
                          <Text style={styles.clueSectionTitle}>人物情报</Text>
                          {/* 按人物分组 */}
                          {Array.from(new Set(intels.filter(i => i.type === 'character').map(i => i.target))).map(target => (
                            <View key={target} style={styles.intelGroup}>
                              <View style={styles.intelTargetHeader}>
                                <Feather name="user" size={16} color={COLORS.accent} />
                                <Text style={styles.intelTargetName}>{target}</Text>
                              </View>
                              {intels
                                .filter(i => i.type === 'character' && i.target === target)
                                .map(intel => (
                                  <View key={intel.id} style={styles.intelItem}>
                                    <Text style={styles.intelBullet}>•</Text>
                                    <Text style={styles.intelContent}>{intel.content}</Text>
                                  </View>
                                ))}
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 物品情报 */}
                      {intels.filter(i => i.type === 'item').length > 0 && (
                        <View style={styles.clueSection}>
                          <Text style={styles.clueSectionTitle}>物品情报</Text>
                          {/* 按物品分组 */}
                          {Array.from(new Set(intels.filter(i => i.type === 'item').map(i => i.target))).map(target => (
                            <View key={target} style={styles.intelGroup}>
                              <View style={styles.intelTargetHeader}>
                                <Feather name="package" size={16} color={COLORS.accent} />
                                <Text style={styles.intelTargetName}>{target}</Text>
                              </View>
                              {intels
                                .filter(i => i.type === 'item' && i.target === target)
                                .map(intel => (
                                  <View key={intel.id} style={styles.intelItem}>
                                    <Text style={styles.intelBullet}>•</Text>
                                    <Text style={styles.intelContent}>{intel.content}</Text>
                                  </View>
                                ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.emptyText}>暂无情报</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  clueButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.large,
    borderTopRightRadius: RADIUS.large,
    height: '60%',
    paddingTop: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  cluesContent: {
    paddingBottom: SPACING.xl,
  },
  intelsContent: {
    paddingBottom: SPACING.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textGray,
    fontSize: 14,
    marginTop: SPACING.xl,
  },
  clueSection: {
    marginBottom: SPACING.lg,
  },
  clueSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  clueCard: {
    backgroundColor: 'rgba(27,31,59,0.3)',
    borderRadius: RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  clueName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  clueLocation: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: SPACING.xs,
  },
  clueDescription: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  intelGroup: {
    marginBottom: SPACING.md,
  },
  intelTargetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  intelTargetName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  intelItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  intelBullet: {
    fontSize: 14,
    color: COLORS.textGray,
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  intelContent: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
});
