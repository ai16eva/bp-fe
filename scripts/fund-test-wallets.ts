import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';

interface TestWallet {
  index: number;
  publicKey: string;
  secretKey: string;
  secretKeyArray: number[];
}

const WALLETS_FILE = path.join(__dirname, '../tests/stress/test-wallets.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const AMOUNT_PER_WALLET = 0.5;

function loadMasterKeypair(input: string): Keypair {
  if (fs.existsSync(input)) {
    console.log(`Loading keypair from file: ${input}`);
    const keypairData = JSON.parse(fs.readFileSync(input, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  }

  console.log('Loading keypair from base58 string...');
  return Keypair.fromSecretKey(bs58.decode(input));
}

async function main() {
  console.log('='.repeat(60));
  console.log('Funding Test Wallets from Master Wallet');
  console.log('='.repeat(60) + '\n');

  const masterWalletInput = process.argv[2] || process.env.MASTER_WALLET_SECRET_KEY;

  if (!masterWalletInput) {
    console.error('Error: Master wallet not provided!\n');
    console.error('Usage:');
    console.error('  npx tsx scripts/fund-test-wallets.ts <keypair_file_or_secret_key>\n');
    console.error('Examples:');
    console.error('  npx tsx scripts/fund-test-wallets.ts ~/.config/solana/id.json');
    console.error('  npx tsx scripts/fund-test-wallets.ts <base58_secret_key>');
    console.error('  MASTER_WALLET_SECRET_KEY=/path/to/keypair.json npx tsx scripts/fund-test-wallets.ts\n');
    process.exit(1);
  }

  const masterKeypair = loadMasterKeypair(masterWalletInput);
  console.log(`Master Wallet: ${masterKeypair.publicKey.toBase58()}`);

  const connection = new Connection(RPC_URL, 'confirmed');

  const masterBalance = await connection.getBalance(masterKeypair.publicKey);
  console.log(`Master Balance: ${(masterBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL\n`);

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error('Error: test-wallets.json not found!');
    console.error('Run: npx tsx scripts/generate-unique-wallets.ts 50 --skip-airdrop');
    process.exit(1);
  }

  const wallets: TestWallet[] = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
  console.log(`Found ${wallets.length} test wallets`);

  const totalNeeded = wallets.length * AMOUNT_PER_WALLET;
  console.log(`Total SOL needed: ${totalNeeded.toFixed(2)} SOL\n`);

  if (masterBalance / LAMPORTS_PER_SOL < totalNeeded + 0.1) {
    console.error('Error: Master wallet has insufficient balance!');
    console.error(`Need: ${totalNeeded.toFixed(2)} SOL + fees`);
    console.error(`Have: ${(masterBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
    process.exit(1);
  }

  console.log('Starting transfers...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    if (!wallet) continue;

    try {
      console.log(`[${i + 1}/${wallets.length}] Funding ${wallet.publicKey.substring(0, 8)}...`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: masterKeypair.publicKey,
          toPubkey: new PublicKey(wallet.publicKey),
          lamports: AMOUNT_PER_WALLET * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [masterKeypair]);

      console.log(`  Transferred ${AMOUNT_PER_WALLET} SOL (${signature.substring(0, 8)}...)`);
      successCount++;

      if ((i + 1) % 10 === 0) {
        console.log('  Pausing 2s...');
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error: any) {
      console.error(`  Failed: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('FUNDING RESULTS');
  console.log('='.repeat(60));
  console.log(`\nTotal Wallets:      ${wallets.length}`);
  console.log(`Successfully Funded: ${successCount}`);
  console.log(`Failed:              ${failCount}`);

  const finalBalance = await connection.getBalance(masterKeypair.publicKey);
  console.log(`\nMaster Balance After: ${(finalBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL\n`);
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
