import { motion } from 'motion/react';
import { 
  X, 
  ExternalLink, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Fingerprint, 
  Keyboard,
  ShieldAlert,
  Info
} from 'lucide-react';

interface PhishingModuleProps {
  onClose: () => void;
}

export const PhishingModule = ({ onClose }: PhishingModuleProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-cyber-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div 
        layoutId="card-phishing"
        className="relative w-full max-w-5xl h-full max-h-[90vh] overflow-hidden bg-cyber-slate rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-crimson-neon/10 rounded-lg border border-crimson-neon/20">
              <ShieldAlert className="w-6 h-6 text-crimson-neon" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white uppercase tracking-tight">
                Case Study: The Government Laptop Scheme Trap
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-crimson-neon shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span className="text-[10px] font-bold text-crimson-neon uppercase tracking-widest">High Probability Threat</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 custom-scrollbar">
          
          {/* Introduction Section */}
          <section className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-neon uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-4 h-4" /> The Vulnerability
              </h3>
              <p className="text-slate-400 leading-relaxed text-lg italic">
                "The user is tricked into opening a fake government portal and submitting their details under the guise of receiving a free educational laptop."
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400">
                  Target Demographics: Students, low-income families, and government employees.
                </p>
              </div>
            </div>
            <div className="aspect-video rounded-2xl bg-cyber-black border border-white/5 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 cyber-grid opacity-20" />
               <div className="relative z-10 text-center animate-pulse-soft">
                  <AlertTriangle className="w-12 h-12 text-crimson-neon mx-auto mb-4" />
                  <span className="text-xl font-display font-medium text-white">SIMULATION READY</span>
               </div>
            </div>
          </section>

          {/* Attack Breakdown Module */}
          <section className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-white mb-2 underline decoration-crimson-neon decoration-4 underline-offset-8">
                ANATOMY OF THE INTRUSION
              </h3>
              <p className="text-slate-500 max-w-2xl mx-auto mt-4 text-sm font-mono">
                [SYSTEM LOG: ANALYZING MALICIOUS PAYLOAD BEHAVIOR...]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Camera, label: "Live Visual Feed", desc: "Silently captures camera snapshots without browser prompt." },
                { icon: MapPin, label: "Precise Geolocation", desc: "Uses WiFi/IP tri-angulation for sub-10m tracking." },
                { icon: Fingerprint, label: "Device Identity", desc: "Collects hardware IDs to bypass 2FA multi-factor checks." },
                { icon: Keyboard, label: "Keystroke Logger", desc: "Intercepts every password and private communication." }
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:border-crimson-neon/30 transition-all group">
                  <item.icon className="w-8 h-8 text-crimson-neon mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white mb-2">{item.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-3xl border border-crimson-neon/20 bg-crimson-neon/[0.03] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <AlertTriangle className="w-32 h-32 text-crimson-neon/5 -mr-8 -mt-8 rotate-12" />
               </div>
               <div className="flex gap-4 items-start relative z-10">
                 <div className="p-3 rounded-full bg-crimson-neon/20 border border-crimson-neon/40 shrink-0">
                    <ShieldAlert className="w-6 h-6 text-crimson-neon" />
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-lg font-bold text-white">Advanced Persistent Threat Logic</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     Behind the scenes, the attacker is <span className="text-crimson-neon font-bold uppercase underline">NOT</span> just stealing form data. 
                     The malicious script executes immediate background extraction of the user's environment. This data is transmitted back to a C2 server 
                     while the user is distracted by a "Processing Application" loading spinner.
                   </p>
                 </div>
               </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-10 text-center space-y-8 border-t border-white/5">
             <div className="space-y-4">
                <h4 className="text-xl font-display font-medium text-white">Experience the breach in a safe environment.</h4>
                <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">Warning: Strictly for educational purposes.</p>
             </div>
             
             <motion.a
                href="https://tn-laptop-gov.netlify.app/"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-emerald-neon text-cyber-black font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all"
             >
                See Attack in Action
                <ExternalLink className="w-5 h-5" />
             </motion.a>
          </section>

        </div>
      </motion.div>
    </motion.div>
  );
};
