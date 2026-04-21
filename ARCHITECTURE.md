# StellarYield Architecture

StellarYield is a non-custodial decentralized micro-lending protocol. It leverages the high speed and low fees of the Stellar network, combined with the programmable logic of Soroban smart contracts.

## High-Level Flow

1. **User Connection**: Users connect via Freighter Wallet (SEP-7/SEP-10 standards).
2. **Horizon Sync**: The protocol fetches the user's historical transaction data directly from the Stellar Horizon API.
3. **Reputation Engine**: A client-side (and eventually on-chain Soroban) logic analyzes transaction consistency, account age, and volume to generate a "Reputation Score".
4. **Liquidity Pools (Soroban)**: 
   - Lenders deposit XLM/USDC into a Soroban smart contract.
   - The contract issues LP tokens and manages interest accrual.
5. **Borrowing Logic**:
   - Interest rates are calculated dynamically: `Rate = BaseRate - (ReputationScore / Divisor)`.
   - Borrowers can access micro-loans with lower collateral requirements if their Reputation Score is "Elite" or "High".

## Component Breakdown

### Frontend (React + Vite)
- **State Management**: React Hooks for wallet and UI state.
- **Data Fetching**: `stellar-sdk` for Horizon API calls.
- **Wallet Interaction**: `@stellar/freighter-api`.

### Intelligence Layer (Reputation Engine)
- **Algorithm**: Weighted average of:
  - Account Continuity (Days since creation)
  - Transaction Density (Txs/Month)
  - Operational Consistency (Regular payments)
  - Network Participation (Amount of assets moved)

### Smart Contract Layer (Soroban - Rust)
- **Pool Contract**: Manages the vault and lending logic.
- **Oracle (Future)**: Will eventually move the Reputation Score logic on-chain using Soroban cross-contract calls.

## Security & Privacy
- **Privacy**: No KYC required. Scoring is strictly based on public ledger activity.
- **Assets**: Funds are held in audited Soroban contracts (simulated for MVP).
- **Non-Custodial**: Users always maintain control of their keys via Freighter.
