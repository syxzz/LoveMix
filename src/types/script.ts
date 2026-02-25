/**
 * 剧本杀相关类型定义
 */

// 难度等级
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 游戏阶段
export type GamePhase = 'intro' | 'search' | 'discuss' | 'vote' | 'result';

// 线索类型
export type ClueType = 'key' | 'important' | 'normal';

// 角色信息
export interface Character {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  background: string;
  secret: string;
  goal: string;
  avatar?: string;
}

// 线索信息
export interface Clue {
  id: string;
  name: string;
  type: ClueType;
  location: string;
  description: string;
  discovered: boolean;
}

// 剧本信息
export interface Script {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: string; // 例如: "60-90分钟"
  characterCount: number;
  coverImage?: string;
  storyBackground: string;
  characters: Character[];
  clues: Clue[];
  murderer: string; // 凶手角色ID
  motive: string; // 作案动机
  truth: string; // 完整真相
}

// 游戏进度
export interface GameProgress {
  scriptId: string;
  selectedCharacterId: string;
  currentPhase: GamePhase;
  discoveredClues: string[]; // 已发现的线索ID列表
  conversationHistory: Message[];
  votedCharacterId?: string;
  completed: boolean;
  success?: boolean;
}

// 对话消息
export interface Message {
  id: string;
  role: 'user' | 'dm' | 'character';
  characterId?: string; // 如果是角色发言
  content: string;
  reasoning?: string; // AI的思考过程（思考链）
  timestamp: number;
}

// 投票选项
export interface VoteOption {
  characterId: string;
  characterName: string;
  reason?: string;
}
