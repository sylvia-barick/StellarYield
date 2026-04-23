import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  ChevronRight,
  Info,
  History,
  AlertCircle,
  Activity,
  Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from './components/Navbar';
import { WalletState, fetchTransactions, fetchAccountAge, fetchTransactionsCount, fetchPaymentsCount, server, checkConnection, supplyFunds, borrowFunds, repayFunds, get_balance, get_borrowed, getWalletBalance } from './lib/stellar';
import { ReputationScore, calculateReputation, getMaxBorrowAmount, calculateInterestRate } from './lib/scoring';
import { cn, formatAmount } from './lib/utils';

// Mock data for yield history (internal values, axis will be hidden)
const yieldData = [
  { name: 'Monday', yield: 4.2 },
  { name: 'Tuesday', yield: 4.5 },
  { name: 'Wednesday', yield: 4.3 },
  { name: 'Thursday', yield: 4.8 },
  { name: 'Friday', yield: 5.2 },
  { name: 'Saturday', yield: 5.5 },
  { name: 'Sunday', yield: 5.4 },
];

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, connected: false });
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow' | 'repayment'>('supply');
  const [processing, setProcessing] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Protocol State
  const [userBalance, setUserBalance] = useState(0);
  const [borrowedAmount, setBorrowedAmount] = useState(0);
  const [events, setEvents] = useState<{id: string, type: string, status: string, time: string, details?: string}[]>(() => {
    const saved = localStorage.getItem('stellar_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stellar_events', JSON.stringify(events));
  }, [events]);


  useEffect(() => {
    const init = async () => {
      const address = await checkConnection();
      if (address) {
        const balance = await getWalletBalance(address);
        setWallet({ address, connected: true, balance });
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      loadUserData(wallet.address);
    } else {
      setReputation(null);
    }
  }, [wallet.connected, wallet.address]);

  const loadUserData = async (address: string) => {
    if (address === 'DEMO_ACCOUNT') {
      setReputation({
        score: 85,
        tier: 'Elite',
        factors: {
          accountAge: 45,
          transactionCount: 40,
          daysOld: 120,
          totalTxs: 88
        }
      });
      setUserBalance(1250.50);
      setBorrowedAmount(150.00);
      return;
    }
    setLoading(true);
    try {
      const createdAt = await fetchAccountAge(address);
      const txCount = await fetchTransactionsCount(address);
      const paymentCount = await fetchPaymentsCount(address);
      const score = await calculateReputation(createdAt, txCount, paymentCount);
      setReputation(score);

      // Refresh wallet balance
      const walletBalance = await getWalletBalance(address);
      setWallet(prev => ({ ...prev, balance: walletBalance }));

      // Fetch on-chain vault state
      const balance = await get_balance(address);
      const borrowed = await get_borrowed(address);
      setUserBalance(Number(balance));
      setBorrowedAmount(Number(borrowed));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = (type: string, status: string = 'SUCCESS', details?: string) => {
    const newEvent = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      type,
      status,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  const enterDemoMode = () => {
    setIsDemo(true);
    setWallet({ address: 'DEMO_ACCOUNT', connected: true });
    loadUserData('DEMO_ACCOUNT');
  };

  const handleSupply = async (overrideAmount?: string) => {
    if (!wallet.connected || !wallet.address) return;
    const finalAmount = overrideAmount || amount;
    if (!finalAmount || isNaN(Number(finalAmount))) {
      setError("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      if (wallet.address === 'DEMO_ACCOUNT') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const txHash = Math.random().toString(36).substring(7).toUpperCase();
        setLastTxId(txHash);
        addEvent('DEPOSIT_INIT', 'SUCCESS', `${finalAmount} XLM`);
      } else {
        const txHash = await supplyFunds(wallet.address, finalAmount);
        setLastTxId(txHash);
        addEvent('CONTRACT_CALL', 'SUCCESS', `+${finalAmount} XLM`);
        
        // Refresh balance from contract
        const balance = await get_balance(wallet.address);
        setUserBalance(Number(balance));
      }
      setAmount('');
    } catch (e: any) {
      if (e.message?.includes('CONTRACT_ID') || e.message?.includes('Contract')) {
        setError("Deployment required. Using a placeholder ID. Try 'Demo Mode' in the navbar to test UI flow.");
      } else {
        setError(e.message || "Supply failed");
      }
      addEvent('TRX_FAILED', 'ERROR');
    } finally {
      setProcessing(false);
      setTimeout(() => setLastTxId(null), 10000);
    }
  };

  const handleBorrow = async () => {
    if (!wallet.connected || !wallet.address || !reputation) return;
    
    const limit = getMaxBorrowAmount(reputation.score);
    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (Number(amount) > limit) {
      setError(`Amount exceeds your reputation-based limit of ${limit} XLM`);
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      if (wallet.address === 'DEMO_ACCOUNT') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const txHash = Math.random().toString(36).substring(7).toUpperCase();
        setLastTxId(txHash);
        addEvent('LOAN_ISSUED', 'SUCCESS', `${amount} XLM`);
      } else {
        const txHash = await borrowFunds(wallet.address, amount);
        setLastTxId(txHash);
        addEvent('BORROW_CALL', 'SUCCESS', `${amount} XLM`);

        // Refresh balance and borrowed from contract
        const balance = await get_balance(wallet.address);
        const borrowed = await get_borrowed(wallet.address);
        setUserBalance(Number(balance));
        setBorrowedAmount(Number(borrowed));
      }
      setAmount('');
    } catch (e: any) {
      if (e.message?.includes('CONTRACT_ID') || e.message?.includes('Contract')) {
        setError("Deployment required. Try 'Demo Mode' to see the full borrowing flow.");
      } else {
        setError(e.message || "Borrow failed");
      }
      addEvent('TRX_FAILED', 'ERROR');
    } finally {
      setProcessing(false);
      setTimeout(() => setLastTxId(null), 10000);
    }
  };

  const handleRepay = async (overrideAmount?: string) => {
    if (!wallet.connected || !wallet.address) return;
    const finalAmount = overrideAmount || amount;
    if (!finalAmount || isNaN(Number(finalAmount))) {
      setError("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      if (wallet.address === 'DEMO_ACCOUNT') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const txHash = Math.random().toString(36).substring(7).toUpperCase();
        setLastTxId(txHash);
        addEvent('REPAY_COMPLETE', 'SUCCESS', `${finalAmount} XLM`);
      } else {
        const txHash = await repayFunds(wallet.address, finalAmount);
        setLastTxId(txHash);
        addEvent('CONTRACT_REPAY', 'SUCCESS', `-${finalAmount} XLM`);

        // Refresh state
        const balance = await get_balance(wallet.address);
        const borrowed = await get_borrowed(wallet.address);
        setUserBalance(Number(balance));
        setBorrowedAmount(Number(borrowed));
      }
      setAmount('');
    } catch (e: any) {
      if (e.message?.includes('CONTRACT_ID') || e.message?.includes('Contract')) {
        setError("Deployment required. Try 'Demo Mode' to see the full repayment flow.");
      } else {
        setError(e.message || "Repay failed");
      }
      addEvent('TRX_FAILED', 'ERROR');
    } finally {
      setProcessing(false);
      setTimeout(() => setLastTxId(null), 10000);
    }
  };

  const switchTab = (tab: 'supply' | 'borrow' | 'repayment') => {
    setActiveTab(tab);
    setAmount('');
    setError(null);
  };

  const handleSimulatedTx = async (type: string) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessing(false);
    alert(`${type.toUpperCase()} process simulated.`);
  };


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E4E3E0] font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">
      <div className="fixed inset-0 grid-overlay -z-10 opacity-50" />
      <Navbar wallet={wallet} setWallet={setWallet} switchTab={switchTab} enterDemoMode={enterDemoMode} />

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto relative z-10">
        {/* Header Stats Bento */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-16">
          <div className="lg:col-span-2 technical-card p-10 flex flex-col justify-center relative group min-h-[320px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-48 h-48 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="mono-label mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Network: Horizon Mainline
                </div>
                {isDemo && (
                  <div className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 text-[8px] font-bold tracking-widest">
                    SIMULATION ACTIVE
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 text-[8px] font-bold tracking-widest">
                    NO_KYC
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded border border-indigo-500/20 text-[8px] font-bold tracking-widest">
                    PURE_DEFI
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-[0.95] mb-6">
                LIQUIDITY <br />
                <span className="text-white/40">MEETS</span> REPUTATION
              </h1>
              <p className="text-[#8E9299] max-w-sm text-sm leading-relaxed mb-8 font-medium">
                The first decentralized micro-lending engine on Stellar. 
                Using on-chain history to enable collateral-efficient financing.
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => switchTab('supply')}
                  className="bg-white text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Explore Pool
                </button>
                <button 
                  onClick={() => switchTab('repayment')}
                  className="border border-[#2A2B2E] text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Manage Debt
                </button>
              </div>
            </div>
          </div>

          <div className="technical-card p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="mono-label">Protocol Liquidity</span>
                <div className="p-1.5 bg-indigo-500/10 rounded-md">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter uppercase">
                Maximum
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] tracking-wider uppercase">
                <TrendingUp className="w-3 h-3" />
                Growth Positive
              </div>
            </div>
            
            <div className="h-24 w-full mt-6 -mx-2 opacity-50 grayscale hover:grayscale-0 transition-all">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData}>
                  <Area type="monotone" dataKey="yield" stroke="#6366f1" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="technical-card p-8 flex flex-col justify-between accent-border">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="mono-label text-indigo-400">Baseline Yield</span>
                <Clock className="w-4 h-4 text-[#8E9299]" />
              </div>
              <div className="text-4xl font-black text-white tracking-tighter uppercase">
                Robust
              </div>
              <p className="text-[#8E9299] text-[10px] uppercase font-bold mt-4 tracking-widest">Optimized APY Curve</p>
            </div>
            <div className="pt-6 border-t border-[#2A2B2E]">
              <div className="flex justify-between text-[10px] font-mono mb-2">
                <span className="text-indigo-400 opacity-60">REWARD STATUS</span>
                <span className="text-white uppercase tracking-tighter">Distributed</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[65%]" />
              </div>
            </div>
          </div>
        </section>

        {/* Tab Interface */}
        <div className="flex items-center gap-10 mb-10 border-b border-[#2A2B2E]">
          <button 
            onClick={() => switchTab('supply')}
            className={cn(
              "pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative",
              activeTab === 'supply' ? "text-white" : "text-[#8E9299] hover:text-white"
            )}
          >
            LENDING_VAULTS
            {activeTab === 'supply' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
          </button>
          <button 
            onClick={() => switchTab('borrow')}
            className={cn(
              "pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative",
              activeTab === 'borrow' ? "text-white" : "text-[#8E9299] hover:text-white"
            )}
          >
            BORROW_CONSOLE
            {activeTab === 'borrow' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
          </button>
          <button 
            onClick={() => switchTab('repayment')}
            className={cn(
              "pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative",
              activeTab === 'repayment' ? "text-white" : "text-[#8E9299] hover:text-white"
            )}
          >
            REPAYMENT_CENTER
            {activeTab === 'repayment' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'supply' ? (
                <motion.div 
                  key="supply"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="technical-card p-10">
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <span className="mono-label mb-2 block">Protocol Asset</span>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Native Core Vault</h2>
                      </div>
                      <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                        <span className="mono-label !text-emerald-400 mb-1 block">Yield Profile</span>
                        <span className="text-3xl font-black text-emerald-400 tracking-tighter">MAXIMUM</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                      <div className="bg-[#1E1F23]/50 rounded-xl p-6 border border-[#2A2B2E]">
                        <span className="mono-label mb-4 block">Personal Stake</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{userBalance > 0 ? userBalance.toFixed(2) : 'MINIMAL'}</span>
                          <span className="text-[#8E9299] font-bold text-[10px] uppercase tracking-widest">XLM Asset</span>
                        </div>
                      </div>
                      <div className="bg-[#1E1F23]/50 rounded-xl p-6 border border-[#2A2B2E]">
                        <span className="mono-label mb-4 block">Yield Accrued</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-emerald-400">{(userBalance * 0.05).toFixed(4)}</span>
                          <span className="text-[#8E9299] font-bold text-[10px] uppercase tracking-widest">Growth Factor</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 mono-label !text-[#8E9299]">AMOUNT</div>
                        <input 
                          type="text" 
                          placeholder="INPUT VALUE" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-xl px-24 py-6 font-black text-xl focus:border-indigo-500 outline-none transition-all placeholder:text-[#2A2B2E]"
                        />
                        <button 
                          onClick={() => setAmount('100')} // Example default
                          className="absolute right-6 top-1/2 -translate-y-1/2 mono-label text-indigo-400 font-black cursor-pointer hover:text-indigo-300 transition-colors bg-indigo-500/10 px-2 py-1 rounded"
                        >
                          ALL
                        </button>
                      </div>
                      {error && activeTab === 'supply' && (
                        <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest">{error}</p>
                      )}
                      <button 
                        onClick={() => wallet.address && handleSupply(amount || "10000000")}
                        disabled={processing}
                        className={cn(
                          "w-full bg-white text-black py-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3",
                          processing ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500 hover:text-white active:scale-95"
                        )}
                      >
                        {processing ? "BROADCASTING..." : lastTxId ? "SUCCESSFUL_DEPOSIT" : "INITIALIZE SUPPLY"}
                         {processing ? <Activity className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                      </button>
                      {lastTxId && (
                        <p className="text-center font-mono text-[9px] text-indigo-400 animate-pulse tracking-widest uppercase">
                          Sig Accepted: Hash_{lastTxId}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'borrow' ? (
                <motion.div 
                  key="borrow"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                   <div className="technical-card p-10 border-indigo-500/30">
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <span className="mono-label mb-2 block">Micro-Financing</span>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Algorithm Credit</h2>
                      </div>
                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                        <span className="mono-label mb-1 block">Credit Status</span>
                        <span className="text-3xl font-black text-indigo-400 tracking-tighter uppercase">
                          {reputation ? reputation.tier : "Locked"}
                        </span>
                      </div>
                    </div>

                    {!wallet.connected ? (
                      <div className="p-20 text-center bg-[#1E1F23]/50 rounded-xl border-2 border-dashed border-[#2A2B2E]">
                        <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2A2B2E] shadow-2xl">
                          <Wallet className="w-7 h-7 text-[#8E9299]" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Identity Required</h3>
                        <p className="text-[#8E9299] font-mono text-[10px] uppercase tracking-widest">Connect Freighter to compute reputation score</p>
                      </div>
                    ) : loading ? (
                       <div className="p-20 text-center">
                        <Activity className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                        <div className="mono-label animate-pulse">Syncing Blockchain Data...</div>
                       </div>
                    ) : (
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-8 bg-[#1E1F23]/50 rounded-xl border border-[#2A2B2E]">
                            <span className="mono-label mb-4 block">Risk Adjusted Rate</span>
                            <span className="text-5xl font-black text-white uppercase tracking-tighter">
                              {reputation ? calculateInterestRate(reputation.score).toFixed(2) : '---'}%
                            </span>
                             <div className="mt-2 flex flex-col gap-1">
                               <div className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest">
                                 Your Reputation-Based APR
                               </div>
                               <div className="text-[7px] font-mono text-[#8E9299] uppercase tracking-[0.05em] opacity-80 leading-relaxed">
                                 Formula: Base Rate (15%) - (Score/100 × Max Reputation Discount (10%))
                               </div>
                             </div>
                          </div>
                          <div className="p-8 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex flex-col justify-center">
                            <span className="mono-label mb-4 block text-indigo-400">Current Debt</span>
                            <span className="text-4xl font-black text-white uppercase tracking-tighter">
                              {borrowedAmount.toFixed(2)} XLM
                            </span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="relative">
                             <div className="absolute left-6 top-1/2 -translate-y-1/2 mono-label !text-[#8E9299]">AMOUNT</div>
                            <input 
                              type="text" 
                              placeholder="INPUT VALUE" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-xl px-24 py-6 font-black text-xl focus:border-indigo-500 outline-none transition-all placeholder:text-[#2A2B2E]"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-mono text-indigo-400">
                              MAX: {reputation ? getMaxBorrowAmount(reputation.score) : 0} XLM
                            </div>
                          </div>
                          {error && activeTab === 'borrow' && (
                            <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest">{error}</p>
                          )}
                          <div className="flex flex-col gap-4">
                            <button 
                              onClick={handleBorrow}
                              disabled={processing}
                              className={cn(
                                "w-full bg-indigo-600 text-white py-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl",
                                processing ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500 active:scale-95 shadow-indigo-600/20"
                              )}
                            >
                              {processing ? "PROC..." : lastTxId ? "LOAN_OK" : "Borrow"}
                              <ArrowUpRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="repayment"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="technical-card p-10 border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                     <div className="flex items-center justify-between mb-12">
                      <div>
                        <span className="mono-label mb-2 block">Active Loans</span>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Repayment Center</h2>
                      </div>
                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                        <span className="mono-label mb-1 block">Credit Usage</span>
                        <span className="text-3xl font-black text-indigo-400 tracking-tighter uppercase">
                          {reputation && borrowedAmount > 0 ? ((borrowedAmount / getMaxBorrowAmount(reputation.score)) * 100).toFixed(1) : "0.0"}%
                        </span>
                      </div>
                    </div>

                    {!wallet.connected || borrowedAmount === 0 ? (
                      <div className="p-20 text-center bg-[#1E1F23]/50 rounded-xl border-2 border-dashed border-[#2A2B2E]">
                        <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2A2B2E]">
                          <ShieldCheck className="w-7 h-7 text-emerald-500/50" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No Active Debt</h3>
                        <p className="text-[#8E9299] font-mono text-[10px] uppercase tracking-widest">Your account is in good standing with the protocol.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#2A2B2E]">
                            <span className="mono-label !text-[#8E9299] mb-4 block">Borrowed Principal</span>
                            <span className="text-3xl font-black text-white">{borrowedAmount.toFixed(2)} XLM</span>
                          </div>
                           <div className="bg-[#0A0A0A] p-6 rounded-xl border border-indigo-500/20">
                             <div className="flex items-center justify-between mb-4">
                               <span className="mono-label !text-indigo-400">Accrued Interest</span>
                               <span className="text-[6px] font-mono text-[#8E9299] uppercase tracking-tighter opacity-60 text-right max-w-[150px]">Base Rate (15%) - (S/100 × Max Discount (10%))</span>
                             </div>
                             <span className="text-3xl font-black text-indigo-400">
                               {reputation ? (borrowedAmount * (calculateInterestRate(reputation.score) / 100)).toFixed(4) : '0.00'} XLM
                             </span>
                           </div>
                        </div>

                        <div className="p-10 bg-indigo-600/10 rounded-2xl border border-indigo-500/30 text-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <History className="w-32 h-32" />
                           </div>
                           <span className="mono-label !text-indigo-400 mb-4 block">Total Return Amount</span>
                           <div className="text-6xl font-black text-white tracking-tighter mb-8">
                             {reputation ? (borrowedAmount * (1 + calculateInterestRate(reputation.score) / 100)).toFixed(2) : borrowedAmount} <span className="text-2xl text-white/50">XLM</span>
                           </div>
                           
                           <button 
                             onClick={() => {
                               const total = (borrowedAmount * (1 + calculateInterestRate(reputation.score) / 100)).toString();
                               handleRepay(total);
                             }}
                             disabled={processing}
                             className="w-full bg-white text-black py-6 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                           >
                             {processing ? "SETTLING..." : "CLEAR DEBT"}
                             <ArrowUpRight className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] font-mono text-amber-200/60 uppercase leading-relaxed tracking-widest">
                            Repaying your debt increases your future credit limit. The interest paid is distributed back to liquidity providers in the Core Vault.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Protocol Insights Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="technical-card p-8">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                     <Activity className="w-5 h-5 text-indigo-500" />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-white">Safety Metrics</h3>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-3">
                        <span className="text-[#8E9299]">SOLVENCY RATIO</span>
                        <span className="text-white font-bold uppercase tracking-tighter">High</span>
                      </div>
                      <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden border border-[#2A2B2E]">
                        <div className="bg-indigo-500 h-full w-[95%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-3">
                        <span className="text-[#8E9299]">RESERVE RATIO</span>
                        <span className="text-indigo-400 font-bold uppercase tracking-tighter">Robust</span>
                      </div>
                      <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden border border-[#2A2B2E]">
                        <div className="bg-indigo-500 h-full w-[70%]" />
                      </div>
                    </div>
                 </div>
                 <p className="mt-8 text-[9px] font-mono tracking-widest text-[#8E9299] leading-relaxed uppercase">
                   Verified by Soroban smart contract invariants. Protocols state is decentralized and redundant.
                 </p>
               </div>

               <div className="technical-card p-8 flex flex-col justify-between h-full">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                     <History className="w-5 h-5 text-indigo-500" />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-white">Event Log</h3>
                 </div>
                 <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {events.length > 0 ? events.map(ev => (
                       <div key={ev.id} className="flex flex-col gap-1 p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2B2E] mb-3">
                         <div className="flex items-center justify-between">
                           <span className="font-mono text-[9px] text-[#8E9299]">{ev.type}</span>
                           <span className={cn(
                             "font-mono text-[9px] font-bold tracking-tighter",
                             ev.status === 'ERROR' ? "text-red-500" : "text-emerald-500"
                           )}>{ev.status}</span>
                         </div>
                         {ev.details && (
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-white">{ev.details}</span>
                             <span className="text-[7px] font-mono text-[#8E9299]">{ev.time}</span>
                           </div>
                         )}
                       </div>
                    )) : (
                      <div className="p-8 text-center border-2 border-dashed border-[#2A2B2E] rounded-xl opacity-20">
                        <span className="mono-label !text-[8px]">Awaiting Events</span>
                      </div>
                    )}
                 </div>
                 <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#2A2B2E]">
                    <span className="mono-label !text-[9px]">System Latency</span>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-widest underline underline-offset-4 decoration-emerald-500">Nominal</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <div className={cn(
              "technical-card p-10 transition-all duration-700 relative group overflow-hidden",
              reputation ? "border-indigo-500/40" : "opacity-40 grayscale"
            )}>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 border-indigo-500 pl-3">Reputation Engine</h3>
                <div className="flex flex-col items-end">
                  <ShieldCheck className={cn("w-6 h-6 mb-1", reputation ? "text-indigo-500" : "text-[#2A2B2E]")} />
                  <span className="text-[7px] font-mono text-[#8E9299] uppercase tracking-widest">Privacy_Preserved</span>
                </div>
              </div>

              {reputation ? (
                <div className="space-y-12">
                  <div className="relative text-center py-4">
                    <div className="text-[100px] font-black tracking-tighter text-white/5 absolute inset-0 flex items-center justify-center leading-none select-none uppercase">
                      {reputation.score}
                    </div>
                    <div className="relative z-10">
                      <div className="text-6xl font-black text-white tracking-tighter mb-4">
                        {reputation.score}<span className="text-2xl text-indigo-500">/100</span>
                      </div>
                      <div className="mono-label text-indigo-400 font-bold tracking-[0.25em]">STELLAR TRUST SCORE</div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-[#2A2B2E]">
                    <div className="flex justify-between items-center mb-1 bg-[#1E1F23]/30 p-3 rounded-lg border border-[#2A2B2E]/50">
                      <div className="flex flex-col">
                        <span className="mono-label !text-[#8E9299]">Account Age</span>
                        <span className="text-white font-bold text-xs uppercase tracking-tight">{reputation.factors.daysOld} Days</span>
                      </div>
                      <div className="text-right">
                        <span className="text-indigo-400 font-bold text-lg font-mono">+{reputation.factors.accountAge}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1 bg-[#1E1F23]/30 p-3 rounded-lg border border-[#2A2B2E]/50">
                      <div className="flex flex-col">
                        <span className="mono-label !text-[#8E9299]">Network Activity</span>
                        <span className="text-white font-bold text-xs uppercase tracking-tight">{reputation.factors.totalTxs} Transactions</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-lg font-mono">+{reputation.factors.transactionCount}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="mono-label !text-[#8E9299]">Verification Tier</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{reputation.tier}</span>
                      </div>
                      <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#2A2B2E]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${reputation.score}%` }}
                          className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                        />
                      </div>
                    </div>
                  </div>

                  <p className="font-mono text-[9px] uppercase text-[#8E9299] leading-relaxed tracking-widest text-center opacity-60">
                    Sourced from open data relays.
                  </p>
                </div>
              ) : (
                <div className="py-24 text-center space-y-6">
                  <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto border border-[#2A2B2E]">
                    <Lock className="w-6 h-6 text-[#2A2B2E]" />
                  </div>
                  <div className="space-y-1">
                    <div className="mono-label">Protocol Locked</div>
                    <p className="text-[10px] font-mono text-[#2A2B2E] uppercase">Awaiting Signature</p>
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </main>

      <footer className="border-t border-[#2A2B2E] py-20 px-8 relative z-10 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-bold text-black text-lg uppercase">
                SY
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase">StellarYield</span>
            </div>
            <p className="text-[#8E9299] text-sm max-w-sm leading-relaxed font-medium">
              A high-frequency micro-lending protocol engineered for the Stellar blockchain. 
              Enabling institutional-grade credit scoring for individual participants.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="mono-label text-white uppercase">Resources</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-[#8E9299]">
              <li><a href="#" className="hover:text-white transition-colors">Lab Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Governance Token</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Audit Reports</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="mono-label text-white uppercase">Protocol Status</h4>
            <div className="space-y-4">
              <div className="p-4 bg-[#151619] border border-[#2A2B2E] rounded-lg">
                <div className="mono-label !text-[8px] mb-2 opacity-50 uppercase">Network Segment</div>
                <div className="font-mono text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Mainline</div>
              </div>
              <div className="mono-label !text-[8px] opacity-40 uppercase tracking-tighter"> 
                stellar labs protocol evolution lab.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
