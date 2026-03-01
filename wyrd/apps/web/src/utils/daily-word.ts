import { WordSpecimen } from '@wyrd/etymology';

// Import all registered specimens
import { weirdSpecimen } from '@wyrd/etymology';
import {
  wickedSpecimen,
  badSpecimen,
  evilSpecimen,
  naughtySpecimen,
  outlandishSpecimen
} from '../../../packages/etymology/src/data/inversions';
import {
  salarySpecimen,
  disasterSpecimen,
  sincereSpecimen,
  clueSpecimen,
  nicknameSpecimen,
  deadlineSpecimen,
  sabotageSpecimen,
  quarantineSpecimen,
  apronSpecimen
} from '../../../packages/etymology/src/data/common-words';

// All available specimens
const ALL_SPECIMENS: WordSpecimen[] = [
  weirdSpecimen,
  wickedSpecimen,
  badSpecimen,
  evilSpecimen,
  naughtySpecimen,
  outlandishSpecimen,
  salarySpecimen,
  disasterSpecimen,
  sincereSpecimen,
  clueSpecimen,
  nicknameSpecimen,
  deadlineSpecimen,
  sabotageSpecimen,
  quarantineSpecimen,
  apronSpecimen,
];

/**
 * Get the daily word based on current date
 * Uses deterministic rotation so same word appears globally on same day
 * @param date Optional date (defaults to today)
 * @returns WordSpecimen for the day
 */
export function getDailyWord(date: Date = new Date()): WordSpecimen {
  // Calculate days since epoch (Jan 1, 1970)
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);

  // Deterministic rotation through all specimens
  const index = daysSinceEpoch % ALL_SPECIMENS.length;

  return ALL_SPECIMENS[index];
}

/**
 * Get all available specimens
 * @returns Array of all WordSpecimen objects
 */
export function getAllSpecimens(): WordSpecimen[] {
  return ALL_SPECIMENS;
}

/**
 * Get a random specimen (for suggestions, etc.)
 * @returns Random WordSpecimen
 */
export function getRandomWord(): WordSpecimen {
  const index = Math.floor(Math.random() * ALL_SPECIMENS.length);
  return ALL_SPECIMENS[index];
}
