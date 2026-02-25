/**
 * Murder Mystery Game English Translation
 */

export default {
  // Welcome Page
  welcome: {
    appName: 'AI Murder Mystery',
    tagline: 'AI-Powered Solo Detective Game',
    startButton: 'Start Game',
    guestLogin: 'Quick Guest Access',
    guestSubtitle: 'No registration required',
    hasAccount: 'Have an account?',
    loginNow: 'Login Now',
  },

  // Login Page
  login: {
    title: 'Login',
    welcomeBack: 'Welcome Back',
    subtitle: 'Continue your detective journey',
    logoSubtext: 'There is only one truth',
    email: 'Email',
    emailPlaceholder: 'Email address',
    password: 'Password',
    passwordPlaceholder: 'Password',
    forgotPassword: 'Forgot password?',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    or: 'or',
    noAccount: "Don't have an account?",
    registerNow: 'Register Now',
    alert: {
      title: 'Notice',
      fillEmailPassword: 'Please enter email and password',
      loginFailed: 'Login failed',
      tryAgain: 'Please try again later',
    },
  },

  // Register Page
  register: {
    title: 'Register',
    createAccount: 'Create Account',
    subtitle: 'Start your detective journey',
    email: 'Email',
    emailPlaceholder: 'Enter email',
    username: 'Username',
    usernamePlaceholder: 'Enter username',
    password: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter password',
    registerButton: 'Register',
    hasAccount: 'Already have an account?',
    loginNow: 'Login Now',
    alert: {
      title: 'Notice',
      fillAllFields: 'Please fill in all fields',
      passwordMismatch: 'Passwords do not match',
      registerFailed: 'Registration failed',
      tryAgain: 'Please try again later',
    },
  },

  // Home - Script List
  home: {
    greeting: 'Hello, {{name}}',
    defaultName: 'Detective',
    title: 'Choose a Script',
    subtitle: 'Begin your investigation',
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    duration: 'Duration',
    characters: 'Characters',
    startGame: 'Start Game',
    continueGame: 'Continue',
    completed: 'Completed',
  },

  // Script Detail
  scriptDetail: {
    title: 'Script Details',
    background: 'Story Background',
    selectCharacter: 'Select Character',
    characterInfo: 'Character Info',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    occupation: 'Occupation',
    personality: 'Personality',
    startGame: 'Start Game',
    male: 'Male',
    female: 'Female',
  },

  // Game Main Interface
  game: {
    phases: {
      intro: 'Introduction',
      search: 'Investigation',
      discuss: 'Discussion',
      vote: 'Voting',
      result: 'Revelation',
    },
    myCharacter: 'My Character',
    clues: 'Clues',
    dialog: 'Dialog',
    vote: 'Vote',
    nextPhase: 'Next Phase',
    dm: 'DM Host',
    viewClues: 'View Clues',
    talkTo: 'Talk to',
    allCharacters: 'All Characters',
  },

  // Clue Page
  clue: {
    title: 'Clue List',
    discovered: 'Discovered',
    total: 'Total',
    types: {
      key: 'Key Clue',
      important: 'Important Clue',
      normal: 'Normal Clue',
    },
    location: 'Location',
    description: 'Description',
    noClues: 'No clues yet',
    searchMore: 'Continue investigating to find more clues',
  },

  // Dialog Page
  dialog: {
    title: 'Dialog',
    selectCharacter: 'Select character to talk',
    talkToDM: 'Talk to DM',
    inputPlaceholder: 'Type your message or question...',
    send: 'Send',
    thinking: 'AI thinking...',
  },

  // Vote Page
  vote: {
    title: 'Vote',
    subtitle: 'Based on your evidence, select who you think is the murderer',
    selectSuspect: 'Select Suspect',
    reason: 'Reasoning (Optional)',
    reasonPlaceholder: 'Explain your deduction...',
    confirm: 'Confirm Vote',
    warning: 'You cannot change your vote after confirmation',
  },

  // Result Page
  result: {
    success: 'Case Solved!',
    failed: 'Case Unsolved',
    successMessage: 'Congratulations! You found the murderer!',
    failedMessage: 'Unfortunately, your deduction was incorrect',
    truth: 'The Truth',
    murderer: 'Murderer',
    motive: 'Motive',
    process: 'What Happened',
    yourChoice: 'Your Choice',
    backToHome: 'Back to Home',
    playAgain: 'Play Again',
  },

  // Profile
  profile: {
    title: 'Profile',
    email: 'Email',
    username: 'Username',
    stats: 'Game Stats',
    gamesPlayed: 'Games Played',
    successRate: 'Success Rate',
    completedScripts: 'Completed Scripts',
    guestMode: 'Guest Mode',
    guestTip: 'You are in guest mode. Register to enjoy:',
    guestBenefit1: '• Cloud sync, never lose data',
    guestBenefit2: '• Unlock more scripts',
    guestBenefit3: '• Community discussions',
    guestBenefit4: '• Premium membership benefits',
    registerNow: 'Register Now',
    logout: 'Logout',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    languageOptions: {
      zh: '简体中文',
      en: 'English',
      ja: '日本語',
    },
    apiKey: 'OpenAI API Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeyDescription: 'For AI dialog feature, default config will be used if not set',
    about: 'About',
    version: 'Version',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },

  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    retry: 'Retry',
  },
};
