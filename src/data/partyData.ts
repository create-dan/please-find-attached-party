export const EVENT_INFO = {
  title: 'Q4 Doomsday Social',
  headline: "We survived Q3, not sure about Q4 — so let's focus on the Quarterly Party.",
  dateLabel: 'Monday, November 30, 2026',
  timeLabel: '4:00 PM – 10:00 PM',
  calendarRoast: 'abhi calendar bhi add karna hai itna to yad rakho',
  excusePopupTitle: 'Aana hi hai. No excuse.',
  excusePopupBody:
    'Monday, November 30, 2026 · 4:00 PM – 10:00 PM. Attendance is non-negotiable.',
  busyPopupTitle: 'Nice try. See you at 4 PM.',
  busyPopupBody:
    'Monday, November 30, 2026 · 4:00 PM – 10:00 PM. Your decline request has been rejected by Q4.',
  doomPopupTitle: 'DOOM DEMANDS YOUR PRESENCE.',
  doomPopupBody: 'Thoda kam karo, no voucher.',
  targetIso: '2026-11-30T16:00:00',
  endIso: '2026-11-30T22:00:00',
  heroImage: '/assets/aistudio/doctor-doom-artwork-3840x2160-28143_ef827910.jpg',
  doomSecretImage: '/assets/aistudio/avengers-doomsday-3840x2160-27631_94a445ff.jpg',
} as const;

export const VENUE_AND_PLAN = {
  venueName: 'The Game Palacio',
  venueArea: 'The Mills, Raja Bahadur City Centre, Pune',
  mapsUrl:
    'https://www.google.com/maps/place/The+Game+Palacio/@18.5336882,73.8685132,17z/data=!3m1!4b1!4m6!3m5!1s0x3bc2c1d2eafb3f0b:0x112509a7f00e2510!8m2!3d18.5336831!4d73.8710881!16s%2Fg%2F11vjwzgcbb?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D',
  venueImage:
    'https://lh3.googleusercontent.com/grass-cs/AABkmLeiHIj1360ugp-J3DVAEwt85yazdfZI3WhmHsIgOqqOn5RXldGsD3u7PR_ZeS5zIzUrdBdPe4siJAebNABHNhMpzhn6Ht_3S1_PEVYw5gmztdIBYZBADa856O5FpC3SBfF4aDqZkFFF-pwS=w408-h272-k-no',
  steps: [
    {
      id: 'leave-office',
      time: '3:45 PM',
      title: 'Leave Office',
      detail: 'Shut the laptop, dodge any "quick sync" traps, and head out around 3:45 PM.',
    },
    {
      id: 'reach-venue',
      time: '5:00 PM',
      title: 'Reach The Game Palacio',
      detail: 'Arrive around 5:00 PM at The Mills and regroup before the lanes open.',
    },
    {
      id: 'bowling',
      time: '5:00 – 6:00 PM',
      title: 'Bowling',
      detail: 'One hour of strikes, gutter balls, and highly questionable bowling form.',
    },
    {
      id: 'dinner',
      time: '6:00 PM+',
      title: 'Dinner at Sushi Special Acai Restaurant',
      detail: 'Wrap up bowling and head for sushi and dinner—zero sprint talk allowed.',
    },
  ],
} as const;

export const DOOMS_MONTH = {
  title: 'Dooms Month',
  dateRange: 'Nov 25, 2026 – Dec 17, 2026',
  startIso: '2026-11-25T00:00:00',
  endIso: '2026-12-17T23:59:59',
  headline: 'More Doom Points. One Winner.',
  description:
    'Starting November 25 through December 17, every move earns—or loses—Doom Points. Whoever holds the highest score on December 17 takes home the official prize. No ties, no participation trophies.',
  prizeTitle: 'Official Dooms Month Grand Prize',
  prizeSubtitle: 'Awarded Dec 17, 2026 · Winner Takes All',
  prizeUrl: 'https://www.amazon.in/dp/B0HQGWM3GM?smid=A14VK0WPI6L3N3&th=1&psc=1',
  prizeImage:
    'https://m.media-amazon.com/images/I/51K7Oou93GL._AC_AIweblab1392912,T3_FMavif_SF831.0,1200.0_PQ65_.jpg?aicid=detailPage-mediaBlock',
} as const;

export interface DoomRuleTier {
  id: string;
  points: string;
  label: string;
  summary: string;
  examples: string[];
  tone: 'positive' | 'legendary' | 'penalty';
}

export const DOOM_RULES = {
  title: 'DOOM POINTS',
  subtitle: 'Do good work. Help the team. Create some chaos. Earn points.',
  rangeLine: 'Earn +1 to +5 for making an impact. Lose up to −2 for avoidable oops.',
  goldenRule:
    'Impact, initiative, complexity & team value matter more than hours spent.',
  tiers: [
    {
      id: 'plus-1',
      points: '+1',
      label: 'Nice!',
      summary: 'Everyday contributions that make a difference.',
      tone: 'positive',
      examples: [
        'Job monitoring & minor fixes',
        'Impactful code reviews that identify potential defects before they escape',
        'Prod support',
        'Code cut & sanity',
        'Curiosity & investigation',
        'Proactively creating well-written Jira stories',
      ],
    },
    {
      id: 'plus-2',
      points: '+2',
      label: 'Solid!',
      summary: 'Meaningful work that solves real problems.',
      tone: 'positive',
      examples: [
        'Internal reviews',
        'High-priority bugs',
        'Flaky Cypress/Jest fixes',
        'Pipeline/DEV-down issues',
        'Knowledge sharing',
        'Refactoring',
        'Difficult root-cause analysis',
      ],
    },
    {
      id: 'plus-3',
      points: '+3',
      label: 'Impressive!',
      summary: 'Strong technical impact beyond your regular work.',
      tone: 'positive',
      examples: [
        'Architecture improvements',
        'PST utilities',
        'Unblocking teammates on tough problems',
        'Significant SQL/API performance improvements',
        'Complex technical fixes',
      ],
    },
    {
      id: 'plus-4',
      points: '+4',
      label: 'Outstanding!',
      summary: 'High complexity + high impact.',
      tone: 'positive',
      examples: [
        'Cracking long-standing problems',
        'Major performance optimization',
        'Valuable automation',
        'Complex frontend + backend + DB features',
        'Reusable technical solutions',
      ],
    },
    {
      id: 'plus-5',
      points: '+5',
      label: 'LEGENDARY',
      summary: 'Rare contributions people remember.',
      tone: 'legendary',
      examples: [
        'Amazing quarterly party',
        'Automation saving hours repeatedly',
        'Driving ambiguous problems end-to-end',
        'Exceptional ownership',
        'Lasting team/product impact',
      ],
    },
    {
      id: 'minus-1',
      points: '−1',
      label: 'Bruh...',
      summary: 'Minor, preventable oops.',
      tone: 'penalty',
      examples: [
        'Not excited for the quarterly party',
        'Avoidable build break',
        'Poor PR description',
        'Missed checklist',
        'Skipped sanity checks',
      ],
    },
    {
      id: 'minus-2',
      points: '−2',
      label: 'Deployment Gods Are Angry',
      summary: 'Serious & clearly avoidable problems.',
      tone: 'penalty',
      examples: [
        'Risky change causing production regression',
        'Repeated quality/security bypasses',
        'Preventable mistakes creating major work for others',
      ],
    },
  ] as DoomRuleTier[],
  closingTitle: 'One Last Rule',
  closingBody:
    "+5 and −2 are rare. Honest mistakes don't deserve punishment, and Doom Points are for fun & recognition, not performance evaluation.",
  closingMission:
    "The goal isn't to collect the most points. The goal is to create a team where people participate, learn, help each other, and enjoy the journey.",
} as const;
