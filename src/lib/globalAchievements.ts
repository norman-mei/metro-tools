export type GlobalAchievementDefinition = {
  slug: string
  title: string
  description: string
  secretDescription?: string
  order: number
  country?: 'global' | 'secret-fun'
}

export const GLOBAL_ACHIEVEMENTS: GlobalAchievementDefinition[] = [
  {
    slug: 'speedrunner-1',
    title: 'Speedrunner I',
    description: 'Complete a city (<150 stations) in under 10 minutes with Speedrun Mode.',
    order: 10_001,
  },
  {
    slug: 'speedrunner-2',
    title: 'Speedrunner II',
    description: 'Complete a city (150-500 stations) in under 30 minutes with Speedrun Mode.',
    order: 10_001,
  },
  {
    slug: 'speedrunner-3',
    title: 'Speedrunner III',
    description: 'Complete a city (≤1000 stations) in under 75 minutes with Speedrun Mode.',
    order: 10_001,
  },
  {
    slug: 'speedrunner-4',
    title: 'Speedrunner IV',
    description: 'Complete a city (1000+ stations) in under 90 minutes with Speedrun Mode.',
    order: 10_001,
  },
  {
    slug: 'flawless',
    title: 'Flawless Route',
    description: 'Complete any city with zero mistakes.',
    order: 10_002,
  },
  {
    slug: 'almost-flawless',
    title: 'Almost Flawless',
    description: 'Complete any city with two or fewer mistakes.',
    order: 10_003,
  },
  {
    slug: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Recover from under 50% to finish a city.',
    order: 10_004,
  },
  {
    slug: 'line-master',
    title: 'Line Master',
    description: 'Complete every station on any single line.',
    order: 10_005,
  },
  {
    slug: 'explorer-3',
    title: 'Rookie Explorer',
    description: 'Complete 3 different cities.',
    order: 10_010,
  },
  {
    slug: 'explorer-10',
    title: 'Explorer',
    description: 'Complete 10 different cities.',
    order: 10_011,
  },
  {
    slug: 'explorer-25',
    title: 'Seasoned Explorer',
    description: 'Complete 25 different cities.',
    order: 10_012,
  },
  {
    slug: 'explorer-50',
    title: 'Ultimate Explorer',
    description: 'Complete 50 different cities.',
    order: 10_013,
  },
  {
    slug: 'daily-normal',
    title: 'Daily Grinder',
    description: 'Play on 1 day.',
    order: 10_020,
  },
  {
    slug: 'daily-super',
    title: 'Super Daily Grinder',
    description: 'Play on 5 different days.',
    order: 10_021,
  },
  {
    slug: 'daily-ultra',
    title: 'Ultra Daily Grinder',
    description: 'Play on 15 different days.',
    order: 10_022,
  },
  {
    slug: 'daily-ultimate',
    title: 'Ultimate Daily Grinder',
    description: 'Play on 30 different days.',
    order: 10_023,
  },
  {
    slug: 'streak-7',
    title: 'Streak Saver I',
    description: 'Maintain a 7-day play streak.',
    order: 10_030,
  },
  {
    slug: 'streak-30',
    title: 'Streak Saver II',
    description: 'Maintain a 30-day play streak.',
    order: 10_031,
  },
  {
    slug: 'streak-90',
    title: 'Streak Saver III',
    description: 'Maintain a 90-day play streak.',
    order: 10_032,
  },
  {
    slug: 'streak-180',
    title: 'Streak Saver IV',
    description: 'Maintain a 180-day play streak.',
    order: 10_033,
  },
  {
    slug: 'twin-city',
    title: 'Twin City',
    description: 'Complete two cities from different continents on the same day.',
    order: 10_040,
  },
  {
    slug: 'station-collector',
    title: 'Station Collector',
    description: 'Find 1,000 stations across all cities.',
    order: 10_041,
  },
  {
    slug: 'line-finisher',
    title: 'Line Finisher',
    description: 'Complete 5 different lines.',
    order: 10_042,
  },
  {
    slug: 'big-city-tamer',
    title: 'Big City Tamer',
    description: 'Complete a city with 1,500+ stations.',
    order: 10_043,
  },
  {
    slug: 'all-rounder',
    title: 'All Rounder',
    description: 'Complete cities on 3 different continents.',
    order: 10_044,
  },
  {
    slug: 'globe-trotter',
    title: 'Globe Trotter',
    description: 'Complete cities on 6 different continents.',
    order: 10_045,
  },
  {
    slug: 'marathoner',
    title: 'Marathoner',
    description: 'Find 10,000 stations across all cities.',
    order: 10_046,
  },
  {
    slug: 'consistent-runner',
    title: 'Consistent Runner',
    description: 'Finish a speedrun without leaving the tab.',
    order: 10_047,
  },
  {
    slug: 'typo-free',
    title: 'Typo Free',
    description: 'Complete a city without using backspace or delete.',
    order: 10_048,
  },
  {
    slug: 'perfect-start',
    title: 'Perfect Start',
    description: 'Make 25 correct guesses in a row to start a city.',
    order: 10_049,
  },
  {
    slug: 'never-repeat',
    title: 'Never Repeat',
    description: 'Complete a city without guessing an already-found station.',
    order: 10_050,
  },
  {
    slug: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Play on 8 consecutive weekends.',
    order: 10_051,
  },
  {
    slug: 'monthly-commuter',
    title: 'Monthly Commuter',
    description: 'Play in 3 different months.',
    order: 10_052,
  },
  {
    slug: 'favorites-first',
    title: 'Favorites First',
    description: 'Complete 5 favorited cities.',
    order: 10_053,
  },
  {
    slug: 'underdog',
    title: 'Underdog',
    description: 'Complete a city with fewer than 20 stations.',
    order: 10_054,
  },
  {
    slug: 'golden-ratio',
    title: 'Golden Ratio',
    description: '???',
    secretDescription: 'Reach 61.8% completion in any city.',
    order: 10_101,
    country: 'secret-fun',
  },
  {
    slug: 'the-commuter',
    title: 'The Commuter',
    description: '???',
    secretDescription: 'Make 7 correct guesses within 7 minutes.',
    order: 10_102,
    country: 'secret-fun',
  },
  {
    slug: 'the-archivist',
    title: 'The Archivist',
    description: '???',
    secretDescription: 'Open city stats for 10 different cities.',
    order: 10_103,
    country: 'secret-fun',
  },
  {
    slug: 'the-cartographer',
    title: 'The Cartographer',
    description: '???',
    secretDescription: 'Toggle map names 20 times.',
    order: 10_104,
    country: 'secret-fun',
  },
]

export const GLOBAL_ACHIEVEMENT_SLUGS = GLOBAL_ACHIEVEMENTS.map((entry) => entry.slug)
