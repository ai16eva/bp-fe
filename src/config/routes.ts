export const ROUTES = {
  HOME: '/',
  ABOUT_US: '/about-us',
  QUESTS: '/quests',
  QUEST_DETAIL: (id: string) => `/quests/${id}`,
  RESULTS: '/results',
  RESULTS_DETAIL: (id: string) => `/results/${id}`,
  BOARDS: '/boards',
  DAO: '/dao',
  ADMIN_PLAY_GAME: '/admin',
  ADMIN_GRANTS: '/admin/grant-admin',
  ADMIN_MINT_NFT: '/admin/mint-nft',
  PROFILE: '/profile',
};
