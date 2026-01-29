import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';

interface TestWallet {
  index: number;
  publicKey: string;
  secretKey: string;
  secretKeyArray: number[];
}

const WALLET_COUNT = parseInt(process.argv[2] || '50');
const SKIP_AIRDROP = process.argv[3] === '--skip-airdrop';
const OUTPUT_FILE = path.join(__dirname, '../tests/stress/test-wallets.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function airdrop(connection: Connection, publicKey: PublicKey, amount = 2): Promise<boolean> {
  try {
    console.log(`  Airdropping ${amount} SOL...`);
    const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    console.log('  Airdrop successful');
    return true;
  } catch (error: any) {
    console.error(`  Airdrop failed: ${error.message}`);
    if (error.message.includes('429') || error.message.includes('airdrop')) {
      console.log('  Rate limited, waiting 60s...');
      await new Promise((r) => setTimeout(r, 60000));
      return airdrop(connection, publicKey, amount);
    }
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Generating Solana Wallets for Stress Testing');
  console.log('='.repeat(60));
  console.log(`\nWallets: ${WALLET_COUNT}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  const connection = new Connection(RPC_URL, 'confirmed');
  const wallets: TestWallet[] = [];

  console.log('Generating wallets...\n');

  for (let i = 0; i < WALLET_COUNT; i++) {
    console.log(`[${i + 1}/${WALLET_COUNT}] Generating wallet...`);

    const keypair = Keypair.generate();

    const wallet: TestWallet = {
      index: i + 1,
      publicKey: keypair.publicKey.toBase58(),
      secretKey: bs58.encode(keypair.secretKey),
      secretKeyArray: Array.from(keypair.secretKey),
    };

    wallets.push(wallet);
    console.log(`  Public Key: ${wallet.publicKey}`);

    if (!SKIP_AIRDROP) {
      if (i > 0 && i % 5 === 0) {
        console.log('  Pausing 10s to avoid rate limit...');
        await new Promise((r) => setTimeout(r, 10000));
      }
      await airdrop(connection, keypair.publicKey, 2);
    } else {
      console.log('  Skipping airdrop');
    }
    console.log('');
  }

  console.log('Saving wallets...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(wallets, null, 2));
  console.log(`Saved to: ${OUTPUT_FILE}\n`);

  if (!SKIP_AIRDROP) {
    console.log('Verifying balances...');
    let fundedCount = 0;
    for (const wallet of wallets) {
      const balance = await connection.getBalance(new PublicKey(wallet.publicKey));
      if (balance > 0) fundedCount++;
    }
    console.log(`${fundedCount}/${WALLET_COUNT} wallets funded\n`);
  } else {
    console.log('Skipped airdrop - wallets created but not funded\n');
  }

  console.log('='.repeat(60));
  console.log('Wallet Generation Complete!');
  console.log('='.repeat(60));
  console.log('\nNext Steps:\n');

  if (SKIP_AIRDROP) {
    console.log('1. Fund wallets:');
    console.log('   npx tsx scripts/fund-test-wallets.ts <keypair>\n');
    console.log('2. Mint NFTs:');
  } else {
    console.log('1. Mint NFTs:');
  }
  console.log('   npx tsx scripts/mint-nfts-for-test-wallets.ts\n');

  console.log(`${SKIP_AIRDROP ? '3' : '2'}. Index NFTs in database:`);
  console.log('   cd ../boomplay-api-master');
  console.log('   node scripts/index_with_helius_das.js\n');

  console.log('Security Reminder:');
  console.log('  - test-wallets.json contains PRIVATE KEYS');
  console.log('  - Add to .gitignore');
  console.log('  - ONLY use for devnet testing\n');
}

main().catch(console.error);
