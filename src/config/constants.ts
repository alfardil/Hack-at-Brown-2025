export const GAME_PHASES = {
  INTRO: 'intro',
  OPENING: 'opening',
  REBUTTAL: 'rebuttal',
  CLOSING: 'closing',
  JUDGMENT: 'judgment'
} as const;

export const TURN_DURATION = 60000; // 60 seconds
export const REBUTTAL_DURATION = 45000; // 45 seconds
export const CLOSING_DURATION = 30000; // 30 seconds
export const judgeImage = '/assets/judge-cat.png';  // Make sure this matches your file structure 