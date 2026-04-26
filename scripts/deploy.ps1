# StellarYield Protocol Deployment & Initialization Script
# Run this from the my-stellar-yield directory

# 1. Build contracts
Write-Host "Building contracts..." -ForegroundColor Cyan
stellar contract build

# 2. Deploy Reputation Contract
Write-Host "Deploying Reputation Contract..." -ForegroundColor Cyan
$REPUTATION_ID = stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellaryield_reputation.wasm --source alice --network testnet
Write-Host "Reputation Contract ID: $REPUTATION_ID" -ForegroundColor Green

# 3. Deploy Vault Contract
Write-Host "Deploying Vault Contract..." -ForegroundColor Cyan
$VAULT_ID = stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellaryield_vault.wasm --source alice --network testnet
Write-Host "Vault Contract ID: $VAULT_ID" -ForegroundColor Green

# 4. Initialize Reputation Contract
Write-Host "Initializing Reputation Contract..." -ForegroundColor Cyan
$ALICE_ADDR = stellar keys address alice
stellar contract invoke --id $REPUTATION_ID --source alice --network testnet -- initialize --admin $ALICE_ADDR

# 5. Initialize Vault Contract
Write-Host "Initializing Vault Contract..." -ForegroundColor Cyan
stellar contract invoke --id $VAULT_ID --source alice --network testnet -- initialize --admin $ALICE_ADDR --reputation_addr $REPUTATION_ID

Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "Please update VAULT_CONTRACT_ID and REPUTATION_CONTRACT_ID in src/lib/stellar.ts" -ForegroundColor Yellow
Write-Host "Vault: $VAULT_ID"
Write-Host "Reputation: $REPUTATION_ID"
