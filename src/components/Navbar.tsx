import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, ShieldCheck, Activity } from 'lucide-react';
import { connectWallet, WalletState } from '../lib/stellar';
import { cn } from '../lib/utils';

interface NavbarProps {
  wallet: WalletState;
  setWallet: (w: WalletState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ wallet, setWallet }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWallet({ address, connected: true });
    }
  };

  const handleDisconnect = () => {
    setWallet({ address: null, connected: false });
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 border-b",
      scrolled ? "bg-black/80 backdrop-blur-md border-white/10 shadow-lg" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black italic text-white">
            S
          </div>
          <div>
            <span className="text-xl font-bold tracking-tighter text-white block leading-tight">STELLARYIELD</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-white/60">
          <a href="#yield" className="hover:text-blue-400 transition-colors">Supply</a>
          <a href="#borrow" className="hover:text-blue-400 transition-colors">Borrow</a>
          <a href="#reputation" className="hover:text-blue-400 transition-colors">Reputation</a>
        </div>

        <div>
          {wallet.connected ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] text-green-500 font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
                <span className="text-xs font-mono font-medium text-white/80">
                  {wallet.address?.slice(0, 4)}...{wallet.address?.slice(-4)}
                </span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="p-2.5 rounded-full bg-white/5 text-white/50 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm shadow-xl hover:bg-blue-400 transition-all active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
