import { WordSpecimen } from "./data/weird.js";

export interface ScanResult {
  word: string;
  found: boolean;
  specimen?: WordSpecimen;
  pieRoot?: string;
  liveCharge: number;
  bleachingStage: "intact" | "partial" | "severe" | "total";
  inversionDetected: boolean;
  notes: string[];
}

export interface InversionResult {
  word: string;
  inverted: boolean;
  originalMeaning: string;
  modernMeaning: string;
  inversionYear?: number;
  mechanism: "amelioration" | "pejoration" | "semantic_shift" | null;
}

// Known inversions database
const inversionDatabase: Map<string, InversionResult> = new Map([
  ["wicked", {
    word: "wicked",
    inverted: true,
    originalMeaning: "evil, morally bad",
    modernMeaning: "excellent, cool (slang)",
    mechanism: "amelioration"
  }],
  ["bad", {
    word: "bad",
    inverted: true,
    originalMeaning: "evil, wicked",
    modernMeaning: "good, excellent (AAVE/slang)",
    mechanism: "amelioration"
  }],
  ["evil", {
    word: "evil",
    inverted: true,
    originalMeaning: "morally bad, wicked",
    modernMeaning: "excellent, impressive (slang)",
    mechanism: "amelioration"
  }],
  ["naughty", {
    word: "naughty",
    inverted: true,
    originalMeaning: "wicked, evil, morally bad",
    modernMeaning: "mischievous, mildly improper",
    mechanism: "amelioration"
  }],
  ["outlandish", {
    word: "outlandish",
    inverted: false,
    originalMeaning: "foreign, alien",
    modernMeaning: "bizarre, strange",
    mechanism: "semantic_shift"
  }],
  ["altogether", {
    word: "altogether",
    inverted: false,
    originalMeaning: "completely, entirely",
    modernMeaning: "in the nude (archaic slang)",
    mechanism: "semantic_shift"
  }]
]);

// Fate Index — curated words with full chains
const fateIndex: Map<string, WordSpecimen> = new Map();

export function registerSpecimen(specimen: WordSpecimen): void {
  fateIndex.set(specimen.modern.toLowerCase(), specimen);
}

// Register WYRD specimen
import { weirdSpecimen } from "./data/weird.js";
registerSpecimen(weirdSpecimen);

// Register inversion specimens
import { wickedSpecimen, badSpecimen, evilSpecimen, naughtySpecimen, outlandishSpecimen } from "./data/inversions.js";
registerSpecimen(wickedSpecimen);
registerSpecimen(badSpecimen);
registerSpecimen(evilSpecimen);
registerSpecimen(naughtySpecimen);
registerSpecimen(outlandishSpecimen);

export class EtymologyScanner {
  scan(word: string): ScanResult {
    const normalized = word.toLowerCase().trim();
    const specimen = fateIndex.get(normalized);
    
    if (!specimen) {
      return {
        word: normalized,
        found: false,
        liveCharge: 0,
        bleachingStage: "total" as const,
        inversionDetected: false,
        notes: ["⚠️ UNVERIFIED: Word not in Fate Index. Etymology cannot be sourced."]
      };
    }

    const charge = specimen.liveCharge;
    const bleachingStage = this.classifyBleaching(charge);
    const inversion = inversionDatabase.get(normalized);

    return {
      word: normalized,
      found: true,
      specimen,
      pieRoot: specimen.pieRoot,
      liveCharge: charge,
      bleachingStage,
      inversionDetected: inversion?.inverted ?? false,
      notes: this.generateNotes(specimen, inversion)
    };
  }

  detectInversion(word: string): InversionResult | null {
    return inversionDatabase.get(word.toLowerCase().trim()) ?? null;
  }

  private classifyBleaching(charge: number): ScanResult["bleachingStage"] {
    if (charge >= 8) return "intact";
    if (charge >= 5) return "partial";
    if (charge >= 2) return "severe";
    return "total";
  }

  private generateNotes(specimen: WordSpecimen, inversion?: InversionResult): string[] {
    const notes: string[] = [];
    
    notes.push(`PIE root: ${specimen.pieRoot} "${specimen.pieMeaning}"`);
    notes.push(`${specimen.stages.length} documented stages`);
    notes.push(`${specimen.bleachingEvents.length} bleaching events`);
    
    if (inversion?.inverted) {
      notes.push(`⚠️ INVERSION DETECTED: "${inversion.originalMeaning}" → "${inversion.modernMeaning}"`);
    }

    if (specimen.liveCharge <= 2) {
      notes.push("💀 TOTAL BLEACHING: Word has lost nearly all cosmological weight");
    }

    return notes;
  }
}

export const scanner = new EtymologyScanner();
