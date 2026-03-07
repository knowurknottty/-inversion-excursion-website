import { openUrl } from './frame-sdk';

// Base URL for the Cell game
const BASE_URL = 'https://cell-game.xyz';

/**
 * Cast template generators for different game states
 */

interface CastTemplate {
  text: string;
  embeds?: string[];
  mentions?: string[];
}

/**
 * Generate victory cast text
 */
export function generateVictoryCast(
  playerName: string,
  score: number,
  rank?: number,
  opponentName?: string
): CastTemplate {
  const templates = [
    `🏆 ${playerName} just dominated the Cell! Score: ${score}${rank ? ` (#${rank} on leaderboard)` : ''}\n\nThink you can do better? Prove it.`,
    `⚔️ Victory is mine! Escaped the Cell with ${score} points.${opponentName ? ` Left @${opponentName} in the dust.` : ''}\n\nWho's next?`,
    `🧠 Another mind freed from the Cell. Final score: ${score}\n\nThe walls are waiting for you...`,
    `🔥 ${playerName} = UNSTOPPABLE\nScore: ${score} | Status: ESCAPED\n\nCan you beat this?`,
  ];
  
  const text = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    text,
    embeds: [`${BASE_URL}?ref=victory&score=${score}&player=${encodeURIComponent(playerName)}`],
  };
}

/**
 * Generate defeat cast text
 */
export function generateDefeatCast(
  playerName: string,
  score: number,
  cause: 'timeout' | 'trap' | 'enemy' | 'wall',
  floor: number
): CastTemplate {
  const causeMessages: Record<string, string> = {
    timeout: '⏱️ Time ran out. The Cell waits for no one.',
    trap: '🕸️ Caught in the web. Should have seen it coming.',
    enemy: '💀 Taken down by the guardians. Almost made it.',
    wall: '🧱 Crashed into the void. Watch your step.',
  };
  
  const templates = [
    `${causeMessages[cause]}\n\n${playerName} fell on floor ${floor} with ${score} points.\n\nThe Cell claims another. Will you fare better?`,
    `💀 GAME OVER\nFloor: ${floor} | Score: ${score}\n${causeMessages[cause].split(' ')[0]} ${cause}\n\nEnter if you dare...`,
    `So close... yet so far. ${playerName} reached floor ${floor} before ${cause === 'timeout' ? 'time expired' : 'the end came'}.\n\n${score} points earned. Can you escape?`,
  ];
  
  const text = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    text,
    embeds: [`${BASE_URL}?ref=defeat&score=${score}&floor=${floor}`],
  };
}

/**
 * Generate invite cast text
 */
export function generateInviteCast(
  inviterName: string,
  inviteCode: string,
  message?: string
): CastTemplate {
  const customMsg = message ? `\n\n"${message}"` : '';
  
  return {
    text: `🧬 ${inviterName} is calling you to the Cell.${customMsg}\n\nUse code: ${inviteCode}\n\nEnter alone. Escape together.`,
    embeds: [`${BASE_URL}?invite=${inviteCode}&inviter=${encodeURIComponent(inviterName)}`],
  };
}

/**
 * Generate high score achievement cast
 */
export function generateHighScoreCast(
  playerName: string,
  score: number,
  previousBest: number,
  rank: number
): CastTemplate {
  const improvement = score - previousBest;
  
  return {
    text: `🎯 NEW PERSONAL BEST!\n\n${playerName} crushed their previous record of ${previousBest}\nNew high: ${score} (+${improvement})\nGlobal rank: #${rank}\n\nThe Cell remembers those who improve.`,
    embeds: [`${BASE_URL}?ref=highscore&score=${score}&rank=${rank}`],
  };
}

/**
 * Generate daily challenge cast
 */
export function generateDailyChallengeCast(
  playerName: string,
  challengeName: string,
  completed: boolean,
  score: number
): CastTemplate {
  const status = completed ? '✅ COMPLETED' : '⏳ ATTEMPTING';
  
  return {
    text: `${status} | Daily Challenge: ${challengeName}\n\n${playerName} ${completed ? 'conquered' : 'is taking on'} today's trial${completed ? ` with ${score} points` : ''}.\n\nDaily challenges reset at midnight UTC.`,
    embeds: [`${BASE_URL}/daily?ref=challenge&score=${score}`],
  };
}

/**
 * Open Warpcast compose with pre-filled cast
 */
export async function shareToCast(template: CastTemplate): Promise<void> {
  const embedUrl = template.embeds?.[0] || BASE_URL;
  const text = encodeURIComponent(template.text);
  const composeUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(embedUrl)}`;
  
  await openUrl(composeUrl);
}

/**
 * Generate share URL for manual copying
 */
export function generateShareUrl(template: CastTemplate): string {
  const embedUrl = template.embeds?.[0] || BASE_URL;
  const text = encodeURIComponent(template.text);
  return `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(embedUrl)}`;
}

/**
 * Cast preview component data
 * Use this to render how the cast will look
 */
export function getCastPreview(template: CastTemplate) {
  return {
    text: template.text,
    embedUrl: template.embeds?.[0],
    previewImage: `${BASE_URL}/api/og?text=${encodeURIComponent(template.text.slice(0, 100))}`,
    characterCount: template.text.length,
    isValid: template.text.length <= 320,
  };
}

export default {
  generateVictoryCast,
  generateDefeatCast,
  generateInviteCast,
  generateHighScoreCast,
  generateDailyChallengeCast,
  shareToCast,
  generateShareUrl,
  getCastPreview,
};
