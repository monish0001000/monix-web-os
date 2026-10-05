import { Suspense, lazy } from "react";
import WindowChrome from "./WindowChrome";

// Dynamically import the awareness-simulator App component from @awareness
const AwarenessApp = lazy(() => import("@awareness/App"));

interface RedTeamAppProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  onFocus: () => void;
  initialX?: number;
  initialY?: number;
  zIndex?: number;
}

export default function RedTeamApp({
  onClose,
  onMinimize,
  isActive,
  onFocus,
  initialX,
  initialY,
  zIndex,
}: RedTeamAppProps) {
  return (
    <WindowChrome
      title="PHISHGUARD — Cybersecurity Awareness Simulator"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      onFocus={onFocus}
      initialX={initialX ?? 40}
      initialY={initialY ?? 25}
      width={1360}
      height={840}
      zIndex={zIndex}
    >
      <div
        className="w-full h-full relative overflow-y-auto overflow-x-hidden bg-[#05070c] text-slate-300 font-sans custom-scrollbar select-text"
        style={{
          transform: "translate3d(0, 0, 0)",
          isolation: "isolate",
        }}
      >
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#050505] text-emerald-400 font-mono text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <div className="tracking-widest uppercase">INITIALIZING RED TEAM SIMULATOR...</div>
            </div>
          }
        >
          <AwarenessApp />
        </Suspense>
      </div>
    </WindowChrome>
  );
}
