import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import nacl from 'tweetnacl';
import path from 'path';
import { GovernanceSDK } from '../../solana-sdk/src/Governance';

interface TestWallet {
  index: number;
  publicKey: string;
  secretKey: string;
  secretKeyArray: number[];
}

const CONCURRENT_USERS = parseInt(process.argv[2] || '50');
const QUEST_TITLE = process.argv[3] || 'Test';
const BASE_URL = process.env.API_URL || 'https://bpl-be-develop.up.railway.app';
const SOLANA_RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const WALLETS_FILE = path.join(__dirname, './test-wallets.json');

function signMessage(message: string, secretKey: string): string {
  const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
  const signature = nacl.sign.detached(Buffer.from(message, 'utf8'), keypair.secretKey);
  return Buffer.from(signature).toString('base64');
}

async function registerMember(walletAddress: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/member/v2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet_address: walletAddress,
      wallet_type: 'PHANTOM',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Registration failed: ${response.status} - ${error}`);
  }
}

async function login(wallet: TestWallet): Promise<string> {
  const message = `${wallet.publicKey}-${Date.now()}`;
  const signature = signMessage(message, wallet.secretKey);

  let response = await fetch(`${BASE_URL}/member/login/solana`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-message': message,
      'x-auth-signature': signature,
    },
    body: JSON.stringify({
      wallet_address: wallet.publicKey,
      message,
      signature,
    }),
  });

  if (response.status === 404) {
    const errorText = await response.text();
    if (errorText.includes('MemberNotFound')) {
      await registerMember(wallet.publicKey);
      response = await fetch(`${BASE_URL}/member/login/solana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-message': message,
          'x-auth-signature': signature,
        },
        body: JSON.stringify({
          wallet_address: wallet.publicKey,
          message,
          signature,
        }),
      });
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} - ${errorText.substring(0, 100)}`);
  }

  const data = await response.json();
  const token = data.data?.token;

  if (!token) {
    throw new Error(`No token returned: ${JSON.stringify(data)}`);
  }

  return token;
}

async function delegateCheckpoint(wallet: TestWallet, token: string): Promise<void> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

  const nftResponse = await fetch(`${BASE_URL}/nfts/${wallet.publicKey}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const nftData = await nftResponse.json();
  const nfts = nftData.data?.nfts || [];

  if (nfts.length === 0) {
    console.warn(`  [${wallet.publicKey.substring(0, 8)}] No NFTs found, skipping delegate`);
    return;
  }

  console.log(`  [${wallet.publicKey.substring(0, 8)}] Found ${nfts.length} NFTs, creating checkpoint...`);

  const userKeypair = Keypair.fromSecretKey(Uint8Array.from(wallet.secretKeyArray));
  const sdk = new GovernanceSDK(connection);
  const nftAccounts = nfts.map((nft: any) => new PublicKey(nft.tokenAccount));

  const transaction = await sdk.updateVoterCheckpoint(userKeypair.publicKey, nftAccounts);
  transaction.feePayer = userKeypair.publicKey;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.sign(userKeypair);

  const txHash = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction({ signature: txHash, blockhash, lastValidBlockHeight }, 'confirmed');

  console.log(`  [${wallet.publicKey.substring(0, 8)}] Checkpoint TX: ${txHash.substring(0, 16)}...`);

  const delegateResponse = await fetch(`${BASE_URL}/member/${wallet.publicKey}/delegate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      delegate_wallet: wallet.publicKey,
      delegated_tx: txHash,
    }),
  });

  if (!delegateResponse.ok) {
    const errorText = await delegateResponse.text();
    console.warn(`  [${wallet.publicKey.substring(0, 8)}] Delegate API failed: ${errorText.substring(0, 50)}`);
  }
}

async function performUserFlow(
  userIndex: number,
  _questTitle: string
): Promise<{ success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();

  try {
    const wallets: TestWallet[] = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
    const wallet = wallets[userIndex - 1];

    if (!wallet) {
      throw new Error(`Wallet ${userIndex} not found`);
    }

    console.log(`[User ${userIndex}] Starting flow with ${wallet.publicKey.substring(0, 8)}...`);

    const token = await login(wallet);
    console.log(`[User ${userIndex}] Logged in`);

    try {
      await delegateCheckpoint(wallet, token);
      console.log(`[User ${userIndex}] Delegation complete`);
    } catch (txError: any) {
      console.warn(`[User ${userIndex}] Delegate failed: ${txError.message}`);
    }

    const duration = Date.now() - startTime;
    return { success: true, duration };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[User ${userIndex}] Failed: ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

function calculateStats(durations: number[]) {
  if (durations.length === 0) return { avg: 0, p50: 0, p95: 0, p99: 0 };

  const sorted = [...durations].sort((a, b) => a - b);
  return {
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
  };
}

function printReport(results: PromiseSettledResult<{ success: boolean; duration: number; error?: string }>[], totalDuration: number) {
  const successResults = results
    .filter((r): r is PromiseFulfilledResult<{ success: boolean; duration: number }> =>
      r.status === 'fulfilled' && r.value.success
    )
    .map((r) => r.value);

  const totalSuccess = successResults.length;
  const totalFailed = CONCURRENT_USERS - totalSuccess;
  const successRate = (totalSuccess / CONCURRENT_USERS) * 100;
  const stats = calculateStats(successResults.map((r) => r.duration));

  console.log('\n' + '='.repeat(60));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`\nTotal Users:    ${CONCURRENT_USERS}`);
  console.log(`Successful:     ${totalSuccess} (${successRate.toFixed(1)}%)`);
  console.log(`Failed:         ${totalFailed}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`\nPerformance:`);
  console.log(`  Average: ${(stats.avg / 1000).toFixed(2)}s`);
  console.log(`  p50:     ${(stats.p50 / 1000).toFixed(2)}s`);
  console.log(`  p95:     ${(stats.p95 / 1000).toFixed(2)}s`);
  console.log(`  p99:     ${(stats.p99 / 1000).toFixed(2)}s`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('STRESS TEST: Concurrent Users Voting');
  console.log('='.repeat(60) + '\n');

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error('Error: test-wallets.json not found!');
    console.error(`Run: npx tsx scripts/generate-unique-wallets.ts ${CONCURRENT_USERS}`);
    process.exit(1);
  }

  const wallets: TestWallet[] = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));

  if (wallets.length < CONCURRENT_USERS) {
    console.error(`Error: Need ${CONCURRENT_USERS} wallets, only ${wallets.length} available`);
    process.exit(1);
  }

  console.log(`Wallets:  ${wallets.length}`);
  console.log(`Users:    ${CONCURRENT_USERS}`);
  console.log(`Quest:    "${QUEST_TITLE}"`);
  console.log(`API:      ${BASE_URL}\n`);

  const testStartTime = Date.now();

  const promises = Array.from({ length: CONCURRENT_USERS }, (_, i) =>
    performUserFlow(i + 1, QUEST_TITLE)
  );

  const results = await Promise.allSettled(promises);
  const testDuration = Date.now() - testStartTime;

  printReport(results, testDuration);

  const successRate = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length / CONCURRENT_USERS * 100;

  process.exit(successRate >= 50 ? 0 : 1);
}

main().catch(console.error);
