import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Radio, Check, Globe, Shield, Zap, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import {
  CommBackendType, getSavedCommBackend, saveCommBackend,
  getSavedCustomSupabase, saveCustomSupabase,
  getSavedFirebaseUrl, saveFirebaseUrl
} from '../../lib/CommSignalingClient';
import { cn } from '../../lib/utils';

interface CommSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackend: CommBackendType;
  onBackendChange: (b: CommBackendType) => void;
  onlineCount: number;
  localPeerAlias: string;
}

export default function CommSettingsModal({
  isOpen, onClose, currentBackend, onBackendChange, onlineCount, localPeerAlias
}: CommSettingsModalProps) {
  const [selectedBackend, setSelectedBackend] = useState<CommBackendType>(currentBackend);
  const [supabaseCreds, setSupabaseCreds] = useState(getSavedCustomSupabase());
  const [firebaseUrl, setFirebaseUrl] = useState(getSavedFirebaseUrl());
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const inviteUrl = window.location.origin;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = () => {
    saveCommBackend(selectedBackend);
    saveCustomSupabase(supabaseCreds.url.trim(), supabaseCreds.key.trim());
    saveFirebaseUrl(firebaseUrl.trim());
    onBackendChange(selectedBackend);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-[#00ffff]/30 rounded-2xl p-6 text-white shadow-[0_0_40px_rgba(0,255,255,0.15)] relative font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(0,255,255,0.1)] border border-[#00ffff] flex items-center justify-center text-[#00ffff]">
                  <Radio size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#00ffff]">
                    Comm Network Settings
                  </h3>
                  <div className="text-[10px] text-zinc-400">
                    Real-time Device Detection & Signaling
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Network Status & Invite */}
              <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Node Status:</span>
                  <span className="text-[10px] font-mono text-[#10b981] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    ONLINE ({onlineCount} Peers Active)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Invite Node:</span>
                  <button
                    onClick={handleCopyInvite}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-[rgba(0,255,255,0.1)] border border-[#00ffff]/30 text-[#00ffff] text-[10px] hover:bg-[rgba(0,255,255,0.2)] font-mono transition-colors"
                  >
                    {copiedLink ? <Check size={10} /> : <Copy size={10} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Device Link'}</span>
                  </button>
                </div>
              </div>

              {/* Signaling Providers */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Select Signaling Provider:
                </label>

                {/* Option 1: MONIX Mesh Relay */}
                <button
                  type="button"
                  onClick={() => setSelectedBackend('mesh')}
                  className={cn(
                    'w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3',
                    selectedBackend === 'mesh'
                      ? 'bg-[rgba(0,255,255,0.08)] border-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                  )}
                >
                  <Zap className="w-4 h-4 text-[#00ffff] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      MONIX Ultra-Fast Mesh Relay
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Instant • Free
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Zero-config real-time SSE stream. Instantly detects other phones, PCs & tabs on your network.
                    </div>
                  </div>
                </button>

                {/* Option 2: Supabase Realtime */}
                <button
                  type="button"
                  onClick={() => setSelectedBackend('supabase')}
                  className={cn(
                    'w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3',
                    selectedBackend === 'supabase'
                      ? 'bg-[rgba(16,185,129,0.08)] border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                  )}
                >
                  <Shield className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      Supabase Realtime Cloud
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10b981]/20 text-[#10b981] font-mono">
                        Cloud Presence
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Connects via Supabase Realtime WebSockets for global internet presence.
                    </div>
                  </div>
                </button>

                {/* Option 3: Firebase */}
                <button
                  type="button"
                  onClick={() => setSelectedBackend('firebase')}
                  className={cn(
                    'w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3',
                    selectedBackend === 'firebase'
                      ? 'bg-[rgba(249,115,22,0.08)] border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                  )}
                >
                  <Globe className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      Firebase Realtime DB
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                        Cloud DB
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Custom Firebase Realtime Database cloud instance.
                    </div>
                  </div>
                </button>
              </div>

              {/* Supabase Custom Credentials (if selected) */}
              {selectedBackend === 'supabase' && (
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 block mb-1">SUPABASE URL</label>
                    <input
                      type="text"
                      value={supabaseCreds.url}
                      onChange={e => setSupabaseCreds({ ...supabaseCreds, url: e.target.value })}
                      placeholder="https://your-project.supabase.co"
                      className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 block mb-1">SUPABASE ANON KEY</label>
                    <input
                      type="password"
                      value={supabaseCreds.key}
                      onChange={e => setSupabaseCreds({ ...supabaseCreds, key: e.target.value })}
                      placeholder="ey..."
                      className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Firebase Custom Credentials (if selected) */}
              {selectedBackend === 'firebase' && (
                <div className="p-3 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 block mb-1">FIREBASE DB URL</label>
                    <input
                      type="text"
                      value={firebaseUrl}
                      onChange={e => setFirebaseUrl(e.target.value)}
                      placeholder="https://your-project.firebaseio.com"
                      className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a1a1a]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded bg-[#00ffff] text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors flex items-center gap-1.5"
              >
                {savedSuccess ? <Check size={14} /> : null}
                <span>{savedSuccess ? 'Saved' : 'Save & Reconnect'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
