import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, ShieldCheck, TrendingUp, ArrowUpRight } from 'lucide-react';
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 md:py-5 border-b",
      scrolled ? "bg-[#a6d8f8] border-black border-b-4 brutal-shadow" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-nowrap md:flex-wrap gap-1 md:gap-4 w-full">
        <div className="flex items-center ml-0 md:ml-12 shrink-0">
          <img src="/logo2.png" alt="StellarYield Logo" className="h-8 w-8 md:h-16 md:w-16 rounded-full object-cover border-2 md:border-4 border-black brutal-shadow" />
        </div>

        <div className="hidden md:flex items-center gap-10 font-mono text-xs uppercase tracking-widest text-black font-bold">
          <button onClick={() => switchTab('supply')} className="hover:text-brutal-blue transition-colors flex items-center gap-2 group">
            <TrendingUp className="w-4 h-4 group-hover:text-brutal-pink transition-colors" />
            Supply
          </button>
          <button onClick={() => switchTab('borrow')} className="hover:text-brutal-blue transition-colors flex items-center gap-2 group">
            <ArrowUpRight className="w-4 h-4 group-hover:text-brutal-pink transition-colors" />
            Borrow
          </button>
          <button onClick={() => switchTab('repayment')} className="hover:text-brutal-blue transition-colors flex items-center gap-2 group">
            <ShieldCheck className="w-4 h-4 group-hover:text-brutal-pink transition-colors" />
            Repayment
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {wallet.connected ? (
            <div className="flex items-center gap-1.5 md:gap-4 pl-1.5 md:pl-4 border-l border-black">
              <div className="flex flex-col items-end pr-1.5 md:pr-4 border-r border-black/50">
                <span className="font-mono text-[6px] md:text-[8px] font-bold text-black uppercase tracking-widest mb-0.5">Wallet</span>
                <span className="text-[10px] md:text-sm font-black text-black tracking-tighter">
                  {wallet.balance ? Number(wallet.balance).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex flex-col items-end pr-1.5 md:pr-0">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-none border border-black bg-emerald-500" />
                  <span className="font-mono text-[5px] md:text-[9px] font-bold text-black uppercase tracking-widest hidden sm:inline-block">Live Status</span>
                </div>
                <span className="text-[7px] md:text-xs font-mono font-bold text-black mt-0.5 md:mt-1 uppercase tracking-tighter">
                   Verified
                </span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center rounded-none bg-white p-1 md:p-2 text-black font-bold hover:bg-brutal-pink transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-3">
              <button 
                onClick={enterDemoMode}
                className="bg-white text-black border-2 border-black px-2 py-1 md:px-4 md:py-2.5 text-[7px] md:text-xs font-bold uppercase tracking-widest font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-brutal-pink transition-all active:translate-y-1 active:translate-x-1 active:shadow-none whitespace-nowrap"
              >
                DEMO
              </button>
              <button 
                onClick={handleConnect}
                disabled={connecting}
                className={cn(
                  "group relative flex items-center gap-1 md:gap-2 bg-brutal-blue border-2 border-black px-2.5 md:px-6 py-1 md:py-2.5 rounded-none font-bold text-[7px] md:text-xs uppercase tracking-widest text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap",
                  connecting ? "opacity-50 cursor-not-allowed" : "hover:bg-white hover:text-black active:translate-y-1 active:translate-x-1 active:shadow-none"
                )}
              >
                <Wallet className={cn("w-3 h-3 md:w-4 md:h-4 transition-transform", connecting ? "animate-pulse" : "group-hover:-rotate-12")} />
                {connecting ? "Load..." : "Init Wallet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
