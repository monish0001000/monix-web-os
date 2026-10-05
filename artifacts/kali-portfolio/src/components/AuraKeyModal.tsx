import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, ShieldCheck, Zap, Brain, Globe, Eye, EyeOff, Check, AlertCircle, X, Loader2, Cpu
} from 'lucide-react';
import {
  getAuraConfig, saveAuraConfig, testGroqKey, AuraRoutingMode, AuraModelId
} from '../lib/AuraModelEngine';
import { cn } from '../lib/utils';

interface AuraKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export default function AuraKeyModal({ isOpen, onClose, onConfigUpdated }: AuraKeyModalProps) {
  const currentConfig = getAuraConfig();
  const [groqKey, setGroqKey] = useState(currentConfig.groqKey);
  const [geminiKey, setGeminiKey] = useState(currentConfig.geminiKey);
  const [mode, setMode] = useState<AuraRoutingMode>(currentConfig.mode);
  const [manualModel, setManualModel] = useState<AuraModelId>(currentConfig.manualModel);

  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [testState, setTestState] = useState<{ testing: boolean; result?: { valid: boolean; error?: string; latencyMs?: number } }>({ testing: false });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestGroq = async () => {
    setTestState({ testing: true });
    const res = await testGroqKey(groqKey, 'openai/gpt-oss-20b');
    setTestState({ testing: false, result: res });
  };

  const handleSave = () => {
    saveAuraConfig({
      groqKey: groqKey.trim(),
      geminiKey: geminiKey.trim(),
      mode,
      manualModel,
    });
    setSavedSuccess(true);
    onConfigUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.18)] z-10"
          >
            {/* Ambient cyberpunk glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="p-6 space-y-6 relative z-10 max-h-[85vh] overflow-y-auto scrollbar-hide">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      AURA Groq LPU Engine
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        Ultra-Fast
                      </span>
                    </h2>
                    <p className="text-zinc-400 text-xs">
                      Hardware-accelerated inference with GPT-OSS 120B & 20B models
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Brain className="w-3.5 h-3.5" />
                  Inference Routing Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('auto')}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden',
                      mode === 'auto'
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                        : 'bg-zinc-900/50 border-white/5 hover:border-white/15 text-zinc-400'
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      Auto (Wise Router)
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Deep queries, code & exploits → 120B model; quick commands → 20B instant.
                    </p>
                    {mode === 'auto' && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden',
                      mode === 'manual'
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'bg-zinc-900/50 border-white/5 hover:border-white/15 text-zinc-400'
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Manual Choice
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Explicitly lock which AI engine handles all queries.
                    </p>
                    {mode === 'manual' && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Manual Model Override Selector (Visible if mode === manual) */}
              {mode === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 p-3 bg-zinc-900/60 border border-white/10 rounded-2xl"
                >
                  <label className="text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono">
                    Select Engine:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'groq-fast', label: '20B Fast', icon: Zap, desc: 'Instant' },
                      { id: 'groq-deep', label: '120B Pro', icon: Brain, desc: 'Deep' },
                      { id: 'qwen-coder', label: 'Qwen 27B', icon: Cpu, desc: 'Code' },
                      { id: 'pollinations', label: 'Relay', icon: Globe, desc: 'Free' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setManualModel(item.id as AuraModelId)}
                        className={cn(
                          'p-2 rounded-xl border text-center transition-all',
                          manualModel === item.id
                            ? 'bg-purple-600/30 border-purple-400 text-white'
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 mx-auto mb-1 text-purple-300" />
                        <div className="text-[11px] font-bold">{item.label}</div>
                        <div className="text-[8px] text-zinc-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Main Groq API Key Input */}
              <div className="space-y-2 p-4 bg-zinc-900/50 border border-cyan-500/30 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">★</span>
                    Main Engine: Groq LPU Key
                    <span className="text-[10px] font-mono text-cyan-400">(gsk_...)</span>
                  </label>
                  {testState.result && (
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-bold',
                      testState.result.valid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    )}>
                      {testState.result.valid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {testState.result.valid ? `Connected (${testState.result.latencyMs}ms)` : 'Error'}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqKey}
                    onChange={e => setGroqKey(e.target.value)}
                    placeholder="Enter Groq API Key (gsk_...)"
                    className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 font-mono pr-20"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="p-1.5 text-zinc-500 hover:text-white"
                      title={showGroqKey ? 'Hide' : 'Show'}
                    >
                      {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestGroq}
                      disabled={testState.testing || !groqKey.trim()}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-40"
                    >
                      {testState.testing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ping Test'}
                    </button>
                  </div>
                </div>
                {testState.result && !testState.result.valid && (
                  <p className="text-[10px] text-red-400">{testState.result.error}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-300">
                    ⚡ openai/gpt-oss-20b
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-purple-300">
                    🧠 openai/gpt-oss-120b
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-300">
                    💻 qwen/qwen3.8-27b
                  </span>
                </div>
              </div>

              {/* Secondary Backup Key (Optional Gemini) */}
              <div className="space-y-2 p-3 bg-zinc-900/30 border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 font-mono">
                    <Key className="w-3.5 h-3.5" />
                    Secondary Fallback Key (Gemini, Optional)
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    placeholder="Enter secondary key (optional)"
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-400 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2.5 p-1 text-zinc-500 hover:text-white"
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className={cn(
                    'px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg',
                    savedSuccess
                      ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30'
                  )}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved & Activated!
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
