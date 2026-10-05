import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  Users, 
  Bug, 
  Zap, 
  Terminal, 
  Activity, 
  Lock, 
  ChevronRight, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Fingerprint, 
  Keyboard, 
  Info, 
  ExternalLink, 
  Radio, 
  Play, 
  RefreshCw, 
  Search, 
  FileCode, 
  Network, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  ArrowUpRight, 
  Eye, 
  Sliders, 
  X, 
  ArrowRight, 
  Crosshair, 
  Mail, 
  BookOpen, 
  BarChart2, 
  Sun, 
  Laptop, 
  Check, 
  RadioTower, 
  KeyRound, 
  FileWarning 
} from 'lucide-react';

// Local Assets
import heroBgImg from './assets/hero-bg.png';
import socialBgImg from './assets/cards-bg/social-bg.png';
import malwareBgImg from './assets/cards-bg/malware-bg.png';
import ratsBgImg from './assets/cards-bg/rats-bg.png';
import vulnBgImg from './assets/cards-bg/vuln-bg.png';
import phishingBgImg from './assets/cards-bg/phishing-bg.png';

type DemoType = 'social' | 'malware' | 'rat';

export default function App() {
  const [activeNav, setActiveNav] = useState('Home');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoTab, setDemoTab] = useState<DemoType>('social');

  // Interactive Marker State on Hero graphic
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Social Engineering Simulation State
  const [phishStep, setPhishStep] = useState(0);
  const [isPhishRunning, setIsPhishRunning] = useState(false);
  const [capturedData, setCapturedData] = useState<{
    email: string;
    studentId: string;
    coords: string;
    ip: string;
    cameraFrame: boolean;
  } | null>(null);

  // Malware Simulation State
  const [malwareStep, setMalwareStep] = useState(0);
  const [isMalwareRunning, setIsMalwareRunning] = useState(false);
  const [malwareLogs, setMalwareLogs] = useState<string[]>([]);

  // RAT Simulation State
  const [ratCommand, setRatCommand] = useState('sysinfo');
  const [ratOutput, setRatOutput] = useState<string[]>([
    '[*] Connected to target RAT client (AES-256 session established)',
    '[*] Agent PID: 3840 (spooled as svchost.exe)',
    '[*] Ready for remote control command dispatch...'
  ]);
  const [keyStream] = useState<string>('kavitha_pass2024!#');

  // Live Threat Feed ticker
  const [threatEvents] = useState([
    { id: 1, time: '10:42', type: 'mail', text: 'Phishing email detected in training environment' },
    { id: 2, time: '10:38', type: 'bug', text: 'Malware file executed (demo environment)' },
    { id: 3, time: '10:31', type: 'alert', text: 'RAT connection attempt blocked' },
    { id: 4, time: '10:24', type: 'user', text: 'Suspicious login from unknown location' },
  ]);

  // Open demo modal with specific sub-module
  const openDemo = (type: DemoType = 'social') => {
    setDemoTab(type);
    setShowDemoModal(true);
  };

  // Run Social Engineering Demo
  const runSocialEngineeringDemo = () => {
    setIsPhishRunning(true);
    setPhishStep(1);
    setCapturedData(null);

    setTimeout(() => {
      setPhishStep(2);
    }, 1100);

    setTimeout(() => {
      setPhishStep(3);
    }, 2200);

    setTimeout(() => {
      setPhishStep(4);
      setCapturedData({
        email: 'kavitha.ramesh24@tndte.gov.in (Spoofed)',
        studentId: 'TN-ENG-2024-8841',
        coords: '13.0827° N, 80.2707° E (Chennai Sector)',
        ip: '49.37.142.18 (Jio Fiber)',
        cameraFrame: true,
      });
      setIsPhishRunning(false);
    }, 3500);
  };

  // Run Malware Execution Demo
  const runMalwareDemo = () => {
    setIsMalwareRunning(true);
    setMalwareStep(1);
    setMalwareLogs(['[+] Staging payload: win64_trojan_dropper.bin (Entropy: 7.92)']);

    setTimeout(() => {
      setMalwareStep(2);
      setMalwareLogs(prev => [
        ...prev,
        '[*] Bypassing AMSI via AmsiScanBuffer in-memory patch...',
        '[*] Resolving VirtualAllocEx in remote target process: svchost.exe'
      ]);
    }, 1200);

    setTimeout(() => {
      setMalwareStep(3);
      setMalwareLogs(prev => [
        ...prev,
        '[+] 8192 bytes injected into allocated PAGE_EXECUTE_READWRITE memory buffer',
        '[*] Executing CreateRemoteThread with shellcode payload entry'
      ]);
    }, 2400);

    setTimeout(() => {
      setMalwareStep(4);
      setMalwareLogs(prev => [
        ...prev,
        '[!] CRITICAL: Reverse TCP shell spawned -> Beacon callback to 198.51.100.42:443',
        '[!] Persistence key installed in HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
      ]);
      setIsMalwareRunning(false);
    }, 3800);
  };

  // Run RAT Remote Shell Command
  const runRatCmd = (cmd: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const out = [`[${timeStr}] rat_c2> ${cmd}`];

    if (cmd === 'sysinfo') {
      out.push('Hostname: VICTIM-WS-049');
      out.push('OS: Microsoft Windows 11 Enterprise (Build 22631 x64)');
      out.push('Memory: 16384 MB | CPU: Intel Core i7-13700H @ 3.40GHz');
      out.push('Current Identity: VICTIM-WS-049\\operator_kavitha');
    } else if (cmd === 'screengrab') {
      out.push('[+] Remote desktop frame captured (1920x1080 @ 32bpp)');
      out.push('[+] Stream synced with C2 display monitor.');
    } else if (cmd === 'webcam') {
      out.push('[+] Stealth camera stream active. Target face framed in buffer.');
    } else if (cmd === 'keylog') {
      out.push('[+] Real-time keystroke buffer hooked: "kavitha_pass2024!#"');
    } else if (cmd === 'hashdump') {
      out.push('[*] Dumping SAM hashes via Volume Shadow Copy...');
      out.push('Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::');
      out.push('operator_kavitha:1001:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::');
    } else {
      out.push(`Execution of "${cmd}" completed with exit code 0.`);
    }

    setRatOutput(prev => [...prev.slice(-12), ...out]);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-slate-100 font-sans antialiased selection:bg-[#FF0055] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* ── 1. Global Header (Navigation Bar) ── */}
      <header className="w-full border-b border-white/[0.07] bg-[#07090E]/95 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-10 py-3.5">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          {/* Left Position: Glowing crimson shield logo asset + PHISHGUARD */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF0055] to-rose-700 p-0.5 shadow-[0_0_18px_rgba(255,0,85,0.5)] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white fill-white/20" />
            </div>
            <div>
              <div className="flex items-center font-black text-base sm:text-lg tracking-wider leading-none">
                <span className="text-white">PHISH</span>
                <span className="text-[#FF0055]">GUARD</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                Think &bull; Detect &bull; Stay Safe
              </div>
            </div>
          </div>

          {/* Center Position: Horizontal minimalist menu links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            {[
              { name: 'Home', active: true },
              { name: 'Learn', active: false },
              { name: 'Simulations', active: false, action: () => openDemo('social') },
              { name: 'Threat Library', active: false },
              { name: 'Leaderboard', active: false },
              { name: 'About', active: false },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveNav(item.name);
                  if (item.action) item.action();
                }}
                className={`relative transition-colors cursor-pointer py-1 ${
                  activeNav === item.name ? 'text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
              >
                <span>{item.name}</span>
                {activeNav === item.name && (
                  <motion.div
                    layoutId="activeNavLine"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#FF0055] rounded-full shadow-[0_0_12px_#FF0055]"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Position: Search, theme toggle, Login, Get Started */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => openDemo('social')}
              className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white/40 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer bg-transparent"
            >
              Login
            </button>
            <button 
              onClick={() => openDemo('social')}
              className="px-5 py-2 rounded-full bg-[#FF0055] hover:bg-[#ff1a66] text-xs font-bold text-white shadow-[0_0_18px_rgba(255,0,85,0.5)] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container (Widescreen W-Full Layout) ── */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-10 py-6 space-y-8">
        
        {/* ================= 1. HERO SECTION (Cinematic Integrated Banner) ================= */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] bg-[#07090E] min-h-[500px] lg:min-h-[540px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          
          {/* Background Layer: hero-bg.png spanning the right half seamlessly */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[68%] pointer-events-none select-none overflow-hidden">
            <img 
              src={heroBgImg} 
              alt="Cyber Threat Actor Graphic Feature" 
              className="w-full h-full object-cover object-right"
            />
            {/* Smooth left-edge gradient overlay to blend into dark canvas behind text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 via-20% to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-[#07090E]/70 lg:hidden" />
          </div>

          {/* Interactive clickable overlay hot spots for the 3 HUD boxes in the artwork */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Social Engineering HUD box hotspot (left of hacker) */}
            <div 
              onClick={() => openDemo('social')}
              className="absolute top-[16%] left-[48%] w-[18%] h-[24%] pointer-events-auto cursor-pointer rounded-xl hover:ring-1 hover:ring-[#FF0055]/50 transition-all"
              title="Click to launch Social Engineering Simulation"
            />
            {/* Malware & RATs HUD box hotspot (top right) */}
            <div 
              onClick={() => openDemo('rat')}
              className="absolute top-[16%] right-[3%] w-[16%] h-[25%] pointer-events-auto cursor-pointer rounded-xl hover:ring-1 hover:ring-cyan-500/50 transition-all"
              title="Click to launch Malware & RATs Simulation"
            />
            {/* Vulnerabilities HUD box hotspot (bottom right) */}
            <div 
              onClick={() => openDemo('malware')}
              className="absolute bottom-[20%] right-[3%] w-[16%] h-[25%] pointer-events-auto cursor-pointer rounded-xl hover:ring-1 hover:ring-amber-500/50 transition-all"
              title="Click to launch Vulnerabilities Simulation"
            />
          </div>

          {/* Left Column: Text, Controls & Features */}
          <div className="relative z-10 max-w-xl lg:max-w-[540px] p-6 sm:p-10 lg:p-12 space-y-6">
            
            {/* Top Tag: Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#FF0055]/50 bg-black/50 backdrop-blur-sm text-[10px] font-mono tracking-widest text-slate-300 uppercase shadow-[0_0_10px_rgba(255,0,85,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-ping" />
              CYBERSECURITY AWARENESS SIMULATOR
            </div>

            {/* Primary Typography: Massive bold heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                Real Threats<span className="text-slate-400">.</span>
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#FF0055] tracking-tight leading-none drop-shadow-[0_0_25px_rgba(255,0,85,0.45)]">
                Real Learning<span className="text-[#FF0055]">.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md font-normal">
              Experience real-world attacks like Social Engineering, Malware, RATs and more &mdash; in a safe, controlled environment.<br className="hidden sm:inline" />
              Detect. Think. Stay Ahead.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button 
                onClick={() => openDemo('social')}
                className="px-6 py-2.5 rounded-full bg-[#FF0055] hover:bg-[#ff1a66] text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,0,85,0.45)] flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Start Simulation</span>
              </button>

              <button 
                onClick={() => openDemo('rat')}
                className="px-6 py-2.5 rounded-full bg-black/50 hover:bg-white/[0.08] border border-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-[#FF0055] fill-[#FF0055]" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Feature Row: 3 micro-columns with icons & text */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/[0.1]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight text-slate-300 font-medium">
                  Interactive<br /><span className="text-slate-400">Threat Scenarios</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight text-slate-300 font-medium">
                  Real-World<br /><span className="text-slate-400">Case Studies</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight text-slate-300 font-medium">
                  Track Your<br /><span className="text-slate-400">Progress</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= 2. "EXPLORE THREATS" SECTION (Expanded High-Fidelity Cards) ================= */}
        <section className="space-y-4 pt-1">
          
          {/* Header titled "Explore Threats" on left and "View All Scenarios →" on right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[#FF0055] font-black font-mono text-base sm:text-lg">//</span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Explore Threats
              </h2>
            </div>
            <button 
              onClick={() => openDemo('social')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group font-medium"
            >
              <span>View All Scenarios</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF0055] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Full-width responsive flex/grid containing 5 expanded modular cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            
            {/* Card 1: Social Engineering */}
            <div 
              onClick={() => openDemo('social')}
              className="group bg-[#0B0D14] hover:bg-[#0E1018] border border-white/[0.08] hover:border-[#FF0055]/50 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[290px] sm:min-h-[310px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_12px_35px_rgba(255,0,85,0.25)] hover:-translate-y-1"
            >
              {/* Expanded Card Unique Background Texture from assets/cards-bg/ */}
              <div className="absolute right-0 top-2 bottom-12 w-[62%] sm:w-[65%] pointer-events-none flex items-center justify-end select-none overflow-hidden">
                <img 
                  src={socialBgImg} 
                  alt="Social Engineering Background" 
                  className="w-full h-full object-contain object-right drop-shadow-[0_0_25px_rgba(255,0,85,0.35)] scale-110 group-hover:scale-120 transition-transform duration-500" 
                />
              </div>

              {/* Neon red outlined icon at the top */}
              <div className="w-11 h-11 rounded-xl bg-black/50 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055] mb-4 relative z-10 shadow-[0_0_15px_rgba(255,0,85,0.3)] group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>

              {/* Title, description, Start → */}
              <div className="relative z-10 mt-auto space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF0055] transition-colors leading-tight">
                  Social Engineering
                </h3>
                <p className="text-xs text-slate-300/80 leading-snug font-normal line-clamp-2">
                  Learn how attackers manipulate people, not just systems.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-[#FF0055] flex items-center justify-center text-[#FF0055] group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF0055] transition-colors">Start</span>
                </div>
              </div>
            </div>

            {/* Card 2: Malware */}
            <div 
              onClick={() => openDemo('malware')}
              className="group bg-[#0B0D14] hover:bg-[#0E1018] border border-white/[0.08] hover:border-[#FF0055]/50 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[290px] sm:min-h-[310px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_12px_35px_rgba(255,0,85,0.25)] hover:-translate-y-1"
            >
              <div className="absolute right-0 top-2 bottom-12 w-[62%] sm:w-[65%] pointer-events-none flex items-center justify-end select-none overflow-hidden">
                <img 
                  src={malwareBgImg} 
                  alt="Malware Background" 
                  className="w-full h-full object-contain object-right drop-shadow-[0_0_25px_rgba(255,0,85,0.35)] scale-110 group-hover:scale-120 transition-transform duration-500" 
                />
              </div>

              <div className="w-11 h-11 rounded-xl bg-black/50 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055] mb-4 relative z-10 shadow-[0_0_15px_rgba(255,0,85,0.3)] group-hover:scale-105 transition-transform">
                <Bug className="w-5 h-5" />
              </div>

              <div className="relative z-10 mt-auto space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF0055] transition-colors leading-tight">
                  Malware
                </h3>
                <p className="text-xs text-slate-300/80 leading-snug font-normal line-clamp-2">
                  Explore how malicious software infects and spreads.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-[#FF0055] flex items-center justify-center text-[#FF0055] group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF0055] transition-colors">Start</span>
                </div>
              </div>
            </div>

            {/* Card 3: RATs */}
            <div 
              onClick={() => openDemo('rat')}
              className="group bg-[#0B0D14] hover:bg-[#0E1018] border border-white/[0.08] hover:border-[#FF0055]/50 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[290px] sm:min-h-[310px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_12px_35px_rgba(255,0,85,0.25)] hover:-translate-y-1"
            >
              <div className="absolute right-0 top-2 bottom-12 w-[62%] sm:w-[65%] pointer-events-none flex items-center justify-end select-none overflow-hidden">
                <img 
                  src={ratsBgImg} 
                  alt="RATs Background" 
                  className="w-full h-full object-contain object-right drop-shadow-[0_0_25px_rgba(255,0,85,0.35)] scale-110 group-hover:scale-120 transition-transform duration-500" 
                />
              </div>

              <div className="w-11 h-11 rounded-xl bg-black/50 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055] mb-4 relative z-10 shadow-[0_0_15px_rgba(255,0,85,0.3)] group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>

              <div className="relative z-10 mt-auto space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF0055] transition-colors leading-tight">
                  RATs
                </h3>
                <p className="text-xs text-slate-300/80 leading-snug font-normal line-clamp-2">
                  See how Remote Access Trojans give attackers full control.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-[#FF0055] flex items-center justify-center text-[#FF0055] group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF0055] transition-colors">Start</span>
                </div>
              </div>
            </div>

            {/* Card 4: Vulnerabilities */}
            <div 
              onClick={() => openDemo('malware')}
              className="group bg-[#0B0D14] hover:bg-[#0E1018] border border-white/[0.08] hover:border-[#FF0055]/50 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[290px] sm:min-h-[310px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_12px_35px_rgba(255,0,85,0.25)] hover:-translate-y-1"
            >
              <div className="absolute right-0 top-2 bottom-12 w-[62%] sm:w-[65%] pointer-events-none flex items-center justify-end select-none overflow-hidden">
                <img 
                  src={vulnBgImg} 
                  alt="Vulnerabilities Background" 
                  className="w-full h-full object-contain object-right drop-shadow-[0_0_25px_rgba(255,0,85,0.35)] scale-110 group-hover:scale-120 transition-transform duration-500" 
                />
              </div>

              <div className="w-11 h-11 rounded-xl bg-black/50 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055] mb-4 relative z-10 shadow-[0_0_15px_rgba(255,0,85,0.3)] group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="relative z-10 mt-auto space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF0055] transition-colors leading-tight">
                  Vulnerabilities
                </h3>
                <p className="text-xs text-slate-300/80 leading-snug font-normal line-clamp-2">
                  Discover common weaknesses and how to exploit (and prevent) them.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-[#FF0055] flex items-center justify-center text-[#FF0055] group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF0055] transition-colors">Start</span>
                </div>
              </div>
            </div>

            {/* Card 5: Phishing & Beyond */}
            <div 
              onClick={() => openDemo('social')}
              className="group bg-[#0B0D14] hover:bg-[#0E1018] border border-white/[0.08] hover:border-[#FF0055]/50 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[290px] sm:min-h-[310px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_12px_35px_rgba(255,0,85,0.25)] hover:-translate-y-1"
            >
              <div className="absolute right-0 top-2 bottom-12 w-[62%] sm:w-[65%] pointer-events-none flex items-center justify-end select-none overflow-hidden">
                <img 
                  src={phishingBgImg} 
                  alt="Phishing & Beyond Background" 
                  className="w-full h-full object-contain object-right drop-shadow-[0_0_25px_rgba(255,0,85,0.35)] scale-110 group-hover:scale-120 transition-transform duration-500" 
                />
              </div>

              <div className="w-11 h-11 rounded-xl bg-black/50 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055] mb-4 relative z-10 shadow-[0_0_15px_rgba(255,0,85,0.3)] group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>

              <div className="relative z-10 mt-auto space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF0055] transition-colors leading-tight">
                  Phishing &amp; Beyond
                </h3>
                <p className="text-xs text-slate-300/80 leading-snug font-normal line-clamp-2">
                  From fake websites to deepfakes &mdash; explore modern attack techniques.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-[#FF0055] flex items-center justify-center text-[#FF0055] group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF0055] transition-colors">Start</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= 3. DASHBOARD DATA FOOTER GRID (Asymmetric 3-Column Layout) ================= */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
          
          {/* Left Column ("Your Security Journey"): Interactive horizontal stepper roadmap (1 to 4) */}
          <div className="md:col-span-5 bg-[#0B0D14] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-[#FF0055] font-black font-mono text-base">//</span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Your Security Journey
                </h3>
              </div>

              {/* Horizontal linear interactive stepper roadmap */}
              <div className="relative flex items-center justify-between px-2 pt-2">
                {/* Connecting track */}
                <div className="absolute top-6 left-8 right-8 h-[2px] bg-white/[0.1] -z-0">
                  {/* Glowing active progress bar between node 1 and 2 */}
                  <div className="h-full bg-[#FF0055] shadow-[0_0_10px_#FF0055] w-1/3" />
                </div>

                {/* Module 1: Learn */}
                <div className="flex flex-col items-center text-center relative z-10 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-[#FF0055] text-white font-black text-xs flex items-center justify-center shadow-[0_0_15px_#FF0055]">
                    1
                  </div>
                  <div className="text-xs font-bold text-white mt-2.5 group-hover:text-[#FF0055] transition-colors">Learn</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Understand the threat</div>
                </div>

                {/* Module 2: Simulate */}
                <div 
                  onClick={() => openDemo('social')}
                  className="flex flex-col items-center text-center relative z-10 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B0D14] border-2 border-[#FF0055] text-[#FF0055] font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(255,0,85,0.4)]">
                    2
                  </div>
                  <div className="text-xs font-bold text-white mt-2.5 group-hover:text-[#FF0055] transition-colors">Simulate</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Experience the attack</div>
                </div>

                {/* Module 3: Detect */}
                <div 
                  onClick={() => openDemo('malware')}
                  className="flex flex-col items-center text-center relative z-10 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B0D14] border border-white/20 text-slate-400 font-bold text-xs flex items-center justify-center group-hover:border-white/40 group-hover:text-white transition-all">
                    3
                  </div>
                  <div className="text-xs font-bold text-white mt-2.5 group-hover:text-[#FF0055] transition-colors">Detect</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Find the red flags</div>
                </div>

                {/* Module 4: Stay Safe */}
                <div className="flex flex-col items-center text-center relative z-10 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-[#0B0D14] border border-white/20 text-slate-400 font-bold text-xs flex items-center justify-center group-hover:border-white/40 group-hover:text-white transition-all">
                    4
                  </div>
                  <div className="text-xs font-bold text-white mt-2.5 group-hover:text-[#FF0055] transition-colors">Stay Safe</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Build real habits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column ("Live Threat Feed"): Real-time system log feed */}
          <div className="md:col-span-4 bg-[#0B0D14] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-ping" />
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    &bull; Live Threat Feed &bull;
                  </h3>
                </div>
                <button 
                  onClick={() => openDemo('social')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF0055]" />
                </button>
              </div>

              {/* Feed items */}
              <div className="space-y-2.5 font-sans">
                <div className="flex items-center gap-2.5 py-1 text-slate-300">
                  <span className="text-slate-500 font-mono text-xs w-11">10:42</span>
                  <Mail className="w-4 h-4 text-[#FF0055] shrink-0" />
                  <span className="text-xs text-slate-300 truncate">Phishing email detected in training environment</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 text-slate-300">
                  <span className="text-slate-500 font-mono text-xs w-11">10:38</span>
                  <Bug className="w-4 h-4 text-[#FF0055] shrink-0" />
                  <span className="text-xs text-slate-300 truncate">Malware file executed (demo environment)</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 text-slate-300">
                  <span className="text-slate-500 font-mono text-xs w-11">10:31</span>
                  <AlertTriangle className="w-4 h-4 text-[#FF0055] shrink-0" />
                  <span className="text-xs text-slate-300 truncate">RAT connection attempt blocked</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 text-slate-300">
                  <div className="flex items-center gap-1 font-mono text-xs text-slate-500 w-11">
                    <span>10:24</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  </div>
                  <Users className="w-4 h-4 text-[#FF0055] shrink-0" />
                  <span className="text-xs text-slate-300 truncate">Suspicious login from unknown location</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column ("Be a Safer You"): Metric profile card container with 3 stats */}
          <div className="md:col-span-3 bg-[#0B0D14] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Header with crimson shield */}
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Be a Safer You
                </h3>
                <div className="w-6 h-6 rounded-lg bg-[#FF0055]/20 border border-[#FF0055]/50 flex items-center justify-center text-[#FF0055] shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                  <Shield className="w-3.5 h-3.5 fill-[#FF0055]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cyber awareness is your strongest firewall.
              </p>

              {/* 3 Bold status figures matching reference screenshot */}
              <div className="grid grid-cols-3 gap-2 mt-5 text-left">
                <div>
                  <div className="text-xl font-extrabold text-white">50K+</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Learners</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">98%</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Threat Detection Rate</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">4.9/5</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">User Rating</div>
                </div>
              </div>

              {/* Italicized user testimonial quote at bottom with red underline */}
              <div className="mt-5 pt-3 border-t border-white/[0.08]">
                <p className="text-[10px] text-slate-300 italic leading-snug">
                  &ldquo;The best security system is a human who knows what to look for.&rdquo;
                </p>
                <div className="w-9 h-0.5 bg-[#FF0055] mt-2 shadow-[0_0_8px_#FF0055]" />
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* ── INTERACTIVE DEMO STUDIO MODAL (SOCIAL ENGINEERING, MALWARE, RAT) ── */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-5xl bg-[#090D18] border border-[#FF0055]/50 rounded-3xl shadow-[0_0_50px_rgba(255,0,85,0.3)] flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0C1222]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF0055]/20 border border-[#FF0055]/40 flex items-center justify-center text-[#FF0055]">
                    <Flame className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>RED TEAM ADVERSARY SIMULATOR // LIVE DEMO</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FF0055]/20 text-[#FF0055]">DEMO MODE</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Safe Sandbox Environment for Interactive Attack Awareness
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Demo Mode Sub-Tabs */}
              <div className="px-6 py-2.5 bg-[#070A12] border-b border-white/5 flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'social', label: '1. Social Engineering Demo', icon: Users, badge: 'Phishing Case Study' },
                  { id: 'malware', label: '2. Malware Sandbox Demo', icon: Bug, badge: 'Dropper & Injection' },
                  { id: 'rat', label: '3. RAT Console Demo', icon: Terminal, badge: 'Remote Access Trojan' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDemoTab(t.id as DemoType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      demoTab === t.id
                        ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {t.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* Modal Body / Tab Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                
                {/* ── TAB 1: SOCIAL ENGINEERING DEMO ── */}
                {demoTab === 'social' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0D1222] to-[#070A12] border border-[#FF0055]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0055]/20 text-[#FF0055] uppercase">
                          SPEAR PHISHING &amp; CREDENTIAL HARVEST
                        </span>
                        <h3 className="text-lg font-bold text-white font-mono mt-1">
                          The TN Government Laptop Scheme Deception
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          Watch how an authentic-looking student distribution portal bypasses victim skepticism to quietly extract credentials, GPS coordinates, and webcam footage.
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <button
                          onClick={runSocialEngineeringDemo}
                          disabled={isPhishRunning}
                          className="px-5 py-2.5 rounded-xl bg-[#FF0055] hover:bg-[#ff1a66] disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,85,0.4)] cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>{isPhishRunning ? `STAGE ${phishStep}/4 EXECUTING...` : 'TRIGGER PHISHING ATTACK'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulation Execution Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {[
                        { step: 1, title: '1. Spoofed Email Delivery', desc: 'Crafts fake TN Gov notification with urgent laptop claim link.' },
                        { step: 2, title: '2. Cloned Portal Opened', desc: 'Victim visits lookalike site and fills roll number & password.' },
                        { step: 3, title: '3. Sensor Snatching', desc: 'Silent browser canvas request extracts GPS & camera frame.' },
                        { step: 4, title: '4. C2 Data Exfiltration', desc: 'Credentials & telemetry transmitted to encrypted listener.' },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`p-3.5 rounded-xl border transition-all ${
                            phishStep >= s.step
                              ? 'bg-[#FF0055]/10 border-[#FF0055]/50 text-white shadow-[0_0_10px_rgba(255,0,85,0.2)]'
                              : 'bg-white/[0.02] border-white/10 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className={phishStep >= s.step ? 'text-[#FF0055]' : 'text-slate-500'}>
                              {s.title}
                            </span>
                            {phishStep >= s.step && <Check className="w-3.5 h-3.5 text-[#FF0055]" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Intercepted Data Dossier */}
                    {capturedData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-black/60 border border-[#FF0055]/40 space-y-3 font-mono"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#FF0055] border-b border-white/10 pb-2">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-[#FF0055] animate-bounce" />
                            INTERCEPTED VICTIM DOSSIER (SIMULATED TELEMETRY)
                          </span>
                          <span className="text-[10px] text-emerald-400">DATA TRANSMISSION CONFIRMED</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-white/5 space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Harvested Account</span>
                            <div className="text-white font-bold">{capturedData.email}</div>
                            <div className="text-[#FF0055]">Student Roll: {capturedData.studentId}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Geo Coordinates</span>
                            <div className="text-white font-bold">{capturedData.coords}</div>
                            <div className="text-slate-400">IP: {capturedData.ip}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Camera Sensor</span>
                            <div className="text-emerald-400 font-bold">640x480 Frame Infiltrated</div>
                            <div className="text-slate-400">Stealth buffer uploaded to C2</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── TAB 2: MALWARE SANDBOX DEMO ── */}
                {demoTab === 'malware' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0D1222] to-[#070A12] border border-[#FF0055]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 uppercase">
                          BINARY INJECTION &amp; PERSISTENCE
                        </span>
                        <h3 className="text-lg font-bold text-white font-mono mt-1">
                          Polymorphic Malware Dropper Execution
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          Step-by-step trace of how modern fileless and dropper payloads manipulate Windows system APIs (VirtualAllocEx, AMSI bypass) to execute stealth code.
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <button
                          onClick={runMalwareDemo}
                          disabled={isMalwareRunning}
                          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-black" />
                          <span>{isMalwareRunning ? `STAGE ${malwareStep}/4 RUNNING...` : 'EXECUTE IN SANDBOX'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                      {[
                        { step: 1, title: '1. Binary Unpack', desc: 'Decodes obfuscated XOR shellcode in memory.' },
                        { step: 2, title: '2. AMSI Bypass', desc: 'Patches AmsiScanBuffer in memory to evade EDR scans.' },
                        { step: 3, title: '3. Memory Injection', desc: 'VirtualAllocEx + WriteProcessMemory into svchost.exe.' },
                        { step: 4, title: '4. Persistence Trigger', desc: 'Installs Run registry key for automatic boot trigger.' },
                      ].map((m) => (
                        <div
                          key={m.step}
                          className={`p-3.5 rounded-xl border transition-all ${
                            malwareStep >= m.step
                              ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                              : 'bg-white/[0.02] border-white/10 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className={malwareStep >= m.step ? 'text-cyan-400' : 'text-slate-500'}>
                              {m.title}
                            </span>
                            {malwareStep >= m.step && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{m.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs space-y-1.5 h-44 overflow-y-auto custom-scrollbar">
                      <div className="text-slate-500">[*] Malware Dynamic Analysis Sandbox v2.4 initialized.</div>
                      {malwareLogs.map((log, i) => (
                        <div key={i} className={log.includes('CRITICAL') ? 'text-[#FF0055] font-bold' : log.includes('injected') ? 'text-emerald-400' : 'text-cyan-300'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: RAT CONSOLE DEMO ── */}
                {demoTab === 'rat' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0D1222] to-[#070A12] border border-[#FF0055]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 uppercase">
                          REMOTE ACCESS TROJAN &amp; COMMAND CONTROL
                        </span>
                        <h3 className="text-lg font-bold text-white font-mono mt-1">
                          Interactive RAT Controller &amp; Telemetry Console
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          Demonstrates how an active Remote Access Trojan allows adversaries to execute system commands, stream keystrokes in real-time, and grab live screen snapshots.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {['sysinfo', 'screengrab', 'keylog', 'webcam', 'hashdump'].map((cmd) => (
                          <button
                            key={cmd}
                            onClick={() => runRatCmd(cmd)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-purple-500/30 hover:text-purple-300 text-slate-200 border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
                          >
                            {cmd}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-black/80 border border-purple-500/30 font-mono text-xs space-y-2 h-64 flex flex-col justify-between">
                        <div className="overflow-y-auto space-y-1 custom-scrollbar flex-1">
                          {ratOutput.map((l, idx) => (
                            <div key={idx} className={l.startsWith('[*]') ? 'text-slate-400' : l.startsWith('[+]') ? 'text-emerald-400 font-bold' : l.includes('rat_c2>') ? 'text-purple-400 font-bold' : 'text-slate-300'}>
                              {l}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <span className="text-purple-400 font-bold">rat&gt;</span>
                          <input
                            type="text"
                            value={ratCommand}
                            onChange={(e) => setRatCommand(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && ratCommand.trim()) {
                                runRatCmd(ratCommand.trim());
                                setRatCommand('');
                              }
                            }}
                            placeholder="Enter RAT command (e.g. sysinfo, hashdump, screengrab)..."
                            className="w-full bg-transparent border-none outline-none text-white text-xs font-mono"
                          />
                          <button
                            onClick={() => {
                              if (ratCommand.trim()) {
                                runRatCmd(ratCommand.trim());
                                setRatCommand('');
                              }
                            }}
                            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                          >
                            RUN
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-[#0C1220] border border-white/10 font-mono text-xs space-y-2">
                          <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                            <span className="text-[#FF0055] font-bold flex items-center gap-1.5">
                              <Keyboard className="w-3.5 h-3.5" />
                              Live Keylogger Intercept Feed
                            </span>
                            <span className="text-[10px] text-emerald-400 animate-pulse">RECORDING</span>
                          </div>
                          <div className="p-3 rounded-lg bg-black/60 text-slate-300 font-mono text-xs">
                            <span className="text-slate-500">Key Buffer: </span>
                            <span className="text-[#FF0055] font-bold">{keyStream}</span>
                            <span className="animate-ping text-white">_</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0C1220] border border-white/10 font-mono text-xs space-y-2">
                          <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5" />
                              Remote Victim Desktop Preview
                            </span>
                            <span className="text-[10px] text-slate-500">VICTIM-WS-049</span>
                          </div>
                          <div className="h-24 rounded-lg bg-black/60 flex items-center justify-center border border-white/5 relative overflow-hidden">
                            <div className="text-center space-y-1">
                              <div className="text-[11px] text-slate-400">Desktop Stream Latency: 18ms</div>
                              <div className="text-[10px] text-emerald-400 font-bold">1920x1080 Full HD [AES-256 ENCRYPTED]</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-white/10 bg-[#070B15] flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#FF0055]" />
                  <span>PHISHGUARD DEFENSE LAB // AWARENESS TRAINING ONLY</span>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="w-full px-6 py-4 border-t border-white/[0.06] bg-[#0B0C10] text-center text-xs text-slate-500 font-medium">
        PHISHGUARD CYBERSECURITY AWARENESS SIMULATOR &bull; MONIX WEB OS &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
