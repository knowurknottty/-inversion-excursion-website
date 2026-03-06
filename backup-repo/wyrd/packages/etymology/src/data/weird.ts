// WYRD Specimen: weird/wyrd
// The load-bearing test case for the etymology engine

export interface EtymologyStage {
  period: string;
  form: string;
  meaning: string;
  notes?: string;
  chargeDelta?: number; // How much semantic charge was lost/gained
}

export interface BleachingEvent {
  year: number;
  event: string;
  chargeLost: number;
  context: string;
}

export interface WordSpecimen {
  modern: string;
  pieRoot: string;
  pieMeaning: string;
  liveCharge: number; // 0-10
  stages: EtymologyStage[];
  bleachingEvents: BleachingEvent[];
  inversion?: boolean;
  inversionNotes?: string;
}

export const weirdSpecimen: WordSpecimen = {
  modern: "weird",
  pieRoot: "*wert-",
  pieMeaning: "to turn, to wind",
  liveCharge: 1,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*wert-",
      meaning: "to turn, to wind, to weave",
      notes: "Root associated with spinning, weaving, fate-weaving"
    },
    {
      period: "Proto-Germanic (c. 500 BCE)",
      form: "*wurthiz",
      meaning: "fate, destiny, that which comes to pass",
      notes: "Nominalized form: 'the turn of events'"
    },
    {
      period: "Old English (c. 900 CE)",
      form: "wyrd",
      meaning: "fate, destiny, the Fates (the three sisters)",
      notes: "Cosmological force. The Wyrd sisters = the Norns who weave fate at the world-tree"
    },
    {
      period: "Middle English (c. 1400 CE)",
      form: "weird(e)",
      meaning: "fate, destiny; the Weird Sisters",
      notes: "Macbeth's 'weird sisters' — agents of supernatural knowledge"
    },
    {
      period: "Early Modern (1606)",
      form: "weird",
      meaning: "fate, destiny; uncanny, supernatural",
      notes: "Shakespeare theatrical pivot: from cosmic force to spooky atmosphere"
    },
    {
      period: "Romantic Era (1815)",
      form: "weird",
      meaning: "uncanny, unearthly, strange",
      notes: "Shelley's 'Mont Blanc': 'the weird domain' — supernatural but personal"
    },
    {
      period: "Victorian (1820s)",
      form: "weird",
      meaning: "odd-looking, strange, eccentric",
      notes: "Physical appearance, not supernatural. The charge begins to leak."
    },
    {
      period: "Modern (2026)",
      form: "weird",
      meaning: "strange, odd, uncomfortable; mild social filler",
      notes: "'That's weird' = 'I don't understand this.' Fully bleached."
    }
  ],
  bleachingEvents: [
    {
      year: 1606,
      event: "Shakespeare's Macbeth popularizes 'weird sisters'",
      chargeLost: 3,
      context: "Theatrical reduction: cosmic fate → spooky witches"
    },
    {
      year: 1815,
      event: "Shelley uses 'weird' for uncanny natural beauty",
      chargeLost: 2,
      context: "Romantic expansion: supernatural → subjective unease"
    },
    {
      year: 1820,
      event: "Physical description usage emerges",
      chargeLost: 2,
      context: "Visual oddity replaces metaphysical dread"
    },
    {
      year: 1950,
      event: "Mass media casualization",
      chargeLost: 2,
      context: "'Weird' becomes conversational filler for anything unusual"
    }
  ]
};

// Calculate live charge dynamically
export function calculateLiveCharge(specimen: WordSpecimen): number {
  const baseCharge = 10;
  const totalLost = specimen.bleachingEvents.reduce((sum, e) => sum + e.chargeLost, 0);
  return Math.max(0, baseCharge - totalLost);
}

// Verify: weird should be 1
console.assert(calculateLiveCharge(weirdSpecimen) === 1, "WYRD specimen charge calculation failed");
