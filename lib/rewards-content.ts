// /rewards (PWF Rewards landing) — copy + data lifted from the Figma
// "JB PWF Reward Desktop 2" frame (4879:88434). Art assets in /public/rewards.
// FAQ answers are drafted from this page's own program facts (Figma had lorem);
// Avanti reviews copy before cutover.

export const APP_LINKS = {
  appStore: 'https://apps.apple.com/app/jungle-boys/id6759608318',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.batchsys.jungleboys',
} as const

export const VALUE_PROPS = [
  {
    icon: '/rewards/icon-earn.svg',
    title: 'Earn Points',
    body: 'Earn points for every $1 spent. Earn more as you level up.',
  },
  {
    icon: '/rewards/icon-unlock.svg',
    title: 'Unlock Rewards',
    body: 'Turn points into real discounts — up to $25 back per transaction.',
  },
  {
    icon: '/rewards/icon-climb.svg',
    title: 'Climb Tiers',
    body: 'The more you spend, the more you unlock.',
  },
  {
    icon: '/rewards/icon-bonus.svg',
    title: 'Bonus Points',
    body: 'Exclusive drops, merch, and perks only redeemable in app.',
  },
] as const

export const STEPS = [
  {
    icon: '/rewards/icon-step-1.svg',
    title: 'Download the App',
    body: 'Create your account and get started instantly.',
  },
  {
    icon: '/rewards/icon-step-2.svg',
    title: 'Shop In-Store & Earn',
    body: 'Earn points on qualifying in-store purchases based on your spend.',
  },
  {
    icon: '/rewards/icon-step-3.svg',
    title: 'Redeem Rewards',
    body: 'Use points at checkout — in-store, in-app or online at jungleboys.com.',
  },
  {
    icon: '/rewards/icon-step-4.svg',
    title: 'Level Up',
    body: 'Unlock stronger perks as your annual spend increases.',
  },
] as const

export const REWARD_TIERS = [
  { name: 'Trimmer', points: '<499' },
  { name: 'Grower', points: '500 – 1,999' },
  { name: 'Pheno Hunter', points: '2,000+' },
  { name: 'Connoisseur Club', points: 'Invite Only' },
] as const

export const REDEMPTION_VALUES = [
  { points: '100 points', value: 'GIFT*' },
  { points: '250 points', value: '$10' },
  { points: '500 points', value: '$25' },
  { points: '1000 points', value: '$75' },
] as const

export const EARN_RULES_DISCLAIMER =
  'Rules and restrictions may apply. Some discounts may not be stackable. Minimum spend may be required to earn points. See store for details.'

export const WAYS_TO_EARN = [
  {
    icon: '/rewards/icon-refer.svg',
    title: 'Refer a Friend',
    points: 'Earn 100 Points',
    bullets: [
      'Friend must be a first-time customer',
      'Minimum $50 spend (pre-tax)',
      'Both must download the app',
      'Reward issued after qualifying purchase',
    ],
  },
  {
    icon: '/rewards/icon-birthday.svg',
    title: 'Birthday Perks',
    points: 'Earn 100 Points',
    badge: 'Pheno Hunter Tier',
    bullets: [
      '100 points',
      'Double Points Day of your choice (expires 2 weeks after birthday)',
    ],
  },
  {
    icon: '/rewards/icon-firsttime.svg',
    title: 'First-Time Customer',
    points: 'Earn 100 Points',
    bullets: ['First-time discount', 'Instant loyalty enrollment'],
  },
] as const

export const BONUS_REWARDS = [
  'Download App',
  'Leave a Review',
  'Social Engagement',
  'Veterans',
  'First Responders',
  'Students',
] as const

export const BONUS_DISCLAIMER =
  'Proof of eligibility required. Bonus points may only be redeemed once per customer. Terms and restrictions apply.'

export const TIER_CARDS = [
  {
    tier: 'Tier 1',
    color: 'Green',
    name: 'Trimmer',
    points: '0 – 499',
    mascot: '/rewards/tier-1-mascot.png',
    theme: 'green' as const,
    perks: [
      'Access to PWF Rewards',
      'Birthday reward',
      'Exclusive offers',
      'Select Double Points Days',
    ],
  },
  {
    tier: 'Tier 2',
    color: 'Silver',
    name: 'Grower',
    points: '500 – 1,999',
    mascot: '/rewards/tier-2-mascot.png',
    theme: 'silver' as const,
    perks: [
      'All rewards from Trimmer tier',
      'More Double Points Days',
      'Early access to merch drops',
      'Early bird/happy hour discounts',
    ],
  },
  {
    tier: 'Tier 3',
    color: 'Gold',
    name: 'Pheno Hunter',
    points: '2,000+',
    mascot: '/rewards/tier-3-mascot.png',
    theme: 'gold' as const,
    perks: [
      'All rewards from Grower tier',
      'Access to in-store events',
      'Priority access to deals and drops',
      '50% off, B1G1 50% off, select days*',
      'Exclusive ounce specials',
    ],
  },
] as const

export const CLUB_PERKS = [
  { icon: '/rewards/icon-club-kit.svg', label: 'Exclusive Welcome Kit' },
  { icon: '/rewards/icon-club-vip.svg', label: 'VIP Events' },
  { icon: '/rewards/icon-club-gifts.svg', label: 'Custom Gifts' },
  { icon: '/rewards/icon-club-allocation.svg', label: 'Guaranteed Product Allocation' },
  { icon: '/rewards/icon-club-access.svg', label: 'Exclusive Product Access' },
  { icon: '/rewards/icon-club-elite.svg', label: 'Elite Brand Experiences' },
] as const

export const APP_FEATURES = [
  'Early access to products',
  'Push notifications for drops and promos',
  'View tier and progress',
  'App-exclusive drops',
  'App-only merch',
  'Track points and rewards',
] as const

export const REWARDS_FAQ = [
  {
    question: 'How do I join PWF Rewards?',
    answer:
      'Download the Jungle Boys app, create your account, and you are enrolled instantly — you even get 100 bonus points just for downloading.',
  },
  {
    question: 'How do I earn points?',
    answer:
      'You earn points on every qualifying purchase — for every $1 you spend in-store, in-app, or online at jungleboys.com. Higher tiers earn points faster, and bonus points are available for things like referring a friend, leaving a review, and Double Points Days.',
  },
  {
    question: 'How do I redeem points?',
    answer:
      'Redeem points at checkout — in-store, in-app, or online at jungleboys.com. Redemptions start at 100 points, with values up to $75 off at 1000 points. One reward can be applied per transaction.',
  },
  {
    question: 'Do points expire?',
    answer:
      'Points expire after 12 months of inactivity. Any purchase or point activity keeps your account active.',
  },
  {
    question: 'How do tiers work?',
    answer:
      'Tiers are based on your rolling 12-month spend: Trimmer (0–499 annual points), Grower (500–1,999), and Pheno Hunter (2,000+). Your tier is valid for 12 months from qualification, and you keep it by maintaining your spend.',
  },
  {
    question: 'Can I use rewards with other promotions?',
    answer:
      'Rewards can be combined with most promotions unless a promotion is specifically restricted. Some discounts may not be stackable — see store for details.',
  },
  {
    question: 'Is there a limit to how many rewards I can use?',
    answer:
      'Yes — one reward per transaction, applied at the time of purchase.',
  },
  {
    question: 'How do I qualify for Connoisseur Club?',
    answer:
      'Connoisseur Club is invite-only, reserved for a select group of OG customers and brand loyalists. Keep shopping, stay engaged, and you may receive an invitation.',
  },
] as const

export const FINE_PRINT = [
  {
    title: 'Tier Qualifications',
    bullets: [
      'Tier status is based on a rolling 12-month spend',
      'Tier is valid for 12 months from qualification date',
      'Customers must maintain spend to keep tier',
      'Customers will be downgraded if thresholds are not met',
    ],
  },
  {
    title: 'Redemption Rules',
    bullets: [
      'Points can be redeemed at checkout (in-store and online at jungleboys.com only)',
      'Only one reward per transaction',
      'Rewards can be combined with most promotions unless restricted',
      'Points have no cash value',
      'Rewards must be applied at time of purchase',
    ],
  },
  {
    title: 'Point Expiration',
    bullets: [
      'Points expire after 12 months of inactivity',
      'Inactivity = no purchases or point activity',
    ],
  },
  {
    title: 'General',
    bullets: [
      'Points earned on qualifying purchases',
      'Rewards subject to change at any time',
    ],
  },
] as const
