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
      'Your brain treats starting a new habit as a threat. The amygdala flags any unfamiliar routine as potential danger — triggering avoidance, procrastination, and paralysis. The solution isn\'t more willpower. It\'s making the first step so small it doesn\'t trigger the threat response.',
    routine: ['Take 3 deep breaths before touching your phone.'],
    spot: [
      'Set your phone across the room from your bed tonight.',
      'Tomorrow morning, notice the pause before you reach for it.',
    ],
  },
  {
    day: 2,
    phase: 'Phase 1: Catalyst',
    title: 'The Morning Signal',
    science:
      'Morning sunlight hitting your retina within 30 minutes of waking sets your circadian rhythm, boosts cortisol (your alertness hormone), and primes dopamine production for the day ahead. Two minutes is enough to trigger the cascade.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside or open a window for 2 minutes of morning sunlight.',
    ],
    spot: ['Track when you first touched your phone this morning. Was it before or after sunlight?'],
  },
  {
    day: 3,
    phase: 'Phase 1: Catalyst',
    title: 'The Voice in Your Head',
    science:
      'Self-affirmations activate the reward centers in the prefrontal cortex. When you speak a value-aligned statement aloud, you reinforce neural pathways associated with agency and self-efficacy — making future aligned behavior more automatic.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your daily affirmation aloud: "I deserve peace and I have agency over my day."',
    ],
    spot: ['Write one thing you said to yourself this morning that wasn\'t kind. Rewrite it as your affirmation.'],
  },
  {
    day: 4,
    phase: 'Phase 1: Catalyst',
    title: 'The Hydration Signal',
    science:
      'Even mild dehydration (1–2%) impairs cognitive performance, mood, and concentration. Your brain is 75% water. Drinking one full glass upon waking rehydrates after 7–8 hours without fluids and signals your body that the day has begun.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
    ],
    spot: ['Place a glass of water on your nightstand tonight so it\'s waiting for you tomorrow.'],
  },
  {
    day: 5,
    phase: 'Phase 1: Catalyst',
    title: 'The Anticipation Anchor',
    science:
      'Anticipation of a reward activates dopamine more powerfully than receiving the reward itself. By consciously identifying something to look forward to each morning, you prime your motivational system before the day\'s demands begin.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
    ],
    spot: ['Write it down. Specificity amplifies the dopamine response.'],
  },
  {
    day: 6,
    phase: 'Phase 1: Catalyst',
    title: 'The Body Leads',
    science:
      'Physical movement — even one minute of it — increases BDNF (brain-derived neurotrophic factor), the protein that promotes neural plasticity and learning. Movement primes your brain for focus and makes new habits stick faster.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement (stretch, walk, jumping jacks — your call).',
    ],
    spot: ['Choose your movement now. Commit to it before you sleep tonight.'],
  },
  {
    day: 7,
    phase: 'Phase 1: Catalyst',
    title: 'The Identity Check-In',
    science:
      'Research by Dr. James Clear shows that identity-based habits are the most durable. When you complete a 7-day streak, you generate evidence for a new self-story. This is the moment you stop being someone trying to build a habit and start being someone who has one.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
    ],
    spot: [
      'Write in your journal: "Seven days ago I decided to change. Here\'s what I notice is different now:"',
      'Complete your identity check-in: "I am someone who ___."',
    ],
  },

  // ─── PHASE 2: IGNITE (Days 8–14) ──────────────────────────────────────────
  {
    day: 8,
    phase: 'Phase 2: Ignite',
    title: 'The Proactive Hour',
    science:
      'Cal Newport\'s research shows that checking messages first thing in the morning puts you in a reactive state — responding to others\' agendas rather than your own. A 10-minute proactive focus block before any inbox primes your prefrontal cortex for intentional leadership over your day.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking any messages.',
    ],
    spot: ['Decide tonight: what is the one thing you will work on first tomorrow?'],
  },
  {
    day: 9,
    phase: 'Phase 2: Ignite',
    title: 'The Environment Speaks',
    science:
      'Your physical environment shapes behavior more than your willpower does. A clear desk reduces cognitive load by up to 40%. A phone out of sight reduces the "brain drain" effect — even a face-down phone within eyesight consumes working memory.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight before your focus block.',
    ],
    spot: ['Take a photo of your workspace right now. Would your best self work here?'],
  },
  {
    day: 10,
    phase: 'Phase 2: Ignite',
    title: 'The Brain Dump',
    science:
      'The Zeigarnik Effect: your brain holds unfinished tasks in active memory, creating mental noise that fragments attention. A 5-minute nighttime brain dump — writing down everything on your mind — closes these open loops and allows deeper sleep and a clearer morning.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
    ],
    spot: ['Tonight, write everything that\'s on your mind before you sleep — no editing, no organizing. Just empty the browser.'],
  },
  {
    day: 11,
    phase: 'Phase 2: Ignite',
    title: 'The Unfamiliar Reframe',
    science:
      'The brain\'s threat response labels anything new as "hard." But neuroscience distinguishes between difficulty (which is fixed) and unfamiliarity (which decreases with repetition). Reframing "this is hard" as "this is just unfamiliar" activates the prefrontal cortex and reduces amygdala interference.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'When resistance hits: say aloud, "This is not hard. It\'s just unfamiliar."',
    ],
    spot: ['Identify one thing you\'ve been avoiding because it feels "too hard." Reframe it. Write the new sentence.'],
  },
  {
    day: 12,
    phase: 'Phase 2: Ignite',
    title: 'The Sprint Cycle',
    science:
      'The Pomodoro Technique leverages ultradian rhythms — natural 90-minute focus-rest cycles — by creating artificial urgency within them. A 25-minute sprint with a 5-minute break improves focus, reduces mental fatigue, and trains your brain to start on command.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer: 25 minutes on, 5 minutes off.',
    ],
    spot: ['Complete at least 2 Pomodoro sprints today. Log what you accomplished in each.'],
  },
  {
    day: 13,
    phase: 'Phase 2: Ignite',
    title: 'The Spot-Stop-Swap',
    science:
      'Procrastination is a loop: trigger → procrastination behavior → temporary relief → guilt → repeat. Spot-Stop-Swap interrupts it at the Spot stage. Once you\'re aware of the loop as it starts, you have a 3-second window to insert a new behavior before the habit fires.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap when you catch a procrastination loop starting.',
    ],
    spot: [
      'Today: catch yourself in a procrastination loop.',
      'Write: what triggered it, what behavior you did, and what you swapped it with.',
    ],
  },
  {
    day: 14,
    phase: 'Phase 2: Ignite',
    title: 'Navigating the Messy Middle',
    science:
      'Day 14 is statistically the most common drop-off point in behavior change programs. The initial motivation has faded, but the new habits haven\'t yet become automatic. This is the Messy Middle — and navigating it requires trusting the system over your feelings.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
    ],
    spot: [
      'Write: "Right now I feel ___, but I\'m going to do the routine anyway because ___."',
      'Complete your full routine today — even if you don\'t feel like it.',
    ],
  },

  // ─── PHASE 3: OWN IT (Days 15–21) ─────────────────────────────────────────
  {
    day: 15,
    phase: 'Phase 3: Own It',
    title: 'Core Values Alignment',
    science:
      'Values clarification activates the anterior cingulate cortex — the brain\'s conflict-monitoring system. When your schedule aligns with your stated values, cognitive dissonance decreases and intrinsic motivation increases. You stop needing external accountability.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
    ],
    spot: [
      'Write your top 3 core values.',
      'Audit your schedule from last week: does it reflect those values?',
      'Identify one change to make this week.',
    ],
  },
  {
    day: 16,
    phase: 'Phase 3: Own It',
    title: 'The Ostrich Effect',
    science:
      'The Ostrich Effect is the tendency to avoid information or tasks that feel threatening or uncomfortable. Neuroscience shows this avoidance is driven by the same threat-detection system as physical danger. Facing one avoided item — even imperfectly — reduces the amygdala\'s grip.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
    ],
    spot: [
      'Identify one email, task, or conversation you\'ve been avoiding.',
      'Do it today — even if imperfectly.',
      'Log how you feel after.',
    ],
  },
  {
    day: 17,
    phase: 'Phase 3: Own It',
    title: 'The Hard Stop',
    science:
      'Without a clear endpoint, work expands to fill all available time (Parkinson\'s Law). A non-negotiable Hard Stop creates urgency, improves focus during work hours, and protects recovery — which is where performance consolidates. Rest is a performance strategy.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
      'Set and honor your Hard Stop time today.',
    ],
    spot: [
      'Decide your Hard Stop time right now.',
      'Put it in your calendar as a non-negotiable.',
      'When the time comes — stop.',
    ],
  },
  {
    day: 18,
    phase: 'Phase 3: Own It',
    title: '3-Win Victory Journal',
    science:
      'Gratitude and accomplishment journaling before sleep activates the brain\'s reward circuitry and primes long-term potentiation — the process that converts short-term experiences into lasting memory. Your brain is literally recording what matters.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
      'Set and honor your Hard Stop time.',
      'Write 3 wins in your Victory Journal before bed.',
    ],
    spot: [
      'Tonight, write 3 wins — small or large.',
      'Bonus: include one win that surprised you.',
    ],
  },
  {
    day: 19,
    phase: 'Phase 3: Own It',
    title: 'The Dickens Identity Shift',
    science:
      'The Dickens Process (from NLP) uses temporal contrast — past pain vs. future possibility — to create emotional momentum for change. "How would my best self respond?" is a pattern interrupt that activates aspirational identity over habitual identity.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
      'Set and honor your Hard Stop time.',
      'Write 3 wins in your Victory Journal before bed.',
    ],
    spot: [
      'Write: "My best self would respond to today\'s biggest challenge by ___."',
      'Once today, catch yourself about to react habitually — and ask: "How would my best self respond?"',
    ],
  },
  {
    day: 20,
    phase: 'Phase 3: Own It',
    title: 'The Peak-End Cool-Down',
    science:
      'The Peak-End Rule (Kahneman) shows that people evaluate experiences based on the emotional peak and the end — not the average. Intentionally designing a positive ending to your day — through stretching and a forgiveness ritual — reshapes how your brain stores the entire day.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
      'Set and honor your Hard Stop time.',
      'Write 3 wins in your Victory Journal before bed.',
    ],
    spot: [
      'End today with a 3-minute stretch.',
      'Then: write one thing you forgive yourself for from this week.',
    ],
  },
  {
    day: 21,
    phase: 'Phase 3: Own It',
    title: 'Future Pacing Graduation',
    science:
      'Future pacing is an NLP technique that uses vivid mental rehearsal of future success to prime the nervous system. When you imagine your 2-year future self in detail, your brain begins to unconsciously align daily behavior with that vision — this is the mechanism of identity-level change.',
    routine: [
      'Take 3 deep breaths before touching your phone.',
      'Step outside for 2 minutes of morning sunlight.',
      'Say your affirmation aloud.',
      'Drink one full glass of water.',
      'Identify one thing you\'re looking forward to today.',
      'Do 1 minute of deliberate physical movement.',
      'Spend 10 minutes on your most important task before checking messages.',
      'Clear your desk and put your phone out of sight.',
      'Do a 5-minute nighttime brain dump before bed.',
      'Say the unfamiliar reframe when resistance hits.',
      'Use the Pomodoro timer.',
      'Practice Spot-Stop-Swap.',
      'Set and honor your Hard Stop time.',
      'Write 3 wins in your Victory Journal before bed.',
    ],
    spot: [
      'Close your eyes for 5 minutes. Visualize your life 2 years from now — what do you see, hear, and feel?',
      'Write: "The version of me who completed Unstuck 21 is someone who ___."',
      'Congratulations. You did it. 🏅',
    ],
  },
];
