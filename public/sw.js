globalThis.addEventListener('install', () => {
  console.log('[Service Worker] Installing Service Worker...');
  globalThis.skipWaiting(); // waiting 상태의 서비스 워커를 active 상태로 변경하도록 강제함
});
