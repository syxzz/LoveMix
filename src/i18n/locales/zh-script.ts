/**
 * 剧本杀相关中文翻译
 */

export default {
  // 欢迎页
  welcome: {
    appName: 'Mirrage',
    tagline: '镜像蜃景，剧本是假，折射的真',
    startButton: '开始游戏',
    guestLogin: '游客快速体验',
    guestSubtitle: '无需注册，立即游玩',
    hasAccount: '已有账号？',
    loginNow: '立即登录',
  },

  // 登录页
  login: {
    title: '登录',
    welcomeBack: '欢迎回来',
    subtitle: '登录继续你的推理之旅',
    logoSubtext: '真相只有一个',
    email: '邮箱',
    emailPlaceholder: '邮箱地址',
    password: '密码',
    passwordPlaceholder: '密码',
    forgotPassword: '忘记密码？',
    loginButton: '登录',
    loggingIn: '登录中...',
    or: '或',
    noAccount: '还没有账号？',
    registerNow: '立即注册',
    alert: {
      title: '提示',
      fillEmailPassword: '请输入邮箱和密码',
      loginFailed: '登录失败',
      tryAgain: '请稍后重试',
    },
  },

  // 注册页
  register: {
    title: '注册',
    createAccount: '创建账号',
    subtitle: '开启你的推理之旅',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    username: '用户名',
    usernamePlaceholder: '请输入用户名',
    password: '密码',
    passwordPlaceholder: '至少6位密码',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '再次输入密码',
    registerButton: '注册',
    hasAccount: '已有账号？',
    loginNow: '立即登录',
    alert: {
      title: '提示',
      fillAllFields: '请填写所有字段',
      passwordMismatch: '两次输入的密码不一致',
      registerFailed: '注册失败',
      tryAgain: '请稍后重试',
    },
  },

  // 首页 - 剧本列表
  home: {
    greeting: '你好，{{name}}',
    defaultName: '侦探',
    title: '选择剧本',
    subtitle: '开始你的推理之旅',
    difficulty: {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    },
    duration: '时长',
    characters: '角色数',
    startGame: '开始游戏',
    continueGame: '继续游戏',
    completed: '已完成',
  },

  // 剧本详情
  scriptDetail: {
    title: '剧本详情',
    background: '故事背景',
    selectCharacter: '选择角色',
    characterInfo: '角色信息',
    name: '姓名',
    age: '年龄',
    gender: '性别',
    occupation: '职业',
    personality: '性格',
    startGame: '开始游戏',
    male: '男',
    female: '女',
  },

  // 游戏主界面
  game: {
    phases: {
      intro: '开场介绍',
      search: '搜证阶段',
      discuss: '讨论阶段',
      vote: '投票阶段',
      result: '结果揭晓',
    },
    myCharacter: '我的角色',
    clues: '线索',
    dialog: '对话',
    vote: '投票',
    nextPhase: '下一阶段',
    dm: 'DM主持人',
    viewClues: '查看线索',
    talkTo: '与...对话',
    allCharacters: '所有角色',
  },

  // 线索页面
  clue: {
    title: '线索列表',
    discovered: '已发现',
    total: '总计',
    types: {
      key: '关键线索',
      important: '重要线索',
      normal: '普通线索',
    },
    location: '位置',
    description: '描述',
    noClues: '暂无线索',
    searchMore: '继续搜证发现更多线索',
  },

  // 对话页面
  dialog: {
    title: '对话',
    selectCharacter: '选择对话对象',
    talkToDM: '与DM对话',
    inputPlaceholder: '输入你想说的话或问题...',
    send: '发送',
    thinking: 'AI思考中...',
  },

  // 投票页面
  vote: {
    title: '投票',
    subtitle: '根据你收集的证据，选择你认为的凶手',
    selectSuspect: '选择嫌疑人',
    reason: '推理依据（可选）',
    reasonPlaceholder: '说说你的推理过程...',
    confirm: '确认投票',
    warning: '投票后将无法修改，请谨慎选择',
  },

  // 结果页面
  result: {
    success: '破案成功！',
    failed: '推理失败',
    successMessage: '恭喜你，成功找出了真凶！',
    failedMessage: '很遗憾，你的推理有误',
    truth: '案件真相',
    murderer: '真凶',
    motive: '作案动机',
    process: '案件经过',
    yourChoice: '你的选择',
    backToHome: '返回首页',
    playAgain: '再玩一次',
  },

  // 个人中心
  profile: {
    title: '个人中心',
    email: '邮箱',
    username: '用户名',
    stats: '游戏统计',
    gamesPlayed: '游玩次数',
    successRate: '破案率',
    completedScripts: '完成剧本',
    guestMode: '游客模式',
    guestTip: '您当前使用游客模式，数据仅保存在本地。注册账号后可享受：',
    guestBenefit1: '• 数据云端同步，永不丢失',
    guestBenefit2: '• 解锁更多剧本',
    guestBenefit3: '• 社区交流讨论',
    guestBenefit4: '• 升级会员享更多特权',
    registerNow: '立即注册',
    logout: '退出登录',
  },

  // 设置页面
  settings: {
    title: '设置',
    language: '语言',
    languageOptions: {
      zh: '简体中文',
      en: 'English',
      ja: '日本語',
    },
    apiKey: 'OpenAI API密钥',
    apiKeyPlaceholder: '输入你的API密钥',
    apiKeyDescription: '用于AI对话功能，不设置将使用默认配置',
    about: '关于',
    version: '版本',
    privacy: '隐私政策',
    terms: '服务条款',
  },

  // 通用
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    retry: '重试',
  },
};
