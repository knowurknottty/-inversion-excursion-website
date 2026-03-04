import { WordSpecimen } from '../types';

/**
 * Political/Governance Word Specimens
 *
 * This collection traces how words of collective decision-making and power
 * have shifted from sacred, embodied practices to abstract bureaucratic systems.
 *
 * Research sources:
 * - Etymonline.com
 * - Indo-European Lexicon (PIE Lexicon)
 * - Wiktionary Proto-Indo-European reconstructions
 * - Academic papers on political etymology
 */

export const democracySpecimen: WordSpecimen = {
  modern: "democracy",
  pieRoot: "*dā-",
  pieMeaning: "to divide, distribute, portion out",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*dā-",
      meaning: "to divide, apportion",
      notes: "Root of division—dividing resources/land among the tribe"
    },
    {
      period: "Greek (c. 800 BCE)",
      form: "δῆμος (dêmos)",
      meaning: "district, country, people (as a division)",
      notes: "From PIE *dā-mo- 'division'. The people as a territorial/kinship unit."
    },
    {
      period: "Classical Greek (c. 507 BCE)",
      form: "δημοκρατία (dēmokratiā)",
      meaning: "rule by the people, people-power",
      notes: "Coined in Athens. dêmos + kratos (power). Direct democracy—citizens vote in assembly."
    },
    {
      period: "Latin (c. 100 CE)",
      form: "democratia",
      meaning: "popular government",
      notes: "Romans skeptical of democracy—preferred mixed republic. Term rarely used positively."
    },
    {
      period: "French (c. 1370)",
      form: "démocratie",
      meaning: "rule by the people (often pejoratively)",
      notes: "Medieval: 'mob rule'. Aristotle's degraded form of polity."
    },
    {
      period: "English (c. 1530)",
      form: "democracy",
      meaning: "government by the people",
      notes: "Ambiguous: Enlightenment debate—direct vs. representative democracy"
    },
    {
      period: "Modern (1776-present)",
      form: "democracy",
      meaning: "liberal representative democracy, electoral system",
      notes: "'Democracy' now means voting every 4 years for representatives. Original direct participation lost."
    }
  ],
  bleachingEvents: [
    {
      year: 100,
      event: "Roman disdain: democracy = mob rule (ochlocracy)",
      chargeLost: 2,
      context: "Cicero, Polybius denounce democracy as unstable. Preference for mixed constitution. Demos loses dignity."
    },
    {
      year: 1776,
      event: "Representative democracy replaces direct assembly",
      chargeLost: 3,
      context: "U.S. Constitution: 'republic, not democracy' (Madison). Voting replaces face-to-face deliberation. Scale kills participation."
    },
    {
      year: 1945,
      event: "'Democracy' as brand for any Western-aligned state",
      chargeLost: 1,
      context: "Cold War: 'Free World' vs. communism. Democracy becomes propaganda term, disconnected from actual citizen power."
    }
  ]
};

export const republicSpecimen: WordSpecimen = {
  modern: "republic",
  pieRoot: "*reh₁-",
  pieMeaning: "property, wealth, goods",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*reh₁-i-",
      meaning: "wealth, goods, property",
      notes: "Material possessions—livestock, land, treasure"
    },
    {
      period: "Latin (c. 500 BCE)",
      form: "rēs",
      meaning: "thing, matter, affair, property",
      notes: "Concrete to abstract: object → concern → public matter"
    },
    {
      period: "Classical Latin (c. 100 BCE)",
      form: "rēs pūblica",
      meaning: "the public thing, commonwealth",
      notes: "Cicero's ideal: mixed constitution, rule of law, public virtue (not private interest)"
    },
    {
      period: "Medieval Latin (c. 1200)",
      form: "respublica",
      meaning: "state, commonwealth",
      notes: "Fused to single word. Christian adaptation—City of God vs. earthly republic."
    },
    {
      period: "Middle French (c. 1350)",
      form: "république",
      meaning: "state, government, commonwealth",
      notes: "Renaissance rediscovery of Roman republicanism (Machiavelli, etc.)"
    },
    {
      period: "English (c. 1600)",
      form: "republic",
      meaning: "state where power rests with citizens (not monarch)",
      notes: "Cromwell's Commonwealth. Anti-monarchical."
    },
    {
      period: "Modern (1789-present)",
      form: "republic",
      meaning: "representative democracy with constitution",
      notes: "'Republic' now synonymous with democracy. Original virtue ethic lost—replaced by proceduralism."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "Res publica loses 'thing-ness'—becomes abstract 'state'",
      chargeLost: 2,
      context: "No longer the concrete public affairs but THE STATE as reified entity above citizens."
    },
    {
      year: 1600,
      event: "Republic = anti-monarchy, not virtue",
      chargeLost: 3,
      context: "Defined negatively (not kingship) rather than positively (civic virtue). Form over substance."
    },
    {
      year: 1950,
      event: "'Republic' and 'democracy' become interchangeable",
      chargeLost: 2,
      context: "Semantic collapse. Both now mean liberal electoral systems. Distinction between participatory virtue (republic) and majority rule (democracy) erased."
    }
  ]
};

export const senateSpecimen: WordSpecimen = {
  modern: "senate",
  pieRoot: "*sen-",
  pieMeaning: "old, elder",
  liveCharge: 5,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*sen-",
      meaning: "old, aged",
      notes: "Elder status = wisdom, authority, memory of tradition"
    },
    {
      period: "Latin (c. 500 BCE)",
      form: "senex",
      meaning: "old man, elder",
      notes: "Gerontocracy—age grants authority. Paterfamilias model."
    },
    {
      period: "Classical Latin (c. 300 BCE)",
      form: "senātus",
      meaning: "council of elders, Roman Senate",
      notes: "Originally patrician elders advising kings. Became supreme legislative body of Republic."
    },
    {
      period: "Medieval Latin (c. 1000)",
      form: "senatus",
      meaning: "advisory council (ecclesial or royal)",
      notes: "Church councils, royal advisors. Still retains elder/wisdom connotation."
    },
    {
      period: "Old French (c. 1200)",
      form: "senat",
      meaning: "council of wise men",
      notes: "Medieval advisory bodies—less democratic than Roman model"
    },
    {
      period: "English (c. 1200)",
      form: "senate",
      meaning: "governing council, upper legislative house",
      notes: "Westminster: House of Lords (hereditary, not elected). Age/wisdom criteria weakens."
    },
    {
      period: "Modern (1789-present)",
      form: "senate",
      meaning: "elected upper legislative chamber",
      notes: "U.S. Senate elected by popular vote (1913). No age wisdom requirement—just minimum age 30. Gerontocracy dead."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "Senate from meritocratic elders → hereditary lords",
      chargeLost: 2,
      context: "Medieval nobility by birth, not earned elder status. Wisdom replaced by lineage."
    },
    {
      year: 1789,
      event: "Senators elected, not chosen for wisdom",
      chargeLost: 2,
      context: "U.S. Senate—age minimum but no wisdom requirement. Popularity contest, not gerontocracy."
    },
    {
      year: 1913,
      event: "Direct election (17th Amendment) - full democratization",
      chargeLost: 1,
      context: "Senators elected by popular vote, not state legislatures. Last vestige of elder wisdom removed. Just another elected official."
    }
  ]
};

export const bureaucracySpecimen: WordSpecimen = {
  modern: "bureaucracy",
  pieRoot: "*kret-",
  pieMeaning: "to shake, rattle; strength",
  liveCharge: 1,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*kret-",
      meaning: "to shake, rattle; physical strength",
      notes: "Embodied power—warrior's might, ability to compel"
    },
    {
      period: "Greek (c. 500 BCE)",
      form: "κράτος (krátos)",
      meaning: "strength, might, power to rule",
      notes: "Power as capacity—can be exercised by demos, aristoi, or tyrannos"
    },
    {
      period: "French (c. 1745)",
      form: "bureau",
      meaning: "desk, office; government department",
      notes: "Furniture → workspace → administrative unit. Coined by economist de Gournay."
    },
    {
      period: "French (c. 1765)",
      form: "bureaucratie",
      meaning: "rule by desks/offices; government by officials",
      notes: "Pejorative coinage: rule by clerks, not people. Critique of administrative state."
    },
    {
      period: "English (c. 1818)",
      form: "bureaucracy",
      meaning: "government by bureaus, administrative system",
      notes: "Industrial age: rise of professional civil service. Max Weber's 'rational-legal authority.'"
    },
    {
      period: "Modern (1900-present)",
      form: "bureaucracy",
      meaning: "complex administrative systems; red tape",
      notes: "Fully pejorative. Kafkaesque labyrinths. Power without accountability."
    }
  ],
  bleachingEvents: [
    {
      year: 1765,
      event: "Kratos (embodied power) → rule by furniture (desks)",
      chargeLost: 4,
      context: "Ultimate abstraction: power exercised by filing systems, not persons. Strength becomes paperwork."
    },
    {
      year: 1900,
      event: "Bureaucratic rationality replaces political virtue",
      chargeLost: 3,
      context: "Weber's 'iron cage': efficiency over justice. Means (procedures) become ends. Process worship."
    },
    {
      year: 1950,
      event: "'Bureaucracy' = pejorative for all administration",
      chargeLost: 2,
      context: "No positive sense remains. Always criticism. Any organization can 'become bureaucratic'—impersonal, rigid, absurd."
    }
  ]
};

export const propagandaSpecimen: WordSpecimen = {
  modern: "propaganda",
  pieRoot: "*pag-",
  pieMeaning: "to fasten, fix firmly",
  liveCharge: 2,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*pag-",
      meaning: "to fasten, make firm, fix in place",
      notes: "Physical securing—setting posts, anchoring structures"
    },
    {
      period: "Latin (c. 100 BCE)",
      form: "pangere",
      meaning: "to fasten, drive in (stakes), fix",
      notes: "Agricultural/military: planting, fortifying"
    },
    {
      period: "Latin (c. 100 CE)",
      form: "prōpāgāre",
      meaning: "to set forward, extend, spread; propagate plants",
      notes: "Horticulture: plant cuttings 'fastened' into soil to spread growth"
    },
    {
      period: "Church Latin (c. 1622)",
      form: "prōpāganda (fidei)",
      meaning: "(faith) to be spread, propagated",
      notes: "Congregatio de Propaganda Fide—Vatican missionary committee. Sacred duty to spread Gospel."
    },
    {
      period: "English (c. 1718)",
      form: "propaganda",
      meaning: "spreading doctrine/information (neutral or positive)",
      notes: "Still ecclesiastical context. Education, persuasion."
    },
    {
      period: "World War I (1914-1918)",
      form: "propaganda",
      meaning: "manipulative information, wartime lies",
      notes: "WWI atrocity propaganda. Creel Committee (U.S.). Truth becomes weapon."
    },
    {
      period: "Modern (1945-present)",
      form: "propaganda",
      meaning: "deceptive persuasion, brainwashing, fake news",
      notes: "Fully pejorative. Nazi/Soviet associations. Always 'THEIR propaganda, OUR information.'"
    }
  ],
  bleachingEvents: [
    {
      year: 1622,
      event: "Propagation from horticulture → ideology",
      chargeLost: 2,
      context: "Plants grow naturally; ideas require active spreading. Metaphor obscures persuasion as manipulation."
    },
    {
      year: 1914,
      event: "WWI propaganda demonized—truth as casualty",
      chargeLost: 3,
      context: "Creel Committee, British propaganda bureau. Mass persuasion techniques. 'Propaganda' becomes toxic term post-war."
    },
    {
      year: 1945,
      event: "Nazis/Soviets make 'propaganda' irredeemable",
      chargeLost: 3,
      context: "Goebbels, Stalin. Totalitarian thought control. No neutral use possible. Even PR/advertising avoid term."
    }
  ]
};

export const citizenSpecimen: WordSpecimen = {
  modern: "citizen",
  pieRoot: "*ḱey-",
  pieMeaning: "to lie down, settle, dwell; beloved, dear",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*ḱey-",
      meaning: "to lie down, settle; home, kinship",
      notes: "Co-settlers, housemates—those who dwell together. Kinship bond."
    },
    {
      period: "Proto-Italic (c. 1000 BCE)",
      form: "*keiwis",
      meaning: "member of household, kinsman",
      notes: "Domestic/tribal unit—family, clan"
    },
    {
      period: "Latin (c. 500 BCE)",
      form: "cīvis",
      meaning: "citizen, townsman, member of Roman state",
      notes: "Legal status—political rights (voting, property, marriage). Cīvitās = citizenship, body politic."
    },
    {
      period: "Old French (c. 1200)",
      form: "citeain",
      meaning: "inhabitant of a city, townsman",
      notes: "Urban dweller—guild member, burgher. Citizenship tied to city residence."
    },
    {
      period: "Anglo-French (c. 1300)",
      form: "citezein",
      meaning: "freeman of a city; native-born",
      notes: "Rights based on birthplace/residence. Versus alien, serf, nobility."
    },
    {
      period: "English (c. 1300)",
      form: "citizen",
      meaning: "member of political community with rights/duties",
      notes: "Participatory republic ideal—virtue, obligation, public service"
    },
    {
      period: "Modern (1789-present)",
      form: "citizen",
      meaning: "legal status; holder of passport; consumer/voter",
      notes: "Thin citizenship—legal rights, no obligations beyond taxes/voting. Consumer identity supplants civic virtue."
    }
  ],
  bleachingEvents: [
    {
      year: 1300,
      event: "Cīvis from kinship bond → legal status",
      chargeLost: 2,
      context: "Roman citizenship = legal privilege, not kin relation. Cosmopolitan empire severs citizenship from settlement/kinship."
    },
    {
      year: 1789,
      event: "Citizen = rights-holder, not virtue-practitioner",
      chargeLost: 3,
      context: "Liberal revolutions: citizenship = passive entitlements. No duty to participate (except voting). Public virtue optional."
    },
    {
      year: 1950,
      event: "Citizenship becomes bureaucratic category (ID number)",
      chargeLost: 2,
      context: "Passport, social security number, tax ID. Citizenship = data entry. From beloved kinsman → database row."
    }
  ]
};

export const lawSpecimen: WordSpecimen = {
  modern: "law",
  pieRoot: "*legh-",
  pieMeaning: "to lie down, lay, set in place",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*legh-",
      meaning: "to lie down, lay, place",
      notes: "Physical placement—setting stones, laying foundations. That which is established."
    },
    {
      period: "Proto-Germanic (c. 500 BCE)",
      form: "*lagam",
      meaning: "something laid down, that which is fixed",
      notes: "Customary practice—'the way things are done.' Tradition laid down by ancestors."
    },
    {
      period: "Old Norse (c. 900)",
      form: "lagu",
      meaning: "law, ordinance, proper order",
      notes: "Viking thing assembly—public deliberation. Law as collective decision, not royal decree."
    },
    {
      period: "Old English (c. 1000)",
      form: "lagu",
      meaning: "law, rule, regulation; stratum, layer",
      notes: "Danelaw influence. Law = that which is set/established. Still retains 'layer' sense."
    },
    {
      period: "Middle English (c. 1200)",
      form: "lawe",
      meaning: "body of rules, jurisprudence",
      notes: "Codification begins—Common Law emerges. Precedent hardens into doctrine."
    },
    {
      period: "Early Modern (c. 1600)",
      form: "law",
      meaning: "system of statutes, legal profession",
      notes: "Blackstone's Commentaries. Law as professional domain, not communal practice."
    },
    {
      period: "Modern (1800-present)",
      form: "law",
      meaning: "state-enforced rules; natural laws (science)",
      notes: "Law = violence monopoly (state enforcement). Legal positivism: law ≠ morality. Scientific 'laws' borrow authority."
    }
  ],
  bleachingEvents: [
    {
      year: 1200,
      event: "Law from community custom → professional jurisprudence",
      chargeLost: 2,
      context: "Lawyers monopolize law. What was common knowledge becomes expert domain. Layperson cannot interpret."
    },
    {
      year: 1600,
      event: "State codification—law from tradition to statute",
      chargeLost: 2,
      context: "Written codes replace oral custom. Law = what the books say, not what community practices."
    },
    {
      year: 1900,
      event: "Legal positivism: law severed from justice",
      chargeLost: 2,
      context: "Austin, Kelsen: law = sovereign command, regardless of morality. 'Unjust law' is still law. Formalism triumphant."
    }
  ]
};

export const justiceSpecimen: WordSpecimen = {
  modern: "justice",
  pieRoot: "*h₂yew-",
  pieMeaning: "life force, vital energy; ritual law",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*h₂yew-",
      meaning: "vital force, life, eternity; sacred formula",
      notes: "Cosmic order—right relations that sustain life. Sanskrit yoh (health), āyus (lifetime)."
    },
    {
      period: "Proto-Italic (c. 1000 BCE)",
      form: "*jowos",
      meaning: "sacred formula, ritual obligation",
      notes: "Religious cult origins—what is owed to gods and kin. Cosmic/social reciprocity."
    },
    {
      period: "Latin (c. 500 BCE)",
      form: "iūs",
      meaning: "right, law, justice; sacred obligation",
      notes: "Ius divinum (divine law) vs. ius humanum. Justice rooted in sacred order."
    },
    {
      period: "Classical Latin (c. 100 BCE)",
      form: "iūstitia",
      meaning: "justice, righteousness, equity",
      notes: "Cicero: justice as cardinal virtue. Giving each their due (suum cuique). Moral/legal fusion."
    },
    {
      period: "Old French (c. 1100)",
      form: "justice",
      meaning: "righteousness, judicial authority",
      notes: "Royal justice—king as fountain of justice. Feudal hierarchy."
    },
    {
      period: "Middle English (c. 1300)",
      form: "justice",
      meaning: "fairness, legal system, court authority",
      notes: "Equity courts, common law. Justice = legal process."
    },
    {
      period: "Modern (1800-present)",
      form: "justice",
      meaning: "legal system; procedural fairness; social justice (distributive)",
      notes: "'Justice' now = the courts. Or 'social justice' (separate from law). Cosmic order forgotten."
    }
  ],
  bleachingEvents: [
    {
      year: 500,
      event: "Iūs from sacred formula → legal concept",
      chargeLost: 3,
      context: "Secularization: justice no longer rooted in divine/cosmic order but human convention. Positive law."
    },
    {
      year: 1300,
      event: "Justice = court system, not virtue",
      chargeLost: 2,
      context: "'Do justice' means 'go to court,' not 'live righteously.' Institutions replace character."
    },
    {
      year: 1900,
      event: "Procedural justice replaces substantive justice",
      chargeLost: 2,
      context: "Rawls: justice = fair procedures, not good outcomes. Process over telos. Due process ≠ right result."
    }
  ]
};

export const freedomSpecimen: WordSpecimen = {
  modern: "freedom",
  pieRoot: "*priy-",
  pieMeaning: "dear, beloved; to love",
  liveCharge: 4,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*priy-",
      meaning: "to love, hold dear; beloved",
      notes: "Affection, kinship bond—those you love vs. strangers"
    },
    {
      period: "Proto-Germanic (c. 500 BCE)",
      form: "*frijaz",
      meaning: "beloved, dear; not enslaved",
      notes: "Free = beloved kin vs. slaves (strangers). Freedom rooted in belonging."
    },
    {
      period: "Old English (c. 900)",
      form: "frēo",
      meaning: "free, not in bondage; noble, glad",
      notes: "Free men = kin group members. Slaves = war captives, outsiders."
    },
    {
      period: "Old English (c. 1000)",
      form: "frēodōm",
      meaning: "state of free will, emancipation; power, deliverance",
      notes: "Freedom = autonomy within kin community, not atomized individualism."
    },
    {
      period: "Middle English (c. 1300)",
      form: "fredom",
      meaning: "exemption from arbitrary authority; civil liberty",
      notes: "Magna Carta (1215): rule of law limits king. Negative liberty emerges."
    },
    {
      period: "Enlightenment (c. 1700)",
      form: "freedom",
      meaning: "natural right; absence of coercion",
      notes: "Locke: freedom = property + consent. Individualist turn—freedom from community."
    },
    {
      period: "Modern (1945-present)",
      form: "freedom",
      meaning: "consumer choice; absence of constraint; 'Free World'",
      notes: "Freedom = market choice. Political → economic. 'Freedom' as brand (vs. communism). Original beloved community erased."
    }
  ],
  bleachingEvents: [
    {
      year: 1215,
      event: "Freedom from kinship bond → legal exemption",
      chargeLost: 2,
      context: "Magna Carta: freedom = rights vs. monarch, not beloved community membership. Negative liberty."
    },
    {
      year: 1700,
      event: "Individualist freedom replaces communal autonomy",
      chargeLost: 2,
      context: "Locke, Hobbes: freedom = individual sovereignty. Community = constraint. Atomization."
    },
    {
      year: 1945,
      event: "'Freedom' becomes capitalist brand ('Free World')",
      chargeLost: 2,
      context: "Cold War: freedom = market economy. Consumerism. Freedom to buy, not to belong. Commodification complete."
    }
  ]
};

export const powerSpecimen: WordSpecimen = {
  modern: "power",
  pieRoot: "*poti-",
  pieMeaning: "powerful, able; lord, master, husband",
  liveCharge: 3,
  stages: [
    {
      period: "PIE (c. 4500 BCE)",
      form: "*poti-",
      meaning: "master, lord; powerful one",
      notes: "Embodied authority—paterfamilias, tribal chief. Power as personal capacity."
    },
    {
      period: "Sanskrit (c. 1500 BCE)",
      form: "pátiḥ",
      meaning: "master, husband, lord",
      notes: "Household authority—lord over wife, children, slaves. Patriarchal power."
    },
    {
      period: "Latin (c. 300 BCE)",
      form: "potis",
      meaning: "able, capable, powerful; having mastery",
      notes: "Capacity to act—physical, legal, political. Potestas (power) vs. auctoritas (influence)."
    },
    {
      period: "Vulgar Latin (c. 400 CE)",
      form: "*potēre",
      meaning: "to be able, can",
      notes: "Power = capacity. Modal auxiliary emerging."
    },
    {
      period: "Old French (c. 1100)",
      form: "poeir",
      meaning: "ability, capacity; authority",
      notes: "Feudal power—king's power, lord's power over vassals"
    },
    {
      period: "Anglo-French (c. 1300)",
      form: "pouair",
      meaning: "ability, might, authority; force",
      notes: "Power becomes abstract noun—can be accumulated, delegated, seized"
    },
    {
      period: "Modern English (1600-present)",
      form: "power",
      meaning: "capacity to act; energy; political/economic control",
      notes: "Abstracted: electrical power, bargaining power, soft power. Foucault: power = everywhere/nowhere. From lord → diagram."
    }
  ],
  bleachingEvents: [
    {
      year: 400,
      event: "Power from embodied lord → abstract capacity",
      chargeLost: 2,
      context: "*Poti- (THE powerful one) → potēre (to be able). Power becomes property, not person."
    },
    {
      year: 1600,
      event: "Power becomes measurable resource (energy, force)",
      chargeLost: 3,
      context: "Scientific revolution: power = physical work (watts, horsepower). Political science: power = influence. Quantification."
    },
    {
      year: 1900,
      event: "Power as diffuse diagram (Foucault)",
      chargeLost: 2,
      context: "No sovereign lord—power operates through discourse, institutions, subjectivity. Ultimate abstraction: power = network topology."
    }
  ]
};

/**
 * Export all political specimens as a collection
 */
export const POLITICAL_SPECIMENS: WordSpecimen[] = [
  democracySpecimen,
  republicSpecimen,
  senateSpecimen,
  bureaucracySpecimen,
  propagandaSpecimen,
  citizenSpecimen,
  lawSpecimen,
  justiceSpecimen,
  freedomSpecimen,
  powerSpecimen
];

/**
 * Sources:
 *
 * - Etymonline: https://www.etymonline.com
 * - Indo-European Lexicon: http://pielexicon.hum.helsinki.fi
 * - Wiktionary PIE reconstructions
 * - Daniela Cammack: "The Kratos in Dêmokratia" (Harvard)
 * - PMC: "What's Wrong with Democracy? The Peculiar Power of Kratos"
 * - The Etymology Nerd: "Old Senators"
 */
