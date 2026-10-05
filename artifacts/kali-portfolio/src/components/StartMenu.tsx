import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Power, Search, X, Shield, User,
} from "lucide-react";
import { useOSStore } from "@/lib/store";
import CyberAppIcon, { getCyberAppTheme } from "./CyberAppIcon";
import { playClickSound } from "@/utils/SoundEngine";
import homeLauncherLogo from "@/assets/home-launcher.png";

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenWindow: (id: string) => void;
}

interface AppEntry {
  id: string;
  label: string;
  category: "security" | "dev" | "system" | "intel";
  desc: string;
}

const APPS: AppEntry[] = [
  { id: "terminal",        label: "Terminal",     category: "security", desc: "Root Zsh / Bash Shell" },
  { id: "browser",         label: "NetRunner",    category: "dev",      desc: "Cyber Web Browser" },
  { id: "files",           label: "VFS Vault",    category: "system",   desc: "Supabase Cloud Storage" },
  { id: "redteam",         label: "Red Team",     category: "security", desc: "Security Awareness Simulator" },
  { id: "sentinel",        label: "Sentinel SOC", category: "security", desc: "SIEM & Threat Defense" },
  { id: "aura",            label: "AURA AI",      category: "system",   desc: "Neural Voice Assistant" },
  
  { id: "codestudio",      label: "Code Studio",  category: "dev",      desc: "Full Cloud IDE" },
  { id: "codepad",         label: "NanoPad",      category: "dev",      desc: "Scratchpad Editor" },
  { id: "github",          label: "GitHub",       category: "dev",      desc: "Git Repositories" },
  { id: "threatmap",       label: "Threat Map",   category: "security", desc: "Global Cyber Attacks" },
  { id: "cykrypt",         label: "CYKRYPT",      category: "security", desc: "CTF Security Arena" },
  { id: "threatmodeler",   label: "Threat Model", category: "security", desc: "STRIDE Analysis Engine" },

  { id: "cyberchef",       label: "CyberChef",    category: "security", desc: "Crypto & Encodings Forge" },
  { id: "dossier",         label: "Dossier",      category: "intel",    desc: "Classified Intel File" },
  { id: "securecomm",      label: "MONIX-COMM",   category: "intel",    desc: "Encrypted Comms" },
  { id: "portfolio",       label: "Credentials",  category: "dev",      desc: "Operative Dossier" },
  { id: "taskmanager",     label: "Telemetry",    category: "system",   desc: "Kernel Monitor & CPU" },
  { id: "settings",        label: "Settings",     category: "system",   desc: "System Overdrive" },

  { id: "wallpaperpicker", label: "Wallpapers",   category: "system",   desc: "Cyber Wallpapers" },
  { id: "trash",           label: "Trash Bin",    category: "system",   desc: "Quarantine Bin" },
  { id: "chess",           label: "Chess",        category: "intel",    desc: "Grandmaster AI Chess" },
];

export default function StartMenu({ open, onClose, onOpenWindow }: StartMenuProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "security" | "dev" | "system" | "intel">("all");
  const setLocked = useOSStore((s) => s.setLocked);

  const filteredApps = useMemo(() => {
    return APPS.filter((app) => {
      const matchesSearch =
        app.label.toLowerCase().includes(search.toLowerCase()) ||
        app.desc.toLowerCase().includes(search.toLowerCase()) ||
        app.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 490 }}
            onClick={onClose}
          />

          {/* Windows-style Redesigned Menu Panel (Zero Scrollbars, Clean Grid Layout) */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed font-sans select-none"
            style={{
              bottom: 48,
              left: 10,
              width: 460,
              maxWidth: "calc(100vw - 20px)",
              zIndex: 500,
              background: "linear-gradient(180deg, rgba(10, 15, 26, 0.96) 0%, rgba(4, 7, 14, 0.98) 100%)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: 14,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Top Header: Windows Search Bar ── */}
            <div
              style={{
                padding: "16px 16px 12px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Search Bar Input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(18, 25, 40, 0.8)",
                  border: "1px solid rgba(0, 240, 255, 0.28)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  boxShadow: "inset 0 1px 4px rgba(0, 0, 0, 0.6)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <Search size={15} color="#00f0ff" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Type here to search apps, tools, commands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: 12.5,
                    fontFamily: "'Segoe UI', 'Ubuntu', sans-serif",
                    width: "100%",
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sub-Header: Pinned Title & Clean Category Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      fontFamily: "'Ubuntu', monospace",
                    }}
                  >
                    Pinned Apps
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: "1px 5px",
                      borderRadius: 10,
                      background: "rgba(0, 240, 255, 0.12)",
                      border: "1px solid rgba(0, 240, 255, 0.3)",
                      color: "#00f0ff",
                      fontWeight: 700,
                    }}
                  >
                    {filteredApps.length}
                  </span>
                </div>

                {/* Clean Category Filters */}
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "security", label: "Sec" },
                    { id: "dev", label: "Dev" },
                    { id: "intel", label: "Ops" },
                    { id: "system", label: "Sys" },
                  ].map((cat) => {
                    const isCur = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          playClickSound();
                          setActiveCategory(cat.id as any);
                        }}
                        style={{
                          padding: "2px 7px",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          borderRadius: 4,
                          border: isCur ? "1px solid #00f0ff" : "1px solid rgba(255, 255, 255, 0.08)",
                          background: isCur ? "rgba(0, 240, 255, 0.18)" : "rgba(255, 255, 255, 0.03)",
                          color: isCur ? "#00f0ff" : "rgba(255, 255, 255, 0.5)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Applications Grid: Clean, Uncluttered, Zero Scrollbars ── */}
            <div
              style={{
                padding: "12px 14px",
                overflow: "hidden", // Completely remove scrollbar
              }}
            >
              {filteredApps.length === 0 ? (
                <div
                  style={{
                    padding: "36px 0",
                    textAlign: "center",
                    color: "rgba(0, 240, 255, 0.5)",
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                >
                  No applications found matching &quot;{search}&quot;
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "10px 4px",
                  }}
                >
                  {filteredApps.map((app) => {
                    const theme = getCyberAppTheme(app.id);
                    return (
                      <motion.button
                        key={app.id}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          playClickSound();
                          onOpenWindow(app.id);
                          onClose();
                        }}
                        title={`${app.label} — ${app.desc}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "7px 4px 6px",
                          background: "transparent",
                          border: "1px solid transparent",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                          e.currentTarget.style.borderColor = `${theme.color}55`;
                          e.currentTarget.style.boxShadow = `0 0 12px ${theme.color}25`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* High-Fidelity Cyber Vector Icon */}
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "filter 0.2s ease",
                          }}
                        >
                          <CyberAppIcon appId={app.id} size={28} glow={false} />
                        </div>

                        {/* Clean Single-Line Typography */}
                        <span
                          style={{
                            marginTop: 5,
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: "#e2e8f0",
                            maxWidth: 66,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: 1.15,
                            textAlign: "center",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {app.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Windows-Style Footer: User Profile & Power Actions ── */}
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid rgba(0, 240, 255, 0.15)",
                background: "rgba(5, 8, 16, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* User Profile */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
                    border: "1px solid rgba(0, 240, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <img
                    src={homeLauncherLogo}
                    alt="User"
                    style={{ width: 16, height: 16, objectFit: "contain" }}
                  />
                  {/* Status Pip */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#00ff88",
                      boxShadow: "0 0 6px #00ff88",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.2,
                    }}
                  >
                    monish
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(0, 240, 255, 0.7)",
                      fontFamily: "monospace",
                      lineHeight: 1.1,
                    }}
                  >
                    root@kali ~ SOC Admin
                  </span>
                </div>
              </div>

              {/* Action Buttons: Lock & Reboot */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => {
                    playClickSound();
                    setLocked(true);
                    onClose();
                  }}
                  title="Lock Workstation"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: "rgba(0, 240, 255, 0.08)",
                    border: "1px solid rgba(0, 240, 255, 0.25)",
                    color: "#00f0ff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 240, 255, 0.2)";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 240, 255, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 240, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Lock size={14} />
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    window.location.reload();
                  }}
                  title="Reboot System"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Power size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
