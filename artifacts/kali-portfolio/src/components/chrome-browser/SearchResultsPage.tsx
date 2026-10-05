import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Sparkles, ChevronDown, ChevronUp, ExternalLink, Globe,
  Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown, ArrowRight,
  BookOpen, Code, Shield, Cpu, RefreshCw, X, Layers, SlidersHorizontal,
  Compass, Share2, HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import {
  executeUnifiedSearch,
  UnifiedSearchResults,
  SearchSource,
  OrganicSearchResult,
  PeopleAlsoAskItem
} from './searchService';

interface SearchResultsPageProps {
  initialQuery: string;
  onNavigate: (url: string) => void;
  onAskAI?: (prompt: string) => void;
}

export function SearchResultsPage({
  initialQuery,
  onNavigate,
  onAskAI,
}: SearchResultsPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'news' | 'code' | 'tools'>('all');

  // Search Results State
  const [searchData, setSearchData] = useState<UnifiedSearchResults | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [openPaaId, setOpenPaaId] = useState<string | null>('paa-1');

  // Interactive feedback & tools
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialQuery
  useEffect(() => {
    setQuery(initialQuery);
    setSearchInput(initialQuery);
  }, [initialQuery]);

  // Execute Live Google & Web Search
  useEffect(() => {
    let isCancelled = false;
    const currentQ = query.trim();
    if (!currentQ) return;

    setIsAiLoading(true);
    setUserRating(null);

    // Stop previous speech if any
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Execute authentic live search with Google AI Overview
    executeUnifiedSearch(currentQ)
      .then((fullResults) => {
        if (!isCancelled) {
          setSearchData(fullResults);
          setIsAiLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('[SearchResultsPage] Search error:', err);
          setIsAiLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [query]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    setQuery(clean);
  };

  // Text-To-Speech handler
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (searchData?.aiOverview?.content) {
      // Strip markdown syntax for natural reading
      const plainText = searchData.aiOverview.content.replace(/[#*`_\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy AI Overview
  const handleCopyOverview = () => {
    if (!searchData?.aiOverview?.content) return;
    navigator.clipboard.writeText(searchData.aiOverview.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#12131a] text-gray-100 flex flex-col overflow-y-auto overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 scroll-smooth"
    >
      {/* ── Top Google / SGE Style Search Header ── */}
      <header className="sticky top-0 z-40 bg-[#12131a]/95 backdrop-blur-md border-b border-white/[0.07] px-4 sm:px-8 pt-4 pb-0 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          {/* Logo */}
          <div
            onClick={() => onNavigate('chrome://newtab')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            title="Monix Search Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Monix
              </span>
              <span className="text-xs font-semibold text-cyan-400/80 ml-1 tracking-wider uppercase">
                Search
              </span>
            </div>
          </div>

          {/* Omnibox / Integrated Top Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 w-full max-w-2xl relative flex items-center bg-[#1c1e28] hover:bg-[#222432] focus-within:bg-[#222432] border border-cyan-500/25 focus-within:border-cyan-400 rounded-full px-4 py-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.06)]"
          >
            <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-400 outline-none font-sans min-w-0"
              placeholder="Search or ask anything..."
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="p-1 text-gray-400 hover:text-white mr-1"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button
              type="button"
              onClick={() => onAskAI?.(searchInput || query)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all ml-1 shrink-0"
              title="Open Aura AI Chat Companion"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Ask Aura</span>
            </button>
          </form>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 text-xs text-gray-400">
            <button
              onClick={() => onNavigate(`https://www.google.com/search?igu=1&hl=en&q=${encodeURIComponent(query)}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer"
              title="Open real Google search page"
            >
              <span className="hidden sm:inline">Open in</span>
              <span>Google.com</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE INDEX
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-1 sm:gap-6 mt-3 text-xs sm:text-sm overflow-x-auto no-scrollbar border-t border-white/[0.05] pt-1">
          {[
            { id: 'all', label: 'All', icon: Search },
            { id: 'images', label: 'Images', icon: Globe },
            { id: 'videos', label: 'Videos', icon: BookOpen },
            { id: 'news', label: 'News', icon: Compass },
            { id: 'code', label: 'Code & Repos', icon: Code },
            { id: 'tools', label: 'Security Tools', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "border-cyan-400 text-cyan-300 shadow-[0_1px_0_rgba(0,240,255,1)]"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-cyan-400" : "text-gray-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-5 flex-1">
        {/* Results Metadata Bar */}
        <div className="text-[12px] text-gray-400 mb-4 flex items-center justify-between">
          <div>
            About {searchData?.totalEstimatedResults.toLocaleString() || '1,420,000'} results (
            {searchData?.searchTimeSec || '0.24'} seconds) &bull; Verified Google &amp; Web Index
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-cyan-400/80">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Google Live Grounding</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Primary Results Column & Desktop Knowledge Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Results Column */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 1. PRIMARY FOLD: GOOGLE AI OVERVIEW SECTION                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section
              aria-label="Google AI Overview"
              className={cn(
                "relative rounded-2xl border transition-all overflow-hidden",
                "bg-gradient-to-br from-[#1a1c27]/95 via-[#161822]/95 to-[#1c192c]/95",
                "border-cyan-500/35 shadow-[0_4px_35px_rgba(0,240,255,0.08)]",
                "hover:border-cyan-400/50"
              )}
            >
              {/* Top Accent Gradient Line (Google colors) */}
              <div className="h-[2.5px] w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

              {/* AI Card Header */}
              <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#google-sparkle-grad)" />
                      <defs>
                        <linearGradient id="google-sparkle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#4285F4"/>
                          <stop offset="0.33" stopColor="#EA4335"/>
                          <stop offset="0.66" stopColor="#FBBC05"/>
                          <stop offset="1" stopColor="#34A853"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                        <span>AI Overview</span>
                      </h2>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-700/50 text-blue-300">
                        Google Search AI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model badge & Collapse Toggle */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-gray-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.05]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-0.5" />
                    {searchData?.aiOverview?.modelUsed || 'Google AI Overview (Gemini)'}
                    {searchData?.aiOverview?.latencyMs ? ` • ${searchData.aiOverview.latencyMs}ms` : ''}
                  </span>

                  <button
                    onClick={() => setAiExpanded(!aiExpanded)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    title={aiExpanded ? "Collapse AI Overview" : "Expand AI Overview"}
                  >
                    {aiExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* AI Card Body */}
              {aiExpanded && (
                <div className="p-4 sm:p-6 pt-4 flex flex-col gap-4">
                  {/* Synthesis Text / Stream */}
                  {isAiLoading && !searchData?.aiOverview?.content ? (
                    <div className="space-y-3 py-2 animate-pulse">
                      <div className="flex items-center gap-2 text-xs text-cyan-300/80 mb-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Synthesizing multi-source overview in real time...</span>
                      </div>
                      <div className="h-4 bg-white/10 rounded-md w-full" />
                      <div className="h-4 bg-white/10 rounded-md w-11/12" />
                      <div className="h-4 bg-white/10 rounded-md w-4/5" />
                      <div className="h-4 bg-white/10 rounded-md w-9/12" />
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed text-gray-200">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-3 mb-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-cyan-300 mt-3 mb-1.5" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-sky-300 mt-2.5 mb-1" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2.5 text-gray-200" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-300" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-300" {...props} />,
                          li: ({ node, ...props }) => <li className="text-gray-200" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-white bg-cyan-950/30 px-1 py-0.5 rounded text-cyan-200" {...props} />,
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match && typeof children === 'string' && !children.includes('\n');
                            if (isInline) {
                              return (
                                <code className="bg-[#242738] text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs border border-cyan-500/20" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            const codeString = String(children).replace(/\n$/, '');
                            const codeKey = `code-${codeString.slice(0, 15)}`;
                            return (
                              <div className="relative my-3 rounded-xl overflow-hidden border border-cyan-500/20 bg-[#12131a]">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#181a24] border-b border-white/[0.05] text-[11px] font-mono text-gray-400">
                                  <span>{match ? match[1] : 'code'}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(codeString);
                                      setCopiedCodeId(codeKey);
                                      setTimeout(() => setCopiedCodeId(null), 2000);
                                    }}
                                    className="flex items-center gap-1 text-gray-300 hover:text-white"
                                  >
                                    {copiedCodeId === codeKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedCodeId === codeKey ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <pre className="p-3 text-xs font-mono text-gray-200 overflow-x-auto bg-[#101118]">
                                  <code>{children}</code>
                                </pre>
                              </div>
                            );
                          },
                        }}
                      >
                        {searchData?.aiOverview?.content || ''}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* EXPANDABLE DROPDOWN LAYER FOR SOURCE ATTRIBUTIONS         */}
                  {/* ───────────────────────────────────────────────────────── */}
                  <div className="mt-2 pt-3 border-t border-white/[0.06]">
                    <button
                      onClick={() => setSourcesOpen(!sourcesOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] transition-all text-xs text-gray-300 group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-medium text-gray-200">
                          Sources & Reference Grounding
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 text-[10px] font-mono border border-cyan-700/40">
                          {searchData?.aiOverview?.sources?.length || 4} verified
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 group-hover:text-cyan-300 font-medium">
                        <span>{sourcesOpen ? 'Hide sources' : 'Show sources'}</span>
                        {sourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Expandable Sources Drawer */}
                    {sourcesOpen && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchData?.aiOverview?.sources?.map((source) => (
                          <div
                            key={source.id}
                            onClick={() => onNavigate(source.url)}
                            className="p-3 rounded-xl bg-[#1d202d] hover:bg-[#252839] border border-white/[0.06] hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  {source.favicon ? (
                                    <img src={source.favicon} alt="" className="w-3 h-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                  ) : (
                                    <Globe className="w-3 h-3 text-cyan-400" />
                                  )}
                                </div>
                                <span className="text-[11px] font-mono text-cyan-300 truncate">
                                  {source.domain}
                                </span>
                              </div>
                              <h4 className="text-xs font-medium text-gray-100 group-hover:text-cyan-300 line-clamp-1">
                                {source.title}
                              </h4>
                              <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-normal">
                                {source.snippet}
                              </p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-gray-400 group-hover:text-cyan-400">
                              <span>Open in Browser</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Response Action Tools Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={handleCopyOverview}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
                        title="Copy synthesis to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={handleToggleSpeech}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors",
                          isSpeaking ? "bg-cyan-500/20 text-cyan-300" : "hover:bg-white/[0.06] hover:text-white"
                        )}
                        title={isSpeaking ? "Stop speaking" : "Listen to summary"}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <div className="w-[1px] h-3 bg-white/10 mx-1" />

                      <button
                        onClick={() => setUserRating(userRating === 'up' ? null : 'up')}
                        className={cn(
                          "p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors",
                          userRating === 'up' ? "text-cyan-400 bg-cyan-500/10" : "text-gray-400 hover:text-white"
                        )}
                        title="Helpful overview"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setUserRating(userRating === 'down' ? null : 'down')}
                        className={cn(
                          "p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors",
                          userRating === 'down' ? "text-red-400 bg-red-500/10" : "text-gray-400 hover:text-white"
                        )}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Follow-up question trigger */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAskAI?.(`Elaborate in detail on: ${query}`)}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Ask follow-up in Aura</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 2. SECONDARY FOLD: ORGANIC WEB RESULTS SECTION             */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section aria-label="Web Results" className="flex flex-col gap-5 pt-2">
              {/* Organic Results List */}
              {searchData?.organicResults?.map((res, idx) => (
                <article
                  key={res.id || idx}
                  className="p-4 rounded-xl bg-[#161720]/60 hover:bg-[#1b1d28] border border-white/[0.04] hover:border-cyan-500/30 transition-all group"
                >
                  {/* Breadcrumb Path */}
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {res.favicon ? (
                        <img src={res.favicon} alt="" className="w-3.5 h-3.5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <Globe className="w-2.5 h-2.5 text-cyan-400" />
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-gray-300 truncate max-w-md">
                      {res.displayUrl}
                    </span>
                    {res.sourceName && (
                      <span className="text-[10px] text-cyan-400/80 font-semibold px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/30">
                        {res.sourceName}
                      </span>
                    )}
                  </div>

                  {/* Title Link */}
                  <h3 className="text-base sm:text-lg font-medium text-sky-400 group-hover:text-sky-300 transition-colors">
                    <button
                      onClick={() => onNavigate(res.url)}
                      className="text-left hover:underline focus:outline-none flex items-center gap-1.5"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 shrink-0" />
                    </button>
                  </h3>

                  {/* Snippet Description */}
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                    {res.date && (
                      <span className="text-gray-400 mr-1.5 font-mono text-xs">
                        {res.date} —
                      </span>
                    )}
                    {res.snippet}
                  </p>

                  {/* Sitelinks (Deep links for primary search authority) */}
                  {res.sitelinks && res.sitelinks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                      {res.sitelinks.map((sl, slIdx) => (
                        <div
                          key={slIdx}
                          onClick={() => onNavigate(sl.url)}
                          className="p-2 rounded-lg bg-white/[0.02] hover:bg-cyan-500/10 cursor-pointer transition-colors"
                        >
                          <div className="text-xs font-medium text-cyan-300 hover:underline">
                            {sl.title}
                          </div>
                          {sl.snippet && (
                            <div className="text-[11px] text-gray-400 truncate mt-0.5">
                              {sl.snippet}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* PEOPLE ALSO ASK (Accordion Questions)                      */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {searchData?.peopleAlsoAsk && searchData.peopleAlsoAsk.length > 0 && (
                <div className="my-2 p-4 rounded-xl bg-[#181a24] border border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>People Also Ask</span>
                  </h3>
                  <div className="divide-y divide-white/[0.05]">
                    {searchData.peopleAlsoAsk.map((item) => {
                      const isOpen = openPaaId === item.id;
                      return (
                        <div key={item.id} className="py-2.5">
                          <button
                            onClick={() => setOpenPaaId(isOpen ? null : item.id)}
                            className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-medium text-gray-200 hover:text-cyan-300 transition-colors"
                          >
                            <span>{item.question}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-cyan-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
                          </button>
                          {isOpen && (
                            <div className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed pl-2 border-l-2 border-cyan-500/50 animate-in fade-in duration-150">
                              <p>{item.answer}</p>
                              <div className="mt-2">
                                <button
                                  onClick={() => onNavigate(item.sourceUrl)}
                                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Source: {item.sourceTitle}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* RELATED SEARCHES                                          */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {searchData?.relatedSearches && searchData.relatedSearches.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-[#161720] border border-white/[0.05]">
                  <h3 className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-3">
                    Related Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchData.relatedSearches.map((term, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => {
                          setQuery(term);
                          setSearchInput(term);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f2230] hover:bg-cyan-500/20 border border-white/[0.06] hover:border-cyan-500/40 text-xs text-gray-200 hover:text-cyan-200 transition-all"
                      >
                        <Search className="w-3 h-3 text-cyan-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Bar */}
              <div className="flex items-center justify-center gap-2 py-8 border-t border-white/[0.05] mt-4">
                <span className="text-base font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent mr-4">
                  M o n i x
                </span>
                {[1, 2, 3, 4, 5].map((pageNum) => (
                  <button
                    key={pageNum}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all",
                      pageNum === 1
                        ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                        : "hover:bg-white/10 text-gray-300"
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-cyan-300 ml-2"
                >
                  Next &gt;
                </button>
              </div>
            </section>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* DESKTOP KNOWLEDGE GRAPH SIDEBAR CARD                       */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:flex flex-col gap-4">
            {searchData?.knowledgeGraph && (
              <div className="p-5 rounded-2xl bg-[#191b26] border border-white/[0.08] sticky top-28 shadow-xl">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>KNOWLEDGE GRAPH</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {searchData.knowledgeGraph.title}
                </h3>
                <div className="text-xs text-gray-400 mt-0.5">
                  {searchData.knowledgeGraph.subtitle}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mt-3 pt-3 border-t border-white/[0.06]">
                  {searchData.knowledgeGraph.description}
                </p>

                {/* Attributes Table */}
                <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                  {searchData.knowledgeGraph.attributes.map((attr, aIdx) => (
                    <div key={aIdx} className="flex justify-between items-start text-[11px] gap-2">
                      <span className="text-gray-400 font-mono shrink-0">{attr.label}</span>
                      <span className="text-gray-200 text-right font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                  {searchData.knowledgeGraph.wikipediaUrl && (
                    <button
                      onClick={() => onNavigate(searchData.knowledgeGraph!.wikipediaUrl!)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Wikipedia</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onAskAI?.(`Deep dive on ${searchData.knowledgeGraph!.title}`)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Aura Chat</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
