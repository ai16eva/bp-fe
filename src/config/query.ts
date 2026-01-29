export const appQueryKeys = {
  QUESTS: 'quests',
  quests: {
    root: ['quests'],
    featured: ['quests', 'featured'],
    popular: ['quests', 'popular'],
    dao: ['quests', 'dao'],
    byFilter: ['filter'],
  },
  quest: {
    root: ['quest'],
    create: ['quest', 'create'],
    draft: ['quest', 'draft'],
    vote: ['quest', 'vote'],
    bettings: ['quest', 'bettings'],
  },
  categories: {
    root: ['cateogries'],
  },
  season: {
    root: ['season'],
    active: ['season', 'active'],
  },
  member: {
    root: ['member'],
    check: ['member', 'check'],
    votings: ['member', 'votings'],
    bettings: ['member', 'bettings'],
    claimDailyReward: ['member', 'daily-reward', 'claim'],
    claimVotingReward: ['member', 'voting-reward', 'claim'],
    getDailyReward: ['member', 'daily-reward', 'get'],
    checkin: ['member', 'check-in'],
    getCheckIn: ['member', 'check-in', 'get'],
    getReferralCode: ['member', 'referral-code', 'get'],
  },
  dao: {
    root: ['dao'],
    setDraft: ['dao', 'draft', 'set'],
    cancelDraft: ['dao', 'draft', 'cancel'],
    publish: ['dao', 'draft', 'publish'],
    make: ['dao', 'draft', 'make'],
    finish: ['dao', 'finish'],
    startDAOSuccess: ['dao', 'success', 'start'],
    setDAOSuccess: ['dao', 'success', 'set'],
    adjournDAOSuccess: ['dao', 'success', 'adjourn'],
    makeDAOSuccess: ['dao', 'success', 'make'],
    setDAOAnswer: ['dao', 'answer', 'set'],
    setSuccess: ['dao', 'quest', 'success'],
    setHot: ['dao', 'quest', 'hot'],
  },
  bettings: {
    create: ['bettings', 'create'],
  },
  contract: {
    voteCount: ['vote_count'],
  },
  board: {
    root: ['board'],
    create: ['board', 'create'],
    delete: ['board', 'delete'],
  },
};

export const storageKey = {
  signedMessage: 'signedMessage',
};
