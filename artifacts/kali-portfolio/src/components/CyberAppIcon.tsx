import React from "react";

export interface CyberAppIconProps {
  appId: string;
  size?: number;
  className?: string;
  glow?: boolean;
}

export const CYBER_APP_THEMES: Record<string, { color: string; bg: string; label: string }> = {
  terminal: {
    color: "#00ff88",
    bg: "rgba(0, 255, 136, 0.12)",
    label: "Root Terminal",
  },
  files: {
    color: "#00f0ff",
    bg: "rgba(0, 240, 255, 0.12)",
    label: "VFS Cloud Vault",
  },
  browser: {
    color: "#00d4ff",
    bg: "rgba(0, 212, 255, 0.14)",
    label: "NetRunner Browser",
  },
  aura: {
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.15)",
    label: "AURA Neural AI",
  },
  sentinel: {
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.14)",
    label: "Sentinel SOC",
  },
  portfolio: {
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
    label: "Operative Dossier",
  },
  github: {
    color: "#e2e8f0",
    bg: "rgba(226, 232, 240, 0.12)",
    label: "Cyber Git Core",
  },
  trash: {
    color: "#fb923c",
    bg: "rgba(251, 146, 60, 0.12)",
    label: "Quarantine Recycler",
  },
  threatmap: {
    color: "#f43f5e",
    bg: "rgba(244, 63, 94, 0.15)",
    label: "Cyber Warfare Map",
  },
  codestudio: {
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.14)",
    label: "Code Studio",
  },
  codepad: {
    color: "#22d3ee",
    bg: "rgba(34, 211, 238, 0.12)",
    label: "NanoPad Editor",
  },
  cyberchef: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.14)",
    label: "CyberChef Engine",
  },
  threatmodeler: {
    color: "#fb7185",
    bg: "rgba(251, 113, 133, 0.14)",
    label: "Threat Modeler",
  },
  chess: {
    color: "#facc15",
    bg: "rgba(250, 204, 21, 0.15)",
    label: "Grandmaster Chess",
  },
  cykrypt: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    label: "CYKRYPT Arena",
  },
  taskmanager: {
    color: "#2dd4bf",
    bg: "rgba(45, 212, 191, 0.12)",
    label: "Kernel Monitor",
  },
  settings: {
    color: "#818cf8",
    bg: "rgba(129, 140, 248, 0.14)",
    label: "Kernel Control",
  },
  securecomm: {
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.14)",
    label: "MONIX-COMM",
  },
  dossier: {
    color: "#e11d48",
    bg: "rgba(225, 29, 72, 0.15)",
    label: "Classified Intel",
  },
  wallpaperpicker: {
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.14)",
    label: "Holo Wallpapers",
  },
  mediaviewer: {
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.14)",
    label: "Media Holo-Viewer",
  },
  redteam: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.16)",
    label: "Red Team Simulator",
  },
};

export function getCyberAppTheme(appId: string) {
  const cleanId = appId.startsWith("mediaviewer-") ? "mediaviewer" : appId.toLowerCase();
  return CYBER_APP_THEMES[cleanId] ?? {
    color: "#00f0ff",
    bg: "rgba(0, 240, 255, 0.12)",
    label: appId,
  };
}

export default function CyberAppIcon({
  appId,
  size = 20,
  className = "",
  glow = false,
}: CyberAppIconProps) {
  const cleanId = appId.startsWith("mediaviewer-") ? "mediaviewer" : appId.toLowerCase();
  const theme = getCyberAppTheme(cleanId);
  const glowStyle = glow
    ? { filter: `drop-shadow(0 0 6px ${theme.color}aa) drop-shadow(0 0 12px ${theme.color}55)` }
    : undefined;

  switch (cleanId) {
    // ── 1. Terminal (Kali Root Console) ──
    case "terminal":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="termGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#00b862" />
            </linearGradient>
            <linearGradient id="termBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#08140f" />
              <stop offset="100%" stopColor="#030805" />
            </linearGradient>
          </defs>
          {/* Chassis */}
          <rect
            x="2"
            y="3"
            width="20"
            height="18"
            rx="3"
            fill="url(#termBg)"
            stroke="url(#termGrad)"
            strokeWidth="1.4"
          />
          {/* Top title rail */}
          <line x1="2" y1="7.5" x2="22" y2="7.5" stroke="#00ff88" strokeWidth="0.8" opacity="0.4" />
          <circle cx="5" cy="5.2" r="0.9" fill="#00ff88" opacity="0.8" />
          <circle cx="7.8" cy="5.2" r="0.9" fill="#00f0ff" opacity="0.8" />
          {/* Prompt >_ */}
          <path
            d="M6 10.5L10 13.5L6 16.5"
            stroke="url(#termGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="12"
            y1="16.5"
            x2="17"
            y2="16.5"
            stroke="#00ff88"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    // ── 2. Files (Encrypted VFS Vault) ──
    case "files":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="filesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0077ff" />
            </linearGradient>
            <linearGradient id="filesBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#051522" />
              <stop offset="100%" stopColor="#020910" />
            </linearGradient>
          </defs>
          {/* Back flap */}
          <path
            d="M3 6.5C3 5.4 3.9 4.5 5 4.5H9.5L11.5 6.8H19C20.1 6.8 21 7.7 21 8.8V17.5C21 18.6 20.1 19.5 19 19.5H5C3.9 19.5 3 18.6 3 17.5V6.5Z"
            fill="url(#filesBg)"
            stroke="url(#filesGrad)"
            strokeWidth="1.3"
          />
          {/* Laser data track */}
          <path
            d="M3 10.5H21"
            stroke="#00f0ff"
            strokeWidth="0.9"
            strokeDasharray="2 1.5"
            opacity="0.8"
          />
          {/* Vault Core Lock */}
          <circle cx="12" cy="14.5" r="2.8" stroke="#00f0ff" strokeWidth="1.2" fill="#03101c" />
          <circle cx="12" cy="14.5" r="1.1" fill="#00f0ff" />
        </svg>
      );

    // ── 3. Web Browser (NetRunner Cyber Gateway) ──
    case "browser":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="browserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <radialGradient id="browserCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#030816" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          {/* Outer Globe */}
          <circle cx="12" cy="12" r="9" fill="url(#browserCore)" stroke="url(#browserGrad)" strokeWidth="1.4" />
          {/* Latitude Lines */}
          <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#00f0ff" strokeWidth="1" opacity="0.75" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />
          {/* Orbital Data Ring */}
          <path
            d="M2.5 8C6 3.5 18 3.5 21.5 8"
            stroke="#8b5cf6"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="19" cy="6.5" r="1.2" fill="#00f0ff" />
        </svg>
      );

    // ── 4. AURA AI (Neural Singularity Core) ──
    case "aura":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
            <radialGradient id="auraCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#1e0b36" />
            </radialGradient>
          </defs>
          {/* Diamond Neural Polyhedron */}
          <path
            d="M12 2L19.5 7.5V16.5L12 22L4.5 16.5V7.5L12 2Z"
            fill="#120524"
            stroke="url(#auraGrad)"
            strokeWidth="1.4"
          />
          {/* Internal Star Spark */}
          <path
            d="M12 5L13.5 10.5L19 12L13.5 13.5L12 19L10.5 13.5L5 12L10.5 10.5L12 5Z"
            fill="url(#auraCore)"
            opacity="0.9"
          />
          <circle cx="12" cy="12" r="1.8" fill="#ffffff" />
        </svg>
      );

    // ── 5. Sentinel SOC (Aegis Cyber Defense Shield) ──
    case "sentinel":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="sentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          {/* Aegis Shield */}
          <path
            d="M12 2.5L20 6V12.5C20 17 16.5 20.8 12 22C7.5 20.8 4 17 4 12.5V6L12 2.5Z"
            fill="#031525"
            stroke="url(#sentGrad)"
            strokeWidth="1.4"
          />
          {/* Inner Radar Target Grid */}
          <circle cx="12" cy="12" r="5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          <circle cx="12" cy="12" r="2.2" stroke="#00f0ff" strokeWidth="1.2" fill="#00f0ff" fillOpacity="0.25" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
        </svg>
      );

    // ── 6. Portfolio (Operative Dossier HUD) ──
    case "portfolio":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="portGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#041a12" stroke="url(#portGrad)" strokeWidth="1.4" />
          {/* Biometric Card Chip */}
          <rect x="5.5" y="7" width="5" height="4.5" rx="1" fill="#34d399" fillOpacity="0.3" stroke="#34d399" strokeWidth="1" />
          {/* Digital Telemetry Lines */}
          <line x1="12.5" y1="8" x2="18.5" y2="8" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12.5" y1="11" x2="16.5" y2="11" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="5.5" y1="15" x2="18.5" y2="15" stroke="#34d399" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.8" />
          <line x1="5.5" y1="17.5" x2="13.5" y2="17.5" stroke="#34d399" strokeWidth="1" opacity="0.5" />
        </svg>
      );

    // ── 7. GitHub (Cyber Octo-Titan Core) ──
    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="gitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            fill="#0f172a"
            stroke="url(#gitGrad)"
            strokeWidth="1.3"
          />
          {/* Cyber Optic Core Node */}
          <circle cx="12" cy="11.5" r="1.5" fill="#ff0055" />
        </svg>
      );

    // ── 8. Trash (Digital Incinerator / Shredder) ──
    case "trash":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="trashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path d="M4 6H20" stroke="url(#trashGrad)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 3H14" stroke="url(#trashGrad)" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M6 6L7.2 19.2C7.3 20.3 8.2 21.2 9.3 21.2H14.7C15.8 21.2 16.7 20.3 16.8 19.2L18 6"
            fill="#1c0f05"
            stroke="url(#trashGrad)"
            strokeWidth="1.4"
          />
          {/* Incinerator Laser Grill */}
          <line x1="10" y1="10" x2="10" y2="17" stroke="#fb923c" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="10" x2="14" y2="17" stroke="#fb923c" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    // ── 9. Threat Map (Global Cyber Warfare) ──
    case "threatmap":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0055" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.2" fill="#1e030a" stroke="url(#mapGrad)" strokeWidth="1.4" />
          <path d="M3 12H21" stroke="#ff0055" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.7" />
          <path d="M12 3V21" stroke="#ff0055" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.7" />
          {/* Ballistic arc and target crosshair */}
          <path d="M6 16C9 8 15 8 18 16" stroke="#ff4444" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="15" cy="9.5" r="1.8" fill="#ff0055" />
          <circle cx="15" cy="9.5" r="3.2" stroke="#ff0055" strokeWidth="0.8" opacity="0.6" />
        </svg>
      );

    // ── 10. Code Studio (Tactical Cyber IDE) ──
    case "codestudio":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"
            fill="#03111e"
            stroke="url(#codeGrad)"
            strokeWidth="1.4"
          />
          {/* Brackets < / > */}
          <path
            d="M9 9.5L6.5 12L9 14.5"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 9.5L17.5 12L15 14.5"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="13"
            y1="8.5"
            x2="11"
            y2="15.5"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    // ── 11. CodePad (NanoPad Scratchpad) ──
    case "codepad":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="padGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="4" y="3" width="16" height="18" rx="2.5" fill="#031622" stroke="url(#padGrad)" strokeWidth="1.4" />
          <line x1="8" y1="7.5" x2="16" y2="7.5" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="8" y1="11.5" x2="14" y2="11.5" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <line x1="8" y1="15.5" x2="16" y2="15.5" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
          <circle cx="16" cy="11.5" r="1.2" fill="#00f0ff" />
        </svg>
      );

    // ── 12. CyberChef (Quantum Cryptanalysis Engine) ──
    case "cyberchef":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="chefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9" fill="#1c0f04" stroke="url(#chefGrad)" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="5.2" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />
          {/* Keyhole and cipher nodes */}
          <path d="M12 9V13" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="14.8" r="1.1" fill="#f59e0b" />
          <circle cx="12" cy="4.5" r="1" fill="#f59e0b" />
          <circle cx="12" cy="19.5" r="1" fill="#f59e0b" />
          <circle cx="4.5" cy="12" r="1" fill="#f59e0b" />
          <circle cx="19.5" cy="12" r="1" fill="#f59e0b" />
        </svg>
      );

    // ── 13. Threat Modeler (Biometric Security Modeler) ──
    case "threatmodeler":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="tmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          {/* Padlock + Scan Shield */}
          <rect x="5" y="10" width="14" height="11" rx="2.5" fill="#20040b" stroke="url(#tmGrad)" strokeWidth="1.4" />
          <path d="M8 10V6.5C8 4.3 9.8 2.5 12 2.5C14.2 2.5 16 4.3 16 6.5V10" stroke="url(#tmGrad)" strokeWidth="1.5" />
          <circle cx="12" cy="15" r="1.8" fill="#fb7185" />
          <line x1="12" y1="16.8" x2="12" y2="18.5" stroke="#fb7185" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    // ── 14. Chess (Monix Grandmaster AI) ──
    case "chess":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="chessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* Cyber King Crown & Base */}
          <path
            d="M5 20H19M6.5 17H17.5M8 17L7 9L10.5 12L12 6L13.5 12L17 9L16 17H8Z"
            fill="#1c1602"
            stroke="url(#chessGrad)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Cross top */}
          <path d="M12 3V6M10.5 4.5H13.5" stroke="#fde047" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    // ── 15. CYKRYPT (Tactical CTF Arena) ──
    case "cykrypt":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="cykGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.2" fill="#1c0404" stroke="url(#cykGrad)" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="5.5" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 1.5" />
          <circle cx="12" cy="12" r="2.2" fill="#ef4444" />
          <line x1="12" y1="1.5" x2="12" y2="6.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="12" y1="17.5" x2="12" y2="22.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="1.5" y1="12" x2="6.5" y2="12" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="17.5" y1="12" x2="22.5" y2="12" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    // ── 16. Task Manager (Kernel Telemetry Monitor) ──
    case "taskmanager":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="3" y="3.5" width="18" height="17" rx="3" fill="#03161a" stroke="url(#taskGrad)" strokeWidth="1.4" />
          {/* Oscilloscope Waveform */}
          <path
            d="M4.5 13H8L10 8L12.5 16.5L14.5 11L16 13H19.5"
            stroke="#2dd4bf"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12.5" cy="16.5" r="1" fill="#00f0ff" />
        </svg>
      );

    // ── 17. Settings (Kernel Control Reactor) ──
    case "settings":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="setGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="8.5" fill="#0b0e24" stroke="url(#setGrad)" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="3.5" stroke="#818cf8" strokeWidth="1.3" fill="#1e1b4b" />
          <circle cx="12" cy="12" r="1.3" fill="#818cf8" />
          {/* 6 Turbine Teeth */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="2.2"
              x2="12"
              y2="4.5"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </svg>
      );

    // ── 18. MONIX-COMM (Satellite Quantum Channel) ──
    case "securecomm":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.2" fill="#021619" stroke="url(#commGrad)" strokeWidth="1.4" />
          {/* Signal wave arcs */}
          <path d="M7 9C9.5 6.5 14.5 6.5 17 9" stroke="#06b6d4" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 11.5C10.5 10 13.5 10 15 11.5" stroke="#06b6d4" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="12" cy="14.5" r="1.8" fill="#06b6d4" />
          <line x1="12" y1="16.5" x2="12" y2="19" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // ── 19. Classified Dossier (Black-Ops Intel) ──
    case "dossier":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="dosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
          </defs>
          <rect x="4" y="3" width="16" height="18" rx="2.5" fill="#1f0208" stroke="url(#dosGrad)" strokeWidth="1.4" />
          {/* Top Secret Badge Stamp */}
          <rect x="6.5" y="7" width="11" height="4.5" rx="1" fill="#e11d48" fillOpacity="0.25" stroke="#e11d48" strokeWidth="1" />
          <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="#e11d48" strokeWidth="1.3" opacity="0.8" />
          <line x1="7.5" y1="17" x2="13.5" y2="17" stroke="#e11d48" strokeWidth="1.3" opacity="0.6" />
          <circle cx="16.5" cy="9.2" r="0.9" fill="#ff0055" />
        </svg>
      );

    // ── 20. Wallpaper Picker (Holo-Display) ──
    case "wallpaperpicker":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect x="3" y="4" width="18" height="14" rx="2.5" fill="#19062b" stroke="url(#wallGrad)" strokeWidth="1.4" />
          {/* Mountains & Sun in cyber style */}
          <circle cx="8" cy="8.5" r="1.8" fill="#ec4899" />
          <path d="M4.5 15L9 10L14 15L16.5 12.5L19.5 15.5" stroke="#a855f7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="20.5" x2="16" y2="20.5" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // ── 21. Media Viewer (Holo-Playback) ──
    case "mediaviewer":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <rect x="3" y="3.5" width="18" height="17" rx="3" fill="#080e28" stroke="url(#medGrad)" strokeWidth="1.4" />
          <path d="M10 8L16 12L10 16V8Z" fill="#60a5fa" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round" />
          <line x1="3" y1="17.5" x2="21" y2="17.5" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.6" />
        </svg>
      );

    // ── 22. Red Team (Security Awareness & Offensive Simulator) ──
    case "redteam":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="redteamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="redteamCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L20 5.5V11.5C20 16.5 16.5 21 12 22.5C7.5 21 4 16.5 4 11.5V5.5L12 2Z"
            fill="#120407"
            stroke="url(#redteamGrad)"
            strokeWidth="1.3"
          />
          <circle cx="12" cy="11.5" r="5" stroke="#ef4444" strokeWidth="0.9" strokeDasharray="2 1.5" opacity="0.8" />
          <circle cx="12" cy="11.5" r="2.2" fill="url(#redteamCore)" />
          <line x1="12" y1="4.5" x2="12" y2="8" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="15" x2="12" y2="18.5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
          <line x1="5.5" y1="11.5" x2="9" y2="11.5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
          <line x1="15" y1="11.5" x2="18.5" y2="11.5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    // ── Fallback: Cyber Kali Hex Core ──
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          style={glowStyle}
        >
          <defs>
            <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L20 6.6V17.4L12 22L4 17.4V6.6L12 2Z"
            fill="#03121f"
            stroke="url(#defGrad)"
            strokeWidth="1.4"
          />
          <circle cx="12" cy="12" r="2.5" fill="#00f0ff" />
        </svg>
      );
  }
}
