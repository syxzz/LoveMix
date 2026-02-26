/**
 * GroupDiscussScreen - 群聊讨论页面
 * 所有角色在一个聊天室中讨论，AI控制其他角色
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message, Script, Character } from '../types';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { Feather } from '@expo/vector-icons';
import { talkToCharacter } from '../services/ai';
import { getScriptById } from '../data/scripts';
import { getGameProgress, saveGameProgress } from '../services/storage';

type GroupDiscussScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDiscuss'>;
type GroupDiscussScreenRouteProp = RouteProp<RootStackParamList, 'GroupDiscuss'>;

interface GroupMessage extends Message {
  characterName?: string;
  isPlayer?: boolean;
}

// 消息组件 - 使用 React.memo 优化渲染
const MessageBubble = React.memo<{ message: GroupMessage }>(({ message }) => {
  const isPlayer = message.isPlayer;
  const isDM = message.role === 'dm';

  return (
    <View
      style={[
        styles.messageWrapper,
        isPlayer ? styles.playerMessageWrapper : styles.otherMessageWrapper,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isPlayer ? styles.playerBubble : isDM ? styles.dmBubble : styles.aiBubble,
        ]}
      >
        <LinearGradient
          colors={
            isPlayer
              ? ['rgba(107,92,231,0.3)', 'rgba(201,169,110,0.2)']
              : isDM
              ? ['rgba(27,31,59,0.5)', 'rgba(27,31,59,0.3)']
              : ['rgba(27,31,59,0.4)', 'rgba(107,92,231,0.2)']
          }
          style={styles.bubbleGradient}
        />

        {/* 角色名称 */}
        {!isDM && (
          <View style={styles.characterTag}>
            <Feather
              name={isPlayer ? 'user' : 'users'}
              size={12}
              color={isPlayer ? COLORS.accent : COLORS.textGray}
            />
            <Text style={[styles.characterName, isPlayer && styles.playerName]}>
              {message.characterName || '未知'}
            </Text>
          </View>
        )}

        {/* 消息内容 */}
        <Text style={[styles.messageText, isPlayer && styles.playerMessageText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

export const GroupDiscussScreen: React.FC = () => {
  const navigation = useNavigation<GroupDiscussScreenNavigationProp>();
  const route = useRoute<GroupDiscussScreenRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null);
  const [otherCharacters, setOtherCharacters] = useState<Character[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('');
  const [discussionStopped, setDiscussionStopped] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<GroupMessage | null>(null);
  const aiRequestAbortRef = useRef(false);
  const skipTriggerRef = useRef(false);
  const roundSpokenRef = useRef<Set<string>>(new Set());

  // 加载动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadGameContext();

    // 组件卸载时清理
    return () => {
      console.log('🧹 GroupDiscussScreen 卸载，停止AI讨论');
      setDiscussionStopped(true);
      aiRequestAbortRef.current = true;
      setAiThinking(false);
    };
  }, []);

  // 加载动画效果
  useEffect(() => {
    if (aiThinking) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

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
  }, [aiThinking]);

  // 加载游戏上下文
  const loadGameContext = async () => {
    try {
      const { scriptId } = route.params;
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

      const others = scriptData.characters.filter(
        c => c.id !== progress.selectedCharacterId
      );

      setScript(scriptData);
      setPlayerCharacter(playerChar);
      setOtherCharacters(others);

      // 加载历史讨论记录（只加载群聊消息，排除 DM/1v1 对话）
      const groupHistory = progress.conversationHistory?.filter(
        msg => msg.role === 'character' && msg.characterId
      ) || [];

      if (groupHistory.length > 0) {
        const formattedMessages: GroupMessage[] = groupHistory.map(msg => {
          const char = scriptData.characters.find(c => c.id === msg.characterId);
          return {
            ...msg,
            characterName: char?.name,
            isPlayer: msg.characterId === playerChar.id,
          };
        });
        setMessages(formattedMessages);
      } else {
        // 首次进入，添加开场白
        const welcomeMessage: GroupMessage = {
          id: '1',
          role: 'dm',
          content: '讨论环节开始！大家可以自由发言，分享线索和推理。',
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
      }

      setLoading(false);
    } catch (error) {
      console.error('加载游戏上下文失败:', error);
      Alert.alert('错误', '加载失败，请重试');
      setLoading(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (!loading) {
      console.log('📜 消息列表更新，当前消息数:', messages.length);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading]);

  // 监听消息变化，自动触发下一轮发言
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // 如果讨论已停止，不再触发
    if (discussionStopped) {
      console.log('⏸ 讨论已停止，不触发');
      return;
    }

    // 如果是玩家回合，不触发AI发言
    if (isPlayerTurn) {
      console.log('👤 玩家回合，不触发AI');
      return;
    }

    // 如果AI正在思考，不触发
    if (aiThinking) {
      console.log('🤔 AI正在思考，不触发');
      return;
    }

    // 如果设置了跳过标志，清除标志并返回
    if (skipTriggerRef.current) {
      console.log('⏭️ 跳过自动触发（玩家跳过发言）');
      skipTriggerRef.current = false;
      return;
    }

    if (!loading && messages.length > 0 && !hasTriggeredRef.current) {
      const lastMessage = messages[messages.length - 1];

      console.log('📨 最后一条消息:', lastMessage.role, lastMessage.characterName || 'DM');

      // 如果最后一条消息是DM的欢迎消息，开始AI发言
      if (lastMessage.role === 'dm' && messages.length === 1) {
        console.log('🎬 开始游戏，触发AI发言');
        hasTriggeredRef.current = true;
        setTimeout(() => {
          hasTriggeredRef.current = false;
          triggerAICharacterSpeak();
        }, 2000);
        return;
      }

      // 如果最后一条消息是玩家或AI角色发的，继续下一轮
      if (lastMessage.role === 'character') {
        console.log('💬 角色发言完成，决定下一个发言者');
        hasTriggeredRef.current = true;
        setTimeout(() => {
          hasTriggeredRef.current = false;
          decideNextSpeaker();
        }, 1500);
      }
    }
  }, [messages, loading, aiThinking, isPlayerTurn, discussionStopped]);

  // 触发AI角色发言（按顺序，所有AI角色说完再轮到玩家）
  const triggerAICharacterSpeak = async (forceStart = false) => {
    if (!script || !playerCharacter || otherCharacters.length === 0) return;
    if (discussionStopped) return;
    if (!forceStart && isPlayerTurn) return;
    if (aiRequestAbortRef.current) return;

    // 找到本轮还没发言的AI角色
    const unspoken = otherCharacters.filter(c => !roundSpokenRef.current.has(c.id));
    if (unspoken.length === 0) {
      // 所有AI角色已发言，轮到玩家
      setIsPlayerTurn(true);
      setCurrentSpeaker(playerCharacter?.name || '你');
      return;
    }

    const speakingCharacter = unspoken[0];
    roundSpokenRef.current.add(speakingCharacter.id);

    aiRequestAbortRef.current = false;
    setAiThinking(true);
    setIsPlayerTurn(false);
    setCurrentSpeaker(speakingCharacter.name);

    try {
      const discussionContext = messages
        .filter(msg => msg.role !== 'dm')
        .map(msg => `${msg.characterName || '未知'}: ${msg.content}`)
        .join('\n');

      const prompt = `当前讨论内容：\n${discussionContext}\n\n现在轮到你发言了。请根据你的角色设定，分享你的观点、线索或推理。记住要保护自己的秘密，如果你是凶手要撇清嫌疑。回复要简短（50-100字）。`;

      if (aiRequestAbortRef.current || discussionStopped || (!forceStart && isPlayerTurn)) {
        setAiThinking(false);
        setCurrentSpeaker('');
        setStreamingMessage(null);
        return;
      }

      const streamingMsg: GroupMessage = {
        id: Date.now().toString(),
        role: 'character',
        characterId: speakingCharacter.id,
        characterName: speakingCharacter.name,
        content: '',
        timestamp: Date.now(),
        isPlayer: false,
      };
      setStreamingMessage(streamingMsg);

      const result = await talkToCharacter(
        speakingCharacter,
        playerCharacter,
        script,
        messages,
        prompt,
        (content) => {
          setStreamingMessage({ ...streamingMsg, content });
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 50);
        },
        false
      );

      if (aiRequestAbortRef.current || discussionStopped || (!forceStart && isPlayerTurn)) {
        setAiThinking(false);
        setCurrentSpeaker('');
        setStreamingMessage(null);
        return;
      }

      const aiMessage: GroupMessage = {
        id: streamingMsg.id,
        role: 'character',
        characterId: speakingCharacter.id,
        characterName: speakingCharacter.name,
        content: result.content,
        timestamp: streamingMsg.timestamp,
        isPlayer: false,
      };

      setStreamingMessage(null);
      const updatedMessages = [...messages, aiMessage];
      setMessages(updatedMessages);
      setAiThinking(false);
      setCurrentSpeaker('');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);

      await saveDiscussionProgress(updatedMessages);
    } catch (error: any) {
      console.error('AI 角色发言失败:', error);
      setAiThinking(false);
      setCurrentSpeaker('');
      setStreamingMessage(null);

      if (!discussionStopped && !aiRequestAbortRef.current) {
        setTimeout(() => {
          decideNextSpeaker();
        }, 1000);
      }
    }
  };

  // 决定下一个发言者
  const decideNextSpeaker = () => {
    if (discussionStopped) return;
    triggerAICharacterSpeak();
  };

  // 玩家发言
  const handlePlayerSpeak = async () => {
    if (!inputText.trim() || !script || !playerCharacter) return;

    const playerMessage: GroupMessage = {
      id: Date.now().toString(),
      role: 'character',
      characterId: playerCharacter.id,
      characterName: playerCharacter.name,
      content: inputText.trim(),
      timestamp: Date.now(),
      isPlayer: true,
    };

    // 新一轮开始
    roundSpokenRef.current.clear();

    const updatedMessages = [...messages, playerMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsPlayerTurn(false);

    await saveDiscussionProgress(updatedMessages);
  };

  // 玩家跳过发言
  const handlePlayerSkip = () => {
    // 新一轮开始
    roundSpokenRef.current.clear();
    skipTriggerRef.current = true;
    setIsPlayerTurn(false);
    setCurrentSpeaker('');
    setTimeout(() => {
      triggerAICharacterSpeak(true);
    }, 100);
  };

  // 停止/继续讨论
  const toggleDiscussion = () => {
    if (discussionStopped) {
      // 继续讨论
      console.log('▶️ 继续讨论');
      setDiscussionStopped(false);
      aiRequestAbortRef.current = false; // 清除中断标志
      // 如果不是玩家回合，继续AI发言
      if (!isPlayerTurn && !aiThinking) {
        setTimeout(() => {
          decideNextSpeaker();
        }, 500);
      }
    } else {
      // 停止讨论
      console.log('⏸ 停止讨论');
      setDiscussionStopped(true);
      aiRequestAbortRef.current = true; // 设置中断标志
      setAiThinking(false);
      setIsPlayerTurn(false);
      setCurrentSpeaker('');
    }
  };

  // 保存讨论进度
  const saveDiscussionProgress = async (updatedMessages: GroupMessage[]) => {
    if (!script) return;

    const progress = await getGameProgress(script.id);
    if (progress) {
      // 保留非群聊消息（DM 对话、1v1 角色对话等）
      const nonGroupMessages = progress.conversationHistory.filter(
        msg => !(msg.role === 'character' && msg.characterId)
      );

      // 提取群聊消息（排除 DM 欢迎消息）
      const groupMessages: Message[] = updatedMessages
        .filter(msg => msg.role === 'character' && msg.characterId)
        .map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'dm' | 'character',
          characterId: msg.characterId,
          content: msg.content,
          timestamp: msg.timestamp,
        }));

      progress.conversationHistory = [...nonGroupMessages, ...groupMessages];
      await saveGameProgress(progress);
    }
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
          onPress={() => {
            // 停止AI讨论
            setDiscussionStopped(true);
            aiRequestAbortRef.current = true;
            setAiThinking(false);
            setIsPlayerTurn(false);
            setCurrentSpeaker('');
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>群聊讨论</Text>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={toggleDiscussion}
        >
          <Feather
            name={discussionStopped ? 'play' : 'pause'}
            size={20}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* 当前发言者提示 */}
      {!discussionStopped && (aiThinking || isPlayerTurn) && (
        <View style={styles.speakerBanner}>
          <Feather
            name={isPlayerTurn ? 'user' : 'users'}
            size={14}
            color={isPlayerTurn ? COLORS.accent : COLORS.textGray}
          />
          <Text style={styles.speakerText}>
            {isPlayerTurn ? '轮到你发言了' : `${currentSpeaker} 正在发言...`}
          </Text>
        </View>
      )}

      {/* 讨论已停止提示 */}
      {discussionStopped && (
        <View style={styles.stoppedBanner}>
          <Feather name="pause-circle" size={14} color={COLORS.error} />
          <Text style={styles.stoppedText}>讨论已暂停</Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={toggleDiscussion}
          >
            <Text style={styles.resumeButtonText}>继续讨论</Text>
          </TouchableOpacity>
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
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* 流式消息 */}
          {streamingMessage && (
            <MessageBubble key={streamingMessage.id} message={streamingMessage} />
          )}

          {/* AI思考中 */}
          {aiThinking && !streamingMessage && (
            <Animated.View style={[styles.thinkingContainer, { opacity: fadeAnim }]}>
              <View style={styles.thinkingContent}>
                <Text style={styles.thinkingIcon}>💭</Text>
                <Text style={styles.thinkingText}>{currentSpeaker} 正在思考</Text>
                <View style={styles.dotsContainer}>
                  <Animated.Text style={[styles.dot, { opacity: dot1Anim }]}>●</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dot2Anim }]}>●</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dot3Anim }]}>●</Animated.Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* 输入区域 */}
        <View style={styles.inputArea}>
          <LinearGradient
            colors={['rgba(107,92,231,0.2)', 'rgba(27,31,59,0.15)']}
            style={styles.inputGradient}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={
                discussionStopped
                  ? '讨论已暂停...'
                  : isPlayerTurn
                  ? '轮到你发言了，说点什么...'
                  : '等待其他角色发言...'
              }
              placeholderTextColor={COLORS.textGray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!discussionStopped && isPlayerTurn}
            />
            {isPlayerTurn && !discussionStopped && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handlePlayerSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>跳过</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || discussionStopped || !isPlayerTurn) && styles.sendButtonDisabled,
              ]}
              onPress={handlePlayerSpeak}
              disabled={!inputText.trim() || discussionStopped || !isPlayerTurn}
            >
              <LinearGradient
                colors={
                  !inputText.trim() || discussionStopped || !isPlayerTurn
                    ? ['rgba(107,92,231,0.3)', 'rgba(201,169,110,0.2)']
                    : [COLORS.primary, COLORS.accent]
                }
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={18} color={COLORS.textLight} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  placeholder: {
    width: 40,
  },
  stopButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(201,169,110,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,169,110,0.3)',
  },
  speakerText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  stoppedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231,76,60,0.3)',
  },
  stoppedText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },
  resumeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.small,
  },
  resumeButtonText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
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
  playerMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: RADIUS.large,
    padding: SPACING.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  playerBubble: {
    borderColor: 'rgba(107,92,231,0.5)',
  },
  aiBubble: {
    borderColor: 'rgba(27,31,59,0.5)',
  },
  dmBubble: {
    borderColor: 'rgba(201,169,110,0.5)',
    maxWidth: '95%',
  },
  bubbleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  characterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  characterName: {
    fontSize: 11,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  playerName: {
    color: COLORS.accent,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  playerMessageText: {
    color: COLORS.textLight,
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
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING.md,
  },
  thinkingContent: {
    alignItems: 'center',
  },
  thinkingIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  thinkingText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    overflow: 'hidden',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(22,26,45,0.6)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipButton: {
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.4)',
    backgroundColor: 'rgba(201,169,110,0.1)',
  },
  skipButtonText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
