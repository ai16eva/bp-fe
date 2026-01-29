export interface JupiterOrderRequest {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker: string;
  receiver?: string;
  payer?: string;
  closeAuthority?: string;
  referralAccount?: string;
  referralFee?: number;
  excludeRouters?: ('iris' | 'jupiterz' | 'dflow' | 'okx')[];
  excludeDexes?: string;
}

export interface JupiterOrderResponse {
  mode: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  priceImpact: number;
  routePlan: RoutePlan[];
  feeBps: number;
  platformFee: PlatformFee;
  signatureFeeLamports: number;
  signatureFeePayer: string | null;
  prioritizationFeeLamports: number;
  prioritizationFeePayer: string | null;
  rentFeeLamports: number;
  rentFeePayer: string | null;
  swapType: string;
  router: 'iris' | 'jupiterz' | 'dflow' | 'okx';
  transaction: string | null;
  gasless: boolean;
  requestId: string;
  totalTime: number;
  taker: string | null;
  inUsdValue?: number;
  outUsdValue?: number;
  swapUsdValue?: number;
  referralAccount?: string;
  feeMint?: string;
  quoteId?: string;
  maker?: string;
  expireAt?: string;
  errorCode?: 1 | 2 | 3;
  errorMessage?: string;
}

interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

interface PlatformFee {
  amount: string;
  feeBps: number;
}

export interface JupiterExecuteRequest {
  signedTransaction: string;
  requestId: string;
}

export interface JupiterExecuteResponse {
  status: 'Success' | 'Failed';
  code: number;
  signature?: string;
  slot?: string;
  error?: string;
  totalInputAmount?: string;
  totalOutputAmount?: string;
  inputAmountResult?: string;
  outputAmountResult?: string;
  swapEvents?: SwapEvent[];
}

interface SwapEvent {
  [key: string]: any;
}

export class JupiterSwapError extends Error {
  constructor(
    message: string,
    public code?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'JupiterSwapError';
  }
}
