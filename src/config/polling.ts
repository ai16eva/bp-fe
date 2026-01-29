export const POLLING_CONFIG = {
  admin: {
    draft: 15000,
    decision: 15000,
    answer: 30000,
    publish: 20000,
    ongoing: 20000,
    success: 30000,
    adjourn: 60000,
  },
  dao: {
    default: 30000,
  },
  quest: {
    detail: 20000,
  },
} as const;

export function getAdminPollingInterval(status: string): number {
  return (POLLING_CONFIG.admin as any)[status] || POLLING_CONFIG.admin.ongoing;
}

export function isDocumentVisible(): boolean {
  return document.visibilityState === 'visible';
}
