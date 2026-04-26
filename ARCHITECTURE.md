# StellarYield Architecture

StellarYield is a non-custodial decentralized micro-lending protocol. It leverages the high speed and low fees of the Stellar network, combined with the programmable logic of Soroban smart contracts.

## High-Level Flow

1. **User Connection**: Users connect via Freighter Wallet (SEP-7/SEP-10 standards).
2. **Horizon Sync**: The protocol fetches the user's historical transaction data directly from the Stellar Horizon API.
3. **Reputation Engine**: An on-chain Reputation Contract stores user trust scores. Scores are updated based on repayment history and network activity.
4. **Liquidity Pools (Soroban)**: 
   - Lenders deposit assets into the Vault Contract.
   - The Vault Contract performs **Cross-Contract Calls** to the Reputation Contract to verify borrower eligibility and calculate limits.

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
- **Vault Contract**: Manages liquidity, deposits, and loans. Calls the Reputation Contract for risk assessment.
- **Reputation Contract**: Decoupled trust scoring system. Acts as a data provider for the Vault.
- **Cross-Contract Calls**: The Vault uses the `Reputation Contract` interface to fetch scores in real-time during the `borrow` transaction.

## Security & Privacy
- **Privacy**: No KYC required. Scoring is strictly based on public ledger activity.
- **Assets**: Funds are held in audited Soroban contracts (simulated for MVP).
- **Non-Custodial**: Users always maintain control of their keys via Freighter.
