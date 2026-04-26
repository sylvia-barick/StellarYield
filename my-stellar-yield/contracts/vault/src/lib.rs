#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol, log};

mod reputation_contract {
    soroban_sdk::contractimport!(file = "reputation.wasm");
}
use reputation_contract::Client as ReputationClient;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    VaultToken,    // The XLM or USDC contract address (SAC)
    ReputationAddr, // The Reputation contract address
    UserScore(Address),
    UserDebt(Address),
    UserDeposit(Address),
    UserDeadline(Address),
    IsPaused,      // Panic Switch status
}

#[contract]
pub struct StellarYield;

#[contractimpl]
impl StellarYield {
    /// 1. INITIALIZE: Set the Admin and the Token to be used (SAC)
    pub fn initialize(env: Env, admin: Address, token_addr: Address, reputation_addr: Address) {
        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::VaultToken, &token_addr);
        env.storage().persistent().set(&DataKey::ReputationAddr, &reputation_addr);
        env.storage().persistent().set(&DataKey::IsPaused, &false);
    }

    /// 2. DEPOSIT: Supply liquidity to the vault
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        
        let token_addr: Address = env.storage().persistent().get(&DataKey::VaultToken).expect("Token not set");
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&user, &env.current_contract_address(), &amount);

        let key = DataKey::UserDeposit(user.clone());
        let current_deposit: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current_deposit + amount));

        env.events().publish((Symbol::new(&env, "deposit"), user), amount);
    }

    /// 2. PANIC SWITCH: Pause or resume the protocol
    pub fn set_pause(env: Env, _admin: Address, status: bool) {
        let stored_admin: Address = env.storage().persistent().get(&DataKey::Admin).expect("Not initialized");
        stored_admin.require_auth();
        
        env.storage().persistent().set(&DataKey::IsPaused, &status);
        env.events().publish((Symbol::new(&env, "protocol_pause"), status), ());
    }

    /// 3. REPUTATION ENGINE: Store the Trust Score on-chain
    pub fn set_score(env: Env, _admin: Address, user: Address, score: i128) {
        let stored_admin: Address = env.storage().persistent().get(&DataKey::Admin).expect("Not initialized");
        stored_admin.require_auth(); 
        
        let reputation_addr: Address = env.storage().persistent().get(&DataKey::ReputationAddr).expect("Reputation not set");
        let client = ReputationClient::new(&env, &reputation_addr);
        client.update_score(&user, &score);
    }

    /// 4. CROSS-CONTRACT CALL: Borrowing with Algorithmic Math
    pub fn borrow(env: Env, borrower: Address, amount: i128) {
        borrower.require_auth();

        // Check Panic Switch
        let is_paused: bool = env.storage().persistent().get(&DataKey::IsPaused).unwrap_or(false);
        if is_paused {
            panic!("Protocol is currently paused");
        }

        let token_addr: Address = env.storage().persistent().get(&DataKey::VaultToken).expect("Token not set");
        let reputation_addr: Address = env.storage().persistent().get(&DataKey::ReputationAddr).expect("Reputation not set");
        let rep_client = ReputationClient::new(&env, &reputation_addr);
        let score_i128 = rep_client.get_score(&borrower);
        let score = score_i128 as u32;
        
        // --- Complexity: Algorithmic Rate Calculation (Basis Points) ---
        // Base rate 15%, max discount 10% based on score
        let base_rate = 1500; 
        let discount = (score as i128 * 1000) / 100; 
        let personal_rate = (base_rate - discount).max(500); // Floor at 5%

        // Calculate Debt (Principal + Interest)
        let total_debt = amount + (amount * personal_rate / 10000);
        
        // Store State: Debt and Deadline (Current Ledger + 100,000 (~7 days))
        env.storage().persistent().set(&DataKey::UserDebt(borrower.clone()), &total_debt);
        env.storage().persistent().set(&DataKey::UserDeadline(borrower.clone()), &(env.ledger().sequence() + 100_000));

        // --- INTER-CONTRACT CALL ---
        // Calling the External SAC Contract to transfer funds to borrower
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&env.current_contract_address(), &borrower, &amount);

        // Emit Event for Metrics
        env.events().publish((Symbol::new(&env, "borrow"), borrower), amount);
    }

    /// 5. REPAYMENT: Clearing debt state with Token Transfer
    pub fn repay(env: Env, borrower: Address, amount: i128) {
        borrower.require_auth();
        
        let token_addr: Address = env.storage().persistent().get(&DataKey::VaultToken).expect("Token not set");
        let current_debt: i128 = env.storage().persistent().get(&DataKey::UserDebt(borrower.clone())).unwrap_or(0);

        if amount < current_debt {
            panic!("Insufficient amount to clear debt");
        }

        // --- INTER-CONTRACT CALL ---
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&borrower, &env.current_contract_address(), &amount);

        // Clear State
        env.storage().persistent().remove(&DataKey::UserDebt(borrower.clone()));
        env.storage().persistent().remove(&DataKey::UserDeadline(borrower.clone()));
        
        // Reward: Small score bump for successful repayment
        let reputation_addr: Address = env.storage().persistent().get(&DataKey::ReputationAddr).expect("Reputation not set");
        let rep_client = ReputationClient::new(&env, &reputation_addr);
        // Note: This will fail if Vault is not admin of Reputation. 
        // In a real system, Vault would have a special permission.
        rep_client.update_score(&borrower, &1); 

        env.events().publish((Symbol::new(&env, "repay"), borrower), amount);
    }

    // --- View Functions ---
    pub fn get_debt(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&DataKey::UserDebt(user)).unwrap_or(0)
    }

    pub fn get_score(env: Env, user: Address) -> i128 {
        let reputation_addr: Address = env.storage().persistent().get(&DataKey::ReputationAddr).expect("Reputation not set");
        let rep_client = ReputationClient::new(&env, &reputation_addr);
        rep_client.get_score(&user)
    }

    pub fn get_deposit(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&DataKey::UserDeposit(user)).unwrap_or(0)
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().persistent().get(&DataKey::IsPaused).unwrap_or(false)
    }
}
