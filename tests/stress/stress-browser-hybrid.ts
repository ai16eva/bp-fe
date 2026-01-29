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

const BASE_URL = 'http://localhost:3001';
const WALLETS_FILE = path.join(__dirname, './test-wallets.json');

const TAB_COUNT = parseInt(process.argv[2] || '10');
const ACTION = process.argv[3] || 'vote';

async function performVoteAction(page: Page, userIndex: number): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`[User ${userIndex}] Starting vote flow...`);

    await page.goto(`${BASE_URL}/dao?status=draft`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    const questItem = page.locator('a[href^="/dao/"]').first();
    await questItem.waitFor({ state: 'visible', timeout: 10000 });
    await questItem.click();

    const votingTrigger = page.locator('[id*="trigger-voting"]').first();
    await votingTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await votingTrigger.click();

    const approveButton = page.getByRole('button', { name: 'Approve' });
    await approveButton.waitFor({ state: 'visible', timeout: 5000 });
    await approveButton.click();

    const privyApprove = page.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
    if (await privyApprove.isVisible({ timeout: 3000 })) {
      await privyApprove.click();
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

async function performCreateQuestAction(page: Page, userIndex: number): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`[User ${userIndex}] Starting quest creation...`);

    await page.goto(BASE_URL);

    const questButton = page.getByRole('button', { name: 'Quest' });
    await questButton.click();

    const createButton = page.getByRole('button', { name: 'Create New Prediction' });
    await createButton.click();

    const title = `Hybrid Test ${userIndex} - ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Tittle' }).fill(title);
    await page.getByRole('textbox', { name: 'Quest details' }).fill('Test details');

    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option').first().click();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const approveButton = page.getByRole('button', { name: 'Approve' });
    await approveButton.click();

    const closeButton = page.getByRole('button', { name: 'Close', exact: true });
    await closeButton.waitFor({ state: 'visible', timeout: 15000 });

    const duration = Date.now() - startTime;
    console.log(`[User ${userIndex}] Quest created in ${duration}ms`);

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
  console.log('HYBRID STRESS TEST RESULTS');
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
  console.log('\nBrowsers will stay open. Press Ctrl+C to exit.\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('HYBRID STRESS TEST: Browser + Ephemeral Wallets');
  console.log('='.repeat(60));
  console.log(`\nTabs: ${TAB_COUNT}`);
  console.log(`Action: ${ACTION}`);
  console.log(`URL: ${BASE_URL}\n`);

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error('Error: test-wallets.json not found!');
    console.error(`Run: npx tsx scripts/generate-unique-wallets.ts ${TAB_COUNT}`);
    process.exit(1);
  }

  const wallets: TestWallet[] = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));

  if (wallets.length < TAB_COUNT) {
    console.error(`Error: Need ${TAB_COUNT} wallets, only ${wallets.length} available`);
    console.error(`Run: npx tsx scripts/generate-unique-wallets.ts ${TAB_COUNT}`);
    process.exit(1);
  }

  console.log(`Loaded ${wallets.length} wallets\n`);

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--disable-features=IsolateOrigins,site-per-process'],
  });

  const testStartTime = Date.now();
  const contexts: BrowserContext[] = [];
  const pages: Page[] = [];

  console.log('Creating browser contexts...\n');

  for (let i = 0; i < TAB_COUNT; i++) {
    const wallet = wallets[i];
    if (!wallet) {
      console.error(`Wallet ${i + 1} not found`);
      continue;
    }

    console.log(`[${i + 1}/${TAB_COUNT}] Opening tab for ${wallet.publicKey.substring(0, 8)}...`);

    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    const page = await context.newPage();
    contexts.push(context);
    pages.push(page);
  }

  console.log(`\nOpened ${TAB_COUNT} browser tabs\n`);
  console.log('Starting actions...\n');

  const actionPromises = pages.map((page, i) => {
    const wallet = wallets[i];
    if (!wallet) {
      return Promise.resolve({ success: false, duration: 0, error: 'Wallet not found' });
    }

    if (ACTION === 'vote') {
      return performVoteAction(page, i + 1);
    } else if (ACTION === 'create-quest') {
      return performCreateQuestAction(page, i + 1);
    }
    return Promise.resolve({ success: false, duration: 0, error: 'Unknown action' });
  });

  const results = await Promise.allSettled(actionPromises);
  const testDuration = Date.now() - testStartTime;

  printReport(results, testDuration);

  await new Promise(() => {});
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
