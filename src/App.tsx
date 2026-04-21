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
import { WalletState, fetchTransactions, server } from './lib/stellar';
import { ReputationScore, calculateReputation } from './lib/scoring';
import { cn, formatAmount } from './lib/utils';

// Mock data for yield history
const yieldData = [
  { name: 'Mon', yield: 4.2 },
  { name: 'Tue', yield: 4.5 },
  { name: 'Wed', yield: 4.3 },
  { name: 'Thu', yield: 4.8 },
  { name: 'Fri', yield: 5.2 },
  { name: 'Sat', yield: 5.5 },
  { name: 'Sun', yield: 5.4 },
];

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, connected: false });
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [poolTvl, setPoolTvl] = useState("12,450.00");
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      loadUserData(wallet.address);
    } else {
      setReputation(null);
    }
  }, [wallet.connected, wallet.address]);

  const loadUserData = async (address: string) => {
    setLoading(true);
    try {
      const txs = await fetchTransactions(address);
      if (txs) {
        const score = await calculateReputation(address, txs.records);
        setReputation(score);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 selection:text-white">
      <Navbar wallet={wallet} setWallet={setWallet} />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero / Stats Banner */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="mono mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Soroban Testnet v1.2 Enabled
              </div>
              <h1 className="hero-text">
                Decentralize<br/>
                <span className="text-blue-500">Every</span> Yield
              </h1>
              <p className="text-zinc-400 max-w-lg text-xl mt-8 leading-relaxed font-light">
                Micro-lending on Stellar using on-chain transaction history 
                to bypass traditional KYC and collateral.
              </p>
              <div className="mt-12 flex flex-wrap gap-6">
                <button onClick={() => setActiveTab('supply')} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  Deposit XLM
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveTab('borrow')} className="border border-zinc-700 hover:border-zinc-500 text-white px-10 py-5 rounded-xl font-black text-lg transition-all">
                  Borrow USDC
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass p-8 rounded-[32px]">
                <div className="mono mb-3">Protocol TVL</div>
                <div className="text-5xl font-black tracking-tighter">${poolTvl}</div>
                <div className="mt-3 flex items-center gap-2 text-green-400 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +12.4% vs last week
                </div>
              </div>
              
              <div className="glass h-40 w-full rounded-[32px] overflow-hidden p-4 pt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldData}>
                    <Area type="monotone" dataKey="yield" stroke="#3b82f6" strokeWidth={4} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Navigation Tabs */}
        <div className="flex gap-10 mb-12 border-b border-zinc-900 pb-2">
          <button 
            onClick={() => setActiveTab('supply')}
            className={cn(
              "pb-4 font-black uppercase tracking-widest text-xs transition-all relative",
              activeTab === 'supply' ? "text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            Lending Pools
            {activeTab === 'supply' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('borrow')}
            className={cn(
              "pb-4 font-black uppercase tracking-widest text-xs transition-all relative",
              activeTab === 'borrow' ? "text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            Borrow Console
            {activeTab === 'borrow' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Work Area */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {activeTab === 'supply' ? (
                <motion.div 
                  key="supply"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="glass p-10 rounded-[40px] accent-glow">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <div className="mono mb-2">Primary Asset</div>
                        <h2 className="text-4xl font-black tracking-tighter">XLM Core Pool</h2>
                      </div>
                      <div className="text-right">
                        <div className="mono mb-2">Fixed APY</div>
                        <span className="text-4xl font-black text-blue-500 tracking-tighter">14.2%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="mono mb-4 text-zinc-500">Your Deposits</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black">0.00</span>
                          <span className="text-zinc-600 font-bold uppercase text-xs">XLM</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="mono mb-4 text-zinc-500">Accrued Yield</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-blue-400">0.00</span>
                          <span className="text-zinc-600 font-bold uppercase text-xs">XLM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-6 font-black text-2xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                        />
                        <div className="absolute right-6 top-7 mono text-blue-500 font-black cursor-pointer hover:text-blue-400">MAX</div>
                      </div>
                      <button className="w-full bg-white text-black py-6 rounded-2xl font-black text-lg hover:bg-blue-400 transition-all active:scale-[0.99] flex items-center justify-center gap-3">
                        Supply Assets
                        <ArrowUpRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="borrow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                   <div className="glass p-10 rounded-[40px] accent-glow border-blue-500/50">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <div className="mono mb-2">Micro-Loan Program</div>
                        <h2 className="text-4xl font-black tracking-tighter">Fast Credit</h2>
                      </div>
                      <div className="text-right">
                        <div className="mono mb-2">Total Capacity</div>
                        <span className="text-4xl font-black text-blue-500 tracking-tighter">
                          {reputation ? `${(reputation.score * 2.5).toFixed(0)} XLM` : "0 XLM"}
                        </span>
                      </div>
                    </div>

                    {!wallet.connected ? (
                      <div className="p-16 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Wallet className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-2 uppercase">Connect for Credit</h3>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest leading-loose">Freighter required for identity verification</p>
                      </div>
                    ) : loading ? (
                       <div className="p-16 text-center">
                        <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
                        <div className="mono animate-pulse">Syncing Horizon Nodes...</div>
                       </div>
                    ) : (
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-8 bg-blue-600/10 rounded-3xl border border-blue-500/20">
                            <div className="mono mb-4 text-blue-400">Current APR</div>
                            <span className="text-5xl font-black">
                              {reputation ? (15 - (reputation.score / 100)).toFixed(1) : "15.0"}%
                            </span>
                          </div>
                          <div className="p-8 bg-green-500/10 rounded-3xl border border-green-500/20">
                            <div className="mono mb-4 text-green-400">Reputation Tier</div>
                            <span className="text-5xl font-black uppercase">
                              {reputation?.tier || "LOW"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="Loan amount..." 
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-6 font-black text-2xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                            />
                          </div>
                          <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all active:scale-[0.99] flex items-center justify-center gap-3">
                            Confirm Borrow
                            <ShieldCheck className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Protocol Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass p-8 rounded-3xl col-span-2">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-blue-500/20 rounded-2xl">
                     <Activity className="w-6 h-6 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-black tracking-tighter uppercase">Protocol Solvency</h3>
                 </div>
                 <div className="flex items-end justify-between mb-4">
                   <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Security Index</span>
                   <span className="text-4xl font-black">98.2%</span>
                 </div>
                 <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full w-[98.2%]" />
                 </div>
                 <p className="mt-8 text-xs font-mono tracking-wide text-zinc-500 leading-relaxed uppercase">
                   Verified by Soroban smart contract invariants. Liquidity buffers are maintained at 2.5x standard withdrawal request capacity.
                 </p>
               </div>

               <div className="glass p-8 rounded-3xl border-white/5 flex flex-col justify-between">
                 <div>
                   <div className="mono mb-4 text-zinc-500">Network</div>
                   <div className="font-black text-xl mb-1 uppercase">Stellar v21</div>
                   <div className="font-mono text-[10px] text-green-500">UPTIME 99.99%</div>
                 </div>
                 <div className="pt-8 border-t border-white/5">
                    <div className="mono mb-2 text-zinc-500">Latency</div>
                    <div className="font-black text-xl uppercase">240ms</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar / Reputation */}
          <div className="lg:col-span-4 space-y-8">
            <div className={cn(
              "glass rounded-[40px] p-10 transition-all duration-700",
              reputation ? "border-blue-500/30 accent-glow" : "opacity-40 grayscale"
            )}>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black tracking-tighter uppercase">On-Chain Score</h3>
                <ShieldCheck className={cn("w-8 h-8", reputation ? "text-blue-500" : "text-zinc-700")} />
              </div>

              {reputation ? (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-8xl font-black tracking-tighter tabular-nums leading-none mb-4">
                        {reputation.score}
                      </div>
                      <div className="mono text-blue-400 font-black tracking-[0.2em]">{reputation.tier} TIER USER</div>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(reputation.score / 1000) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-blue-500 h-full" 
                    />
                  </div>

                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex justify-between items-center group cursor-default">
                      <span className="mono text-zinc-500 group-hover:text-zinc-300 transition-colors">Account Age</span>
                      <span className="font-black text-lg">{formatAmount(reputation.factors.accountAge / 10)}D</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-default">
                      <span className="mono text-zinc-500 group-hover:text-zinc-300 transition-colors">Activity Rate</span>
                      <span className="font-black text-lg">{reputation.factors.transactionCount}/50</span>
                    </div>
                  </div>

                  <p className="font-mono text-[10px] uppercase text-zinc-500 leading-relaxed tracking-widest text-center italic opacity-60">
                    *Score generated via public horizon explorer data
                  </p>
                </div>
              ) : (
                <div className="py-20 text-center space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/20">
                    <Lock className="w-8 h-8 text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <div className="mono text-zinc-600">Verification Pending</div>
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-700">Waiting for Freighter sync</p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass p-10 rounded-[40px] bg-blue-600/5 border-blue-500/20">
              <div className="mono mb-6 text-blue-500 font-black tracking-widest">Protocol Bounty</div>
              <div className="text-xl font-black mb-4 uppercase leading-tight">Complete MVP Feedback To Earn $100 Rewards</div>
              <p className="mono font-normal text-zinc-500 mb-8 lowercase opacity-80">
                we are looking for 5+ testnet users to validate our micro-lending curves.
              </p>
              <button 
                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all transition-colors"
              >
                Open Form
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-16">
          <div className="flex flex-col gap-8">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black italic text-black text-xl">
                 S
               </div>
               <span className="text-4xl font-black tracking-tighter uppercase">StellarYield</span>
             </div>
             <div className="flex gap-16">
               <div className="flex flex-col">
                 <span className="mono mb-2">Contract Status</span>
                 <span className="font-black text-sm uppercase">Soroban v1.2</span>
               </div>
               <div className="flex flex-col">
                 <span className="mono mb-2">Network Feed</span>
                 <span className="font-black text-sm uppercase tracking-tighter">Horizon v2.10</span>
               </div>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-8 text-right">
            <div className="flex gap-12 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              <a href="#" className="hover:text-white transition-colors">Explorer</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="mono opacity-40 lowercase"> 
              &copy; 2026 stellaryield. on-chain intelligence protocol.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
