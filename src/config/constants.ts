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
// Using a placeholder cat image from a reliable source
export const judgeImage = 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&h=300&fit=crop'; // Professional cat in suit
