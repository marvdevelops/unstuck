export interface DayData {
  day: number;
  phase: string;
  title: string;
  science: string;
  routine: string[];
  spot: string[];
  videoUrl?: string; // R2 or any HTTPS URL; undefined = not yet uploaded
}

export const CURRICULUM: DayData[] = [
  // ─── PHASE 1: CATALYST (Days 1–7) ─────────────────────────────────────────
  {
    day: 1,
    phase: 'Phase 1: Catalyst',
    title: 'The Law of Lowered Standards',
    science:
      'When we wake up and immediately reach for our phones, we invite the urgencies, notifications, and anxieties of the world into our minds. We trigger a fight or flight state before our feet even hit the floor. Taking three slow breaths signals physical safety to the nervous system, putting us in control of the day.',
    routine: ['Take 3 deliberate deep breaths before touching your phone or looking at any screen.'],
    spot: [],
  },
  {
    day: 2,
    phase: 'Phase 1: Catalyst',
    title: 'The Circadian Dopamine Anchor',
    science:
      'Sunlight exposure in the first hour of waking triggers a natural cortisol spike that wakes up the body, regulates sleep cycles, and stabilizes our baseline dopamine levels for the rest of the day.',
    routine: [
      'Take 3 deliberate deep breaths before touching any screen.',
      'Step outside or look out a window to get direct morning sunlight for 2 minutes.',
    ],
    spot: [],
  },
  {
    day: 3,
    phase: 'Phase 1: Catalyst',
    title: 'The Subconscious Coding',
    science:
      'The mind\'s primary job is to make your internal self-talk your external reality. Affirmations stated in a relaxed, waking state (alpha brainwave state) bypass the critical conscious mind, directly programming our self-image.',
    routine: [
      'Take 3 deliberate deep breaths.',
      'Get 2 minutes of direct morning sunlight.',
      'Say out loud: "I deserve peace and I have agency over my day."',
    ],
    spot: [],
  },
  {
    day: 4,
    phase: 'Phase 1: Catalyst',
    title: 'Physiological Prime',
    science:
      'Overnight dehydration increases cortisol levels, which mimics the physiological sensations of anxiety. Rehydrating before introducing caffeine or sugar stabilizes heart rate variability and mental clarity.',
    routine: [
      'Take 3 deliberate deep breaths.',
      'Get 2 minutes of direct morning sunlight.',
      'Say your daily statement of peace and agency.',
      'Drink one full glass of water.',
    ],
    spot: [],
  },
  {
    day: 5,
    phase: 'Phase 1: Catalyst',
    title: 'Shifting out of Scarcity',
    science:
      'The brain is naturally wired with a negativity bias to protect us from danger. By forcing the mind to scan for a positive expectation, we interrupt the threat-detection loop and activate the reward centers of the prefrontal cortex.',
    routine: [
      'Take 3 deep breaths.',
      'Get 2 minutes of sunlight.',
      'Say your daily statement.',
      'Drink one full glass of water.',
    ],
    spot: ['Identify or write down one specific thing you are genuinely looking forward to today.'],
  },
  {
    day: 6,
    phase: 'Phase 1: Catalyst',
    title: 'Shifting Your Physiology',
    science:
      'Emotions are created by motion. When we feel stuck, our physical posture is often slumped and closed. Shifting our physical state immediately alters the chemical baseline of our brain, dropping cortisol and elevating endorphins.',
    routine: [
      'Take 3 deep breaths.',
      'Get 2 minutes of sunlight.',
      'Say your daily statement.',
      'Drink one full glass of water.',
      'Complete 1 minute of deliberate physical movement, like stretching or swinging your arms.',
    ],
    spot: [],
  },
  {
    day: 7,
    phase: 'Phase 1: Catalyst',
    title: 'The Identity Check-In',
    science:
      'Every action you take is a vote for the person you want to become. Completing a consecutive seven-day streak of even the smallest habits builds the self-trust and identity of someone who keeps promises to themselves.',
    routine: [
      'Take 3 deep breaths.',
      'Get 2 minutes of morning light.',
      'Say your daily statement.',
      'Drink one full glass of water.',
      'Complete 1 minute of physical movement.',
    ],
    spot: [],
  },

  // ─── PHASE 2: IGNITE (Days 8–14) ──────────────────────────────────────────
  {
    day: 8,
    phase: 'Phase 2: Ignite',
    title: 'The 10-Minute Focus Block',
    science:
      'Starting the workday in reaction mode (answering other people\'s demands first) fragments our attention. Beginning with just ten minutes of proactive deep work triggers the Zeigarnik Effect, making it much easier to sustain momentum throughout the day.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Work on your single most critical task for exactly 10 minutes before checking any emails, notifications, or messages.',
    ],
    spot: [],
  },
  {
    day: 9,
    phase: 'Phase 2: Ignite',
    title: 'Environmental Sanitation',
    science:
      'Visual clutter and proximal triggers (like a phone sitting face-up on a desk) place a constant tax on our working memory. Eliminating the friction of visual distractions preserves neural energy and willpower.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete your 10-Minute Focus Block.',
    ],
    spot: [
      'Clear all visual clutter off your immediate desk.',
      'Put your phone completely out of sight, in another room or a desk drawer, during your work blocks.',
    ],
  },
  {
    day: 10,
    phase: 'Phase 2: Ignite',
    title: 'The Nighttime Brain Dump',
    science:
      'Anticipatory anxiety and racing thoughts prevent the brain from entering deep, restorative sleep states. Externalizing these thoughts onto paper provides psychological closure, signaling the subconscious that it is safe to rest.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete your 10-Minute Focus Block.',
      'Spend 5 minutes before bed writing down all tasks, worries, and loose ends on paper.',
    ],
    spot: [],
  },
  {
    day: 11,
    phase: 'Phase 2: Ignite',
    title: 'Changing the Narrative (The "Unfamiliar" Reframe)',
    science:
      'Labeling a task as "hard" triggers a neurochemical threat response, inducing resistance and self-doubt. Reframing the task as "unfamiliar" neutralizes the threat, allowing the logical brain to find a solution.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete your 10-Minute Focus Block.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [
      'When facing a difficult task today, verbally say out loud: "This is not hard; it is just unfamiliar, and I can navigate it."',
    ],
  },
  {
    day: 12,
    phase: 'Phase 2: Ignite',
    title: 'Focused Sprint and Deliberate Recovery',
    science:
      'The human brain is built for pulse-and-recovery cycles, not continuous, low-level cognitive strain. Working in structured blocks (Pomodoro technique) sharpens concentration and prevents the build-up of mental fatigue.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete your Nighttime Brain Dump.',
      'Set a timer and work on one task for exactly 25 minutes with all notifications muted.',
      'Take a mandatory 5-minute physical break away from all screens after the timer goes off.',
    ],
    spot: [],
  },
  {
    day: 13,
    phase: 'Phase 2: Ignite',
    title: 'Spot, Stop, Swap',
    science:
      'Habits are run by automatic loop structures in the basal ganglia. To interrupt an unproductive pattern (like escape-scrolling), we must consciously spot the trigger, stop the behavior, and swap it with a low-friction productive alternative.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [
      'When you catch yourself procrastinating or scrolling today, spot the behavior, stop for one breath, and swap it with a 1-minute positive behavior.',
    ],
  },
  {
    day: 14,
    phase: 'Phase 2: Ignite',
    title: 'Navigating the Messy Middle',
    science:
      'Day 14 is statistically the most common drop-off point in behavior change programs. The initial motivation has faded, but the new habits haven\'t yet become automatic. This is the Messy Middle — and navigating it requires trusting the system over your feelings.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Set up your workspace with your phone out of sight.',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [],
  },

  // ─── PHASE 3: OWN IT (Days 15–21) ─────────────────────────────────────────
  {
    day: 15,
    phase: 'Phase 3: Own It',
    title: 'Aligning with Core Values',
    science:
      'Overcoming daily temptations and staying productive is significantly easier when tasks are connected to higher-order personal values. Aligning our daily schedule with our identity provides deep intrinsic motivation.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint with notifications muted.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [
      'Complete the interactive Core Values Discovery exercise.',
      'Check your schedule today to ensure at least one task or calendar block directly honors your new core values.',
    ],
  },
  {
    day: 16,
    phase: 'Phase 3: Own It',
    title: 'The Ostrich Effect Intervention',
    science:
      'The Ostrich Effect is our cognitive bias to avoid information we perceive as unpleasant. This avoidance induces chronic, background stress. Facing the data directly removes the anxiety of the unknown, returning agency and ownership to the individual.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [
      'Identify one task, email, or bill you have been actively avoiding.',
      'Open it and look at it directly in the clear light of day.',
    ],
  },
  {
    day: 17,
    phase: 'Phase 3: Own It',
    title: 'Enforcing the "Hard Stop" Boundary',
    science:
      'Working professionals face constant mental bleeding when work and personal life overlap. Setting an absolute, non-negotiable end time forces efficiency during the day and provides the restorative boundaries required to prevent burnout.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
    ],
    spot: [
      'Set a non-negotiable "Hard Stop" time for work today (e.g., 6:00 PM).',
      'Close your laptop and silence all work notifications at that exact hour.',
    ],
  },
  {
    day: 18,
    phase: 'Phase 3: Own It',
    title: 'The 3-Win Victory Journal',
    science:
      'Confidence and self-belief are built by cumulative, physical evidence of progress. Intentionally tracking three daily wins retrains the brain to focus on successes, neutralizing the imposter syndrome and fatigue common in high-performers.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
      'Spend 2 minutes before bed writing down exactly 3 small wins or positive moments from today.',
    ],
    spot: [],
  },
  {
    day: 19,
    phase: 'Phase 3: Own It',
    title: 'The "Dickens" Identity Shift',
    science:
      'Embodied cognition shows that acting as if we already inhabit an identity shapes our physiological and emotional states, making the target behaviors natural and effortless rather than forced.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-Minute Focused Work Sprint.',
      'Complete your Nighttime Brain Dump.',
      'Log your Three-Win Victory Journal before bed.',
    ],
    spot: [
      'Pause before three major actions or decisions today and ask: "If I were already the best, most unshakeable version of myself, how would I respond right now?"',
    ],
  },
  {
    day: 20,
    phase: 'Phase 3: Own It',
    title: 'Permitting the Ambiguous (The Peak End Rule)',
    science:
      'The Peak-End Rule dictates that we judge past experiences based on their peak and their end. Ending a turbulent day with a positive, relaxing ritual (like stretching or deep breaths) rewires our memory of the day, keeping our self-image intact.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused work sprint.',
      'Complete your Nighttime Brain Dump.',
      'Log your Three-Win Victory Journal before bed.',
    ],
    spot: [
      'Complete a gentle, 3-minute physical cool-down stretch right before bed and consciously forgive any errors made today.',
    ],
  },
  {
    day: 21,
    phase: 'Phase 3: Own It',
    title: 'The Future Pacing Graduation',
    science:
      'Mental rehearsal primes the nervous system for future execution. By vividly imagining our future self sustaining these habits, we cement our new identity into our long-term subconscious blueprint.',
    routine: [
      'Complete your Morning Stack (breaths, light, statement, water, movement).',
      'Complete at least one 25-minute focused workday block.',
      'Complete your Nighttime Brain Dump.',
      'Log your Three-Win Victory Journal before bed.',
    ],
    spot: [
      'Spend 5 minutes visualizing your life two years from now, focusing on the calm, simple execution of this daily system.',
    ],
  },
];
