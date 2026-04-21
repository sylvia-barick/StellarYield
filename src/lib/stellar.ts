import * as StellarSdk from 'stellar-sdk';
import { isConnected, getAddress, signTransaction } from '@stellar/freighter-api';

export const STELLAR_NETWORK = 'TESTNET';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export interface WalletState {
  address: string | null;
  connected: boolean;
}

export async function connectWallet(): Promise<string | null> {
  if (await isConnected()) {
    const result = await getAddress();
    if (result && 'address' in result) {
      return result.address;
    }
  }
  return null;
}

export async function fetchAccountInfo(address: string) {
  try {
    return await server.loadAccount(address);
  } catch (e) {
    console.error('Error loading account:', e);
    return null;
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

// Mock of Soroban contract interaction for the demo
// In a real app, this would use Contract.call()
export const CONTRACT_ID = 'CC...MOCK_ID'; 
