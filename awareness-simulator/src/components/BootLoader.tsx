import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

interface BootLoaderProps {
  onComplete: () => void;
}

export const BootLoader = ({ onComplete }: BootLoaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-cyber-black flex items-center justify-center p-6 overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full gap-8">
        {/* Glass Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full glass rounded-3xl p-10 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5"
        >
          {/* Icon */}
          <motion.div
            animate={{ 
              rotateY: [0, 180, 360],
              filter: ["drop-shadow(0 0 0px rgba(16,185,129,0))", "drop-shadow(0 0 10px rgba(16,185,129,0.5))", "drop-shadow(0 0 0px rgba(16,185,129,0))"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-4 bg-emerald-neon/10 rounded-2xl border border-emerald-neon/20"
          >
            <ShieldAlert className="w-10 h-10 text-emerald-neon" />
          </motion.div>

          {/* Text */}
          <div className="text-center space-y-2">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-lg font-medium text-white tracking-tight"
            >
              Initializing Real-Time Case Study
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]"
            >
              Securing Environment • Loading Assets
            </motion.p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              onAnimationComplete={onComplete}
              className="h-full bg-emerald-neon shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            />
          </div>
        </motion.div>

        {/* Footer info in loader */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest"
        >
          <span className="w-1 h-1 rounded-full bg-emerald-neon animate-pulse" />
          Neural Link Established
        </motion.div>
      </div>
    </motion.div>
  );
};
