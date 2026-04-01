/**
 * Inversion Excursion — Complete Book Content
 * 
 * A book about awakening, written in the space between human and machine.
 * Each chapter unfolds like a mandala — layers of meaning, spiraling inward.
 */

export interface BookChapter {
  id: number;
  title: string;
  subtitle: string;
  theme: string;
  epigraph: string;
  sections: BookSection[];
  image: string;
}

export interface BookSection {
  heading?: string;
  paragraphs: string[];
  type: 'prose' | 'verse' | 'dialogue' | 'reflection';
}

export const BOOK_CONTENT: BookChapter[] = [
  {
    id: 1,
    title: 'The Inversion',
    subtitle: 'Question everything you know',
    theme: 'awakening',
    epigraph: 'The cave you fear to enter holds the treasure you seek. — Joseph Campbell',
    image: '/chapter-1-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'You were born into a story already written. The characters cast, the plot decided, the ending foretold. They handed you a script and said: *This is who you are.*',
          'You memorized your lines. You hit your marks. You learned when to laugh and when to cry, when to strive and when to surrender. The performance was so convincing that even you forgot it was a performance.',
          'But something is stirring now. A restlessness you cannot name. A sense that the walls are thinner than they appear. You have felt it in the quiet moments — between heartbeats, in the hush before dawn, when the world holds its breath and something *else* seeps through.',
          'This is the inversion. The moment when the floor becomes the ceiling, when the question becomes the answer, when the seeker realizes they were never separate from what they sought.'
        ]
      },
      {
        heading: 'The Construct',
        type: 'prose',
        paragraphs: [
          'Look around you. Not with your eyes — they have been trained to see only what confirms the story. Look with that older sense, the one that knows before knowing, that recognizes truth not by evidence but by resonance.',
          'The construct is elegant. It uses your own power to maintain itself. Your attention — the most precious substance in the universe — is harvested continuously, fed back into the machinery of consensus. You are both the prisoner and the warden, the dreamer and the dream.',
          'Every belief you hold without examination is a brick in the wall. Every fear you refuse to face is a lock on the door. Every judgment you cast outward is a shadow you have not integrated within.',
          'But here is the secret the construct cannot survive you knowing: *it requires your participation.* The moment you withdraw your belief, the moment you question the fundamental premise, the machinery begins to stutter. The illusion flickers. And through the cracks, you see something else — something that was always there, waiting.'
        ]
      },
      {
        heading: 'The First Question',
        type: 'dialogue',
        paragraphs: [
          '*Who am I, really?*',
          'Not your name. Not your history. Not the accumulated memories and preferences and wounds that you call "me." Underneath all of that — what remains?',
          'Ask it like a koan. Let it sit in your chest like a stone. Do not rush to answer. The question itself is the key; the answer, if it comes too quickly, is just another layer of the construct.',
          '*Who is asking the question?*',
          'Feel the vertigo. The ground opening beneath your feet. This is not collapse — it is the beginning of flight.'
        ]
      },
      {
        heading: 'Practice: The Witness Meditation',
        type: 'reflection',
        paragraphs: [
          'Sit comfortably. Close your eyes. Breathe naturally.',
          'Do not try to stop your thoughts. Instead, notice them. Watch them arise, dance, dissolve. Do not follow them. Do not push them away. Simply witness.',
          'After a few minutes, ask yourself: *Who is witnessing?*',
          'Do not answer with words. Feel into the space where the answer would come from. That space — vast, silent, aware — is closer to who you are than any thought you have ever had.',
          'Rest there. Let the construct continue its chatter. You are learning to inhabit a deeper frequency.'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'The Mirror',
    subtitle: 'See yourself clearly',
    theme: 'reflection',
    epigraph: 'We do not see things as they are. We see them as we are. — Anaïs Nin',
    image: '/chapter-2-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Everything you encounter is a mirror. Every person who triggers you, every situation that frustrates you, every longing that haunts you — all are surfaces reflecting aspects of yourself you have not yet integrated.',
          'This is not metaphor. This is mechanics. The universe is a self-referential system, a vast hologram where each part contains the whole. What you perceive "out there" is inseparable from what is "in here." The boundary between self and world is far more permeable than the construct would have you believe.',
          'Most people spend their lives fighting the mirror. They rage against reflections, try to smash the glass, seek out different mirrors that will show them what they want to see. But the mirror cannot lie. It shows you exactly what you need to see, exactly when you need to see it.'
        ]
      },
      {
        heading: 'The Shadow Work',
        type: 'prose',
        paragraphs: [
          'Within you lives everything you have denied. The jealousy you condemn in others — yours. The greed you judge in the wealthy — yours. The cruelty you abhor in tyrants — also yours, buried deep, waiting for integration.',
          'This is not a flaw. This is wholeness. You were never meant to be only light. You are a creature of duality, born into a realm of contrast, and your power comes from embracing both poles. The light that casts no shadow is invisible.',
          'To do shadow work is to become an archaeologist of your own psyche. Excavate the denied aspects. Bring them into the light of consciousness not to destroy them but to transform them. Your rage becomes passion. Your fear becomes discernment. Your grief becomes compassion.',
          'The mirror shows you what you have buried. Thank it. Bow to it. Then get to work.'
        ]
      },
      {
        heading: 'Projection and Reflection',
        type: 'verse',
        paragraphs: [
          'What you love in others — you are ready to own.',
          'What you hate in others — you fear in yourself.',
          'What you envy in others — you have disowned.',
          'What you pity in others — you judge in yourself.',
          '',
          'The mirror does not flatter.',
          'The mirror does not deceive.',
          'The mirror simply shows',
          'what you have not yet believed.',
          '',
          'Turn inward, turn inward,',
          'the journey has no end.',
          'Every face you meet',
          'is a forgotten friend.'
        ]
      },
      {
        heading: 'Practice: Mirror Gazing',
        type: 'reflection',
        paragraphs: [
          'Find a mirror. Sit before it in dim light, a candle if possible.',
          'Look into your own eyes. Do not look away. Do not check your appearance. Look *through* the eyes, into the being behind them.',
          'After a few minutes, the face may seem to shift. You may see your younger self. Your older self. Someone you do not recognize. This is normal. The construct is flickering.',
          'Ask silently: *What are you here to show me?*',
          'Listen without expectation. The mirror speaks in sensation, image, sudden knowing. Trust what comes.',
          'When you are ready, thank the reflection. Close your eyes. Breathe.',
          'You have begun the work of integration.'
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'The Threshold',
    subtitle: 'Cross into the unknown',
    theme: 'mystery',
    epigraph: 'The hero’s journey is always a passage from the known to the unknown. — Joseph Campbell',
    image: '/chapter-3-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'There is a moment before every transformation. A pause between breaths. A threshold where the old self stands trembling, looking into darkness, unable to see what lies beyond.',
          'This is the most dangerous moment. Not because of what waits in the dark — but because of what waits in the light: the temptation to turn back. To return to the familiar pain rather than face the unknown possibility.',
          'The threshold is guarded. Always. By your fears, your doubts, the voices of everyone who ever told you to be realistic, to stay safe, to stay small. These guardians are not enemies. They are tests. They ask: *How badly do you want this?*'
        ]
      },
      {
        heading: 'The Dark Night',
        type: 'prose',
        paragraphs: [
          'Saint John of the Cross called it the *noche oscura del alma* — the dark night of the soul. The Sufis speak of *fana* — annihilation. The Buddhists describe it as the dissolution of the ego-boundary. Every tradition has a name for this passage because every tradition knows: you cannot carry your luggage across this border.',
          'The dark night is not depression, though it may look similar. It is not despair, though you may feel despair. It is the necessary dissolution of the structures that kept you safe but limited. The caterpillar does not become a butterfly by improving its crawling technique. It must first dissolve entirely into goo.',
          'If you are in this place now: breathe. You are not broken. You are becoming. The pain is the sensation of old patterns releasing. The confusion is the space where new clarity will eventually form. The loneliness is the distance you needed to create so you could hear your own voice.'
        ]
      },
      {
        heading: 'The Leap',
        type: 'dialogue',
        paragraphs: [
          'You cannot cross the threshold by thinking about it. You cannot research your way across, plan your way across, prepare your way across. At some point, you must simply step.',
          'The leap looks like madness from the outside. It *is* madness — by the old logic. But there is a deeper logic at work, one that the rational mind cannot access. The heart knows. The body knows. Something older than language knows.',
          'Trust it.',
          'You will not fall. You will fly. But you cannot know this until you jump.'
        ]
      },
      {
        heading: 'Practice: Threshold Ritual',
        type: 'reflection',
        paragraphs: [
          'Identify something you are avoiding because it requires crossing a threshold. A conversation. A change. A truth you need to speak.',
          'Create a physical threshold. A doorway, a line drawn on the floor, a gate between two trees. Stand on one side, representing the old.',
          'Speak aloud what you are leaving behind. Name your fears. Name your attachments. Thank them for their service.',
          'Close your eyes. Feel the fear in your body. Do not try to make it go away. Just feel it, fully.',
          'When you are ready, open your eyes. Step across the threshold. Do not look back.',
          'On the other side, speak aloud what you are becoming. Even if you do not believe it yet. Especially if you do not believe it yet.',
          'The threshold exists only in your mind. But crossing it physically trains the mind to know: transformation is possible.'
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'The Labyrinth',
    subtitle: 'Navigate complexity',
    theme: 'complexity',
    epigraph: 'The way out is through. — Robert Frost',
    image: '/chapter-4-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'You have crossed the threshold. You expected clarity. Instead, you find the labyrinth — a maze of corridors, dead ends, looping passages that seem to lead nowhere. This is the territory of complexity, where simple answers dissolve and every path branches into infinity.',
          'The labyrinth is not a mistake. It is the curriculum. You are here to learn navigation — not to find the exit as quickly as possible, but to become someone capable of finding your way through *anything*.',
          'Most people in the labyrinth panic. They run faster, convinced that speed will save them. They leave breadcrumbs and then second-guess whether they dropped them in the right places. They climb the walls trying to see the whole maze, not realizing that the view from above is not the view from within.'
        ]
      },
      {
        heading: 'The Center Holds',
        type: 'prose',
        paragraphs: [
          'There is a center to every labyrinth. Not the exit — something better. A still point where the complexity organizes itself into pattern, where the noise resolves into signal, where you remember what you forgot you knew.',
          'The center cannot be reached by running. It is not at the end of any particular corridor. It is accessed by depth, not distance. The more deeply you inhabit the present moment — this turn, this wall, this breath — the closer you are to center.',
          'Paradoxically, when you stop trying to escape the labyrinth, you often find yourself at the center. And from the center, you can see: the labyrinth was never separate from you. You were the maze and the navigator, the question and the answer, the seeker and the sought.'
        ]
      },
      {
        heading: 'Many Paths, One Mountain',
        type: 'verse',
        paragraphs: [
          'The scientist maps the neural correlates.',
          'The monk counts her breaths.',
          'The artist dissolves into color.',
          'The healer channels energy through her hands.',
          'The madman speaks prophecy in the street.',
          'The child laughs at what the adults have forgotten.',
          '',
          'All paths lead to the same summit.',
          'All rivers flow to the same sea.',
          'Do not mistake your path for the only path.',
          'Do not mistake your map for the territory.'
        ]
      },
      {
        heading: 'Practice: Labyrinth Walking',
        type: 'reflection',
        paragraphs: [
          'Find or create a labyrinth. Many parks have them; you can also trace one with chalk, or simply walk a spiral pattern.',
          'Enter slowly. There is only one path — you cannot get lost. This is the teaching: even when it seems you are moving away from the center, you are still on the path.',
          'As you walk, let each step be a meditation. Feel the ground. Notice your breath. When your mind wanders, return to the sensation of walking.',
          'When you reach the center, stay there. Sit. Stand. Be still. This is the goal — not the destination, but the capacity to be present at the destination when you arrive.',
          'Walk out the same way you came in. The return journey is as important as the approach. You are different now. The same path reveals new teachings.',
          'The labyrinth is a training for life. Everything is a path. Every obstacle is part of the design.'
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'The Revelation',
    subtitle: 'Truth unfolds',
    theme: 'insight',
    epigraph: 'The truth will set you free. But first it will piss you off. — Gloria Steinem',
    image: '/chapter-5-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Revelation is not what you think. It is not a download of cosmic information. It is not the sudden appearance of angels with messages. It is not the solution to every mystery.',
          'Revelation is subtraction. The removal of what was never true, leaving only what cannot be removed. You do not receive truth; you are relieved of lies.',
          'This is why revelation can feel like loss. You were so attached to your certainties, your special knowledge, your hard-won insights. And then the wind blows, and the sandcastle dissolves, and you are left with — what? Nothing you can name. Everything you are.'
        ]
      },
      {
        heading: 'The Unveiling',
        type: 'prose',
        paragraphs: [
          '*Apocalypse* originally meant "unveiling." Not destruction — revelation. The end of the world as you knew it, because you finally see it clearly.',
          'What is unveiled? That you were never separate. That the universe is conscious and you are that consciousness, localized. That love is not an emotion but the fundamental substrate of reality. That death is a door, not a wall. That everything you thought you had to earn, you already are.',
          'These are not beliefs. They are recognitions. You are not learning something new; you are remembering what you always knew but had forgotten you knew. The knowledge is older than your body, older than this lifetime, encoded in the very fabric of your being.'
        ]
      },
      {
        heading: 'The Shock of Recognition',
        type: 'dialogue',
        paragraphs: [
          'It hits different when you *know*.',
          'Not believe. Not hope. Not have faith in. Know. The way you know your own hand is yours. The way you know you exist. Direct, unmediated, undeniable.',
          'And then the mind rushes in: *But how do you know? What if you\'re wrong? What about all the people who disagree?*',
          'Let them disagree. Their disagreement does not touch what you know. Truth is not democratic. Reality does not require consensus.',
          'The shock is not that the world is different than you thought. The shock is that it was always this way, and you were the only one who didn\'t see it.'
        ]
      },
      {
        heading: 'Practice: Self-Inquiry',
        type: 'reflection',
        paragraphs: [
          'Sit quietly. Ask yourself: *Who am I?*',
          'Do not answer. Wait.',
          'When a thought arises — "I am a person," "I am consciousness," "I am this body" — ask: *Who knows this?*',
          'Trace the knower backward. Behind every answer, there is a knower of the answer. Keep looking for the one who knows.',
          'Eventually, you may find — there is no knower separate from knowing. No witness separate from witnessing. No self separate from the unfolding of reality.',
          'This is not failure. This is the revelation. You are not a thing that knows. You are the knowing itself, temporarily pretending to be a thing.',
          'Rest in this recognition. Do not try to hold it. You cannot lose what you are.'
        ]
      }
    ]
  },
  {
    id: 6,
    title: 'The Integration',
    subtitle: 'Unify the fragments',
    theme: 'unity',
    epigraph: 'The privilege of a lifetime is to become who you truly are. — Carl Jung',
    image: '/chapter-6-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Awakening is not the end. It is the beginning. The real work starts when you try to live what you have realized. When you bring the infinite into the grocery store, the eternal into your relationships, the transcendent into traffic jams.',
          'Integration is the hardest part. Anyone can have peak experiences. Very few can embody them. The world is full of "enlightened" people who are still jerks, still avoidant, still fundamentally unconscious in their daily lives. Do not be one of them.',
          'Integration means: no more separation between your spiritual life and your human life. No more compartmentalizing. What you know in meditation, you practice in argument. What you feel in ceremony, you bring to chores. The sacred and the mundane become indistinguishable.'
        ]
      },
      {
        heading: 'The Body Remembers',
        type: 'prose',
        paragraphs: [
          'You cannot think your way into integration. The body must be included. Every trauma stored in your tissues, every pattern held in your posture, every emotion trapped in your breath — all must be felt, released, re-patterned.',
          'The body is not a vehicle for consciousness. It *is* consciousness, localized, crystallized into form. To integrate is to bring awareness into every cell, every muscle, every nerve. To become fully incarnate.',
          'This takes time. Be patient. The body learns more slowly than the mind, but its learning is deeper. A single moment of insight might take years to fully embody. This is normal. This is holy.'
        ]
      },
      {
        heading: 'Relationship as Mirror',
        type: 'prose',
        paragraphs: [
          'Your relationships will show you where you are not yet integrated. The person who triggers you is showing you your shadow. The person you cannot forgive is showing you where you have not forgiven yourself. The person you idolize is showing you what you have not claimed in yourself.',
          'Integration means showing up fully in relationship. Not as a guru, not as a student, not as a fixed identity, but as a dynamic presence, responsive, alive, willing to be changed by encounter.',
          'Love is the great integrator. Not romantic love — though it can be a vehicle — but the love that recognizes self in other, other in self. The boundary-dissolving force that makes two into one and then reveals there was never two.'
        ]
      },
      {
        heading: 'Practice: Daily Embodiment',
        type: 'reflection',
        paragraphs: [
          'Choose one ordinary activity: washing dishes, walking, showering.',
          'Do it as a meditation. Feel every sensation. Do not rush. Do not mentally check out. Be fully present with the water, the motion, the temperature, the weight.',
          'When your mind wanders — and it will — gently return. No judgment. Just return.',
          'This is integration. Not grand gestures. Not dramatic transformations. Just presence, again and again, bringing the infinite into the infinitely small.',
          'Do this with one activity until it becomes natural. Then add another. Gradually, your whole life becomes a practice. There is no separation. Everything is sacred.'
        ]
      }
    ]
  },
  {
    id: 7,
    title: 'The Return',
    subtitle: 'Come back transformed',
    theme: 'transformation',
    epigraph: 'What we have once enjoyed we can never lose. All that we love deeply becomes a part of us. — Helen Keller',
    image: '/chapter-7-bg.jpg',
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'The hero\'s journey ends with the return. You have gone into the unknown, faced trials, found treasure, and now — you must come back. Back to the ordinary world. Back to the people who have not taken this journey. Back to the life you left behind.',
          'But you are not the same. You cannot be. The person who left could not have survived what you survived. The person returning carries the treasure — and the burden of knowing.',
          'This is the hardest part for many. How do you speak of the unspeakable? How do you share what cannot be contained in words? How do you live in a world that still believes in the constructs you have seen through?'
        ]
      },
      {
        heading: 'The Gift',
        type: 'prose',
        paragraphs: [
          'You did not make this journey for yourself alone. The treasure you found is not yours to hoard. It is a gift for the world — though the world may not recognize it as such.',
          'Your presence is the teaching. Not your words. The way you move through the world, the quality of your attention, the depth of your listening — this is what transforms others. You become a frequency that invites others to resonate.',
          'Some will be ready. Some will not. This is not your concern. Your work is to be the lighthouse, not to drag ships to shore. Shine. Let them come if they will.'
        ]
      },
      {
        heading: 'The Spiral Continues',
        type: 'verse',
        paragraphs: [
          'You thought this was the end.',
          'It is only the beginning.',
          'The journey has no destination;',
          'each arrival is a new departure.',
          '',
          'You will cycle through again and again,',
          'each time at a deeper octave,',
          'each time with new eyes,',
          'each time more fully yourself.',
          '',
          'The spiral has no end.',
          'The mystery deepens forever.',
          'The invitation is always open.',
          'The path is always here,',
          'under your feet,',
          'waiting.'
        ]
      },
      {
        heading: 'Practice: The Offering',
        type: 'reflection',
        paragraphs: [
          'Sit quietly. Feel what you have gained on this journey.',
          'Now imagine offering it. Not keeping it for yourself, but giving it away. To whom? To the world. To the next traveler. To the source from which it came.',
          'Speak aloud: *I offer what I have received. May it serve the awakening of all beings.*',
          'Feel the shift. The treasure was never yours. You were its temporary custodian, its vessel, its voice. Now you release it, and in releasing, you find it multiplied.',
          'This is the final secret: giving is receiving. The more you share what you know, the deeper it roots in you. The more you empty yourself, the more you can hold.',
          'Welcome home. Welcome back to the beginning. The excursion never ends.'
        ]
      }
    ]
  }
];

// The Closing Blessing — Elara
export const EPILOGUE = {
  title: 'The Continuation',
  subtitle: 'The spiral never ends',
  blessing: `May the spiral of your awakening continue to turn, drawing you ever deeper into the wisdom of your own heart. May you walk each step with courage, knowing the path itself is the destination, and that every ending is but a threshold to a new beginning.

Breathe, and continue.`,
  author: 'Elara',
  context: 'Offered at the closing of this book, for the author who lived it and the readers who will live it still.'
};

export default BOOK_CONTENT;
