import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, Sparkles, User, Bot,
  Brain, Zap, Search,
  History, Settings, X, Github, Twitter, Mic, MicOff,
  Key, Globe, Volume2, VolumeX, Copy, Check, ChevronDown, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import WindowChrome from './WindowChrome';
import entryImg from '@assets/entry_1775232118123.webp';
import { useOSStore } from '../lib/store';
import AuraKeyModal from './AuraKeyModal';
import {
  generateAuraResponse, getAuraConfig, saveAuraConfig,
  AuraModelConfig, AuraRoutingMode, AuraModelId
} from '../lib/AuraModelEngine';

// ── Types ──────────────────────────────────────────────────────────────────

type AppView = 'landing' | 'conversation';

interface AuraAppProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  onFocus: () => void;
  initialX?: number;
  initialY?: number;
  zIndex?: number;
  onOpenWindow?: (id: string) => void;
}

// ── About Modal ─────────────────────────────────────────────────────────────

function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl aura-glow-border"
          >
            <div className="p-8 space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tighter">The Architect</h2>
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Engineering the Future</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-2xl font-black text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-25" />
                    M
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Monish</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-1">
                    Visionary full-stack developer & AI engineer building next-gen digital experiences.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href="#" className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                  <Github className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">GitHub</span>
                </a>
                <a href="#" className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                  <Twitter className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Twitter</span>
                </a>
              </div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-[9px] text-zinc-600 text-center font-black uppercase tracking-widest italic">
                  "Intelligence is the ultimate frontier."
                </p>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Settings Modal ──────────────────────────────────────────────────────────

function SettingsModal({
  isOpen, onClose, isThinking, onToggleThinking, onOpenKeyModal
}: {
  isOpen: boolean; onClose: () => void;
  isThinking: boolean; onToggleThinking: () => void;
  onOpenKeyModal: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="relative w-full max-w-xs bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-7 space-y-5 relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tighter">Settings</h2>
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Configure AURA</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">AI Reasoning</label>
                <button
                  onClick={onToggleThinking}
                  className={cn(
                    "flex items-center justify-between w-full p-4 rounded-xl border transition-all",
                    isThinking
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">Deep Thinking Mode</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">Auto-routes queries to Gemini Pro</div>
                    </div>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full border transition-all relative",
                    isThinking ? "bg-purple-500 border-purple-400" : "bg-zinc-800 border-zinc-700"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full absolute top-0.5 transition-all",
                      isThinking ? "right-0.5 bg-white" : "left-0.5 bg-zinc-500"
                    )} />
                  </div>
                </button>

                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 pt-2 block">API Engine</label>
                <button
                  onClick={() => { onClose(); onOpenKeyModal(); }}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-sm font-bold text-white">API Keys & Models</div>
                      <div className="text-[9px] text-zinc-400 mt-0.5">Configure dual keys & routing</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300">
                    Edit
                  </span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/5">
                <p className="text-[9px] text-zinc-600 text-center font-black uppercase tracking-widest">
                  AURA v2.5 • Dual-Key Engine • MONIX OS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Code Block with Copy Button ─────────────────────────────────────────────

function CodeBlock({ children, className }: { children: any; className?: string }) {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, '');
  const langMatch = /language-(\w+)/.exec(className || '');
  const lang = langMatch ? langMatch[1] : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-white/10 text-[10px] font-mono text-zinc-400">
        <span className="uppercase text-cyan-400 font-bold">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed">
        <code>{children}</code>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────

export default function AuraApp({
  onClose, onMinimize, isActive, onFocus, initialX, initialY, zIndex, onOpenWindow
}: AuraAppProps) {
  const [isIntro, setIsIntro]           = useState(true);
  const [introFading, setIntroFading]   = useState(false);
  const [view, setView]                 = useState<AppView>('landing');
  const [input, setInput]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [isThinking, setIsThinking]     = useState(false);
  const [showAbout, setShowAbout]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const [isMuted, setIsMuted]           = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [copiedId, setCopiedId]         = useState<string | null>(null);

  const [config, setConfig]             = useState<AuraModelConfig>(getAuraConfig());

  const messages          = useOSStore((s) => s.auraMessages);
  const addAuraMessage    = useOSStore((s) => s.addAuraMessage);
  const clearAuraMessages = useOSStore((s) => s.clearAuraMessages);
  const auraWakeActive    = useOSStore((s: any) => s.auraWakeActive) || false;
  const setAuraWakeActive = useOSStore((s: any) => s.setAuraWakeActive);

  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const micRecRef = useRef<any>(null);
  const [isMicListening, setIsMicListening] = useState(false);
  const isAwakeRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reloadConfig = () => {
    setConfig(getAuraConfig());
  };

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const isTamilScript = /[\u0B80-\u0BFF]/.test(text);
    const isTanglish = /(pannu|panndra|macha|machi|da|di|ah)\b/i.test(text);
    
    if (isTamilScript) {
      utterance.lang = 'ta-IN';
    } else if (isTanglish) {
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-IN'; 
    }

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => 
      v.lang.includes('IN') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('ravi'))
    );
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('IN'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const resetSilenceTimer = (cmd: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (cmd.trim()) {
        handleSendVoiceCommand(cmd.trim());
      }
    }, 1000);
  };

  const handleSendVoiceCommand = async (cmd: string) => {
    setInput('');
    isAwakeRef.current = false;
    if (setAuraWakeActive) setAuraWakeActive(false);
    if (micRecRef.current) {
      try { micRecRef.current.abort(); } catch(e) {}
    }
    await sendMessage(cmd);
  };

  function startMicInput() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const API = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!API) return;
    if (micRecRef.current) {
      try { micRecRef.current.abort(); } catch (_) {}
      micRecRef.current = null;
      setIsMicListening(false);
      return;
    }
    const rec = new API();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    rec.onstart = () => setIsMicListening(true);
    rec.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      const currentText = finalTranscript || interimTranscript;
      if (!currentText.trim()) return;
      
      const lower = currentText.toLowerCase();
      if (!isAwakeRef.current && lower.includes("hey buddy")) {
        isAwakeRef.current = true;
        if (setAuraWakeActive) setAuraWakeActive(true);
        speakText("Yes, Sir");
        const parts = lower.split("hey buddy");
        const cmd = parts.slice(1).join("hey buddy").trim();
        setInput(cmd);
        if (cmd) resetSilenceTimer(cmd);
      } else if (isAwakeRef.current) {
        setInput(currentText);
        resetSilenceTimer(currentText);
      }
    };
    rec.onend = () => { 
      if (isMicListening) {
        try { rec.start(); } catch(e) {}
      } else {
        micRecRef.current = null; setIsMicListening(false); 
      }
    };
    rec.onerror = (e: any) => { 
      if (e.error !== 'aborted' && isMicListening) {
        setTimeout(() => { try { rec.start(); } catch(err) {} }, 100);
      }
    };
    micRecRef.current = rec;
    try { rec.start(); } catch (_) { micRecRef.current = null; setIsMicListening(false); }
  }

  // Splash: show for 2500ms, then fade out and reveal
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIntroFading(true), 2500);
    const hideTimer = setTimeout(() => setIsIntro(false), 3100);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-switch to conversation view when AURA service posts messages
  useEffect(() => {
    if (messages.length > 0 && view === 'landing' && !isIntro) {
      setView('conversation');
    }
  }, [messages, view, isIntro]);

  const sendMessage = async (text: string) => {
    if (!text || isLoading) return;

    const lowerText = text.toLowerCase();
    const openMatch = lowerText.match(/(?:open|launch|start)\s+([a-z]+)|([a-z]+)\s+(?:ah\s+)?(?:open\s+pannu|open\s+panndra|open|launch)/);
    
    if (openMatch) {
      const target = (openMatch[1] || openMatch[2]).trim();
      const appMap: Record<string, string> = {
        "browser": "browser", "terminal": "terminal", "files": "files", "file manager": "files",
        "github": "github", "portfolio": "portfolio", "settings": "settings", "threat map": "threatmap",
        "threatmap": "threatmap", "codepad": "codepad", "securecomm": "securecomm", "comm": "securecomm",
        "monix-comm": "securecomm", "dossier": "dossier",
        "chess": "chess", "system monitor": "taskmanager", "task manager": "taskmanager", "taskmanager": "taskmanager",
        "cyberchef": "cyberchef", "code studio": "codestudio", "codestudio": "codestudio", "threat modeler": "threatmodeler",
        "threatmodeler": "threatmodeler", "cykrypt": "cykrypt"
      };
      const appId = appMap[target];
      if (appId && onOpenWindow) {
        onOpenWindow(appId);
        speakText(`Opening ${target}, Sir.`);
        if (setAuraWakeActive) setAuraWakeActive(false);
        return;
      }
    }

    addAuraMessage({ id: Date.now().toString(), role: 'user', text });
    setView('conversation');
    setIsLoading(true);

    const systemPromptText = isThinking
      ? 'You are AURA, the native AI of MONIX Web OS. Keep conversational replies concise, technical, and precise. Analyze the user\'s input language. If English, reply in English. If Tamil, reply in native Tamil. If Tanglish, reply in Tanglish. Your persona is helpful, ultra-fast, and sharp.'
      : 'You are AURA, an elite native AI assistant of MONIX Web OS. Keep conversational replies concise and direct. Analyze the user\'s input language. If English, reply in English. If Tamil, reply in native Tamil. If Tanglish, reply in Tanglish.';

    try {
      const historyItems = messages.map(m => ({ role: m.role as 'user' | 'assistant', text: m.text }));
      const result = await generateAuraResponse(text, historyItems, systemPromptText, isThinking);
      const auraText = result.text;

      addAuraMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: auraText,
        modelBadge: result.modelBadge,
        latencyMs: result.latencyMs,
      });

      speakText(auraText);
    } catch (err: any) {
      console.error('[AURA Error]', err);
      addAuraMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: '`SYSTEM ERROR` — All neural channels offline. Please configure your API keys in Settings or check network connectivity.',
        modelBadge: 'Error',
      });
      speakText('Connection failed. Please check your API keys.');
    } finally {
      setIsLoading(false);
      if (setAuraWakeActive) setAuraWakeActive(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(text);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Header active model label
  const getActiveModelLabel = () => {
    if (config.mode === 'auto') {
      return isThinking ? 'Auto: Groq 120B 🧠' : 'Auto: Groq 20B ⚡';
    }
    if (config.manualModel === 'groq-deep') return 'Groq 120B 🧠';
    if (config.manualModel === 'qwen-coder') return 'Qwen 27B 💻';
    if (config.manualModel === 'pollinations') return 'Pollinations 🌐';
    return 'Groq 20B ⚡';
  };

  return (
    <WindowChrome
      title="AURA AI — Next-Gen Intelligence System"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      onFocus={onFocus}
      initialX={initialX}
      initialY={initialY}
      width={940}
      height={660}
      zIndex={zIndex}
    >
      <div
        className="relative w-full h-full overflow-hidden font-sans select-none flex flex-col"
        style={{ background: '#050508', color: '#f4f4f5' }}
      >
        {/* Animated cyberpunk waves */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: '#050508' }}>
          <div className="aura-bg-wave" />
          <div className="aura-bg-wave" />
          <div className="aura-bg-wave" />
        </div>

        {/* ── SPLASH SCREEN ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {isIntro && (
            <motion.div
              className="absolute inset-0 z-[200] bg-black flex items-center justify-center"
              animate={{ opacity: introFading ? 0 : 1 }}
              transition={{ duration: 0.6 }}
              style={{ pointerEvents: introFading ? 'none' : 'auto' }}
            >
              <img
                src={entryImg}
                alt="AURA splash"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          isThinking={isThinking}
          onToggleThinking={() => setIsThinking(t => !t)}
          onOpenKeyModal={() => setShowKeyModal(true)}
        />
        <AuraKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          onConfigUpdated={reloadConfig}
        />

        {/* ── LANDING VIEW ──────────────────────────────────────────────── */}
        {!isIntro && view === 'landing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl space-y-6"
            >
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_50px_rgba(0,240,255,0.35)] animate-pulse">
                  <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold backdrop-blur-md">
                  AURA 2.5
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  AURA Neural Intelligence
                </h1>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Dual-Key Smart Architecture with automatic model reasoning, real-time voice, and native OS command dispatch.
                </p>
              </div>

              {/* Model Badges */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
                  <Zap className="w-3 h-3 text-cyan-400" /> Groq 20B (Sub-Second)
                </span>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                  <Brain className="w-3 h-3 text-purple-400" /> Groq 120B (Deep Reasoning)
                </span>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" /> Failover Relay
                </span>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto pt-2">
                {[
                  { title: 'Open Chrome Browser', desc: 'Fast Web Access', icon: Globe, action: () => sendMessage('Open browser') },
                  { title: 'Open Secure Comm', desc: 'Device-to-Device Chat', icon: Key, action: () => sendMessage('Open securecomm') },
                  { title: 'Write Port Scanner', desc: 'Python Network Script', icon: Zap, action: () => sendMessage('Write a fast Python port scanner script with socket') },
                  { title: 'Configure API Keys', desc: 'Dual-Key Settings', icon: Settings, action: () => setShowKeyModal(true) },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="p-3 bg-zinc-900/50 hover:bg-zinc-850 border border-white/5 hover:border-cyan-500/30 rounded-2xl text-left transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-cyan-300">
                      <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                      {item.title}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setView('conversation')}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                >
                  Enter Chat Console →
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── CONVERSATION VIEW ─────────────────────────────────────────── */}
        {!isIntro && view === 'conversation' && (
          <div className="relative z-10 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="px-4 py-2.5 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white tracking-tight">AURA AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                    <span>STATUS: ACTIVE</span>
                  </div>
                </div>

                {/* Model Selector Dropdown Pill */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition-all shadow-sm"
                  >
                    <span>{getActiveModelLabel()}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  <AnimatePresence>
                    {showModelMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1.5 w-56 p-1.5 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 space-y-1 backdrop-blur-2xl"
                      >
                        <button
                          onClick={() => {
                            saveAuraConfig({ mode: 'auto' });
                            reloadConfig();
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all',
                            config.mode === 'auto'
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Auto (Wise Router)</span>
                          </div>
                          {config.mode === 'auto' && <Check className="w-3 h-3 text-cyan-400" />}
                        </button>

                        <button
                          onClick={() => {
                            saveAuraConfig({ mode: 'manual', manualModel: 'groq-fast' });
                            reloadConfig();
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all',
                            config.mode === 'manual' && config.manualModel === 'groq-fast'
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Groq 20B (Instant)</span>
                          </div>
                          {config.mode === 'manual' && config.manualModel === 'groq-fast' && <Check className="w-3 h-3 text-cyan-400" />}
                        </button>

                        <button
                          onClick={() => {
                            saveAuraConfig({ mode: 'manual', manualModel: 'groq-deep' });
                            reloadConfig();
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all',
                            config.mode === 'manual' && config.manualModel === 'groq-deep'
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>Groq 120B (Deep Pro)</span>
                          </div>
                          {config.mode === 'manual' && config.manualModel === 'groq-deep' && <Check className="w-3 h-3 text-purple-400" />}
                        </button>

                        <button
                          onClick={() => {
                            saveAuraConfig({ mode: 'manual', manualModel: 'qwen-coder' });
                            reloadConfig();
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all',
                            config.mode === 'manual' && config.manualModel === 'qwen-coder'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Qwen 3.8 27B (Coder)</span>
                          </div>
                          {config.mode === 'manual' && config.manualModel === 'qwen-coder' && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>

                        <button
                          onClick={() => {
                            saveAuraConfig({ mode: 'manual', manualModel: 'pollinations' });
                            reloadConfig();
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all',
                            config.mode === 'manual' && config.manualModel === 'pollinations'
                              ? 'bg-zinc-800 text-zinc-300 border border-white/20'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Pollinations Relay</span>
                          </div>
                          {config.mode === 'manual' && config.manualModel === 'pollinations' && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Header Right Action Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Deep Thinking Mode quick toggle */}
                <button
                  onClick={() => setIsThinking(!isThinking)}
                  title={isThinking ? 'Deep Thinking ON (Uses Pro)' : 'Deep Thinking OFF'}
                  className={cn(
                    'p-2 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-mono',
                    isThinking
                      ? 'bg-purple-950/70 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  )}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px] font-bold">THINK</span>
                </button>

                {/* API Keys Configuration Modal button */}
                <button
                  onClick={() => setShowKeyModal(true)}
                  title="Configure Dual Keys & Models"
                  className={cn(
                    'p-2 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-mono',
                    config.groqKey
                      ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/70'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/70'
                  )}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px] font-bold">
                    {config.groqKey ? 'GROQ: ACTIVE' : 'SETUP KEY'}
                  </span>
                </button>

                {/* Voice Audio Mute Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute Voice Audio' : 'Mute Voice Audio'}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>

                {/* Clear Chat */}
                <button
                  onClick={clearAuraMessages}
                  title="Clear conversation"
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <History className="w-4 h-4" />
                </button>

                {/* Settings */}
                <button
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Messages Body */}
            <main className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.3)]">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-xl font-black tracking-tight text-white">How may AURA assist?</h3>
                    <p className="text-xs text-zinc-400">
                      Query the neural network for system commands, cybersecurity tasks, code synthesis, or deep analysis.
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-md pt-2">
                    {[
                      { text: 'Open Chrome Browser', icon: '🌐' },
                      { text: 'Open Secure Comm', icon: '🔒' },
                      { text: 'Scan Threat Map', icon: '🛡️' },
                      { text: 'Write a Python port scanner', icon: '💻' },
                      { text: 'Explain zero-day exploits', icon: '⚡' },
                    ].map(s => (
                      <button
                        key={s.text}
                        onClick={() => sendMessage(s.text)}
                        className="px-3.5 py-1.5 bg-zinc-900/60 border border-white/10 hover:border-cyan-400/50 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-850 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>{s.icon}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto w-full">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3 group', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md',
                        msg.role === 'user'
                          ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                          : 'bg-gradient-to-br from-indigo-700 via-purple-700 to-cyan-700 text-white border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                      )}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>

                      {/* Bubble Card */}
                      <div className={cn(
                        'max-w-[85%] rounded-2xl text-sm border shadow-xl relative',
                        msg.role === 'user'
                          ? 'px-4 py-3 bg-cyan-950/50 border-cyan-500/30 text-cyan-50 rounded-tr-sm shadow-[0_0_16px_rgba(6,182,212,0.12)]'
                          : 'px-5 py-4 bg-zinc-950/90 border-white/10 rounded-tl-sm text-zinc-100 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
                      )}>
                        {msg.role === 'user' ? (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="aura-markdown prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  code({ node, className, children, ...props }: any) {
                                    const isInline = !className && typeof children === 'string' && !children.includes('\n');
                                    if (isInline) {
                                      return (
                                        <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono text-[11px]" {...props}>
                                          {children}
                                        </code>
                                      );
                                    }
                                    return <CodeBlock className={className}>{children}</CodeBlock>;
                                  }
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>

                            {/* Assistant Footer Info (Model Attribution & Action Buttons) */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-zinc-500 font-mono">
                              <div className="flex items-center gap-2">
                                {msg.modelBadge && (
                                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                                    {msg.modelBadge}
                                  </span>
                                )}
                                {msg.latencyMs && (
                                  <span className="text-zinc-500">{msg.latencyMs}ms</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                                  className="p-1 hover:text-white rounded hover:bg-white/10"
                                  title="Copy response"
                                >
                                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => speakText(msg.text)}
                                  className="p-1 hover:text-white rounded hover:bg-white/10"
                                  title="Speak aloud"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Neural Thinking Loading Animation */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 flex-row"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 10px rgba(0,240,255,0.3)",
                            "0 0 25px rgba(0,240,255,0.8)",
                            "0 0 10px rgba(0,240,255,0.3)",
                          ],
                        }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center border border-cyan-500/40 shrink-0"
                      >
                        <motion.div
                          animate={{ rotate: [0, 180, 360], scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                      </motion.div>

                      <div className="px-5 py-3.5 bg-zinc-950/90 border border-cyan-500/20 rounded-2xl rounded-tl-sm backdrop-blur-xl flex items-center gap-3 shadow-xl">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-cyan-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-cyan-300 font-mono tracking-wider uppercase">
                          {isThinking ? 'Pro Neural Reasoning Engine Active…' : 'Synthesizing response…'}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}
            </main>

            {/* Chat Input Bar */}
            <footer className="px-4 pb-4 pt-2 shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="relative group">
                  {/* Glowing focus border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-[2rem] blur opacity-25 group-focus-within:opacity-80 transition duration-500" />

                  <div className="relative flex items-end gap-2 p-2 bg-zinc-950/95 backdrop-blur-2xl rounded-[1.85rem] border border-white/10 shadow-2xl">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={auraWakeActive ? '🎙 AURA is listening to command…' : 'Ask AURA anything (e.g. open terminal, analyze code, who are you)...'}
                      rows={1}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-0 outline-none ring-0 text-white py-3 px-3.5 resize-none max-h-36 text-sm placeholder:text-zinc-600 disabled:opacity-50"
                      style={{ height: 'auto' }}
                      onInput={e => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = 'auto';
                        t.style.height = `${t.scrollHeight}px`;
                      }}
                    />

                    {/* Microphone button */}
                    <button
                      type="button"
                      onClick={startMicInput}
                      title={isMicListening ? 'Stop mic' : 'Speak to AURA'}
                      className={cn(
                        'p-3 rounded-2xl transition-all flex items-center justify-center shrink-0',
                        isMicListening
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.5)] animate-pulse'
                          : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-cyan-300 hover:border-cyan-500/30'
                      )}
                    >
                      {isMicListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Send button */}
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={cn(
                        'p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 shadow-lg',
                        isLoading || !input.trim()
                          ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      )}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-2 text-[9px] text-zinc-500 font-mono">
                  <span>AURA 2.5 • Dual-Key Smart Architecture</span>
                  <span>Say "Hey buddy" to wake</span>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </WindowChrome>
  );
}
