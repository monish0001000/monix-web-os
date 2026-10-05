import { Shield, Radio } from 'lucide-react';
import { motion } from 'motion/react';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-cyber-black/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-neon/10 rounded-lg border border-emerald-neon/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Shield className="w-5 h-5 text-emerald-neon" />
        </div>
        <h1 className="font-display text-xl font-bold tracking-tight text-white">
          AWARENESS<span className="text-emerald-neon">.SIM</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-neon/5 border border-emerald-neon/20 shadow-inner">
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-emerald-neon shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-neon">
            Awareness Status: Active
          </span>
        </div>
        
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Radio className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
