/**
 * マーダーミステリーゲーム日本語翻訳
 */

export default {
  // ウェルカムページ
  welcome: {
    appName: 'AIマーダーミステリー',
    tagline: 'AI駆動の一人用推理ゲーム',
    startButton: 'ゲーム開始',
    guestLogin: 'ゲストで体験',
    guestSubtitle: '登録不要、すぐにプレイ',
    hasAccount: 'アカウントをお持ちですか？',
    loginNow: 'ログイン',
  },

  // ログインページ
  login: {
    title: 'ログイン',
    welcomeBack: 'おかえりなさい',
    subtitle: '推理の旅を続ける',
    logoSubtext: '真実はいつもひとつ',
    email: 'メール',
    emailPlaceholder: 'メールアドレス',
    password: 'パスワード',
    passwordPlaceholder: 'パスワード',
    forgotPassword: 'パスワードを忘れた？',
    loginButton: 'ログイン',
    loggingIn: 'ログイン中...',
    or: 'または',
    noAccount: 'アカウントをお持ちでない方',
    registerNow: '今すぐ登録',
    alert: {
      title: 'お知らせ',
      fillEmailPassword: 'メールとパスワードを入力してください',
      loginFailed: 'ログイン失敗',
      tryAgain: '後でもう一度お試しください',
    },
  },

  // 登録ページ
  register: {
    title: '登録',
    createAccount: 'アカウント作成',
    subtitle: '推理の旅を始める',
    email: 'メール',
    emailPlaceholder: 'メールアドレスを入力',
    username: 'ユーザー名',
    usernamePlaceholder: 'ユーザー名を入力',
    password: 'パスワード',
    passwordPlaceholder: '6文字以上',
    confirmPassword: 'パスワード確認',
    confirmPasswordPlaceholder: 'パスワードを再入力',
    registerButton: '登録',
    hasAccount: 'アカウントをお持ちですか？',
    loginNow: 'ログイン',
    alert: {
      title: 'お知らせ',
      fillAllFields: 'すべての項目を入力してください',
      passwordMismatch: 'パスワードが一致しません',
      registerFailed: '登録失敗',
      tryAgain: '後でもう一度お試しください',
    },
  },

  // ホーム - シナリオリスト
  home: {
    greeting: 'こんにちは、{{name}}',
    defaultName: '探偵',
    title: 'シナリオを選択',
    subtitle: '推理を始めましょう',
    difficulty: {
      easy: '簡単',
      medium: '普通',
      hard: '難しい',
    },
    duration: 'プレイ時間',
    characters: 'キャラクター数',
    startGame: 'ゲーム開始',
    continueGame: '続きから',
    completed: '完了済み',
  },

  // シナリオ詳細
  scriptDetail: {
    title: 'シナリオ詳細',
    background: 'ストーリー背景',
    selectCharacter: 'キャラクター選択',
    characterInfo: 'キャラクター情報',
    name: '名前',
    age: '年齢',
    gender: '性別',
    occupation: '職業',
    personality: '性格',
    startGame: 'ゲーム開始',
    male: '男性',
    female: '女性',
  },

  // ゲームメイン画面
  game: {
    phases: {
      intro: 'オープニング',
      search: '捜査フェーズ',
      discuss: '議論フェーズ',
      vote: '投票フェーズ',
      result: '真相公開',
    },
    myCharacter: '自分のキャラクター',
    clues: '手がかり',
    dialog: '会話',
    vote: '投票',
    nextPhase: '次のフェーズ',
    dm: 'DMホスト',
    viewClues: '手がかりを見る',
    talkTo: '話しかける',
    allCharacters: '全キャラクター',
  },

  // 手がかりページ
  clue: {
    title: '手がかりリスト',
    discovered: '発見済み',
    total: '合計',
    types: {
      key: '重要な手がかり',
      important: '大事な手がかり',
      normal: '普通の手がかり',
    },
    location: '場所',
    description: '説明',
    noClues: '手がかりがありません',
    searchMore: '捜査を続けて手がかりを見つけましょう',
  },

  // 会話ページ
  dialog: {
    title: '会話',
    selectCharacter: '話す相手を選択',
    talkToDM: 'DMと話す',
    inputPlaceholder: 'メッセージや質問を入力...',
    send: '送信',
    thinking: 'AI思考中...',
  },

  // 投票ページ
  vote: {
    title: '投票',
    subtitle: '集めた証拠から、犯人だと思う人を選んでください',
    selectSuspect: '容疑者を選択',
    reason: '推理根拠（任意）',
    reasonPlaceholder: '推理過程を説明...',
    confirm: '投票確定',
    warning: '投票後は変更できません。慎重に選択してください',
  },

  // 結果ページ
  result: {
    success: '事件解決！',
    failed: '推理失敗',
    successMessage: 'おめでとうございます！真犯人を見つけました！',
    failedMessage: '残念ながら、推理が間違っていました',
    truth: '事件の真相',
    murderer: '真犯人',
    motive: '動機',
    process: '事件の経緯',
    yourChoice: 'あなたの選択',
    backToHome: 'ホームに戻る',
    playAgain: 'もう一度プレイ',
  },

  // プロフィール
  profile: {
    title: 'プロフィール',
    email: 'メール',
    username: 'ユーザー名',
    stats: 'ゲーム統計',
    gamesPlayed: 'プレイ回数',
    successRate: '解決率',
    completedScripts: '完了シナリオ',
    guestMode: 'ゲストモード',
    guestTip: 'ゲストモードでプレイ中です。登録すると：',
    guestBenefit1: '• クラウド同期、データ永久保存',
    guestBenefit2: '• より多くのシナリオ解放',
    guestBenefit3: '• コミュニティ交流',
    guestBenefit4: '• プレミアム会員特典',
    registerNow: '今すぐ登録',
    logout: 'ログアウト',
  },

  // 設定
  settings: {
    title: '設定',
    language: '言語',
    languageOptions: {
      zh: '简体中文',
      en: 'English',
      ja: '日本語',
    },
    apiKey: 'OpenAI APIキー',
    apiKeyPlaceholder: 'APIキーを入力',
    apiKeyDescription: 'AI会話機能用、未設定の場合はデフォルト設定を使用',
    about: 'について',
    version: 'バージョン',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
  },

  // 共通
  common: {
    confirm: '確定',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    back: '戻る',
    loading: '読み込み中...',
    success: '成功',
    error: 'エラー',
    retry: '再試行',
  },
};
