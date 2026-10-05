import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Database, CheckCircle2, AlertTriangle, Loader2,
  Copy, Check, ExternalLink, HardDrive, KeyRound, Sparkles
} from "lucide-react";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

const SUPABASE_SETUP_SQL = `-- Monix Web-OS: Virtual File System Cloud Registry Schema
CREATE TABLE IF NOT EXISTS cloud_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable public access for demo / authorized users
ALTER TABLE cloud_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON cloud_registry FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON cloud_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Access" ON cloud_registry FOR DELETE USING (true);
CREATE POLICY "Public Update Access" ON cloud_registry FOR UPDATE USING (true);

-- Storage: In Supabase Dashboard -> Storage, create a public bucket named 'monix-drive'`;

export default function SupabaseConfigModal({
  isOpen,
  onClose,
  onConfigSaved,
}: SupabaseConfigModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableReady?: boolean;
    storageReady?: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to reach Supabase project",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    onConfigSaved?.();
    onClose();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl("");
    setAnonKey("");
    setTestResult(null);
    onConfigSaved?.();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2200);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111318] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden font-sans text-xs text-gray-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#171922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Supabase VFS Cloud Settings
                {isConfigured ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium">
                    LOCAL SANDBOX
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-400">
                Connect your Supabase project for persistent cloud file sync across devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Alert */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-300">File Storage Engine:</span>
              <span className="text-cyan-400 font-mono">
                {isConfigured ? "Supabase Storage + PostgreSQL Registry" : "Local VFS Sandbox (IndexedDB/Cache)"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              When Supabase is configured, files are securely uploaded to the <code className="text-cyan-300">monix-drive</code> storage bucket and logged into <code className="text-cyan-300">cloud_registry</code>. When offline or unconfigured, VFS seamlessly persists files locally.
            </p>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <HardDrive size={13} className="text-cyan-400" />
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-cyan-400" />
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Test Diagnostic Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-xs">{testResult.message}</div>
                {testResult.tableReady !== undefined && (
                  <div className="text-[10px] space-x-2 font-mono">
                    <span>
                      Table: {testResult.tableReady ? "✓ cloud_registry found" : "✗ cloud_registry missing"}
                    </span>
                    <span>•</span>
                    <span>
                      Bucket: {testResult.storageReady ? "✓ monix-drive found" : "✗ monix-drive missing"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setup Guide Accordion */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 py-1"
            >
              <span>{showSqlGuide ? "Hide Supabase SQL Schema Setup" : "Show Supabase SQL Schema & Bucket Setup"}</span>
              <span>{showSqlGuide ? "▲" : "▼"}</span>
            </button>

            {showSqlGuide && (
              <div className="mt-2 p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Run this in your Supabase SQL Editor:</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded text-[10px] font-medium transition-colors"
                  >
                    {copiedSql ? <Check size={11} /> : <Copy size={11} />}
                    {copiedSql ? "Copied SQL" : "Copy SQL"}
                  </button>
                </div>
                <pre className="p-2 bg-black/70 rounded-lg text-[10px] font-mono text-gray-300 overflow-x-auto max-h-36 leading-tight select-all">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <div className="text-[10px] text-amber-300/80 leading-normal">
                  <strong>Important:</strong> In your Supabase Dashboard under <em>Storage</em>, create a public bucket named <code className="bg-white/10 px-1 rounded text-cyan-300">monix-drive</code>.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#171922]">
          {isConfigured ? (
            <button
              onClick={handleDisconnect}
              className="text-rose-400 hover:text-rose-300 text-xs font-medium"
            >
              Disconnect Supabase
            </button>
          ) : (
            <div className="text-[10px] text-gray-500 font-mono">
              Local VFS Active
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url || !anonKey}
              className="px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40 font-semibold transition-colors flex items-center gap-1.5"
            >
              {isTesting && <Loader2 size={12} className="animate-spin" />}
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
