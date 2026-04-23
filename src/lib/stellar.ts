import * as StellarSdk from 'stellar-sdk';
import { isConnected, getAddress, requestAccess, signTransaction } from '@stellar/freighter-api';

export const STELLAR_NETWORK = 'TESTNET';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// Native XLM Token ID on Testnet
export const XLM_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Helper to convert XLM amount to Stroops (10^7) for the contract
export const toStroops = (amount: string) => (BigInt(Math.floor(Number(amount) * 10000000))).toString();
// Helper to convert Stroops from contract back to XLM decimal for UI
export const fromStroops = (stroops: string) => (Number(stroops) / 10000000).toString();

export interface WalletState {
  address: string | null;
  connected: boolean;
  balance?: string;
}

export async function getWalletBalance(address: string): Promise<string> {
  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (e) {
    console.error('Error fetching wallet balance:', e);
    return '0';
  }
}


export async function connectWallet(): Promise<string | null> {
  try {
    if (!await isConnected()) {
      throw new Error('Freighter extension not detected. Please install it to continue.');
    }

    // Use requestAccess to trigger the popup if not authorized
    const result = await requestAccess();

    if (typeof result === 'string') {
      return result;
    }

    if (result && 'address' in result && result.address) {
      return result.address;
    }

    if (result && 'error' in result && result.error) {
      throw new Error(result.error);
    }

    return null;
  } catch (e: any) {
    console.error('Wallet connection error:', e);
    throw e;
  }
}

export async function checkConnection(): Promise<string | null> {
  try {
    if (await isConnected()) {
      const result = await getAddress();
      if (typeof result === 'string' && result) return result;
      if (result && 'address' in result && result.address) {
        return result.address;
      }
    }
  } catch (e) {
    // Silent failure for auto-check
  }
  return null;
}

export async function fetchAccountAge(address: string) {
  try {
    const operations = await server.operations().forAccount(address).order('asc').limit(1).call();
    if (operations.records.length > 0) {
      return operations.records[0].created_at;
    }
    return null;
  } catch (e) {
    console.error('Error fetching account age:', e);
    return null;
  }
}

export async function fetchTransactionsCount(address: string) {
  try {
    const txs = await server.transactions().forAccount(address).limit(100).call();
    return txs.records.length;
  } catch (e) {
    console.error('Error fetching transactions count:', e);
    return 0;
  }
}

export async function fetchTransactions(address: string, limit = 50) {
  try {
    return await server.transactions().forAccount(address).limit(limit).order('desc').call();
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return null;
  }
}


export const CONTRACT_ID = "CB4LDGHHLIFULYQPMKZCN6QD3FOZE7BANAF2LYIPYFQLDD3VDQJWFGCL"; 
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const rpcServer = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

export async function supplyFunds(address: string, amount: string) {
  try {
    const account = await server.loadAccount(address);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const stroopAmount = toStroops(amount);

    let tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        contract.call('deposit',
          StellarSdk.Address.fromString(address).toScVal(),
          StellarSdk.Address.fromString(XLM_ID).toScVal(),
          StellarSdk.xdr.ScVal.scvI128(new StellarSdk.xdr.Int128Parts({
            lo: StellarSdk.xdr.Uint64.fromString(stroopAmount),
            hi: StellarSdk.xdr.Int64.fromString('0')
          }))
        )
      )
      .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
      .setTimeout(30)
      .build();

    try {
      tx = await rpcServer.prepareTransaction(tx);
    } catch (simError: any) {
      console.error('Simulation failed:', simError);
      throw new Error(`Simulation Failed. Ensure you have enough XLM in your wallet to cover the deposit.`);
    }

    const signedTx = await signTransaction(tx.toXDR(), { networkPassphrase: StellarSdk.Networks.TESTNET });
    const xdrToSubmit = typeof signedTx === 'string' ? signedTx : signedTx.signedTxXdr;
    
    const result = await rpcServer.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(xdrToSubmit, StellarSdk.Networks.TESTNET));

    if (result.status !== 'ERROR') {
      return result.hash;
    }
    
    throw new Error(`Transaction rejected by network: ${result.status}`);
  } catch (e: any) {
    console.error('Supply error:', e);
    throw e;
  }
}

export async function borrowFunds(address: string, amount: string) {
  try {
    const account = await server.loadAccount(address);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const stroopAmount = toStroops(amount);

    let tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        contract.call('borrow',
          StellarSdk.Address.fromString(address).toScVal(),
          StellarSdk.Address.fromString(XLM_ID).toScVal(),
          StellarSdk.xdr.ScVal.scvI128(new StellarSdk.xdr.Int128Parts({
            lo: StellarSdk.xdr.Uint64.fromString(stroopAmount),
            hi: StellarSdk.xdr.Int64.fromString('0')
          }))
        )
      )
      .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
      .setTimeout(30)
      .build();

    try {
      tx = await rpcServer.prepareTransaction(tx);
    } catch (simError: any) {
      console.error('Simulation failed:', simError);
      throw new Error(`Simulation Failed. The vault may not have enough liquidity yet.`);
    }

    const signedTx = await signTransaction(tx.toXDR(), { networkPassphrase: StellarSdk.Networks.TESTNET });
    const xdrToSubmit = typeof signedTx === 'string' ? signedTx : signedTx.signedTxXdr;
    const result = await rpcServer.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(xdrToSubmit, StellarSdk.Networks.TESTNET));

    if (result.status !== 'ERROR') {
      return result.hash;
    }
    throw new Error(`Transaction rejected: ${result.status}`);
  } catch (e: any) {
    console.error('Borrow error:', e);
    throw e;
  }
}

export async function repayFunds(address: string, amount: string) {
  try {
    const account = await server.loadAccount(address);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const stroopAmount = toStroops(amount);

    let tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        contract.call('repay',
          StellarSdk.Address.fromString(address).toScVal(),
          StellarSdk.Address.fromString(XLM_ID).toScVal(),
          StellarSdk.xdr.ScVal.scvI128(new StellarSdk.xdr.Int128Parts({
            lo: StellarSdk.xdr.Uint64.fromString(stroopAmount),
            hi: StellarSdk.xdr.Int64.fromString('0')
          }))
        )
      )
      .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
      .setTimeout(30)
      .build();

    try {
      tx = await rpcServer.prepareTransaction(tx);
    } catch (simError: any) {
      console.error('Simulation failed:', simError);
      throw new Error(`Simulation Failed. Ensure you have enough XLM to repay the principal + interest.`);
    }

    const signedTx = await signTransaction(tx.toXDR(), { networkPassphrase: StellarSdk.Networks.TESTNET });
    const xdrToSubmit = typeof signedTx === 'string' ? signedTx : signedTx.signedTxXdr;
    const result = await rpcServer.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(xdrToSubmit, StellarSdk.Networks.TESTNET));

    if (result.status !== 'ERROR') {
      return result.hash;
    }
    throw new Error(`Transaction rejected: ${result.status}`);
  } catch (e: any) {
    console.error('Repay error:', e);
    throw e;
  }
}

export async function fetchPaymentsCount(address: string) {
  try {
    const payments = await server.payments().forAccount(address).limit(100).call();
    return payments.records.length;
  } catch (e) {
    console.error('Error fetching payments count:', e);
    return 0;
  }
}

export async function get_balance(address: string): Promise<string> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const userAddress = StellarSdk.Address.fromString(address);
    
    // Create a dummy transaction to simulate the call
    const sourceAccount = new StellarSdk.Account(address, "0");
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100",
    })
      .addOperation(contract.call("get_balance", userAddress.toScVal()))
      .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
      .setTimeout(30)
      .build();

    const simulation = await rpcServer.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      if (result) {
        const parts = result.i128();
        const lo = parts.lo().toString();
        return fromStroops(lo);
      }
    }
    return "0";
  } catch (e) {
    console.error('Error in get_balance:', e);
    return "0";
  }
}

export async function get_borrowed(address: string): Promise<string> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const userAddress = StellarSdk.Address.fromString(address);
    
    const sourceAccount = new StellarSdk.Account(address, "0");
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100",
    })
      .addOperation(contract.call("get_borrowed", userAddress.toScVal()))
      .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
      .setTimeout(30)
      .build();

    const simulation = await rpcServer.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      if (result) {
        const parts = result.i128();
        return fromStroops(parts.lo().toString());
      }
    }
    return "0";
  } catch (e) {
    console.error('Error in get_borrowed:', e);
    return "0";
  }
}
