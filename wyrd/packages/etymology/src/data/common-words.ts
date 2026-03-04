// Common words with interesting etymologies
// Curated specimens for Fate Index expansion

import { WordSpecimen } from "./weird.js";

export const salarySpecimen: WordSpecimen = {
  modern: "salary",
  pieRoot: "*sal-",
  pieMeaning: "salt",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*sal-",
      meaning: "salt",
      notes: "Essential preservative and trade commodity"
    },
    {
      period: "Latin (c. 200 BCE)",
      form: "salarium",
      meaning: "salt money, soldier's salt allowance",
      notes: "Roman soldiers received salt rations or money to buy salt. 'Sal' = salt, '-arium' = concerning"
    },
    {
      period: "Medieval Latin (c. 1200 CE)",
      form: "salarium",
      meaning: "stipend, wages, payment",
      notes: "Extended from military to civilian payment"
    },
    {
      period: "Old French (c. 1300 CE)",
      form: "salaire",
      meaning: "wages, payment for work",
      notes: "Salt connection fading, generalized to any regular payment"
    },
    {
      period: "Middle English (c. 1400 CE)",
      form: "salarie",
      meaning: "fixed payment for services",
      notes: "Borrowed from French, adopted by English bureaucracy"
    },
    {
      period: "Modern English (2026)",
      form: "salary",
      meaning: "fixed regular payment, usually monthly or annual",
      notes: "Completely divorced from salt. Most speakers unaware of etymology."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "Extension from military salt rations to general wages",
      chargeLost: 3,
      context: "Salt's specific meaning → generic payment"
    },
    {
      year: 1400,
      event: "Adoption into English bureaucracy",
      chargeLost: 2,
      context: "Lost connection to Roman military culture"
    },
    {
      year: 1800,
      event: "Industrial standardization of wages",
      chargeLost: 2,
      context: "Became accounting term, lost material connection entirely"
    }
  ]
};

export const disasterSpecimen: WordSpecimen = {
  modern: "disaster",
  pieRoot: "*ster-",
  pieMeaning: "star",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*ster-",
      meaning: "star",
      notes: "Celestial light, divine omen"
    },
    {
      period: "Greek (c. 700 BCE)",
      form: "astēr (ἀστήρ)",
      meaning: "star, constellation",
      notes: "Stars as divine signs, astrology foundation"
    },
    {
      period: "Latin (c. 100 BCE)",
      form: "astrum",
      meaning: "star, constellation",
      notes: "Astrological belief: stars govern fate"
    },
    {
      period: "Italian (c. 1500 CE)",
      form: "disastro",
      meaning: "ill-starred event, calamity",
      notes: "'dis-' (bad) + 'astro' (star) = literally 'bad star' or 'against the stars'"
    },
    {
      period: "French (c. 1560 CE)",
      form: "désastre",
      meaning: "unfavorable planetary influence, catastrophe",
      notes: "Astrological causation: stars misaligned = disaster"
    },
    {
      period: "Early Modern English (c. 1591)",
      form: "disaster",
      meaning: "calamity blamed on unfavorable stars",
      notes: "Shakespeare: 'disasters in the sun' (Hamlet) — cosmic disruption"
    },
    {
      period: "Modern English (2026)",
      form: "disaster",
      meaning: "catastrophe, major misfortune (no celestial connection)",
      notes: "Fully secularized. No one thinks about stars when saying 'disaster.'"
    }
  ],
  bleachingEvents: [
    {
      year: 1600,
      event: "Secularization of causation",
      chargeLost: 4,
      context: "From 'stars caused this' → 'bad things happen'"
    },
    {
      year: 1750,
      event: "Enlightenment rejection of astrology",
      chargeLost: 3,
      context: "Scientific revolution eliminated astrological belief"
    },
    {
      year: 1900,
      event: "Insurance/bureaucratic categorization",
      chargeLost: 1,
      context: "'Natural disaster,' 'disaster relief' — administrative term"
    }
  ]
};

export const sincereSpecimen: WordSpecimen = {
  modern: "sincere",
  pieRoot: "*ker-",
  pieMeaning: "to grow",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*ker-",
      meaning: "to grow, increase",
      notes: "Growth, creation, generation"
    },
    {
      period: "Latin (c. 200 BCE)",
      form: "sincerus",
      meaning: "pure, clean, sound, whole",
      notes: "Possibly 'sine' (without) + 'cera' (wax) — marble without wax filler patches"
    },
    {
      period: "Latin (alternative etymology)",
      form: "sincerus",
      meaning: "whole, unadulterated, genuine",
      notes: "Or from 'semel' (once) + 'crescere' (to grow) → grown once, unmixed"
    },
    {
      period: "Middle French (c. 1530)",
      form: "sincère",
      meaning: "pure, genuine, honest",
      notes: "Extended from materials (pure wine, clean marble) to character"
    },
    {
      period: "English (c. 1533)",
      form: "sincere",
      meaning: "honest, genuine in feeling, without pretense",
      notes: "Fully moralized: from physical purity → emotional authenticity"
    },
    {
      period: "Modern English (2026)",
      form: "sincere",
      meaning: "genuine, honest, heartfelt",
      notes: "Emotional authenticity. Lost connection to physical purity/growth."
    }
  ],
  bleachingEvents: [
    {
      year: 1530,
      event: "Transfer from material purity to moral purity",
      chargeLost: 2,
      context: "Metaphorical shift: pure substance → pure intention"
    },
    {
      year: 1700,
      event: "Sentimentalization",
      chargeLost: 2,
      context: "Romantic emphasis on sincerity as feeling vs. classical purity"
    },
    {
      year: 1950,
      event: "Corporate/advertising dilution",
      chargeLost: 2,
      context: "'Sincerely yours,' marketing 'sincerity' — performative not substantive"
    }
  ]
};

export const clueSpecimen: WordSpecimen = {
  modern: "clue",
  pieRoot: "*gleu-",
  pieMeaning: "to stick together, ball up",
  liveCharge: 1,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*gleu-",
      meaning: "to stick, adhere, form a ball",
      notes: "Adhesive, glue-like substances"
    },
    {
      period: "Old English (c. 900 CE)",
      form: "cliewen",
      meaning: "ball of thread or yarn",
      notes: "Physical ball of wound thread"
    },
    {
      period: "Greek Myth (c. 800 BCE)",
      form: "Ariadne's thread",
      meaning: "thread ball that guided Theseus out of the labyrinth",
      notes: "Mythological origin: the thread that solves the maze"
    },
    {
      period: "Middle English (c. 1400)",
      form: "clewe",
      meaning: "ball of thread; thread that guides one out",
      notes: "Literal ball of yarn + metaphorical guidance"
    },
    {
      period: "Early Modern (c. 1596)",
      form: "clew",
      meaning: "that which points the way, guiding principle",
      notes: "Shakespeare: metaphorical guidance, not physical thread"
    },
    {
      period: "Modern English (c. 1850)",
      form: "clue",
      meaning: "piece of evidence, hint in solving mystery",
      notes: "Detective fiction popularizes 'clue' as evidence fragment"
    },
    {
      period: "Modern English (2026)",
      form: "clue",
      meaning: "hint, piece of information to solve problem",
      notes: "Fully abstracted. No connection to thread or labyrinths."
    }
  ],
  bleachingEvents: [
    {
      year: 1596,
      event: "Metaphorization from physical thread to guidance",
      chargeLost: 3,
      context: "Lost material form, became abstract principle"
    },
    {
      year: 1850,
      event: "Detective fiction adoption",
      chargeLost: 3,
      context: "Sherlock Holmes era: clue = evidence fragment, not mythic guide"
    },
    {
      year: 1950,
      event: "Game/puzzle trivialization",
      chargeLost: 3,
      context: "Board game 'Clue,' crossword clues — entertainment not cosmic navigation"
    }
  ]
};

export const nicknameSpecimen: WordSpecimen = {
  modern: "nickname",
  pieRoot: "*h₂ew-",
  pieMeaning: "to add, increase",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*h₂ew-",
      meaning: "to increase, augment",
      notes: "Growth, addition, extension"
    },
    {
      period: "Old English (c. 900 CE)",
      form: "eke",
      meaning: "also, in addition, moreover",
      notes: "Adverb meaning 'also' or 'in addition to'"
    },
    {
      period: "Middle English (c. 1300)",
      form: "an eke name",
      meaning: "an additional name, a name added to",
      notes: "'Eke' = also, 'name' = name → 'also-name' or 'additional name'"
    },
    {
      period: "Middle English (c. 1400)",
      form: "a neke name → a nickname",
      meaning: "additional name, informal name",
      notes: "REBRACKETING: 'an ekename' → 'a nekename' → 'a nickname'"
    },
    {
      period: "Early Modern English (c. 1550)",
      form: "nickname",
      meaning: "informal or affectionate name",
      notes: "Solidified spelling, lost awareness of 'eke' origin"
    },
    {
      period: "Modern English (2026)",
      form: "nickname",
      meaning: "informal name, username, alias",
      notes: "Digital expansion: social media handles, gamer tags. 'Eke' fully lost."
    }
  ],
  bleachingEvents: [
    {
      year: 1400,
      event: "Rebracketing destroys etymological transparency",
      chargeLost: 4,
      context: "'An ekename' → 'a nickname' — linguistic reanalysis erased 'eke'"
    },
    {
      year: 1550,
      event: "Loss of 'eke' as living word",
      chargeLost: 2,
      context: "'Eke' disappeared from common speech, leaving only fossilized 'nickname'"
    },
    {
      year: 2000,
      event: "Digital abstraction",
      chargeLost: 2,
      context: "Usernames, handles — no longer tied to personal naming"
    }
  ]
};

export const deadlineSpecimen: WordSpecimen = {
  modern: "deadline",
  pieRoot: "*h₁lewdʰ-",
  pieMeaning: "people, growth, free",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*h₁lewdʰ-",
      meaning: "people, free people",
      notes: "Tribe, growth, community"
    },
    {
      period: "Old English (c. 900)",
      form: "dēad",
      meaning: "dead, lifeless, deceased",
      notes: "Basic concept of death"
    },
    {
      period: "American Civil War (c. 1864)",
      form: "dead-line",
      meaning: "physical line around prison beyond which guards shoot to kill",
      notes: "Andersonville Prison: literal line in the dirt. Cross it = instant death."
    },
    {
      period: "Post-Civil War (c. 1920)",
      form: "deadline",
      meaning: "time limit for completion (journalism, printing)",
      notes: "Printing press deadline: if copy missed the time, edition was 'dead'"
    },
    {
      period: "Modern English (2026)",
      form: "deadline",
      meaning: "due date, time limit for task completion",
      notes: "Ubiquitous in business/education. Death connection completely lost."
    }
  ],
  bleachingEvents: [
    {
      year: 1920,
      event: "Transfer from literal death boundary → time limit",
      chargeLost: 4,
      context: "From 'cross this line and die' → 'submit by this date'"
    },
    {
      year: 1960,
      event: "Corporate/academic normalization",
      chargeLost: 1,
      context: "Everyone has deadlines, violence metaphor neutralized"
    },
    {
      year: 2000,
      event: "Digital project management trivialization",
      chargeLost: 1,
      context: "'Soft deadline,' 'hard deadline' — bureaucratic jargon"
    }
  ]
};

export const sabotageSpecimen: WordSpecimen = {
  modern: "sabotage",
  pieRoot: "*sab-",
  pieMeaning: "wooden shoe",
  liveCharge: 5,
  stages: [
    {
      period: "Old French (c. 1200)",
      form: "sabot",
      meaning: "wooden shoe, clog",
      notes: "Peasant footwear, simple wooden clog"
    },
    {
      period: "French (c. 1500)",
      form: "saboter",
      meaning: "to walk noisily in wooden shoes; to bungle, do shoddy work",
      notes: "Verb: to make noise like sabots, or to work poorly"
    },
    {
      period: "French Industrial (c. 1870)",
      form: "sabotage",
      meaning: "deliberate destruction of machinery by workers",
      notes: "FOLK ETYMOLOGY: workers threw sabots into machines. LIKELY FALSE. Actually from 'to bungle.'"
    },
    {
      period: "English (c. 1910)",
      form: "sabotage",
      meaning: "deliberate destruction to hinder production",
      notes: "Borrowed during labor movement, IWW strikes"
    },
    {
      period: "WWI-WWII (c. 1914-1945)",
      form: "sabotage",
      meaning: "covert destruction of enemy resources, espionage",
      notes: "Military/intelligence usage: resistance fighters sabotaging Nazi supply lines"
    },
    {
      period: "Modern English (2026)",
      form: "sabotage",
      meaning: "deliberate undermining, self-sabotage, relationship sabotage",
      notes: "Metaphorical expansion: 'I sabotaged my own diet.' Lost connection to shoes entirely."
    }
  ],
  bleachingEvents: [
    {
      year: 1910,
      event: "Transfer from shoe-clumsiness → intentional destruction",
      chargeLost: 2,
      context: "Lost literal 'sabot' connection, became abstract destruction"
    },
    {
      year: 1945,
      event: "Post-war metaphorization",
      chargeLost: 2,
      context: "Extended to psychological/personal contexts: 'self-sabotage'"
    },
    {
      year: 2000,
      event: "Pop psychology dilution",
      chargeLost: 1,
      context: "Self-help books: 'Are you sabotaging your success?' — cliché"
    }
  ]
};

export const quarantineSpecimen: WordSpecimen = {
  modern: "quarantine",
  pieRoot: "*kʷetwóres",
  pieMeaning: "four",
  liveCharge: 5,
  stages: [
    {
      period: "PIE (c. 4500-2500 BCE)",
      form: "*kʷetwóres",
      meaning: "four",
      notes: "Cardinal number four"
    },
    {
      period: "Latin (c. 100 CE)",
      form: "quadraginta",
      meaning: "forty",
      notes: "4 × 10 = 40"
    },
    {
      period: "Venetian Italian (c. 1127 CE)",
      form: "quarantina",
      meaning: "forty days",
      notes: "Plague ships forced to wait 40 days before docking in Venice"
    },
    {
      period: "Italian (c. 1300 Black Death)",
      form: "quarantina",
      meaning: "forty-day isolation period for plague",
      notes: "Venice, Ragusa (Dubrovnik): first formal quarantine laws"
    },
    {
      period: "French (c. 1600)",
      form: "quarantaine",
      meaning: "forty-day isolation for disease",
      notes: "Adopted across Europe as plague measure"
    },
    {
      period: "English (c. 1609)",
      form: "quarantine",
      meaning: "isolation period for disease (originally 40 days)",
      notes: "Borrowed during plague outbreaks"
    },
    {
      period: "Modern English (2026)",
      form: "quarantine",
      meaning: "isolation for any duration (no longer 40 days)",
      notes: "COVID-19: '14-day quarantine,' '5-day quarantine.' Lost connection to 'forty.'"
    }
  ],
  bleachingEvents: [
    {
      year: 1850,
      event: "Variable duration quarantines",
      chargeLost: 2,
      context: "Scientific disease knowledge: not always 40 days needed"
    },
    {
      year: 1950,
      event: "Metaphorical extension",
      chargeLost: 2,
      context: "'Quarantine the infected file' — computing metaphor"
    },
    {
      year: 2020,
      event: "COVID-19 normalization",
      chargeLost: 1,
      context: "Everyone has been 'in quarantine' — lost medical specificity"
    }
  ]
};

export const apronSpecimen: WordSpecimen = {
  modern: "apron",
  pieRoot: "*mapp-",
  pieMeaning: "napkin, cloth",
  liveCharge: 1,
  stages: [
    {
      period: "Latin (c. 200 CE)",
      form: "mappa",
      meaning: "napkin, cloth, tablecloth",
      notes: "Simple fabric for wiping, covering"
    },
    {
      period: "Old French (c. 1200)",
      form: "naperon",
      meaning: "small tablecloth, protective cloth",
      notes: "'Nape' (tablecloth) + '-ron' (diminutive) = little cloth"
    },
    {
      period: "Middle English (c. 1400)",
      form: "a napron",
      meaning: "protective garment worn over clothing",
      notes: "Borrowed from French as 'a napron'"
    },
    {
      period: "Middle English (c. 1500)",
      form: "an apron",
      meaning: "protective garment",
      notes: "REBRACKETING: 'a napron' → 'an apron' (like 'a neke-name' → 'a nickname')"
    },
    {
      period: "Modern English (2026)",
      form: "apron",
      meaning: "protective garment, kitchen apron, workshop apron",
      notes: "Fully rebracketed. 'Napron' completely lost. No awareness of 'napkin' connection."
    }
  ],
  bleachingEvents: [
    {
      year: 1500,
      event: "Rebracketing destroys etymological transparency",
      chargeLost: 5,
      context: "'A napron' → 'an apron' — 'n' migrated, original form erased"
    },
    {
      year: 1600,
      event: "Loss of 'napron' from language",
      chargeLost: 2,
      context: "No one remembered or used 'napron' — apron became sole form"
    },
    {
      year: 1900,
      event: "Industrial/occupational specialization",
      chargeLost: 2,
      context: "Blacksmith aprons, lab aprons — functional tool, not garment"
    }
  ]
};
