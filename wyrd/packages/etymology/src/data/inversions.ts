import { WordSpecimen } from "./weird.js";

// Inverted words: amelioration (bad → good)

export const wickedSpecimen: WordSpecimen = {
  modern: "wicked",
  pieRoot: "*weik-",
  pieMeaning: "to bend, to wind, to curve",
  liveCharge: 3,
  stages: [
    {
      period: "Old English (c. 900 CE)",
      form: "wicca/wicce",
      meaning: "wizard, witch, sorcerer",
      notes: "From PIE *weik- 'to bend' — one who bends reality through magic"
    },
    {
      period: "Middle English (1200s)",
      form: "wicked",
      meaning: "evil, morally bad, sinful",
      notes: "Adjectival form: 'like a witch' — deeply pejorative"
    },
    {
      period: "Early Modern (1600s)",
      form: "wicked",
      meaning: "evil, vicious, morally corrupt",
      notes: "Peak negative charge — witch trials era"
    },
    {
      period: "20th Century (1920s)",
      form: "wicked",
      meaning: "excellent, cool, impressive (slang)",
      notes: "INVERSION: Jazz era amelioration — 'wicked piano player'"
    },
    {
      period: "Modern (2026)",
      form: "wicked",
      meaning: "excellent, cool; or still 'evil' in formal contexts",
      notes: "Dual register: context determines charge"
    }
  ],
  bleachingEvents: [
    {
      year: 1250,
      event: "Christianization demonizes witchcraft",
      chargeLost: 4,
      context: "Religious pejoration: magical practitioner → evil person"
    },
    {
      year: 1920,
      event: "Jazz slang inverts meaning",
      chargeLost: -2,
      context: "INVERSION: Amelioration through subcultural reclamation"
    }
  ],
  inversion: true,
  inversionNotes: "Evil → Excellent via African American jazz culture"
};

export const badSpecimen: WordSpecimen = {
  modern: "bad",
  pieRoot: "*bhedh- (?)",
  pieMeaning: "to bend, to press",
  liveCharge: 4,
  stages: [
    {
      period: "Old English (c. 1000 CE)",
      form: "bæddel",
      meaning: "hermaphrodite, effeminate man",
      notes: "Originally gender/sexual deviance, not general evil"
    },
    {
      period: "Middle English (1300s)",
      form: "badde",
      meaning: "evil, wicked, vicious",
      notes: "Generalized from specific deviance to moral evil"
    },
    {
      period: "Early Modern (1500s-1800s)",
      form: "bad",
      meaning: "evil, wicked, defective, unpleasant",
      notes: "Peak negative charge — dominant moral pejorative"
    },
    {
      period: "20th Century (1960s)",
      form: "bad",
      meaning: "excellent, impressive, tough (AAVE)",
      notes: "INVERSION: Michael Jackson 'Bad' — tough/cool, not evil"
    },
    {
      period: "Modern (2026)",
      form: "bad",
      meaning: "excellent (slang) or evil (standard)",
      notes: "Dual register maintained; context disambiguates"
    }
  ],
  bleachingEvents: [
    {
      year: 1300,
      event: "Semantic generalization from sexual to moral",
      chargeLost: 2,
      context: "Specific deviance → general evil"
    },
    {
      year: 1960,
      event: "AAVE amelioration via jazz/blues culture",
      chargeLost: -3,
      context: "INVERSION: Reclamation through subcultural prestige"
    }
  ],
  inversion: true,
  inversionNotes: "Evil → Excellent via AAVE; most successful amelioration in English"
};

export const evilSpecimen: WordSpecimen = {
  modern: "evil",
  pieRoot: "*upelo-",
  pieMeaning: "exceeding proper bounds",
  liveCharge: 2,
  stages: [
    {
      period: "Old English (c. 900 CE)",
      form: "yfel",
      meaning: "bad, vicious, ill, harmful",
      notes: "Strong moral charge from inception"
    },
    {
      period: "Middle English (1100s)",
      form: "evil",
      meaning: "morally bad, wicked, sinful",
      notes: "Theological weight: opposition to good/God"
    },
    {
      period: "Early Modern (1600s)",
      form: "evil",
      meaning: "wicked, sinful, morally depraved",
      notes: "Peak charge — witchcraft, demonic associations"
    },
    {
      period: "20th Century (1980s)",
      form: "evil",
      meaning: "excellent, impressive (slang)",
      notes: "INVERSION: Surfer/skater culture — 'evil guitar solo'"
    },
    {
      period: "Modern (2026)",
      form: "evil",
      meaning: "morally bad (dominant); excellent (niche slang)",
      notes: "Inversion less successful than 'bad' or 'wicked'"
    }
  ],
  bleachingEvents: [
    {
      year: 1980,
      event: "Extreme sports slang amelioration",
      chargeLost: -1,
      context: "INVERSION: Limited success in subcultures"
    }
  ],
  inversion: true,
  inversionNotes: "Evil → Excellent; weaker inversion than 'bad' due to theological gravity"
};

export const naughtySpecimen: WordSpecimen = {
  modern: "naughty",
  pieRoot: "*naught",
  pieMeaning: "nothing, zero",
  liveCharge: 2,
  stages: [
    {
      period: "Late Middle English (1400s)",
      form: "naughti",
      meaning: "wicked, evil, morally bad",
      notes: "From 'naught' = nothing; 'good-for-nothing'"
    },
    {
      period: "Early Modern (1600s)",
      form: "naughty",
      meaning: "wicked, evil, vicious",
      notes: "Strong pejorative — Shakespearean usage"
    },
    {
      period: "Victorian Era (1800s)",
      form: "naughty",
      meaning: "mischievous, disobedient (of children)",
      notes: "AMELIORATION: Euphemism for children; 'wicked' too strong"
    },
    {
      period: "Modern (2026)",
      form: "naughty",
      meaning: "mischievous; mildly improper; sexual innuendo",
      notes: "Fully bleached; sexual charge in adult contexts"
    }
  ],
  bleachingEvents: [
    {
      year: 1850,
      event: "Victorian child-rearing euphemism",
      chargeLost: 5,
      context: "Wicked → Mischievous; protecting children from moral weight"
    },
    {
      year: 1980,
      event: "Sexual innuendo reclamation",
      chargeLost: 2,
      context: "'Naughty' as playful sexual descriptor"
    }
  ],
  inversion: false,
  inversionNotes: "Amelioration, not inversion: evil → mischievous"
};

export const outlandishSpecimen: WordSpecimen = {
  modern: "outlandish",
  pieRoot: "*out + *land",
  pieMeaning: "foreign territory",
  liveCharge: 3,
  stages: [
    {
      period: "Old English (c. 1000 CE)",
      form: "utlendisc",
      meaning: "foreign, from another land",
      notes: "Neutral descriptor of origin"
    },
    {
      period: "Middle English (1300s)",
      form: "outlandish",
      meaning: "foreign, alien, non-native",
      notes: "Still primarily geographical"
    },
    {
      period: "Early Modern (1600s)",
      form: "outlandish",
      meaning: "bizarre, strange, unfamiliar",
      notes: "Metaphorical extension: foreign → odd"
    },
    {
      period: "Modern (2026)",
      form: "outlandish",
      meaning: "bizarre, eccentric, wildly unconventional",
      notes: "Fully metaphorical; no geographical sense"
    }
  ],
  bleachingEvents: [
    {
      year: 1600,
      event: "Metaphorical extension to behavior",
      chargeLost: 3,
      context: "Geographical foreignness → behavioral strangeness"
    }
  ],
  inversion: false,
  inversionNotes: "Semantic shift, not inversion: foreign → bizarre"
};
