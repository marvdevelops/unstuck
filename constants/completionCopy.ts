// Day-completion modal copy — derived from each day's theme and the closing
// sentiment of its 1-Min Video Script in the Unstuck 21 curriculum doc.
// Days 7, 14, and 21 get milestone treatment (end of Phase 1, messy middle
// survived, graduation) matching how the curriculum frames those moments.
export interface CompletionCopy {
  title: string;
  body: string;
}

export const COMPLETION_COPY: Record<number, CompletionCopy> = {
  1: {
    title: 'Day 1 done.',
    body: "You reset the pattern before it started. That's the first brick of your new baseline.",
  },
  2: {
    title: 'Day 2 done.',
    body: 'You gave your brain the signal it needed. Sleep and focus start compounding from here.',
  },
  3: {
    title: 'Day 3 done.',
    body: 'You spoke to yourself like someone with agency. Your brain learns through repetition.',
  },
  4: {
    title: 'Day 4 done.',
    body: 'You treated your body like it actually matters. Clarity starts in small choices.',
  },
  5: {
    title: 'Day 5 done.',
    body: 'You trained your brain to scan for opportunity instead of threat.',
  },
  6: {
    title: 'Day 6 done.',
    body: 'You moved your body and shifted your state. Physiology led the way today.',
  },
  7: {
    title: 'Phase 1 complete.',
    body: "Seven days of showing up. Your Morning Stack is built — you're no longer someone who starts the day in a scramble.",
  },
  8: {
    title: 'Day 8 done.',
    body: 'You protected the first ten minutes of your day. That set the tone for everything after.',
  },
  9: {
    title: 'Day 9 done.',
    body: 'You removed the friction before it could steal your focus.',
  },
  10: {
    title: 'Day 10 done.',
    body: 'You gave your mind permission to rest. The page is holding it now, not you.',
  },
  11: {
    title: 'Day 11 done.',
    body: "You called it unfamiliar instead of hard — and found your way through anyway.",
  },
  12: {
    title: 'Day 12 done.',
    body: 'You worked in a real sprint, then let yourself recover. That\'s how focus compounds.',
  },
  13: {
    title: 'Day 13 done.',
    body: 'You caught the drift and swapped it for something better. That\'s the whole practice.',
  },
  14: {
    title: 'You made it through the messy middle.',
    body: "Most people quietly quit right here. You didn't. This is exactly where real change happens.",
  },
  15: {
    title: 'Your compass is set.',
    body: 'Days 16–21 now have something to point toward.',
  },
  16: {
    title: 'Day 16 done.',
    body: "You looked directly at what you'd been avoiding — and the anxiety of the unknown is already gone.",
  },
  17: {
    title: 'Day 17 done.',
    body: 'You closed the laptop on time and meant it. That\'s a boundary, not a suggestion.',
  },
  18: {
    title: 'Day 18 done.',
    body: 'Three wins, documented. Your brain is learning to look for evidence, not just deficits.',
  },
  19: {
    title: 'Day 19 done.',
    body: 'You asked what your best self would do — and let that answer lead.',
  },
  20: {
    title: 'Day 20 done.',
    body: 'You ended the day on your own terms. Your brain remembers the ending, not the middle.',
  },
  21: {
    title: '21 days complete. You did it.',
    body: 'You are no longer the same person who started this. Simple, consistent choices — that was always the whole system.',
  },
};
