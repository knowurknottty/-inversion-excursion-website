import { WordSpecimen } from '../types';

/**
 * Economic/Financial Word Specimens
 *
 * This collection traces the semantic bleaching of words related to exchange,
 * value, and prosperity—showing how sacred, cosmological concepts devolved
 * into abstract bureaucratic instruments.
 *
 * Research sources:
 * - Etymonline.com
 * - Indo-European Lexicon (PIE Lexicon)
 * - Wiktionary Proto-Indo-European reconstructions
 */

export const moneySpecimen: WordSpecimen = {
  modern: "money",
  pieRoot: "*men-",
  pieMeaning: "to think, remember, have one's mind aroused",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*men-",
      meaning: "to think, remember, warn; mental activity",
      notes: "Root of memory, mind, mentor—cognitive/spiritual awareness"
    },
    {
      period: "Latin (c. 400 BCE)",
      form: "monēre",
      meaning: "to warn, advise, remind, admonish",
      notes: "Goddess Juno Moneta ('The Warner') protectress of sacred funds"
    },
    {
      period: "Classical Latin (c. 269 BCE)",
      form: "monēta",
      meaning: "mint, place where coins are struck; later, coin itself",
      notes: "Roman mint established in Temple of Juno Moneta on Capitoline Hill—coinage sacral act"
    },
    {
      period: "Late Latin (c. 400 CE)",
      form: "monēta",
      meaning: "coin, metal currency",
      notes: "Shift from sacred place → object produced there. Temple connection fading."
    },
    {
      period: "Old French (c. 1100)",
      form: "moneie",
      meaning: "coin, currency, wealth",
      notes: "Fully secularized—no memory of goddess or temple"
    },
    {
      period: "Middle English (c. 1290)",
      form: "moneye",
      meaning: "medium of exchange, wealth, coinage",
      notes: "Abstract financial instrument. All cosmological resonance lost."
    },
    {
      period: "Modern English (1500-present)",
      form: "money",
      meaning: "abstract store of value, fiat currency, data in ledgers",
      notes: "Ultimate abstraction—exists as electronic signals. No material form required."
    }
  ],
  bleachingEvents: [
    {
      year: -269,
      event: "Metonymic shift: sacred space → object produced in space",
      chargeLost: 2,
      context: "Juno Moneta as goddess of warning/memory → moneta as mere 'mint building' → coins themselves. Lost: divine oversight of exchange."
    },
    {
      year: 400,
      event: "Delocalization: Roman temple cult declines, mint moves",
      chargeLost: 3,
      context: "Coins no longer struck in goddess's temple. Money becomes portable, severed from sacred origin point. Christianity replaces pagan economic theology."
    },
    {
      year: 1100,
      event: "Complete amnesia: Old French moneie has no awareness of Juno",
      chargeLost: 2,
      context: "Etymology forgotten. 'Money' now just 'that stuff you trade'—no cosmological anchoring."
    },
    {
      year: 1971,
      event: "Nixon ends gold standard—money becomes pure abstraction",
      chargeLost: 1,
      context: "Final severance from material reality. Money = collective agreement, nothing more. From goddess's temple → Excel spreadsheet."
    }
  ]
};

export const wageSpecimen: WordSpecimen = {
  modern: "wage",
  pieRoot: "*wegh-",
  pieMeaning: "to go, move, transport in a vehicle; to carry, convey",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*wegh-",
      meaning: "to move, transport, carry (especially by vehicle)",
      notes: "Root attests to wheel technology—sacred conveyance, journey"
    },
    {
      period: "Proto-Germanic (c. 500 BCE)",
      form: "*wagōną",
      meaning: "to move, carry, weigh; to venture, risk",
      notes: "Carrying goods → risking/wagering them in trade"
    },
    {
      period: "Old North French (c. 1200)",
      form: "wage",
      meaning: "pledge, security, guarantee",
      notes: "What you pledge/carry as guarantee of work. Still physical metaphor."
    },
    {
      period: "Anglo-French (c. 1300)",
      form: "wager",
      meaning: "to pledge, engage to pay",
      notes: "Verb: to give as pledge. Implies contractual obligation, sacred oath."
    },
    {
      period: "Middle English (c. 1330)",
      form: "wage",
      meaning: "payment for services, hire",
      notes: "Noun: what you receive in exchange for labor. Still implies mutual pledge."
    },
    {
      period: "Early Modern English (c. 1600)",
      form: "wages",
      meaning: "periodic payment for labor (usually plural)",
      notes: "Abstracted to regular intervals. Less about pledge, more about clock time."
    },
    {
      period: "Industrial English (1800-present)",
      form: "wage",
      meaning: "hourly/monthly compensation; wage labor as commodity",
      notes: "Labor power as alienated commodity. Marx: wage obscures surplus value extraction."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "From sacred conveyance → contractual pledge",
      chargeLost: 2,
      context: "Shift from carrying goods (active, embodied) to abstract legal promise. Physical metaphor retained but meaning drifts."
    },
    {
      year: 1600,
      event: "Regularization: pledge → periodic entitlement",
      chargeLost: 3,
      context: "Weekly/monthly wages replace event-based payment. Time discipline imposed. Wage = abstract hours, not completed tasks."
    },
    {
      year: 1850,
      event: "Industrialization: wage as commodity price for labor power",
      chargeLost: 2,
      context: "Wage no longer mutual pledge but market-determined price. Worker has no bargaining power. Classical political economy: wage = subsistence minimum."
    }
  ]
};

export const profitSpecimen: WordSpecimen = {
  modern: "profit",
  pieRoot: "*dhe-",
  pieMeaning: "to set, put, place; to establish",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*dhe-",
      meaning: "to set, put, place",
      notes: "Root of 'do, deed, fact'—cosmological act of making/establishing order"
    },
    {
      period: "Latin (c. 200 BCE)",
      form: "prōficere",
      meaning: "to advance, make progress, accomplish, be useful",
      notes: "prō- (forward) + facere (to make). Literally: 'to make forward progress'—virtuous advancement."
    },
    {
      period: "Classical Latin (100 BCE)",
      form: "profectus",
      meaning: "progress, success, advancement",
      notes: "Stoic concept: profit = moral/spiritual progress, not just material gain"
    },
    {
      period: "Old French (c. 1200)",
      form: "profit",
      meaning: "advancement, benefit, gain (material or spiritual)",
      notes: "Ambiguous: could mean spiritual profit OR economic gain"
    },
    {
      period: "Middle English (c. 1300)",
      form: "profit",
      meaning: "advantage, benefit; income, gain from trade",
      notes: "Spiritual sense declines. Mercantile usage increases."
    },
    {
      period: "Early Modern English (c. 1600)",
      form: "profit",
      meaning: "financial gain, excess of returns over outlay",
      notes: "Accounting term. Double-entry bookkeeping makes profit quantifiable abstraction."
    },
    {
      period: "Modern English (1800-present)",
      form: "profit",
      meaning: "surplus value, return on investment, bottom line",
      notes: "Purely economic. 'Profit maximization' as moral imperative of capitalism."
    }
  ],
  bleachingEvents: [
    {
      year: 1300,
      event: "Semantic narrowing: spiritual advancement → material gain",
      chargeLost: 3,
      context: "Usury prohibitions weaken. Merchant class rises. 'Profit' loses Stoic virtue connotations—becomes mercantile term."
    },
    {
      year: 1600,
      event: "Quantification: profit as measurable accounting category",
      chargeLost: 2,
      context: "Double-entry bookkeeping (Pacioli 1494) enables profit calculation. From quality (advancement) → quantity (numbers in ledger)."
    },
    {
      year: 1850,
      event: "Ideological capture: profit as natural law",
      chargeLost: 1,
      context: "Classical economics naturalizes profit. Adam Smith: profit = return to capital. Marx: profit = unpaid labor. Either way, moral dimension erased."
    }
  ]
};

export const debtSpecimen: WordSpecimen = {
  modern: "debt",
  pieRoot: "*ghabh-",
  pieMeaning: "to give or receive; to hold (in offering or taking)",
  liveCharge: 1,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*ghabh-",
      meaning: "to give, receive, hold; reciprocal exchange",
      notes: "Root of 'give, gift'—sacred reciprocity, mutual obligation within kinship"
    },
    {
      period: "Latin (c. 200 BCE)",
      form: "habēre",
      meaning: "to have, hold, possess",
      notes: "Neutral: to hold in one's power (could be gift or obligation)"
    },
    {
      period: "Latin (100 BCE)",
      form: "dēbēre",
      meaning: "to owe; to keep something away from someone",
      notes: "dē- (away) + habēre. Literally: 'to hold away from'—implies rightful owner exists elsewhere."
    },
    {
      period: "Latin (1 CE)",
      form: "dēbitum",
      meaning: "thing owed, debt; moral/religious obligation",
      notes: "'Forgive us our debts' (Matthew 6:12)—still ethical, not purely financial"
    },
    {
      period: "Old French (c. 1200)",
      form: "dete",
      meaning: "obligation, thing owed (legal and moral)",
      notes: "Ambiguity remains: debt to God vs. debt to creditor"
    },
    {
      period: "Middle English (c. 1300)",
      form: "dette",
      meaning: "financial obligation, legal liability",
      notes: "Silent 'b' added (16c.) by scholars imitating Latin—fake erudition"
    },
    {
      period: "Modern English (1700-present)",
      form: "debt",
      meaning: "quantified financial obligation, asset class, tradeable instrument",
      notes: "Debt securitization: debts bought/sold like commodities. Moral dimension extinct."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "Canon law shift: debt from sin (moral) → contract (legal)",
      chargeLost: 3,
      context: "Church prohibits usury but creates loopholes. Debt transitions from spiritual failing to enforceable legal claim."
    },
    {
      year: 1500,
      event: "Commodification: debts become transferable assets",
      chargeLost: 4,
      context: "Bills of exchange enable debt trading. Creditor need not be original lender. Debt abstracted from relationship."
    },
    {
      year: 1980,
      event: "Financialization: debt as speculative instrument (CDOs, derivatives)",
      chargeLost: 2,
      context: "Debt bundled, sliced, sold globally. 2008 crisis: debt several layers removed from original obligation. Pure abstraction."
    }
  ]
};

export const tradeSpecimen: WordSpecimen = {
  modern: "trade",
  pieRoot: "*der-",
  pieMeaning: "to split, flay, peel; to walk, step",
  liveCharge: 5,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*der-",
      meaning: "to split, peel; to walk, tread a path",
      notes: "Ambiguous root: splitting (division) AND stepping (pathway)—relevant to exchange"
    },
    {
      period: "Middle Low German (c. 1300)",
      form: "trade",
      meaning: "track, course, pathway",
      notes: "Physical track worn by repeated passage—trade routes as literal paths"
    },
    {
      period: "Middle English (c. 1400)",
      form: "trade",
      meaning: "path, track, course; regular movement along a route",
      notes: "Trade routes = shipping lanes, caravan paths. Still geographical."
    },
    {
      period: "Early Modern English (c. 1550)",
      form: "trade",
      meaning: "business conducted along a route; commerce, occupation",
      notes: "Metonymy: path → activity conducted on path. 'Tradesman' emerges."
    },
    {
      period: "Modern English (c. 1700)",
      form: "trade",
      meaning: "exchange of goods, commerce; skilled occupation",
      notes: "Dual sense: trading (exchange) + trade (craft). Pathway sense obsolete."
    },
    {
      period: "Contemporary (1900-present)",
      form: "trade",
      meaning: "international commerce, financial markets, abstract exchange",
      notes: "'Trade war,' 'trade deficit'—fully abstracted from physical movement"
    }
  ],
  bleachingEvents: [
    {
      year: 1550,
      event: "Metonymic abstraction: physical path → commercial activity",
      chargeLost: 2,
      context: "Shift from concrete (you trade by walking the Silk Road) to abstract (you trade = you exchange goods)."
    },
    {
      year: 1800,
      event: "De-embodiment: trade possible without physical goods movement",
      chargeLost: 2,
      context: "Futures contracts, commodity exchanges—trade in abstractions (rights to goods not yet produced)."
    },
    {
      year: 1980,
      event: "Digitalization: high-frequency trading, nanosecond exchanges",
      chargeLost: 1,
      context: "Trade = algorithmic signals. No human decision, no goods, no pathway. Pure information."
    }
  ]
};

export const marketSpecimen: WordSpecimen = {
  modern: "market",
  pieRoot: "*(s)mer-",
  pieMeaning: "to get a share, portion; to remember, be mindful",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*(s)mer-",
      meaning: "to allot, assign a share; to remember one's portion",
      notes: "Sacred division—shares allocated by ritual, not haggling"
    },
    {
      period: "Latin (c. 300 BCE)",
      form: "merx",
      meaning: "wares, merchandise, commodity",
      notes: "What is portioned out for exchange. God Mercurius presides over fair division."
    },
    {
      period: "Classical Latin (100 BCE)",
      form: "mercātus",
      meaning: "trading, market; place of exchange",
      notes: "Public square under divine witness (Mercury's oversight). Sacred/civic space."
    },
    {
      period: "Old English (c. 1000)",
      form: "market (borrowed)",
      meaning: "gathering for trade, marketplace",
      notes: "Market day = social/religious occasion, not just commerce. Communal bonding."
    },
    {
      period: "Middle English (c. 1300)",
      form: "market",
      meaning: "place or time for buying and selling",
      notes: "Still physical location. 'Market cross' = sacred center of town square."
    },
    {
      period: "Early Modern English (c. 1600)",
      form: "market",
      meaning: "abstract system of exchange; supply and demand",
      notes: "'The market' as invisible mechanism. Adam Smith: market as natural order."
    },
    {
      period: "Modern English (1900-present)",
      form: "market",
      meaning: "self-regulating price system, financial markets, 'market forces'",
      notes: "'The market' as deity—allocates resources, punishes inefficiency. Neoliberal theology."
    }
  ],
  bleachingEvents: [
    {
      year: 1000,
      event: "Spatial abstraction: sacred square → any exchange site",
      chargeLost: 2,
      context: "Market spreads from temple/forum to any crossroads. Mercury's presence dilutes."
    },
    {
      year: 1600,
      event: "'The market' as autonomous force (invisible hand)",
      chargeLost: 3,
      context: "Adam Smith: market as self-organizing system. Replaces divine order with mechanical order. God → Natural Law."
    },
    {
      year: 1980,
      event: "Market fundamentalism: 'market knows best'",
      chargeLost: 3,
      context: "Neoliberalism: market logic applied to ALL domains (dating, education, organs). Total colonization. Original sacred division forgotten."
    }
  ]
};

export const purchaseSpecimen: WordSpecimen = {
  modern: "purchase",
  pieRoot: "*kap-",
  pieMeaning: "to seize, grasp, take hold of",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*kap-",
      meaning: "to seize, grasp (possibly onomatopoeic)",
      notes: "Physical grasping—hunter seizing prey. Embodied action."
    },
    {
      period: "Latin (c. 100 BCE)",
      form: "capere",
      meaning: "to take, seize, capture",
      notes: "Hunt, warfare, capture. High-stakes taking."
    },
    {
      period: "Vulgar Latin (c. 400 CE)",
      form: "*captiāre",
      meaning: "to try to seize, chase after",
      notes: "Iterative: repeated attempts to capture. Effort required."
    },
    {
      period: "Old French (c. 1100)",
      form: "chacier",
      meaning: "to hunt, chase, pursue eagerly",
      notes: "Aristocratic hunt—still physical, dangerous, sacred (ritual kill)"
    },
    {
      period: "Anglo-French (c. 1300)",
      form: "purchaser",
      meaning: "to seek to obtain, strive for; to acquire by effort",
      notes: "pur- (forth) + chaser. Still implies exertion, quest."
    },
    {
      period: "Middle English (c. 1400)",
      form: "purchasen",
      meaning: "to acquire by payment (but retains 'striving' sense)",
      notes: "Transition: hunting → buying, but effort still implied"
    },
    {
      period: "Modern English (1700-present)",
      form: "purchase",
      meaning: "to buy; consumer transaction",
      notes: "'One-click purchase'—zero effort. From hunting stag → clicking button."
    }
  ],
  bleachingEvents: [
    {
      year: 1400,
      event: "From hunting (death-stakes) → buying (peaceful exchange)",
      chargeLost: 3,
      context: "Aristocratic chase (life/death) becomes bourgeois shopping. Danger evaporates."
    },
    {
      year: 1800,
      event: "Effort minimization: department stores, catalogs",
      chargeLost: 2,
      context: "Consumer convenience culture. Purchase = passive selection, not active quest."
    },
    {
      year: 1995,
      event: "One-click purchasing (Amazon patent 1999)",
      chargeLost: 1,
      context: "Ultimate effortlessness. From stalking prey → finger twitch. Dopamine hit replaces achievement."
    }
  ]
};

export const valueSpecimen: WordSpecimen = {
  modern: "value",
  pieRoot: "*wal-",
  pieMeaning: "to be strong, to rule, to have power",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*wal-",
      meaning: "to be strong, powerful; to rule",
      notes: "Intrinsic strength—a warrior's valor, a king's authority"
    },
    {
      period: "Latin (c. 200 BCE)",
      form: "valēre",
      meaning: "to be strong, healthy, vigorous; to have worth",
      notes: "Still physical: strong body = valuable. Virtue (virtus) = manly strength."
    },
    {
      period: "Old French (c. 1100)",
      form: "valoir",
      meaning: "to be worth, have value, be strong",
      notes: "Worth tied to capacity—what can you DO? Functional strength."
    },
    {
      period: "Anglo-French (c. 1300)",
      form: "value",
      meaning: "worth, merit, usefulness",
      notes: "Noun: the quality of being strong/worthy. Still qualitative."
    },
    {
      period: "Middle English (c. 1400)",
      form: "value",
      meaning: "material worth, price, valuation",
      notes: "Shift to quantitative: how much will someone pay? Market determines value."
    },
    {
      period: "Early Modern English (c. 1600)",
      form: "value",
      meaning: "monetary worth, exchange value",
      notes: "Use-value vs. exchange-value split. Political economy: value = socially necessary labor time."
    },
    {
      period: "Modern English (1900-present)",
      form: "value",
      meaning: "abstract utility, shareholder value, 'value proposition'",
      notes: "'Creating value,' 'value-added'—managerial jargon. Original strength erased."
    }
  ],
  bleachingEvents: [
    {
      year: 1400,
      event: "From intrinsic strength → market-assigned price",
      chargeLost: 3,
      context: "Value no longer IN the thing (its power/virtue) but assigned BY the market. Externalized."
    },
    {
      year: 1776,
      event: "Labor theory of value (Smith/Ricardo)",
      chargeLost: 2,
      context: "Value = crystallized labor. Strength abstracted to work-hours. Classical economics."
    },
    {
      year: 1871,
      event: "Marginal utility theory: value = subjective preference",
      chargeLost: 2,
      context: "Neoclassical revolution: value in the eye of beholder. No objective anchor. Pure relativism."
    }
  ]
};

export const wealthSpecimen: WordSpecimen = {
  modern: "wealth",
  pieRoot: "*wel-",
  pieMeaning: "to wish, will, desire; to be well",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*wel-",
      meaning: "to wish, will, choose; to be content",
      notes: "Root of 'will, voluntary, volition'—autonomous desire, spiritual alignment"
    },
    {
      period: "Proto-Germanic (c. 500 BCE)",
      form: "*welōn-",
      meaning: "well-being, prosperity, favorable condition",
      notes: "Eudaimonia—flourishing in accord with one's nature. Qualitative."
    },
    {
      period: "Old English (c. 900)",
      form: "wela",
      meaning: "well-being, prosperity, happiness; worldly riches",
      notes: "Ambiguous: spiritual welfare OR material goods. Not yet split."
    },
    {
      period: "Middle English (c. 1250)",
      form: "welth(e)",
      meaning: "state of well-being; material prosperity",
      notes: "Suffix -th (abstract state). Still implies holistic well-being."
    },
    {
      period: "Early Modern English (c. 1600)",
      form: "wealth",
      meaning: "material riches, abundance of possessions",
      notes: "Spiritual sense fades. 'Wealth of a nation' (Adam Smith 1776) = economic output."
    },
    {
      period: "Modern English (1800-present)",
      form: "wealth",
      meaning: "net worth, assets minus liabilities, financial portfolio",
      notes: "'Wealth management,' 'wealth inequality'—purely quantitative. Well-being forgotten."
    }
  ],
  bleachingEvents: [
    {
      year: 1250,
      event: "Semantic narrowing: well-being → material prosperity",
      chargeLost: 2,
      context: "Wealth begins privileging external goods over internal virtue. Aristotelian eudaimonia splits."
    },
    {
      year: 1776,
      event: "Economization: wealth as measurable national output",
      chargeLost: 3,
      context: "Adam Smith: 'Wealth of Nations' = GDP avant la lettre. Wealth = quantity of stuff, not quality of life."
    },
    {
      year: 1980,
      event: "Financialization: wealth as portfolio balance",
      chargeLost: 2,
      context: "Wealth detached from productive activity. Billionaire wealth = stock valuations (paper), not use-values. Speculative abstraction."
    }
  ]
};

export const economySpecimen: WordSpecimen = {
  modern: "economy",
  pieRoot: "*weyk-",
  pieMeaning: "to enter, settle; clan/household unit",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*weyḱ-",
      meaning: "to enter and settle; social unit, clan above household",
      notes: "Root of villa, village—sacred settlement, kinship space"
    },
    {
      period: "Greek (c. 400 BCE)",
      form: "οἶκος (oikos)",
      meaning: "house, household, family estate",
      notes: "Domestic sphere—production/reproduction under one roof. Aristotle: oikos vs. polis."
    },
    {
      period: "Classical Greek (350 BCE)",
      form: "οἰκονομία (oikonomia)",
      meaning: "household management, stewardship",
      notes: "Oikos (house) + nomos (law/custom). Art of managing finite household resources."
    },
    {
      period: "Latin (c. 100 CE)",
      form: "oeconomia",
      meaning: "management of household or state",
      notes: "Expanded to statecraft but retains household metaphor. Still human-scale."
    },
    {
      period: "Middle French (c. 1530)",
      form: "économie",
      meaning: "art of managing resources; thrift",
      notes: "'Political economy' emerges—managing state finances like household budget"
    },
    {
      period: "English (c. 1650)",
      form: "economy",
      meaning: "system of production and consumption in a state",
      notes: "Transition: household management → abstract system. Mercantilism, then classical economics."
    },
    {
      period: "Modern (1900-present)",
      form: "economy",
      meaning: "global capitalist system, GDP, market mechanisms",
      notes: "'The economy' as autonomous entity obeying laws. No household, no oikos. Pure abstraction."
    }
  ],
  bleachingEvents: [
    {
      year: 1650,
      event: "Scale explosion: household → national economy",
      chargeLost: 3,
      context: "Mercantilism: economy as state concern, not family. Oikos metaphor stretched beyond meaning."
    },
    {
      year: 1776,
      event: "Naturalization: economy as self-regulating system",
      chargeLost: 3,
      context: "Adam Smith: economy as natural order (like gravity). No longer managed—it manages itself. Invisible hand replaces householder."
    },
    {
      year: 1944,
      event: "Globalization: Bretton Woods, 'world economy'",
      chargeLost: 2,
      context: "Economy transcends nations. Global supply chains, IMF, World Bank. No locus, no home. Oikos completely evacuated."
    }
  ]
};

/**
 * Export all economic specimens as a collection
 */
export const ECONOMIC_SPECIMENS: WordSpecimen[] = [
  moneySpecimen,
  wageSpecimen,
  profitSpecimen,
  debtSpecimen,
  tradeSpecimen,
  marketSpecimen,
  purchaseSpecimen,
  valueSpecimen,
  wealthSpecimen,
  economySpecimen
];

/**
 * Sources:
 *
 * - Etymonline: https://www.etymonline.com
 * - Indo-European Lexicon (PIE Lexicon): http://pielexicon.hum.helsinki.fi
 * - Wiktionary Proto-Indo-European reconstructions
 * - American Economic Association: "What Did the Ancient Greeks Mean by Oikonomia?"
 * - ResearchGate: Academic papers on monetary etymology
 * - Temple of Juno Moneta: https://en.wikipedia.org/wiki/Temple_of_Juno_Moneta
 */
