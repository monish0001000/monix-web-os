import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Sparkles, Mic, Camera, Plus, Settings, Grid, Menu,
  ExternalLink, Globe, RotateCw, ShieldCheck, Clock, Star,
  Trash2, Copy, Check, ArrowRight, BookOpen, Layers,
  Download, Folder, HardDrive, File
} from 'lucide-react';
import { Tab, HistoryEntry, Bookmark, Download as DownloadType } from './types';
import { cn } from '@/lib/utils';
import { queryAuraEngine } from '@/lib/AuraModelEngine';
import ReactMarkdown from 'react-markdown';
import { SearchResultsPage } from './SearchResultsPage';

interface Message {
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  latencyMs?: number;
}

interface BrowserContentProps {
  tab: Tab;
  onLoadComplete: () => void;
  onNavigate: (url: string) => void;
  onAskAI: (query: string) => void;
  onUpdateTitle?: (title: string, favicon?: string) => void;
  historyEntries?: HistoryEntry[];
  onClearHistory?: () => void;
  bookmarks?: Bookmark[];
  onAddBookmark?: (title: string, url: string) => void;
  onRemoveBookmark?: (id: string) => void;
  searchEngine?: 'google' | 'duckduckgo' | 'bing';
  onChangeSearchEngine?: (engine: 'google' | 'duckduckgo' | 'bing') => void;
  downloads?: DownloadType[];
  onDownload?: (url: string, filename?: string) => void;
  onDownloadSample?: (type?: 'pdf' | 'report' | 'image' | 'script') => void;
  onRemoveDownload?: (id: string) => void;
  onOpenDownloadsInFiles?: () => void;
}

const DEFAULT_SHORTCUTS = [
  { title: 'Google', url: 'https://www.google.com/?igu=1&hl=en', icon: 'https://www.google.com/favicon.ico' },
  { title: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Operating_system', icon: 'https://en.wikipedia.org/favicon.ico' },
  { title: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico' },
  { title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
  { title: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.reddit.com/favicon.ico' },
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'https://duckduckgo.com/favicon.ico' },
  { title: 'Aura AI', url: 'chrome://ai', icon: '' },
];

export function BrowserContent({
  tab,
  onLoadComplete,
  onNavigate,
  onAskAI,
  onUpdateTitle,
  historyEntries = [],
  onClearHistory,
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  searchEngine = 'google',
  onChangeSearchEngine,
  downloads = [],
  onDownload,
  onDownloadSample,
  onRemoveDownload,
  onOpenDownloadsInFiles,
}: BrowserContentProps) {
  const [query, setQuery] = useState('');
  const [downloadSearch, setDownloadSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcutTitle, setNewShortcutTitle] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem('monix_browser_shortcuts');
      return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isAIMode = tab.url === 'chrome://ai';
  const isSearchMode = !tab.url || tab.url === 'chrome://newtab';
  const isHistoryMode = tab.url === 'chrome://history';
  const isBookmarksMode = tab.url === 'chrome://bookmarks';
  const isSettingsMode = tab.url === 'chrome://settings';
  const isDownloadsMode = tab.url === 'chrome://downloads';

  // Save shortcuts
  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutTitle.trim() || !newShortcutUrl.trim()) return;
    let url = newShortcutUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('chrome://')) {
      url = `https://${url}`;
    }
    const updated = [...shortcuts, { title: newShortcutTitle.trim(), url, icon: '' }];
    setShortcuts(updated);
    try {
      localStorage.setItem('monix_browser_shortcuts', JSON.stringify(updated));
    } catch {}
    setNewShortcutTitle('');
    setNewShortcutUrl('');
    setShowAddShortcut(false);
  };

  // Scroll to bottom in AI Mode
  useEffect(() => {
    if (isAIMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isAIMode]);

  const onLoadCompleteRef = useRef(onLoadComplete);
  useEffect(() => {
    onLoadCompleteRef.current = onLoadComplete;
  }, [onLoadComplete]);

  // Handle iframe load - fast loading with zero artificial delay
  useEffect(() => {
    setIframeError(false);
    if (!tab.url || tab.url.startsWith('chrome://')) {
      setIframeLoading(false);
      onLoadCompleteRef.current?.();
      return;
    }

    setIframeLoading(true);

    // Fallback safety timeout (clears progress bar after 2.5s if onload doesn't fire)
    const timer = setTimeout(() => {
      setIframeLoading(false);
      onLoadCompleteRef.current?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [tab.url, tab.reloadKey]);

  // Listen for navigation and download messages from the proxy script inside the iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (event.data.type === 'monix-browser-ready') {
        setIframeLoading(false);
        onLoadCompleteRef.current?.();
      }
      if (event.data.type === 'monix-browser-title' && event.data.title) {
        onUpdateTitle?.(event.data.title);
      }
      if (event.data.type === 'monix-browser-navigate' && event.data.url) {
        onNavigate(event.data.url);
      }
      if (event.data.type === 'monix-browser-download' && event.data.url) {
        onDownload?.(event.data.url, event.data.filename);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onUpdateTitle, onDownload]);

  // AI Chat handler using Groq LPU AuraModelEngine
  const handleAskAIInternal = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setQuery('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.text
      }));

      const res = await queryAuraEngine(text, history, {
        model: 'auto',
        systemPrompt: "You are the Monix Web-OS intelligent browser companion. Assist the user with research, code generation, summarization, and deep web understanding with clear, elegant markdown formatting."
      });

      setMessages([
        ...newMessages,
        {
          role: 'model',
          text: res.content,
          modelUsed: res.modelUsed,
          latencyMs: res.latencyMs
        }
      ]);
    } catch (error: any) {
      console.error("[Chrome AI] Response error:", error);
      setMessages([
        ...newMessages,
        {
          role: 'model',
          text: `Neural channel error: ${error?.message || "Please check network connectivity."}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ── Render 1: New Tab / Search Mode ──
  if (isSearchMode) {
    return (
      <div
        className="flex flex-col items-center justify-between h-full relative select-none overflow-y-auto px-4 py-8"
        style={{
          background: 'linear-gradient(135deg, #110d18 0%, #1a1625 50%, #0d1117 100%)',
        }}
      >
        {/* Top Right Shortcuts */}
        <div className="w-full flex items-center justify-between max-w-4xl px-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full">
              MONIX SECURE BROWSER
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('chrome://ai')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Mode</span>
            </button>
            <button
              onClick={() => onNavigate('chrome://settings')}
              className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Search & Logo */}
        <div className="w-full max-w-2xl flex flex-col items-center my-auto py-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Monix
              </span>
              <span className="text-4xl sm:text-6xl font-light text-white/90">
                Web
              </span>
            </div>
            <p className="text-xs text-gray-400 tracking-wider">
              SANDBOXED BROWSING • FRAME-BLOCKER BYPASS • GOOGLE AI &amp; SEARCH INTEGRATED
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full relative flex items-center bg-[#1e2029] border border-cyan-500/30 hover:border-cyan-400 focus-within:border-cyan-400 rounded-2xl p-2 pl-4 shadow-[0_0_25px_rgba(0,240,255,0.15)] transition-all">
            <Search className="h-5 w-5 text-cyan-400 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm sm:text-base text-white placeholder-gray-400 min-w-0 font-sans"
              placeholder="Search the web with AI Overview or type a URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = query.trim();
                  if (!q) return;
                  if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('chrome://')) {
                    onNavigate(q);
                  } else if (q.includes('.') && !q.includes(' ')) {
                    onNavigate(`https://${q}`);
                  } else {
                    onNavigate(`chrome://search?q=${encodeURIComponent(q)}`);
                  }
                }
              }}
              autoFocus
            />
            <div className="flex items-center gap-2 pr-1 shrink-0">
              <button
                onClick={() => {
                  const q = query.trim();
                  if (!q) {
                    onNavigate('chrome://search?q=monix%20web-os');
                    return;
                  }
                  if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('chrome://')) {
                    onNavigate(q);
                  } else if (q.includes('.') && !q.includes(' ')) {
                    onNavigate(`https://${q}`);
                  } else {
                    onNavigate(`chrome://search?q=${encodeURIComponent(q)}`);
                  }
                }}
                className="px-3 sm:px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Shortcuts
              </span>
              <button
                onClick={() => setShowAddShortcut(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Shortcut
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {shortcuts.map((sc: any, idx: number) => {
                let domain = '';
                try {
                  domain = new URL(sc.url).hostname;
                } catch {
                  domain = sc.title;
                }
                const iconSrc = sc.icon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

                return (
                  <button
                    key={idx}
                    onClick={() => onNavigate(sc.url)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.05] hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#252835] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                      {sc.url === 'chrome://ai' ? (
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <img
                          src={iconSrc}
                          alt=""
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-300 group-hover:text-white truncate w-full text-center">
                      {sc.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="w-full max-w-4xl text-center text-[10px] text-gray-500 pt-4 border-t border-white/5">
          Monix Web-OS Native Web Experience • Built with High-Speed Proxy Bridge
        </div>

        {/* Add Shortcut Modal */}
        {showAddShortcut && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleAddShortcut}
              className="bg-[#1e2028] border border-cyan-500/30 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-semibold text-white">Add Shortcut</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Reddit)"
                  value={newShortcutTitle}
                  onChange={(e) => setNewShortcutTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="text"
                  placeholder="URL (e.g. reddit.com)"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShortcut(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ── Render 2: AI Mode (chrome://ai) ──
  if (isAIMode) {
    return (
      <div className="flex h-full bg-[#16171d] text-gray-200 font-sans select-text">
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#1e2028] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  Monix Browser AI Companion
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    GROQ LPU ACCELERATED
                  </span>
                </h2>
                <p className="text-[10px] text-gray-400">Context-aware web intelligence and coding assistant</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('chrome://newtab')}
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-white/5"
            >
              Exit AI Mode
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">How can I assist your browsing today?</h2>
                <p className="text-xs text-gray-400">
                  Ask me to summarize any topic, write code, explain complex research, or draft ideas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-4 text-left">
                  {[
                    "Explain WebAssembly and how modern Web-OS browsers execute it",
                    "Compare Chromium vs Firefox browser architecture",
                    "Write a Python script to scrape HTML tables cleanly",
                    "Summarize recent advancements in AI neural chips"
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskAIInternal(prompt)}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs text-gray-300 hover:text-white transition-all text-left"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-3xl",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user'
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs"
                        : "bg-[#20222a] border border-white/10 text-gray-100 rounded-bl-xs shadow-lg w-full"
                    )}
                  >
                    {msg.role === 'model' ? (
                      <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {msg.role === 'model' && msg.latencyMs && (
                    <span className="text-[9px] text-gray-500 font-mono mt-1 px-1">
                      {msg.modelUsed || 'google-ai'} • {msg.latencyMs}ms
                    </span>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#20222a] text-cyan-400 text-xs max-w-xs">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Thinking through Google AI neural channel...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Input bar */}
          <div className="p-4 bg-[#1e2028] border-t border-white/10">
            <div className="max-w-3xl mx-auto flex items-center bg-[#13141a] border border-cyan-500/30 focus-within:border-cyan-400 rounded-xl px-4 py-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAIInternal(query);
                }}
                placeholder="Ask Monix AI anything..."
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-white placeholder-gray-500"
              />
              <button
                onClick={() => handleAskAIInternal(query)}
                disabled={isLoading || !query.trim()}
                className="ml-2 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render 3: History Manager (chrome://history) ──
  if (isHistoryMode) {
    return (
      <div className="flex flex-col h-full bg-[#16171d] text-gray-200 select-none p-6 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Browsing History</h1>
                <p className="text-xs text-gray-400">{historyEntries.length} items logged</p>
              </div>
            </div>
            {onClearHistory && historyEntries.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All History
              </button>
            )}
          </div>

          {historyEntries.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Your browsing history is completely clean.
            </div>
          ) : (
            <div className="divide-y divide-white/5 bg-[#1e2028] border border-white/5 rounded-xl overflow-hidden">
              {historyEntries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.url)}
                  className="p-3.5 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="text-sm font-medium text-white hover:text-cyan-300 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-cyan-400/80 truncate font-mono">{item.url}</div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render 4: Settings (chrome://settings) ──
  if (isSettingsMode) {
    return (
      <div className="flex flex-col h-full bg-[#16171d] text-gray-200 select-none p-6 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Settings className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Browser Settings</h1>
              <p className="text-xs text-gray-400">Configure search engines, web proxy, and privacy</p>
            </div>
          </div>

          <div className="bg-[#1e2028] border border-white/5 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Search Engine</h2>
            <p className="text-xs text-gray-400">Select default search engine for omnibox queries:</p>
            <div className="grid grid-cols-3 gap-3">
              {(['google', 'duckduckgo', 'bing'] as const).map((eng) => (
                <button
                  key={eng}
                  onClick={() => onChangeSearchEngine?.(eng)}
                  className={cn(
                    "p-3 rounded-xl border text-center capitalize text-xs font-semibold transition-all",
                    searchEngine === eng
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "bg-black/20 border-white/10 text-gray-400 hover:text-white"
                  )}
                >
                  {eng}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1e2028] border border-white/5 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Monix Web Proxy Architecture</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Standard web browsers running inside a Web-OS website are blocked from loading 95% of real-world websites due to <code className="text-cyan-400">X-Frame-Options</code> and <code className="text-cyan-400">Content-Security-Policy</code>.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Monix OS solves this by routing requests through its integrated high-speed proxy gateway (<code className="text-cyan-400">/api/proxy</code>), stripping frame blockers, resolving base URLs, and maintaining native in-tab navigation!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render 5: Downloads Manager (chrome://downloads) ──
  if (isDownloadsMode) {
    const filteredDownloads = (downloads || []).filter((d) =>
      downloadSearch ? d.filename.toLowerCase().includes(downloadSearch.toLowerCase()) : true
    );

    return (
      <div className="flex flex-col h-full bg-[#16171d] text-gray-200 select-none p-6 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Downloads</h1>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Saved to Device Storage:</span>
                  <code className="text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">/storage/Downloads</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDownloadsInFiles}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Show in File Manager</span>
              </button>
              <button
                onClick={() => onDownloadSample?.('report')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Asset</span>
              </button>
            </div>
          </div>

          {/* Search bar inside downloads */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={downloadSearch}
              onChange={(e) => setDownloadSearch(e.target.value)}
              placeholder="Search downloaded files..."
              className="w-full bg-[#1e2028] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Downloads list */}
          {filteredDownloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-[#1e2028]/60 border border-white/5 rounded-2xl text-center">
              <Download className="w-12 h-12 text-gray-600 mb-3" />
              <h3 className="text-sm font-semibold text-gray-300 mb-1">No downloaded files</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Downloaded assets and files will automatically be stored into your device's local storage directory (<code className="text-cyan-400">/storage/Downloads</code>).
              </p>
              <button
                onClick={() => onDownloadSample?.('report')}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition-all"
              >
                Download Test Security Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="flex items-center justify-between p-4 bg-[#1e2028] border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <File className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate max-w-md">{dl.filename}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                        <span className="text-emerald-400 font-medium capitalize">{dl.status}</span>
                        {dl.size && <span>• {dl.size}</span>}
                        {dl.timestamp && (
                          <span>• {new Date(dl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <span className="text-cyan-400/80">• /storage/Downloads</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onOpenDownloadsInFiles}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-all"
                      title="Show in File Explorer"
                    >
                      Show in folder
                    </button>
                    {dl.url && (
                      <a
                        href={dl.url}
                        download={dl.filename}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-300 transition-all"
                        title="Save copy to host device"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    {onRemoveDownload && (
                      <button
                        onClick={() => onRemoveDownload(dl.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                        title="Remove from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render 5.5: Search Generative Experience (SGE) Results Page ──
  if (tab.url?.startsWith('chrome://search')) {
    let initialQuery = '';
    try {
      const urlObj = new URL(tab.url.replace('chrome://', 'http://'));
      initialQuery = urlObj.searchParams.get('q') || '';
    } catch {
      initialQuery = tab.url.replace(/^chrome:\/\/search\??(q=)?/, '');
    }

    return (
      <SearchResultsPage
        initialQuery={initialQuery}
        onNavigate={onNavigate}
        onAskAI={onAskAI}
      />
    );
  }

  // ── Render 6: Real Web Page (Iframe with Proxy Bridge) ──
  // If tab.mode === 'direct', load directly; else use the high-speed Monix Proxy!
  const effectiveSrc =
    tab.mode === 'direct'
      ? tab.url
      : `/api/proxy?url=${encodeURIComponent(tab.url)}`;

  return (
    <div className="w-full h-full relative bg-white flex flex-col overflow-hidden">
      {/* Sleek top loading progress bar (Chrome style - never blocks user interaction) */}
      {iframeLoading && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] z-30 overflow-hidden bg-cyan-950/20 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 animate-pulse w-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
        </div>
      )}

      {/* Main Browser Iframe */}
      <iframe
        key={`${tab.url}_${tab.reloadKey || 0}_${tab.mode || 'proxy'}`}
        ref={iframeRef}
        src={effectiveSrc}
        className="w-full flex-1 border-none bg-white"
        onLoad={() => {
          setIframeLoading(false);
          onLoadCompleteRef.current?.();
        }}
        onError={() => {
          setIframeLoading(false);
          setIframeError(true);
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
        title={tab.title || "Web Page"}
      />
    </div>
  );
}
