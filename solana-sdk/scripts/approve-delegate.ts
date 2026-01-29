import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, approve } from '@solana/spl-token';
import { ForecastExchangeSDK } from '../src/ForecastExchange';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const APPROVE_AMOUNT_USDT = '1000000000000000';
const APPROVE_AMOUNT_USDP = '1000000000000000';

function loadKeypair(): Keypair {
  const key = process.env.PRIVATE_KEY_BASE58;
  if (!key) throw new Error('Missing PRIVATE_KEY_BASE58');
  const kp = Keypair.fromSecretKey(bs58.decode(key));
  console.log(`Owner loaded: ${kp.publicKey.toBase58()}`);
  return kp;
}

async function checkBalance(connection: Connection, pub: PublicKey) {
  return (await connection.getBalance(pub)) / 1e9;
}

async function approveDelegate() {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
      'confirmed'
    );
    const owner = loadKeypair();
    const balance = await checkBalance(connection, owner.publicKey);
    console.log(`SOL Balance: ${balance.toFixed(4)} SOL`);

    const sdk = new ForecastExchangeSDK(connection);
    const exchangeState = await sdk.fetchExchangeState();

    if (!exchangeState.owner.equals(owner.publicKey)) {
      throw new Error(
        `Keypair mismatch! Expected: ${exchangeState.owner.toBase58()}, Got: ${owner.publicKey.toBase58()}`
      );
    }

    const ownerUsdtAccount = await getAssociatedTokenAddress(
      exchangeState.usdtMint,
      owner.publicKey
    );
    const ownerUsdpAccount = await getAssociatedTokenAddress(
      exchangeState.usdpMint,
      owner.publicKey
    );

    const exchangePDA = sdk.getExchangeStatePDA();

    const usdtSig = await approve(
      connection,
      owner,
      ownerUsdtAccount,
      exchangePDA,
      owner.publicKey,
      BigInt(APPROVE_AMOUNT_USDT)
    );
    await connection.confirmTransaction(usdtSig, 'confirmed');

    const usdpSig = await approve(
      connection,
      owner,
      ownerUsdpAccount,
      exchangePDA,
      owner.publicKey,
      BigInt(APPROVE_AMOUNT_USDP)
    );
    await connection.confirmTransaction(usdpSig, 'confirmed');

    console.log('Approval completed successfully!');
  } catch (err) {
    console.error('Error during approval:', err);
    process.exit(1);
  }
}

approveDelegate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
