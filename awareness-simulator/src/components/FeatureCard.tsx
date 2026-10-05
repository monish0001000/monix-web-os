import { motion } from 'motion/react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  accentColor: 'emerald' | 'cyan' | 'crimson' | 'slate';
  isPlaceholder?: boolean;
  onClick: () => void;
}

export const FeatureCard = ({ 
  id, 
  title, 
  description, 
  icon: Icon, 
  badge, 
  accentColor,
  isPlaceholder,
  onClick 
}: FeatureCardProps) => {
  const colorMap = {
    emerald: 'text-emerald-neon bg-emerald-neon/10 border-emerald-neon/20 shadow-emerald-neon/10',
    cyan: 'text-cyan-neon bg-cyan-neon/10 border-cyan-neon/20 shadow-cyan-neon/10',
    crimson: 'text-crimson-neon bg-crimson-neon/10 border-crimson-neon/20 shadow-crimson-neon/10',
    slate: 'text-slate-400 bg-slate-400/10 border-slate-400/20 shadow-slate-400/10'
  };

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={onClick}
      className={`group relative overflow-hidden p-6 rounded-2xl border border-white/5 bg-cyber-slate hover:border-white/20 transition-all duration-300 cursor-pointer shadow-2xl`}
      whileHover={{ y: -5 }}
    >
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full ${colorMap[accentColor].split(' ')[2]}`} />

      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-xl border ${colorMap[accentColor].split(' ').slice(1, 3).join(' ')}`}>
            <Icon className={`w-6 h-6 ${colorMap[accentColor].split(' ')[0]}`} />
          </div>
          {badge && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 rounded-md text-slate-400">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-white/90">
            {title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isPlaceholder ? 'text-slate-600' : colorMap[accentColor].split(' ')[0]}`}>
            {isPlaceholder ? 'Module Restricted' : 'Access Intelligence'}
          </span>
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
        </div>
      </div>
    </motion.div>
  );
};
