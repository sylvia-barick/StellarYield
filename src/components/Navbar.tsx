import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, ShieldCheck, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { connectWallet, WalletState } from '../lib/stellar';
import { cn } from '../lib/utils';

interface NavbarProps {
  wallet: WalletState;
  setWallet: (w: WalletState) => void;
  switchTab: (tab: 'supply' | 'borrow' | 'repayment') => void;
  enterDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ wallet, setWallet, switchTab, enterDemoMode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      if (address) {
        setWallet({ address, connected: true });
      }
    } catch (error: any) {
      alert(error.message || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWallet({ address: null, connected: false });
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-8 py-5 border-b",
      scrolled ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-[#2A2B2E] shadow-2xl" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">STELLARYIELD</span>
            <span className="mono-label !text-[8px] tracking-[0.2em]">Institutional Micro-Lending</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E9299]">
          <button onClick={() => switchTab('supply')} className="hover:text-white transition-colors flex items-center gap-1.5 group">
            <TrendingUp className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
            Supply
          </button>
          <button onClick={() => switchTab('borrow')} className="hover:text-white transition-colors flex items-center gap-1.5 group">
            <ArrowUpRight className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
            Borrow
          </button>
          <button onClick={() => switchTab('repayment')} className="hover:text-white transition-colors flex items-center gap-1.5 group">
            <ShieldCheck className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
            Repayment
          </button>
        </div>

        <div className="flex items-center gap-4">
          {wallet.connected ? (
            <div className="flex items-center gap-4 pl-4 border-l border-[#2A2B2E]">
              <div className="flex flex-col items-end pr-4 border-r border-[#2A2B2E]/50">
                <span className="mono-label !text-[8px] text-indigo-400 mb-1">Wallet XLM</span>
                <span className="text-sm font-black text-white tracking-tighter">
                  {wallet.balance ? Number(wallet.balance).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="mono-label !text-[9px]">Live Status</span>
                </div>
                <span className="text-xs font-mono font-bold text-white mt-1 uppercase tracking-tighter">
                   Identity_Verified
                </span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2A2B2E]/50 text-[#8E9299] hover:bg-red-500/10 hover:text-red-500 transition-all border border-[#2A2B2E]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={enterDemoMode}
                className="px-4 py-2.5 rounded-lg border border-amber-500/30 text-amber-500 text-[9px] font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-all font-mono"
              >
                DEMO_MODE
              </button>
              <button 
                onClick={handleConnect}
                disabled={connecting}
                className={cn(
                  "group relative flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-white transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)]",
                  connecting ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500 active:scale-95"
                )}
              >
                <Wallet className={cn("w-4 h-4 transition-transform", connecting ? "animate-pulse" : "group-hover:-rotate-12")} />
                {connecting ? "Initializing..." : "Initialize Wallet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
