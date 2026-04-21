import { Horizon } from 'stellar-sdk';

export interface ReputationScore {
  score: number; // 0 to 1000
  tier: 'Low' | 'Medium' | 'High' | 'Elite';
  factors: {
    accountAge: number;
    transactionCount: number;
    consistency: number;
    volume: number;
  };
}

export async function calculateReputation(
  address: string, 
  transactions: Horizon.ServerApi.TransactionRecord[]
): Promise<ReputationScore> {
  // Simple heuristic for demo
  const txCount = transactions.length;
  
  // Account age (if we had the account creation date)
  // For demo, we'll assume older based on index
  const ageFactor = Math.min(txCount * 10, 250);
  
  // Transaction frequency factor
  const frequencyFactor = Math.min(txCount * 5, 250);
  
  // Consistency (simulated)
  const consistencyFactor = 200; 
  
  // Volume (simulated)
  const volumeFactor = 200;

  const totalScore = ageFactor + frequencyFactor + consistencyFactor + volumeFactor;
  
  let tier: ReputationScore['tier'] = 'Low';
  if (totalScore > 800) tier = 'Elite';
  else if (totalScore > 600) tier = 'High';
  else if (totalScore > 400) tier = 'Medium';

  return {
    score: totalScore,
    tier,
    factors: {
      accountAge: ageFactor,
      transactionCount: txCount,
      consistency: consistencyFactor,
      volume: volumeFactor
    }
  };
}
