import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Volume2, VolumeX, Bell, BatteryCharging, Battery,
  Wifi, WifiOff, Power, Mic, MicOff,
} from "lucide-react";
import { useOSStore } from "@/lib/store";
import StartMenu from "./StartMenu";
import CyberAppIcon, { getCyberAppTheme } from "./CyberAppIcon";
import { playClickSound, playCyberPulseSound } from "@/utils/SoundEngine";
import homeLauncherLogo from "@/assets/home-launcher.png";

interface OpenWindowInfo {
  id: string;
  label: string;
  minimized: boolean;
}

interface TopPanelProps {
  openWindows: OpenWindowInfo[];
  onOpenWindow: (id: string) => void;
  onTaskbarClick: (id: string) => void;
  activeWindowId: string;
}

function FpsCounter() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animId = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = now;
      }
      animId.current = requestAnimationFrame(loop);
    };
    animId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId.current);
  }, []);

  const color = fps > 50 ? "#00ff88" : fps > 30 ? "#ffaa00" : fps > 0 ? "#ff4444" : "#00f0ff";
  const glow = fps > 50 ? "rgba(0,255,136,0.6)" : fps > 30 ? "rgba(255,170,0,0.6)" : "rgba(255,68,68,0.6)";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 5, height: "100%" }}
      title={`Actual FPS: ${fps}`}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${glow}`,
          animation: "fpsPulse 1s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          color,
          textShadow: `0 0 8px ${glow}`,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {fps > 0 ? `${fps} FPS` : "··· FPS"}
      </span>
    </div>
  );
}

type TrayPopover = "battery" | "network" | "sound" | "notifications" | null;

export default function TopPanel({ openWindows: _openWindows = [], onOpenWindow, onTaskbarClick, activeWindowId }: TopPanelProps) {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const isMobile = screenWidth < 768;
  const [showCalendar, setShowCalendar] = useState(false);
  const [trayPopover, setTrayPopover] = useState<TrayPopover>(null);
  const [showStartMenu, setShowStartMenu] = useState(false);

  // M Launcher button custom animation states
  const [isHomeActivating, setIsHomeActivating] = useState(false);
  const [shockwaves, setShockwaves] = useState<{ id: number }[]>([]);
  const [sparks, setSparks] = useState<{ id: number; angle: number; dist: number; color: string }[]>([]);

  // Battery state
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  // IP address state
  const [publicIp, setPublicIp] = useState<string | null>(null);

  const calRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const setLocked = useOSStore((s) => s.setLocked);
  const osVolume = useOSStore((s) => s.osVolume);
  const setOsVolume = useOSStore((s) => s.setOsVolume);
  const activeProcesses = useOSStore((s) => s.activeProcesses);
  const auraMuted      = useOSStore((s) => s.auraMuted);
  const toggleAuraMute = useOSStore((s) => s.toggleAuraMute);
  const manualWakeAura = useOSStore((s) => s.manualWakeAura);

  // Clock + network + screen size
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Real battery API
  useEffect(() => {
    let battery: any = null;
    const update = (b: any) => {
      setBatteryLevel(Math.round(b.level * 100));
      setIsCharging(b.charging);
    };
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        update(b);
        b.addEventListener("levelchange", () => update(b));
        b.addEventListener("chargingchange", () => update(b));
      }).catch(() => {});
    }
    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", () => {});
        battery.removeEventListener("chargingchange", () => {});
      }
    };
  }, []);

  // Real public IP
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setPublicIp(d.ip))
      .catch(() => setPublicIp(null));
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) setTrayPopover(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const btnClass = "flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 h-full px-2.5";

  const appLaunchers = [
    { id: "terminal", appId: "terminal", title: "Root Terminal (Kali Linux Core)" },
    { id: "browser",  appId: "browser",  title: "NetRunner Browser" },
    { id: "files",    appId: "files",    title: "VFS Cloud Vault" },
    { id: "sentinel", appId: "sentinel", title: "Sentinel SOC" },
    { id: "aura",     appId: "aura",     title: "AURA Neural AI" },
  ];

  const now = time;
  const monthName = format(now, "MMMM yyyy");
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const today = now.getDate();

  const toggleTray = (key: TrayPopover) => {
    setShowCalendar(false);
    setShowStartMenu(false);
    setTrayPopover((prev) => (prev === key ? null : key));
  };

  const handleLogoClick = () => {
    playCyberPulseSound();
    setIsHomeActivating(true);
    setTimeout(() => setIsHomeActivating(false), 550);

    // Shockwave pulse
    const swId = Date.now();
    setShockwaves((prev) => [...prev.slice(-2), { id: swId }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((sw) => sw.id !== swId));
    }, 750);

    // Radial particle burst
    const colors = ["#00f0ff", "#38bdf8", "#c084fc", "#e879f9", "#00ff88"];
    const newSparks = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      angle: (i / 16) * Math.PI * 2,
      dist: 34 + (i % 4) * 10,
      color: colors[i % colors.length],
    }));
    setSparks(newSparks);
    setTimeout(() => setSparks([]), 600);

    setTrayPopover(null);
    setShowCalendar(false);
    setShowStartMenu((v) => !v);
  };

  const popoverBase: React.CSSProperties = {
    position: "fixed",
    bottom: 48,
    background: "rgba(18, 18, 26, 0.97)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 14px",
    zIndex: 400,
    minWidth: 200,
    boxShadow: "0 -8px 32px rgba(0,0,0,0.9)",
    borderRadius: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "'Ubuntu', sans-serif",
  };

  // Battery color
  const battColor = batteryLevel > 40 ? "#6ee7a0" : batteryLevel > 20 ? "#f4c066" : "#f87171";

  return (
    <>
      <StartMenu
        open={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        onOpenWindow={(id) => { onOpenWindow(id); setShowStartMenu(false); }}
      />

      <div
        className="w-full h-full select-none font-sans flex items-stretch justify-between relative"
        style={{
          background: "linear-gradient(180deg, rgba(8, 12, 22, 0.95) 0%, rgba(3, 6, 12, 0.98) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(0, 240, 255, 0.3)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.85), 0 -1px 8px rgba(0, 240, 255, 0.2)",
        }}
      >
        {/* Holographic Top Laser Rail */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.6) 20%, rgba(168, 85, 247, 0.7) 50%, rgba(0, 240, 255, 0.6) 80%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* ── LEFT SECTION ── */}
        <div className="flex items-center h-full gap-0 z-20">

          {/* ── "M" Launcher Home Button with Steroid Kali Animation ── */}
          <div className="relative flex items-center h-full px-2">
            {/* Expanding Cybernetic Shockwave Rings */}
            <AnimatePresence>
              {shockwaves.map((sw) => (
                <motion.div
                  key={sw.id}
                  initial={{ scale: 0.5, opacity: 1, borderWidth: "2px" }}
                  animate={{ scale: 3.4, opacity: 0, borderWidth: "1px" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    borderColor: "#00f0ff",
                    borderStyle: "solid",
                    boxShadow: "0 0 20px #00f0ff, inset 0 0 10px #00f0ff",
                    pointerEvents: "none",
                    zIndex: 60,
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Cyber Radial Particle Sparks */}
            {sparks.map((spark) => (
              <motion.div
                key={spark.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(spark.angle) * spark.dist,
                  y: Math.sin(spark.angle) * spark.dist,
                  scale: 0.1,
                  opacity: 0,
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 3.5,
                  height: 3.5,
                  borderRadius: "50%",
                  background: spark.color,
                  boxShadow: `0 0 8px ${spark.color}`,
                  pointerEvents: "none",
                  zIndex: 61,
                }}
              />
            ))}

            {/* Kinetic "M" Home Button */}
            <motion.button
              onClick={handleLogoClick}
              title="MONIX Cyber Nexus (Kali Linux Launcher)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.90 }}
              animate={isHomeActivating ? {
                scale: [1, 0.86, 1.12, 1],
                filter: [
                  "brightness(1)",
                  "brightness(2.4) drop-shadow(0 0 18px #00f0ff)",
                  "brightness(1.5) drop-shadow(0 0 10px #c084fc)",
                  "brightness(1)",
                ],
              } : {}}
              transition={{ duration: 0.45 }}
              style={{
                width: 36,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showStartMenu
                  ? "linear-gradient(135deg, rgba(0, 240, 255, 0.28) 0%, rgba(168, 85, 247, 0.28) 100%)"
                  : "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.98) 100%)",
                border: showStartMenu
                  ? "1px solid rgba(0, 240, 255, 0.75)"
                  : "1px solid rgba(0, 240, 255, 0.25)",
                borderRadius: 7,
                boxShadow: showStartMenu
                  ? "0 0 24px rgba(0, 240, 255, 0.5), inset 0 0 12px rgba(0, 240, 255, 0.25)"
                  : "0 2px 10px rgba(0, 0, 0, 0.6)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Standalone Minimalist Monogram Asset */}
              <img
                src={homeLauncherLogo}
                alt="MONIX Home"
                style={{
                  width: 22,
                  height: 22,
                  objectFit: "contain",
                  filter: showStartMenu
                    ? "drop-shadow(0 0 8px #00f0ff) drop-shadow(0 0 14px #a855f7) brightness(1.2)"
                    : "drop-shadow(0 0 3px rgba(0, 240, 255, 0.5))",
                  transition: "filter 0.3s ease, transform 0.3s ease",
                }}
              />
            </motion.button>
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(0, 240, 255, 0.2)", marginLeft: 2 }} />

          {/* Quick Launchers — Clean default state with high-intensity hover-only glow */}
          <div className="flex items-center h-full px-1 gap-1">
            {appLaunchers.map((launcher) => {
              const theme = getCyberAppTheme(launcher.appId);
              return (
                <button
                  key={launcher.id}
                  className="flex items-center justify-center cursor-pointer transition-all duration-200 h-full px-2 relative group hover:bg-white/5"
                  title={launcher.title}
                  onClick={() => {
                    playClickSound();
                    setShowStartMenu(false);
                    onOpenWindow(launcher.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    borderRadius: 4,
                  }}
                >
                  <div
                    className="p-1 rounded transition-all duration-200 group-hover:scale-115 group-hover:brightness-125"
                    style={{
                      transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = `drop-shadow(0 0 8px ${theme.color}) drop-shadow(0 0 16px ${theme.color}aa)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "none";
                    }}
                  >
                    <CyberAppIcon appId={launcher.appId} size={17} glow={false} />
                  </div>
                  {/* Subtle glowing indicator dot on hover only */}
                  <div
                    className="absolute bottom-0.5 w-1.5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }}
                  />
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(0, 240, 255, 0.2)", marginLeft: 2 }} />

          {/* Tactical Workspace Switcher — hidden on mobile */}
          {!isMobile && (
            <div className="flex items-center h-full px-2 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    playClickSound();
                    setActiveWorkspace(n);
                  }}
                  title={`Switch to Sector 0${n}`}
                  style={{
                    width: 28,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9.5,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: 4,
                    border: activeWorkspace === n ? "1px solid #00f0ff" : "1px solid rgba(255, 255, 255, 0.08)",
                    background: activeWorkspace === n ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.02)",
                    color: activeWorkspace === n ? "#00f0ff" : "rgba(255, 255, 255, 0.45)",
                    boxShadow: activeWorkspace === n ? "0 0 10px rgba(0, 240, 255, 0.35), inset 0 0 4px rgba(0, 240, 255, 0.2)" : "none",
                    transition: "all 0.15s ease",
                    letterSpacing: "0.04em",
                  }}
                >
                  0{n}
                </button>
              ))}
            </div>
          )}

          {/* ── Active Process Tabs (Zustand-driven, High-Fidelity Neo-Cyberpunk) ── */}
          {activeProcesses.length > 0 && (
            <>
              <div style={{ width: 1, height: 22, background: "rgba(0, 240, 255, 0.2)", marginLeft: 2, marginRight: 2 }} />
              <div
                className="flex items-center h-full gap-1.5 px-1"
                style={{
                  flex: isMobile ? "1 1 0" : "0 1 auto",
                  maxWidth: isMobile ? "100%" : "calc(100vw - 520px)",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                } as React.CSSProperties}
              >
                <AnimatePresence initial={false}>
                  {activeProcesses.map((proc) => {
                    const isActive = activeWindowId === proc.id;
                    const isSuspended = proc.isMinimized;
                    const theme = getCyberAppTheme(proc.id);

                    return (
                      <motion.div
                        key={proc.id}
                        layout
                        initial={{ opacity: 0, scale: 0.88, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -6 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => {
                          playClickSound();
                          onTaskbarClick(proc.id);
                        }}
                        className="group"
                        title={`${proc.name} [${proc.pid}] — ${isSuspended ? "Suspended (Click to restore)" : isActive ? "Active (Click to minimize)" : "Running (Click to focus)"}`}
                        style={{
                          height: 32,
                          minWidth: isMobile ? 38 : 124,
                          maxWidth: isMobile ? 42 : 180,
                          padding: isMobile ? "0 6px" : "0 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          cursor: "pointer",
                          position: "relative",
                          borderRadius: "5px 5px 0 0",
                          background: isActive
                            ? `linear-gradient(180deg, ${theme.color}25 0%, rgba(10, 16, 28, 0.95) 100%)`
                            : isSuspended
                            ? "rgba(16, 20, 30, 0.65)"
                            : "rgba(255, 255, 255, 0.04)",
                          borderTop: isActive ? `1px solid ${theme.color}bb` : "1px solid rgba(255, 255, 255, 0.08)",
                          borderLeft: isActive ? `1px solid ${theme.color}66` : "1px solid rgba(255, 255, 255, 0.06)",
                          borderRight: isActive ? `1px solid ${theme.color}66` : "1px solid rgba(255, 255, 255, 0.06)",
                          borderBottom: "none",
                          boxShadow: isActive
                            ? `0 -2px 14px ${theme.color}35, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                            : "none",
                          backdropFilter: "blur(8px)",
                          userSelect: "none",
                          transition: "all 0.15s ease",
                          overflow: "hidden",
                          flexShrink: 0,
                          opacity: isSuspended ? 0.65 : 1,
                        }}
                      >
                        {/* Glowing Laser Rail on Top */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: isActive
                              ? `linear-gradient(90deg, transparent, ${theme.color}, transparent)`
                              : isSuspended
                              ? "linear-gradient(90deg, transparent, #f59e0b, transparent)"
                              : "transparent",
                            boxShadow: isActive ? `0 0 8px ${theme.color}` : "none",
                          }}
                        />

                        {/* High-Fidelity Neo-Cyberpunk Vector Icon */}
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CyberAppIcon appId={proc.id} size={16} glow={isActive} />
                        </div>

                        {/* App Title & PID (Desktop) */}
                        {!isMobile && (
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                                fontFamily: "'Ubuntu', 'Rajdhani', sans-serif",
                                letterSpacing: "0.02em",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.15,
                              }}
                            >
                              {proc.name}
                            </div>
                            <div
                              style={{
                                fontSize: 8.5,
                                color: isActive ? theme.color : "rgba(255, 255, 255, 0.35)",
                                fontFamily: "monospace",
                                letterSpacing: "0.06em",
                                lineHeight: 1,
                              }}
                            >
                              {isSuspended ? "SUSP" : proc.pid}
                            </div>
                          </div>
                        )}

                        {/* Status LED Indicator */}
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: isSuspended ? "#f59e0b" : isActive ? theme.color : "rgba(255, 255, 255, 0.3)",
                            boxShadow: isSuspended
                              ? "0 0 6px #f59e0b"
                              : isActive
                              ? `0 0 6px ${theme.color}`
                              : "none",
                          }}
                        />

                        {/* Direct Kill Button on Hover (Desktop) */}
                        {!isMobile && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              playClickSound();
                              useOSStore.getState().killProcess(proc.id);
                            }}
                            title="Terminate process"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              color: "rgba(255, 255, 255, 0.6)",
                              background: "rgba(255, 255, 255, 0.1)",
                              flexShrink: 0,
                              marginLeft: "auto",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#ff4444";
                              e.currentTarget.style.background = "rgba(255, 50, 50, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            ×
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: System Tray ── */}
        <div className="flex items-center h-full" ref={trayRef}>
          <style>{`
            @keyframes fpsPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.75); }
            }
          `}</style>

          {/* FPS counter — hidden on mobile */}
          {!isMobile && (
            <>
              <div className={btnClass} style={{ gap: 5 }} title="Real-time FPS">
                <FpsCounter />
              </div>
              <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)" }} />
            </>
          )}

          {/* Network / IP */}
          <div
            className={btnClass}
            style={{ position: "relative", background: trayPopover === "network" ? "rgba(255,255,255,0.12)" : undefined }}
            title="Network"
            onClick={() => toggleTray("network")}
          >
            {isOnline ? <Wifi size={15} color="#7ec8e3" /> : <WifiOff size={15} color="#f87171" />}
            {trayPopover === "network" && (
              <div style={{ ...popoverBase, right: 130 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: "#7ec8e3", fontSize: 13 }}>Network</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {isOnline ? <Wifi size={14} color="#7ec8e3" /> : <WifiOff size={14} color="#f87171" />}
                  <span style={{ fontWeight: 500, color: isOnline ? "#7ec8e3" : "#f87171" }}>
                    {isOnline ? "Connected" : "No connection"}
                  </span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                  {isOnline ? "Ethernet — 1000 Mbps" : "Cable unplugged"}
                </div>
                {publicIp && (
                  <div style={{ marginTop: 8, padding: "5px 8px", background: "rgba(126,200,227,0.08)", borderRadius: 5, fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>IP: </span>
                    <span style={{ color: "#7ec8e3", fontFamily: "monospace" }}>{publicIp}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sound / Volume */}
          <div
            className={btnClass}
            style={{ position: "relative", background: trayPopover === "sound" ? "rgba(255,255,255,0.12)" : undefined }}
            title={`Volume: ${osVolume}%`}
            onClick={() => toggleTray("sound")}
          >
            {osVolume === 0 ? <VolumeX size={15} color="rgba(255,255,255,0.5)" /> : <Volume2 size={15} color="rgba(255,255,255,0.8)" />}
            {trayPopover === "sound" && (
              <div style={{ ...popoverBase, right: 90 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
                  Sound — <span style={{ color: "#90bfff" }}>{osVolume}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <VolumeX size={13} color="rgba(255,255,255,0.4)" />
                  <input
                    type="range" min={0} max={100} value={osVolume}
                    onChange={(e) => setOsVolume(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#367BF0", cursor: "pointer" }}
                  />
                  <Volume2 size={13} color="rgba(255,255,255,0.4)" />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {[0, 25, 50, 75, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setOsVolume(v)}
                      style={{
                        flex: 1, padding: "3px 0", fontSize: 10,
                        background: osVolume === v ? "rgba(54,123,240,0.3)" : "rgba(255,255,255,0.06)",
                        border: osVolume === v ? "1px solid rgba(54,123,240,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 4, cursor: "pointer", color: osVolume === v ? "#90bfff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div
            className={btnClass}
            style={{ position: "relative", background: trayPopover === "notifications" ? "rgba(255,255,255,0.12)" : undefined }}
            title="Notifications"
            onClick={() => toggleTray("notifications")}
          >
            <Bell size={15} color="rgba(255,255,255,0.8)" />
            {trayPopover === "notifications" && (
              <div style={{ ...popoverBase, right: 55 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Notifications</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center", padding: "8px 0" }}>
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* Battery */}
          <div
            className={btnClass}
            style={{ position: "relative", background: trayPopover === "battery" ? "rgba(255,255,255,0.12)" : undefined }}
            title={`Battery: ${batteryLevel}%${isCharging ? " (Charging)" : ""}`}
            onClick={() => toggleTray("battery")}
          >
            {isCharging
              ? <BatteryCharging size={15} color={battColor} />
              : <Battery size={15} color={battColor} />
            }
            {trayPopover === "battery" && (
              <div style={{ ...popoverBase, right: 22 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: battColor, fontSize: 13 }}>Battery</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {isCharging
                    ? <BatteryCharging size={14} color={battColor} />
                    : <Battery size={14} color={battColor} />
                  }
                  <span style={{ color: battColor, fontWeight: 600 }}>
                    {batteryLevel}% — {isCharging ? "Charging ⚡" : "On battery"}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${batteryLevel}%`,
                    background: battColor,
                    borderRadius: 3,
                    transition: "width 0.4s",
                  }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "right" }}>
                  {batteryLevel}% remaining
                </div>
              </div>
            )}
          </div>

          {/* AURA Mute Toggle — single click mutes, double click manual wake */}
          <div
            className={btnClass}
            title={auraMuted ? "AURA Muted — click to unmute  |  double-click to force wake" : 'AURA Armed — click to mute  |  double-click to wake "Hey Buddy"'}
            onClick={() => toggleAuraMute()}
            onDoubleClick={(e) => { e.stopPropagation(); manualWakeAura(); }}
            style={{ position: "relative", userSelect: "none" }}
          >
            {auraMuted
              ? <MicOff size={14} color="rgba(255,100,100,0.8)" />
              : <Mic    size={14} color="rgba(0,240,255,0.85)"  style={{ filter: "drop-shadow(0 0 4px rgba(0,240,255,0.6))" }} />
            }
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)" }} />

          {/* Clock / Calendar */}
          <div
            className={btnClass}
            style={{
              position: "relative", paddingLeft: 12, paddingRight: 12,
              background: showCalendar ? "rgba(255,255,255,0.1)" : undefined,
            }}
            title="Calendar"
            onClick={() => { setTrayPopover(null); setShowStartMenu(false); setShowCalendar((v) => !v); }}
            ref={calRef}
          >
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 400, letterSpacing: "0.02em" }}>
              {isMobile ? format(time, "HH:mm") : format(time, "EEE HH:mm")}
            </span>

            {showCalendar && (
              <div
                style={{
                  position: "fixed", bottom: 54, right: 62,
                  background: "rgba(14,14,22,0.96)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 14, zIndex: 400, minWidth: 210,
                  boxShadow: "0 -12px 40px rgba(0,0,0,0.9)", borderRadius: 8,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 28, fontWeight: 200, color: "rgba(255,255,255,0.95)", lineHeight: 1, letterSpacing: "-1px" }}>
                    {format(now, "HH:mm")}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {format(now, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#90bfff", marginBottom: 10, fontWeight: 600 }}>
                  {monthName}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.35)", paddingBottom: 4, fontWeight: 600 }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today;
                    return (
                      <div key={day} style={{
                        textAlign: "center", fontSize: 11, padding: "3px 0", borderRadius: 4,
                        background: isToday ? "#367BF0" : "transparent",
                        color: isToday ? "#fff" : "rgba(255,255,255,0.7)",
                        fontWeight: isToday ? 700 : 400,
                        boxShadow: isToday ? "0 2px 8px rgba(54,123,240,0.4)" : "none",
                      }}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)" }} />

          {/* Lock / Power */}
          <div
            className={btnClass}
            style={{ paddingLeft: 8, paddingRight: 10 }}
            title="Lock Screen"
            onClick={() => { setShowStartMenu(false); setLocked(true); }}
          >
            <Power size={15} color="rgba(255,255,255,0.7)" />
          </div>
        </div>
      </div>
    </>
  );
}
