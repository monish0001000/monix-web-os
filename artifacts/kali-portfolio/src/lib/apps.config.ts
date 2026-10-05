export interface OSAppConfig {
  id: string;
  name: string;
  displayName: string;
  launchPath: string;
  category: "security" | "dev" | "system" | "intel";
  icon: string;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  defaultMaximized?: boolean;
}

export const MONIX_APP_REGISTRY: Record<string, OSAppConfig> = {
  redteam: {
    id: "redteam",
    name: "Red Team Awareness Simulator",
    displayName: "Red Team",
    launchPath: "awareness-simulator",
    category: "security",
    icon: "redteam",
    description: "High-fidelity simulation environment to analyze psychological exploitation, phishing vectors, and offensive maneuvers.",
    defaultWidth: 1180,
    defaultHeight: 740,
    minWidth: 480,
    minHeight: 360,
    defaultMaximized: false,
  },
  terminal: {
    id: "terminal",
    name: "Root Terminal",
    displayName: "Root Terminal",
    launchPath: "src/components/Terminal.tsx",
    category: "security",
    icon: "terminal",
    description: "Zsh / Bash Root Shell Environment",
    defaultWidth: 780,
    defaultHeight: 480,
  },
  sentinel: {
    id: "sentinel",
    name: "Sentinel SOC",
    displayName: "Sentinel SOC",
    launchPath: "src/components/SentinelApp.tsx",
    category: "security",
    icon: "sentinel",
    description: "Enterprise SIEM & Cyber Defense Command Center",
    defaultWidth: 1120,
    defaultHeight: 680,
  },
  threatmap: {
    id: "threatmap",
    name: "Cyber Threat Map",
    displayName: "Threat Map",
    launchPath: "src/components/ThreatMapApp.tsx",
    category: "security",
    icon: "threatmap",
    description: "Live Global Cyber Attack Radar & Ballistic Telemetry",
    defaultWidth: 1140,
    defaultHeight: 700,
  },
  cykrypt: {
    id: "cykrypt",
    name: "CYKRYPT CTF",
    displayName: "CYKRYPT",
    launchPath: "src/components/CykryptApp.tsx",
    category: "security",
    icon: "cykrypt",
    description: "Offensive Security CTF Arena & Exploitation Sandbox",
    defaultWidth: 1040,
    defaultHeight: 660,
  },
  threatmodeler: {
    id: "threatmodeler",
    name: "Threat Modeler",
    displayName: "Threat Modeler",
    launchPath: "src/components/ThreatModelerApp.tsx",
    category: "security",
    icon: "threatmodeler",
    description: "STRIDE Threat Modeling & Diagramming Surface",
    defaultWidth: 1100,
    defaultHeight: 680,
  },
  cyberchef: {
    id: "cyberchef",
    name: "CyberChef Forge",
    displayName: "CyberChef",
    launchPath: "src/components/CyberChefApp.tsx",
    category: "security",
    icon: "cyberchef",
    description: "Cryptographic Operations & Encoding Swiss Army Knife",
    defaultWidth: 1100,
    defaultHeight: 700,
  },
  browser: {
    id: "browser",
    name: "NetRunner Browser",
    displayName: "Browser",
    launchPath: "src/components/BrowserApp.tsx",
    category: "dev",
    icon: "browser",
    description: "High-Speed Native Quantum Orbital Web Browser",
    defaultWidth: 1080,
    defaultHeight: 680,
  },
  files: {
    id: "files",
    name: "VFS Vault",
    displayName: "Files",
    launchPath: "src/components/FileExplorer.tsx",
    category: "system",
    icon: "files",
    description: "Supabase-Backed Virtual File System & Cloud Drive",
    defaultWidth: 840,
    defaultHeight: 520,
  },
  aura: {
    id: "aura",
    name: "AURA Neural AI",
    displayName: "AURA AI",
    launchPath: "src/components/AuraApp.tsx",
    category: "system",
    icon: "aura",
    description: "Autonomous Quantum Neural Assistant with Voice Core",
    defaultWidth: 920,
    defaultHeight: 620,
  },
  taskmanager: {
    id: "taskmanager",
    name: "Kernel Monitor",
    displayName: "Task Manager",
    launchPath: "src/components/TaskManagerApp.tsx",
    category: "system",
    icon: "taskmanager",
    description: "System Telemetry, Process Management & Resource Gauges",
    defaultWidth: 820,
    defaultHeight: 500,
  },
  settings: {
    id: "settings",
    name: "Kernel Settings",
    displayName: "Settings",
    launchPath: "src/components/SettingsApp.tsx",
    category: "system",
    icon: "settings",
    description: "System Overdrive, Appearance & Configuration",
    defaultWidth: 780,
    defaultHeight: 520,
  },
};

export function getAppConfig(appId: string): OSAppConfig | undefined {
  return MONIX_APP_REGISTRY[appId];
}
