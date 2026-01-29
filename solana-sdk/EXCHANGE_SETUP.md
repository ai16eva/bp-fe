# Exchange Feature Setup Guide

Hướng dẫn khởi tạo tính năng Exchange để swap giữa POINT token và BOOM token.

## Prerequisites

1. **Solana CLI** đã cài đặt
2. **Node.js** >= 18
3. Đã deploy **ForecastExchange program** lên Solana (devnet/mainnet)
4. Có 2 SPL tokens:
   - **POINT token** (usdtMint) - token đầu vào
   - **BOOM token** (usdpMint) - token đầu ra

---

## Step 1: Cấu hình Environment

### 1.1 Tạo file `.env` trong `solana-sdk/`

```bash
cd solana-sdk
cp .env.example .env
```

### 1.2 Cập nhật các biến môi trường

```env
# Network
SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Token addresses (thay bằng địa chỉ thật)
NEXT_PUBLIC_POINT_TOKEN_ADDRESS=<POINT_TOKEN_MINT_ADDRESS>
NEXT_PUBLIC_BOOM_TOKEN_ADDRESS=<BOOM_TOKEN_MINT_ADDRESS>

# Exchange fee (basis points, 50 = 0.5%)
EXCHANGE_FEE_BPS=50

# Admin wallet private key (base58 format)
PRIVATE_KEY_BASE58=<YOUR_ADMIN_PRIVATE_KEY>
```

---

## Step 2: Initialize Exchange

### 2.1 Cài đặt dependencies

```bash
cd solana-sdk
npm install
```

### 2.2 Chạy script khởi tạo

```bash
npx ts-node scripts/initialize-exchange.ts
```

**Output mong đợi:**
```
Initializing ForecastExchange...
Owner: <OWNER_PUBKEY>
USDT Mint (POINT): <POINT_TOKEN_ADDRESS>
USDP Mint (BOOM): <BOOM_TOKEN_ADDRESS>
Exchange Fee: 50 bps (0.5%)
Exchange initialized: <TRANSACTION_SIGNATURE>
Exchange State PDA: <EXCHANGE_STATE_PDA>
```

**Lưu lại `Exchange State PDA`** - đây là địa chỉ exchange program.

---

## Step 3: Fund Owner Wallet

Owner wallet cần có đủ tokens để exchange hoạt động.

### 3.1 Transfer POINT tokens cho owner

```bash
# Lấy owner ATA cho POINT token
spl-token accounts <POINT_TOKEN_ADDRESS> --owner <OWNER_PUBKEY> --url devnet

# Transfer tokens (ví dụ 1,000,000 POINT)
spl-token transfer <POINT_TOKEN_ADDRESS> 1000000 <OWNER_PUBKEY> --url devnet
```

### 3.2 Transfer BOOM tokens cho owner

```bash
# Lấy owner ATA cho BOOM token
spl-token accounts <BOOM_TOKEN_ADDRESS> --owner <OWNER_PUBKEY> --url devnet

# Transfer tokens (ví dụ 1,000,000,000 BOOM)
spl-token transfer <BOOM_TOKEN_ADDRESS> 1000000000 <OWNER_PUBKEY> --url devnet
```

---

## Step 4: Approve Delegate

**QUAN TRỌNG:** Owner phải approve Exchange PDA làm delegate cho token accounts.

### 4.1 Chạy approve script

```bash
npx ts-node scripts/approve-delegate.ts
```

**Output mong đợi:**
```
Owner loaded: <OWNER_PUBKEY>
SOL Balance: X.XXXX SOL
Approval completed successfully!
```

### 4.2 Verify approval (optional)

```bash
# Check POINT token delegate
spl-token display <OWNER_POINT_ATA> --url devnet

# Check BOOM token delegate
spl-token display <OWNER_BOOM_ATA> --url devnet
```

Delegate phải là Exchange State PDA.

---

## Step 5: Frontend Configuration

### 5.1 Cập nhật `.env` của frontend (`bpl-fe-lastest/.env`)

```env
# Exchange Program Address (Exchange State PDA từ Step 2)
NEXT_PUBLIC_EXCHANGE_ADDRESS=<EXCHANGE_STATE_PDA>

# Token addresses
NEXT_PUBLIC_POINT_TOKEN_ADDRESS=<POINT_TOKEN_ADDRESS>
NEXT_PUBLIC_BOOM_TOKEN_ADDRESS=<BOOM_TOKEN_ADDRESS>
```

### 5.2 Restart frontend

```bash
npm run dev
```

---

## Step 6: API Configuration (Daily Reward)

Nếu muốn daily check-in trả BOOM token:

### 6.1 Cập nhật `boomplay-api-master/.env.dev`

```env
# Token mint cho daily reward
SOLANA_TOKEN_MINT=<BOOM_TOKEN_ADDRESS>

# Số lượng reward mỗi lần check-in
DAILY_REWARD_AMOUNT=0.001

# RPC URL
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 6.2 Restart API server

```bash
npm run start:dev
```

---

## Verification Checklist

- [ ] Exchange initialized (có transaction signature)
- [ ] Owner có đủ POINT tokens
- [ ] Owner có đủ BOOM tokens
- [ ] Delegate approved cho cả 2 token accounts
- [ ] Frontend `.env` đã cập nhật `NEXT_PUBLIC_EXCHANGE_ADDRESS`
- [ ] API `.env` đã cập nhật `SOLANA_TOKEN_MINT` (nếu dùng daily reward)

---

## Troubleshooting

### Error: `AccountNotFound`
- User chưa có token account (ATA)
- **Fix:** Code tự tạo ATA, user cần có SOL để pay rent

### Error: `MissingDelegateApproval`
- Owner chưa approve delegate
- **Fix:** Chạy lại `npx ts-node scripts/approve-delegate.ts`

### Error: `InsufficientFunds`
- Owner không đủ tokens
- **Fix:** Transfer thêm tokens cho owner wallet

### Error: User không có SOL
- User cần SOL để pay transaction fees
- **Fix:** Airdrop SOL cho user (devnet): `solana airdrop 2 <USER_PUBKEY> --url devnet`

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   User      │────▶│ ForecastExchange │────▶│   Owner     │
│  Wallet     │     │   Program (PDA)  │     │   Wallet    │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                     │                      │
       │                     │                      │
  ┌────▼────┐          ┌─────▼─────┐         ┌─────▼─────┐
  │User ATA │          │ Exchange  │         │Owner ATA  │
  │ POINT   │          │   State   │         │  POINT    │
  │ BOOM    │          │           │         │  BOOM     │
  └─────────┘          └───────────┘         └───────────┘
```

**Swap Flow:**
1. **POINT → BOOM (buyUsdp):** User gửi POINT, nhận BOOM từ owner
2. **BOOM → POINT (sellUsdp):** User gửi BOOM, nhận POINT từ owner

---

## Scripts Reference

| Script | Mô tả |
|--------|-------|
| `scripts/initialize-exchange.ts` | Khởi tạo exchange |
| `scripts/approve-delegate.ts` | Approve delegate cho owner |
| `scripts/check-exchange-state.ts` | Kiểm tra trạng thái exchange |

---

## Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser DevTools
2. API server logs
3. Solana Explorer: https://explorer.solana.com/?cluster=devnet
