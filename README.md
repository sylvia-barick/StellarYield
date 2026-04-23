# 🌌 StellarYield: Micro-Lending Protocol

**StellarYield** is a decentralized, reputation-based lending platform built on the **Stellar Network** using **Soroban Smart Contracts**. It solves the problem of high collateral in DeFi by using a user's on-chain history to lower interest rates—defying the "gravity" of traditional high-interest debt.

---

## 🚀 The Vision: "Antigravity" Lending
In traditional finance, everyone pays the same high rate. In StellarYield, your **Stellar Trust Score** acts as your financial identity. The better your history, the lower your interest rate.

### 🧠 The Reputation Engine
We use the **Stellar Horizon API** to analyze:
1. **Account Age:** Loyalty to the network.
2. **Network Activity:** Total transaction count.
These factors combine into a **Trust Score (0-100)**.

---

## 📐 Economic Model (The Formula)
We use a Linear Scaling Formula to ensure transparency. Every user sees exactly why they are paying their specific rate.

**The Equation:**
> **Personalized Interest Rate** = `Base Rate (15%)` - (`Trust Score` / 100 × `Max Reputation Discount (10%)`)

### Example Scenarios:
| User Type | Trust Score | Calculation | Final APR |
| :--- | :--- | :--- | :--- |
| **New Account** | 0 | 15% - (0 × 10%) | **15% (Base Rate)** |
| **Active Developer** | 90 | 15% - (0.9 × 10%) | **6% (Elite Rate)** |
| **Stellar Whale** | 100 | 15% - (1.0 × 10%) | **5% (Minimum Floor)** |

---

## 🏗️ Technical Architecture



1. **Frontend:** Next.js & Framer Motion (for smooth "Antigravity" UI animations).
2. **Smart Contract:** Soroban (Rust) handling the **Stellar Asset Contract (SAC)** for real XLM transfers.
3. **Data Layer:** Horizon API for real-time identity verification.
4. **Wallet:** Integration with **Freighter** for secure transaction signing.

---

## 🌊 System Flowchart



1. **CONNECT:** User links Freighter wallet.
2. **SCAN:** Reputation Engine pings Horizon API to calculate Trust Score.
3. **SUPPLY:** User deposits XLM into the Native Core Vault.
4. **BORROW:** User takes a loan at a personalized rate.
5. **REPAY:** User clears debt in the Repayment Center to maintain their score.

---

## 🛠️ How to Use This Website

### 1. Initialize Your Identity
* Open the website and click **Connect Wallet**.
* Ensure you are on the **Stellar Testnet**.
* Watch your **Trust Score** animate based on your actual account history.

### 2. Supplying Liquidity (Lending)
* Enter an amount in the **Input Value** box (e.g., 25 XLM).
* Click **Initialize Supply**. 
* Approve the Freighter popup. Your XLM is now in the Vault!

### 3. Borrowing
* Navigate to the **Borrow Console**.
* See your **Personalized APR** (6% if your score is 90).
* Enter the amount you need and click **Borrow**.

### 4. Repaying (Repayment Center)
* Go to the **Repayment Center** (formerly Governance).
* View your "Total to Return" (Principal + Accrued Interest).
* Click **Clear Debt** to finalize the transaction and free up your credit line.

---

## 🔑 Key Technical Details
- **Contract ID:** `CBVOHUCBRKE6DY7W4M7BIQU7CDKOXYG7ZGREEXL2AHFFSA7JETZFD6RB`
- **Network:** Stellar Testnet
- **Token:** Native XLM (SAC)
- **Precision:** 7 Decimal places (Stroops)

---

