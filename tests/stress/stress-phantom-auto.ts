import { chromium, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface TestWallet {
  index: number;
  publicKey: string;
  secretKey: string;
  secretKeyArray: number[];
}

interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
}

const BASE_URL = 'https://bpl-fe-develop.up.railway.app';
const WALLETS_FILE = path.join(__dirname, './test-wallets.json');
const PHANTOM_EXTENSION_PATH = path.join(__dirname, '../../extensions/phantom');
const PHANTOM_PASSWORD = process.env.PHANTOM_PASSWORD || 'taiqui12';
const TEMP_DIR = path.join(__dirname, '../../phantom-temp');

const TAB_COUNT = parseInt(process.argv[2] || '10');
const ACTION = process.argv[3] || 'vote';

let globalContexts: BrowserContext[] = [];

async function cleanup() {
  console.log('\nCleaning up...');

  try {
    if (globalContexts.length > 0) {
      await Promise.all(globalContexts.map((ctx) => ctx.close().catch(() => {})));
      console.log('Closed all browsers');
    }

    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log('Deleted temporary profiles');
    }
  } catch (error: any) {
    console.error('Cleanup error:', error.message);
  }
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

async function setupPhantomWallet(context: BrowserContext, wallet: TestWallet, userIndex: number): Promise<void> {
  console.log(`  [User ${userIndex}] Setting up Phantom...`);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const page = await context.newPage();

  await page.goto('chrome-extension://bfnaelmomeimhlpmgjnjophhpkkoljpa/onboarding.html');
  await page.waitForTimeout(2000);

  try {
    const importButton = page.getByRole('button', { name: /already have/i });
    if (await importButton.isVisible({ timeout: 3000 })) {
      await importButton.click();
      await page.waitForTimeout(1000);
    }

    const privateKeyButton = page.getByRole('button', { name: /private key/i });
    if (await privateKeyButton.isVisible({ timeout: 3000 })) {
      await privateKeyButton.click();
      await page.waitForTimeout(1000);
    }

    const privateKeyInput = page.locator('input[type="password"], textarea').first();
    await privateKeyInput.fill(wallet.secretKey);
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="accountName"], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill(`Wallet ${userIndex}`);
      await page.waitForTimeout(500);
    }

    const continueButton = page.getByRole('button', { name: /continue|import/i });
    await continueButton.click();
    await page.waitForTimeout(1500);

    const tosCheckbox = page.locator('input[data-testid="onboarding-form-terms-of-service-checkbox"]');
    if (await tosCheckbox.isVisible({ timeout: 2000 })) {
      await tosCheckbox.click();
      await page.waitForTimeout(500);
    }

    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();

    if (count >= 2) {
      await passwordInputs.nth(0).fill(PHANTOM_PASSWORD);
      await passwordInputs.nth(1).fill(PHANTOM_PASSWORD);
      await page.waitForTimeout(500);

      const saveButton = page.getByRole('button', { name: /save|continue/i });
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    const skipButton = page.getByRole('button', { name: /skip|later/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    await enableDevnet(page, userIndex);
    await page.close();

    console.log(`  [User ${userIndex}] Phantom setup complete`);
  } catch (error: any) {
    console.error(`  [User ${userIndex}] Phantom setup failed: ${error.message}`);
    await page.close();
    throw error;
  }
}

async function enableDevnet(page: Page, userIndex: number): Promise<void> {
  console.log(`  [User ${userIndex}] Switching to Devnet...`);

  await page.goto('chrome-extension://bfnaelmomeimhlpmgjnjophhpkkoljpa/popup.html');
  await page.waitForTimeout(2000);

  const settingsMenuButton = page.locator('button[data-testid="settings-menu-open-button"]');
  if (!(await settingsMenuButton.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.log(`  [User ${userIndex}] Settings menu not found`);
    return;
  }

  await settingsMenuButton.click();
  await page.waitForTimeout(1000);

  const settingsButton = page.locator('button[data-testid="sidebar_menu-button-settings"]');
  if (!(await settingsButton.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.log(`  [User ${userIndex}] Settings button not found`);
    return;
  }

  await settingsButton.click();
  await page.waitForTimeout(1500);

  const developerSettings = page.locator('button#settings-item-developer-settings');
  if (!(await developerSettings.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.log(`  [User ${userIndex}] Developer settings not found`);
    return;
  }

  await developerSettings.click();
  await page.waitForTimeout(1500);

  const testNetworkToggle = page.locator('[data-testid="toggleTestNetwork-switch"]');
  if (!(await testNetworkToggle.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.log(`  [User ${userIndex}] Test network toggle not found`);
    return;
  }

  const checkbox = testNetworkToggle.locator('input[type="checkbox"]');
  const isChecked = await checkbox.isChecked().catch(() => false);

  if (!isChecked) {
    await testNetworkToggle.click();
    await page.waitForTimeout(1500);
    console.log(`  [User ${userIndex}] Switched to Devnet`);
  } else {
    console.log(`  [User ${userIndex}] Test network already enabled`);
  }
}

async function loginWithPhantom(page: Page, userIndex: number): Promise<void> {
  console.log(`  [User ${userIndex}] Logging in...`);

  try {
    const loginButton = page.locator('button.bg-brand', { hasText: 'Login' });
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await loginButton.click();
    await page.waitForTimeout(2000);

    const continueWallet = page.getByRole('button', { name: /continue with a wallet/i });
    await continueWallet.waitFor({ state: 'visible', timeout: 5000 });
    await continueWallet.click();
    await page.waitForTimeout(1500);

    const phantomOption = page.getByText('Phantom', { exact: true }).first();
    await phantomOption.waitFor({ state: 'visible', timeout: 5000 });
    await phantomOption.click();
    await page.waitForTimeout(2000);

    await handlePhantomPopups(page, userIndex);

    console.log(`  [User ${userIndex}] Logged in successfully`);
  } catch (error: any) {
    console.error(`  [User ${userIndex}] Login failed: ${error.message}`);
    throw error;
  }
}

async function handlePhantomPopups(page: Page, userIndex: number): Promise<void> {
  console.log(`  [User ${userIndex}] Handling Phantom popups...`);

  let pages = page.context().pages();
  let phantomPopup = pages.find((p) => p.url().includes('notification.html'));

  if (!phantomPopup) {
    await page.waitForTimeout(2000);
    pages = page.context().pages();
    phantomPopup = pages.find((p) => p.url().includes('notification.html'));
  }

  if (!phantomPopup) return;

  await phantomPopup.waitForLoadState('load');
  await phantomPopup.waitForTimeout(1000);

  const connectButton = phantomPopup.getByRole('button', { name: /connect/i }).first();
  const hasConnectButton = await connectButton.isVisible({ timeout: 3000 }).catch(() => false);

  if (hasConnectButton) {
    console.log(`  [User ${userIndex}] Approving connection...`);
    await connectButton.click();
    await page.waitForTimeout(3000);

    phantomPopup = await waitForSignPopup(page, userIndex);
  }

  if (phantomPopup) {
    await clickSignButton(phantomPopup, userIndex);
  }
}

async function waitForSignPopup(page: Page, userIndex: number): Promise<Page | undefined> {
  console.log(`  [User ${userIndex}] Waiting for Sign popup...`);

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1500);
    const pages = page.context().pages();
    const popup = pages.find((p) => p.url().includes('notification.html'));

    if (popup) {
      await popup.waitForLoadState('load').catch(() => {});
      await popup.waitForTimeout(500);

      let signButton = popup.getByRole('button', { name: /sign|approve|confirm/i }).first();
      let found = await signButton.isVisible({ timeout: 1000 }).catch(() => false);

      if (!found) {
        signButton = popup.getByTestId('primary-button');
        found = await signButton.isVisible({ timeout: 1000 }).catch(() => false);
      }

      if (found) {
        console.log(`  [User ${userIndex}] Sign popup found`);
        return popup;
      }
    }

    if (i % 3 === 0) {
      console.log(`  [User ${userIndex}] Still searching... (${i + 1}/10)`);
    }
  }

  console.log(`  [User ${userIndex}] Sign popup not found`);
  return undefined;
}

async function clickSignButton(popup: Page, userIndex: number): Promise<void> {
  let signButton = popup.getByRole('button', { name: /sign|approve|confirm/i }).first();
  let buttonFound = await signButton.isVisible({ timeout: 2000 }).catch(() => false);

  if (!buttonFound) {
    signButton = popup.getByTestId('primary-button');
    buttonFound = await signButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  if (buttonFound) {
    const buttonText = await signButton.textContent().catch(() => 'Unknown');
    console.log(`  [User ${userIndex}] Clicking "${buttonText}"...`);
    await signButton.click();
    await popup.waitForTimeout(3000);
  } else {
    console.log(`  [User ${userIndex}] Sign button not visible`);
  }
}

async function delegateVotingPower(page: Page, userIndex: number): Promise<void> {
  console.log(`  [User ${userIndex}] Checking delegation...`);

  try {
    const delegateButton = page.locator('button', { hasText: /delegate/i }).first();

    if (await delegateButton.isVisible({ timeout: 3000 })) {
      console.log(`  [User ${userIndex}] Delegating...`);
      await delegateButton.click();
      await page.waitForTimeout(1000);

      const pages = page.context().pages();
      const phantomPopup = pages.find((p) => p.url().includes('notification.html'));

      if (phantomPopup) {
        await phantomPopup.waitForLoadState('load');
        await phantomPopup.waitForTimeout(1000);

        const approveButton = phantomPopup.getByRole('button', { name: /approve/i }).first();
        if (await approveButton.isVisible({ timeout: 5000 })) {
          await approveButton.click();
          await page.waitForTimeout(3000);
        }
      }

      await page.waitForTimeout(2000);
      console.log(`  [User ${userIndex}] Delegation complete`);
    } else {
      console.log(`  [User ${userIndex}] Already delegated`);
    }
  } catch {
    console.log(`  [User ${userIndex}] No delegation needed`);
  }
}

async function performVoteAction(page: Page, userIndex: number): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`[User ${userIndex}] Starting vote flow...`);

    await page.goto(`${BASE_URL}/dao?status=draft`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    await delegateVotingPower(page, userIndex);

    const questItem = page.locator('a[href^="/dao/"]').first();
    await questItem.waitFor({ state: 'visible', timeout: 10000 });
    await questItem.click();
    await page.waitForTimeout(1000);

    const votingTrigger = page.locator('[id*="trigger-voting"]').first();
    await votingTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await votingTrigger.click();
    await page.waitForTimeout(500);

    const approveButton = page.getByRole('button', { name: 'Approve' });
    await approveButton.waitFor({ state: 'visible', timeout: 5000 });
    await approveButton.click();
    await page.waitForTimeout(1000);

    const pages = page.context().pages();
    const phantomPopup = pages.find((p) => p.url().includes('notification.html'));

    if (phantomPopup) {
      await phantomPopup.waitForLoadState('load');
      const approveInPhantom = phantomPopup.getByRole('button', { name: /approve/i });
      await approveInPhantom.click();
      await page.waitForTimeout(2000);
    }

    const successToast = page.locator('.text-base.font-medium', { hasText: /success/i });
    await successToast.waitFor({ state: 'visible', timeout: 30000 });

    const duration = Date.now() - startTime;
    console.log(`[User ${userIndex}] Vote successful in ${duration}ms`);

    return { success: true, duration };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[User ${userIndex}] Failed: ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

function calculateStats(durations: number[]) {
  if (durations.length === 0) return { avg: 0, p50: 0, p95: 0 };

  const sorted = [...durations].sort((a, b) => a - b);
  return {
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
  };
}

function printReport(results: PromiseSettledResult<TestResult>[], totalDuration: number) {
  const successResults = results
    .filter((r): r is PromiseFulfilledResult<TestResult> => r.status === 'fulfilled' && r.value.success)
    .map((r) => r.value);

  const totalSuccess = successResults.length;
  const totalFailed = TAB_COUNT - totalSuccess;
  const successRate = (totalSuccess / TAB_COUNT) * 100;
  const stats = calculateStats(successResults.map((r) => r.duration));

  console.log('\n' + '='.repeat(60));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`\nTotal Tabs:     ${TAB_COUNT}`);
  console.log(`Action:         ${ACTION}`);
  console.log(`Successful:     ${totalSuccess} (${successRate.toFixed(1)}%)`);
  console.log(`Failed:         ${totalFailed}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`\nPerformance:`);
  console.log(`  Average: ${(stats.avg / 1000).toFixed(2)}s`);
  console.log(`  p50:     ${(stats.p50 / 1000).toFixed(2)}s`);
  console.log(`  p95:     ${(stats.p95 / 1000).toFixed(2)}s`);
  console.log('='.repeat(60));
  console.log('\nBrowsers will stay open. Press Ctrl+C to cleanup and exit.');
  console.log(`Temp profiles: ${TEMP_DIR}\n`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('PHANTOM AUTO-IMPORT STRESS TEST');
  console.log('='.repeat(60));
  console.log(`\nTabs: ${TAB_COUNT}`);
  console.log(`Action: ${ACTION}`);
  console.log(`URL: ${BASE_URL}\n`);

  if (!fs.existsSync(PHANTOM_EXTENSION_PATH)) {
    console.error(`Error: Phantom extension not found at ${PHANTOM_EXTENSION_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error('Error: test-wallets.json not found!');
    console.error(`Run: npx tsx scripts/generate-unique-wallets.ts ${TAB_COUNT}`);
    process.exit(1);
  }

  const wallets: TestWallet[] = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));

  if (wallets.length < TAB_COUNT) {
    console.error(`Error: Need ${TAB_COUNT} wallets, only ${wallets.length} available`);
    process.exit(1);
  }

  console.log(`Loaded ${wallets.length} wallets`);
  console.log('Phantom extension ready\n');

  const testStartTime = Date.now();

  console.log('Creating browser contexts...\n');

  const setupPromises = Array.from({ length: TAB_COUNT }, async (_, i) => {
    const wallet = wallets[i];
    if (!wallet) {
      console.error(`Wallet ${i + 1} not found`);
      return null;
    }

    console.log(`[${i + 1}/${TAB_COUNT}] Setting up ${wallet.publicKey.substring(0, 8)}...`);

    const userDataDir = path.join(TEMP_DIR, `user-${i + 1}-${Date.now()}`);

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${PHANTOM_EXTENSION_PATH}`,
        `--load-extension=${PHANTOM_EXTENSION_PATH}`,
        '--disable-blink-features=AutomationControlled',
      ],
    });

    await setupPhantomWallet(context, wallet, i + 1);

    const ctxPages = context.pages();
    const page = ctxPages[0] || (await context.newPage());
    return { context, page };
  });

  const setupResults = await Promise.all(setupPromises);
  const validResults = setupResults.filter((r): r is { context: BrowserContext; page: Page } => r !== null);

  const contexts = validResults.map((r) => r.context);
  const pages = validResults.map((r) => r.page);
  globalContexts = contexts;

  console.log(`\nOpened ${TAB_COUNT} browser tabs\n`);
  console.log('Logging in...\n');

  await Promise.all(pages.map((page, i) => page.goto(BASE_URL).then(() => loginWithPhantom(page, i + 1))));

  console.log('\nAll users logged in\n');
  console.log('Starting actions...\n');

  const actionPromises = pages.map((page, i) => {
    if (ACTION === 'vote') {
      return performVoteAction(page, i + 1);
    }
    return Promise.resolve({ success: false, duration: 0, error: 'Unknown action' });
  });

  const results = await Promise.allSettled(actionPromises);
  const testDuration = Date.now() - testStartTime;

  printReport(results, testDuration);

  await new Promise(() => {});
}

main().catch(async (error) => {
  console.error('\nFatal error:', error);
  console.error(`\nTemp profiles kept for debugging: ${TEMP_DIR}`);
  console.error(`To cleanup: rm -rf ${TEMP_DIR}\n`);
  process.exit(1);
});
