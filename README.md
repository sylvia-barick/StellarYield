# 🌌 StellarYield: Micro-Lending Protocol

![Stellar](https://img.shields.io/badge/Built%20on-Stellar-blue)
![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-orange)
![Status](https://img.shields.io/badge/Status-Testnet-success)
![License](https://img.shields.io/badge/License-MIT-green)
<div align="center">
  <img src="picc.png" width="800" alt="StellarYield Banner">
</div>

**StellarYield** is a decentralized, reputation-based lending platform built on the **Stellar Network** using **Soroban Smart Contracts**. It solves the problem of high collateral in DeFi by using a user's on-chain history to lower interest rates—defying the "gravity" of traditional high-interest debt.

---

## 🚀 The Vision: "Antigravity" Lending
In traditional finance, everyone pays the same high rate regardless of loyalty. In StellarYield, your **Stellar Trust Score** acts as your financial identity. The better your history, the lower your interest rate.

---

## 🔌 Project Links & Verification
- **Video Demonstration:** [Demo video](https://youtu.be/GPmrRI8RiSo?si=9-Ih2V02ixWXX4RD)
- **Live MVP Demo:** [stellar-yield-rose.vercel.app](https://stellar-yield-rose.vercel.app/)
- **On-Chain Verification (Stellar Expert):** [Contract ID Explorer](https://stellar.expert/explorer/testnet/contract/CB4LDGHHLIFULYQPMKZCN6QD3FOZE7BANAF2LYIPYFQLDD3VDQJWFGCL)
- **GitHub Repository:** [github.com/sylvia-barick/StellarYield](https://github.com/sylvia-barick/StellarYield)

---

### 🧠 The Reputation Engine
We use the **Stellar Horizon API** to analyze:
1. **Account Age:** Loyalty and long-term commitment to the network.
2. **Network Activity:** Total transaction count and engagement level.
These factors combine into a dynamic **Trust Score (0-100)**.

---

## 📐 Economic Model (The Formula)
We use a Linear Scaling Formula to ensure absolute transparency. Every user can verify exactly why they are paying their specific rate.

**The Equation:**
 > **Personalized Interest Rate** = `Base Rate` - (`Trust Score` / 100 × `(Base Rate - Min Rate)`)

### Example Scenarios:
| User Type | Trust Score | Calculation | Final APR |
| :--- | :--- | :--- | :--- |
| **New Account** | 0 | 15% - (0 × 10%) | **15% (Base Rate)** |
| **Active Developer** | 90 | 15% - (0.9 × 10%) | **6% (Elite Rate)** |
| **Stellar Whale** | 100 | 15% - (1.0 × 10%) | **5% (Minimum Floor)** |

---
## 👥 User Validation & Onboarding
To validate the MVP, we onboarded 6 testnet users to verify the end-to-end liquidity lifecycle and "Antigravity" interest scaling.

- **User Feedback Data (Excel):** [View Spreadsheet of Responses](https://docs.google.com/spreadsheets/d/1_pxFn-fNdMikKCbjyV5wrrjBzYCOKOajp6D3dPO1CCY/edit?usp=sharing)
- **Verified Testnet Users:**
  1. Debojyoti De Majumder [GC4H63C77AZ4URQKZ7FPWI2JRP4JVRM6OQ2QVNNTU5CO3GF7SAAMQ5L2]
  2. Debdeepa Dutta [GAB7YLJODGSDGQZLOZTNMH2F4OAJ2UTPMTICBRLPAB4DC2OKWAAC65FH]
  3. Diptomoy Das [GCZKPRMN44P3FKEEZMOYCMRWB6KRWJCW6GMSO4MH34DK2CWR4TDK66CI]
  4. Sriz Debnath [GBTVSNJJSKKKSMMSMMSNSNNNNNSNSVVSNMSM]
  5. Rohan Kumar [GBYOEY63WVKXY5KTSQZG4FGCDYY2CV7K3SH4ZSVN6IFDWJ464HPFIEIQ]
  6. Tanmay Chakraborty [GCVBGPRU7YSL7NTK4WQ5SRGE4RC5CV7KNYBVJLNPKMMOUQRFPGRZRF2R]

---
## 🛡️ On-Chain Proof
<div align="center">
  <img src="check.png" width="800" alt="On-Chain Proof">
</div>

---

## The "StellarYield" Concept
```
User connects wallet via Freighter
        │
        ▼
 Reputation Engine scans Horizon API
 [Trust Score calculated: 0 - 100]
        │
        ▼
 System triggers "Antigravity" Formula
 [Base Rate 15% → Floats down based on Score]
        │
        ▼
 User interacts with Soroban Vault
 [Lend XLM for yield OR Borrow at personal APR]
        │
        ▼
 Repayment Center manages debt lifecycle
 [On-chain proof of settlement via Stellar Expert]

 ```

---

## 🏗️ Technical Architecture
1. **Frontend:** Next.js & Framer Motion (for smooth "Antigravity" UI animations).
2. **Smart Contract:** Soroban (Rust) handling the **Stellar Asset Contract (SAC)** for real XLM transfers.
3. **Data Layer:** Horizon API for real-time identity verification.
4. **Wallet:** Integration with **Freighter** for secure transaction signing.
 ```
StellarYield/
├── contracts/
│   └── stellaryield/
│       └── src/
│           └── lib.rs        # Core Soroban lending & vault logic
├── src/
│   ├── app/                  # Next.js App Router (Lend/Borrow pages)
│   ├── components/           # Antigravity UI & Trust Score animations
│   ├── lib/                  # Horizon API client & Soroban SDK utils
│   └── hooks/                # Custom hooks for real-time APR scaling
├── public/                   # Project assets (check.jpg, picc.png)
└── README.md
 ```


---

## 🌊 System Flowchart
1. **CONNECT:** User links Freighter wallet.
2. **SCAN:** Reputation Engine pings Horizon API to calculate Trust Score.
3. **SUPPLY:** User deposits XLM into the Native Core Vault.
4. **BORROW:** User takes a loan at a personalized rate.
5. **REPAY:** User clears debt in the Repayment Center to maintain their score.

```mermaid
flowchart TD
    A[Connect Wallet] --> B[Fetch Account Data]
    B --> C[Calculate Trust Score]
    C --> D[Show Personalized APR]

    D --> E{User Action}

    E -->|Supply| F[Deposit XLM]
    F --> G[Vault]

    E -->|Borrow| H[Loan Request]
    H --> I[Contract Check]
    I --> J[Transfer XLM]

    E -->|Repay| K[Repay Loan]
    K --> L[Clear Debt]
```

---

## 🛠️ How to Use This Website

### 1. Initialize Your Identity
* Open the website and click **Connect Wallet**.
* Ensure you are on the **Stellar Testnet**.
* Watch your **Trust Score** animate based on your actual account history.

### 2. Supplying Liquidity (Lending)
* Enter an amount in the **Input Value** box (e.g., 25 XLM).
* Click **Initialize Supply** and approve the Freighter popup. Your XLM is now earning yield in the Vault!

### 3. Borrowing
* Navigate to the **Borrow Console**.
* View your **Personalized APR** (e.g., 6% if your score is 90).
* Enter the amount you need and click **Borrow**.

### 4. Repaying (Repayment Center)
* Go to the **Repayment Center**.
* View your "Total to Return" (Principal + Accrued Interest).
* Click **Clear Debt** to finalize the transaction and restore your credit line.

---

## 🔑 Key Technical Details
- **Contract ID:** `CB4LDGHHLIFULYQPMKZCN6QD3FOZE7BANAF2LYIPYFQLDD3VDQJWFGCL`
- **Network:** Stellar Testnet
- **Token:** Native XLM (SAC)
- **Precision:** 7 Decimal places (Stroops)
---

