#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Balance(Address),
    Borrowed(Address),
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    /// Deposit funds into the vault (Actual Token Transfer)
    pub fn deposit(env: Env, user: Address, token_id: Address, amount: i128) {
        // 1. Verify user authorization
        user.require_auth();

        // 2. Transfer tokens from user to vault
        let client = token::Client::new(&env, &token_id);
        client.transfer(&user, &env.current_contract_address(), &amount);
        
        // 3. Update internal balance scoreboard
        let key = DataKey::Balance(user.clone());
        let current_balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current_balance + amount));
        
        // Log event
        env.events().publish((Symbol::new(&env, "deposit"), user), amount);
    }

    /// Borrow funds from the vault (Actual Token Transfer)
    pub fn borrow(env: Env, user: Address, token_id: Address, amount: i128) {
        // 1. Verify user authorization
        user.require_auth();
        
        // 2. Transfer tokens from vault to user
        let client = token::Client::new(&env, &token_id);
        client.transfer(&env.current_contract_address(), &user, &amount);
        
        // 3. Update borrowed scoreboard
        let key = DataKey::Borrowed(user.clone());
        let current_borrowed: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current_borrowed + amount));
        
        // Log event
        env.events().publish((Symbol::new(&env, "borrow"), user), amount);
    }

    /// Repay funds to the vault (Actual Token Transfer)
    pub fn repay(env: Env, user: Address, token_id: Address, amount: i128) {
        // 1. Verify user authorization
        user.require_auth();
        
        // 2. Transfer tokens from user back to vault
        let client = token::Client::new(&env, &token_id);
        client.transfer(&user, &env.current_contract_address(), &amount);
        
        // 3. Update borrowed scoreboard
        let key = DataKey::Borrowed(user.clone());
        let current_borrowed: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        
        let new_borrowed = if current_borrowed > amount {
            current_borrowed - amount
        } else {
            0
        };
        
        env.storage().persistent().set(&key, &new_borrowed);
        
        // Log event
        env.events().publish((Symbol::new(&env, "repay"), user), amount);
    }

    /// Get user's current vault balance
    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(user)).unwrap_or(0)
    }

    /// Get user's current borrowed amount
    pub fn get_borrowed(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Borrowed(user)).unwrap_or(0)
    }
}
