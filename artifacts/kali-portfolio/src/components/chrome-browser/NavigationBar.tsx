import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, Home, Lock, Star, MoreVertical,
  Sparkles, User, Download, Puzzle, EyeOff, X, CheckCircle, Shield,
  History, Search, ExternalLink, ShieldCheck, Globe, Trash2, Folder, HardDrive, File
} from 'lucide-react';
import { Tab, Download as DownloadType, Extension, HistoryEntry } from './types';
import { cn } from '@/lib/utils';

interface NavigationBarProps {
  activeTab: Tab;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onNavigate: (url: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  currentMode: 'proxy' | 'direct' | 'reader';
  onChangeMode: (mode: 'proxy' | 'direct' | 'reader') => void;
  onToggleAI: () => void;
  isAIPanelOpen: boolean;
  isIncognito?: boolean;
  onToggleIncognito?: () => void;
  showDownloads?: boolean;
  onToggleDownloads?: () => void;
  showExtensions?: boolean;
  onToggleExtensions?: () => void;
  showHistory?: boolean;
  onToggleHistory?: () => void;
  onClearHistory?: () => void;
  downloads?: DownloadType[];
  extensions?: Extension[];
  historyEntries?: HistoryEntry[];
  onToggleExtension?: (id: string) => void;
  onOpenDownloadsInFiles?: () => void;
  onDownloadSample?: (type?: 'pdf' | 'report' | 'image' | 'script') => void;
}

export function NavigationBar({
  activeTab,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onHome,
  onNavigate,
  isBookmarked,
  onToggleBookmark,
  currentMode,
  onChangeMode,
  onToggleAI,
  isAIPanelOpen,
  isIncognito,
  onToggleIncognito,
  showDownloads,
  onToggleDownloads,
  showExtensions,
  onToggleExtensions,
  showHistory,
  onToggleHistory,
  onClearHistory,
  downloads = [],
  extensions = [],
  historyEntries = [],
  onToggleExtension,
  onOpenDownloadsInFiles,
  onDownloadSample,
}: NavigationBarProps) {
  const [inputUrl, setInputUrl] = useState(activeTab.url);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (isAIPanelOpen && activeTab.url === 'chrome://ai') {
      setInputUrl('chrome://ai');
    } else {
      setInputUrl(activeTab.url);
    }
  }, [activeTab.url, isAIPanelOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(inputUrl);
  };

  const handleOpenExternal = () => {
    if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredHistory = historyEntries.filter(
    (h) =>
      h.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      h.url.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 sm:gap-2 px-2 py-1.5 border-b relative select-none",
        isIncognito ? "bg-[#1e1e1e] border-[#333]" : "bg-[#3b2f3c] border-[#4a3d4b]"
      )}
    >
      {/* Navigation Controls: Back, Forward, Reload, Home */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            canGoBack
              ? "hover:bg-white/10 text-gray-200 cursor-pointer"
              : "text-gray-600 cursor-not-allowed"
          )}
          title="Click to go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            canGoForward
              ? "hover:bg-white/10 text-gray-200 cursor-pointer"
              : "text-gray-600 cursor-not-allowed"
          )}
          title="Click to go forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReload}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          title="Reload this page"
        >
          <RotateCw className={cn("w-4 h-4", activeTab.isLoading && "animate-spin text-blue-400")} />
        </button>

        <button
          onClick={onHome}
          className="hidden sm:flex p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          title="Open New Tab page"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibox / Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0">
        <div
          className={cn(
            "flex-1 flex items-center rounded-full px-2.5 py-1 focus-within:ring-1 focus-within:ring-cyan-400 transition-all h-8",
            isIncognito
              ? "bg-[#2d2d2d] hover:bg-[#383838] focus-within:bg-[#2d2d2d]"
              : "bg-[#251d27] hover:bg-[#352936] focus-within:bg-[#251d27]"
          )}
        >
          {/* Security / Search Indicator */}
          {activeTab.url?.startsWith('chrome://search') ? (
            <div className="flex items-center gap-1 mr-1.5 px-1.5 py-0.5 rounded text-xs text-cyan-400 bg-cyan-500/10 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-[10px] tracking-wider uppercase font-semibold text-cyan-300">
                AI Search
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSecurityModal(!showSecurityModal)}
              className="flex items-center gap-1 mr-1.5 px-1.5 py-0.5 rounded text-xs text-emerald-400 hover:bg-emerald-500/10 shrink-0"
              title="View Site Security & Proxy Tunnel Settings"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-[10px] tracking-wider uppercase font-semibold text-emerald-300">
                {currentMode === 'proxy' ? 'Proxy' : 'Direct'}
              </span>
            </button>
          )}

          {/* URL Input */}
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-white placeholder-gray-400 min-w-0 font-mono tracking-tight"
            placeholder="Search Google, DuckDuckGo or type a URL"
          />

          {/* External Popout button */}
          {activeTab.url && !activeTab.url.startsWith('chrome://') && (
            <button
              type="button"
              onClick={handleOpenExternal}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition-colors shrink-0"
              title="Open in real host browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bookmark / Star Button */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={cn(
              "p-1 rounded-full transition-colors shrink-0",
              isBookmarked
                ? "text-yellow-400 hover:bg-yellow-400/10"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
            title={isBookmarked ? "Remove from bookmarks" : "Bookmark this tab"}
          >
            <Star className={cn("w-4 h-4", isBookmarked && "fill-yellow-400")} />
          </button>
        </div>
      </form>

      {/* Action Tools */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          onClick={onToggleHistory}
          className={cn(
            "hidden sm:flex p-1.5 rounded-full transition-colors",
            showHistory ? "bg-white/20 text-white" : "hover:bg-white/10 text-gray-400"
          )}
          title="History"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleDownloads}
          className={cn(
            "hidden sm:flex p-1.5 rounded-full transition-colors",
            showDownloads ? "bg-white/20 text-white" : "hover:bg-white/10 text-gray-400"
          )}
          title="Downloads"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleExtensions}
          className={cn(
            "hidden sm:flex p-1.5 rounded-full transition-colors",
            showExtensions ? "bg-white/20 text-white" : "hover:bg-white/10 text-gray-400"
          )}
          title="Extensions"
        >
          <Puzzle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleIncognito}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            isIncognito ? "text-cyan-400 bg-cyan-400/10" : "hover:bg-white/10 text-gray-400"
          )}
          title={isIncognito ? "Exit Incognito" : "New Incognito Window"}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* AI Mode Button */}
        <button
          onClick={onToggleAI}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border",
            isAIPanelOpen
              ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              : "hover:bg-white/10 text-gray-300 border-transparent"
          )}
          title="Toggle AI Companion (Groq Powered)"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-xs font-semibold">AI Mode</span>
        </button>

        {/* More Menu */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          title="Customize and control Monix Browser"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Profile Avatar */}
        <div className="p-1 ml-0.5">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
              isIncognito ? "bg-gray-700" : "bg-gradient-to-tr from-cyan-500 to-blue-600"
            )}
          >
            {isIncognito ? "🕶️" : "M"}
          </div>
        </div>
      </div>

      {/* ── Security / Proxy Settings Popover ── */}
      {showSecurityModal && (
        <div
          className="absolute top-full left-12 mt-1 w-80 bg-[#1e2025] border border-cyan-500/30 rounded-xl shadow-2xl p-4 z-50 text-xs text-gray-200 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-semibold text-white">Connection is Secure</div>
                <div className="text-[10px] text-gray-400">Monix Safe Tunnel v2.0</div>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityModal(false)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-[11px] text-gray-300">
            <p>
              Your connection to this site is private and protected by the Monix Web-OS sandbox.
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1 font-mono text-[10px]">
              <div><strong className="text-cyan-300">Target:</strong> {activeTab.url || 'chrome://newtab'}</div>
              <div><strong className="text-cyan-300">Tunnel:</strong> {currentMode === 'proxy' ? 'Active (Stripping X-Frame Restrictions)' : 'Direct Iframe'}</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[11px] font-semibold text-white block mb-2">Display Mode:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onChangeMode('proxy');
                  setShowSecurityModal(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg border text-center font-medium transition-colors",
                  currentMode === 'proxy'
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "border-white/10 hover:bg-white/5 text-gray-400"
                )}
              >
                Web Proxy (Recommended)
              </button>
              <button
                onClick={() => {
                  onChangeMode('direct');
                  setShowSecurityModal(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg border text-center font-medium transition-colors",
                  currentMode === 'direct'
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "border-white/10 hover:bg-white/5 text-gray-400"
                )}
              >
                Direct Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Options Dropdown ── */}
      {showMoreMenu && (
        <div
          className="absolute top-full right-2 mt-1 w-64 bg-[#252830] border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-xs text-gray-200"
          onClick={() => setShowMoreMenu(false)}
        >
          <button
            onClick={() => onNavigate('chrome://newtab')}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <Home className="w-4 h-4 text-cyan-400" /> New Tab
          </button>
          <button
            onClick={onToggleIncognito}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <EyeOff className="w-4 h-4 text-purple-400" /> New Incognito Tab
          </button>
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => onNavigate('chrome://history')}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <History className="w-4 h-4 text-emerald-400" /> History
          </button>
          <button
            onClick={() => onNavigate('chrome://bookmarks')}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <Star className="w-4 h-4 text-yellow-400" /> Bookmarks Manager
          </button>
          <button
            onClick={() => onNavigate('chrome://downloads')}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <Download className="w-4 h-4 text-blue-400" /> Downloads
          </button>
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => onNavigate('chrome://settings')}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left"
          >
            <Globe className="w-4 h-4 text-indigo-400" /> Browser Settings
          </button>
          {activeTab.url && !activeTab.url.startsWith('chrome://') && (
            <button
              onClick={handleOpenExternal}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-left text-cyan-300"
            >
              <ExternalLink className="w-4 h-4" /> Open in Real Host Tab
            </button>
          )}
        </div>
      )}

      {/* ── Downloads Popover ── */}
      {showDownloads && (
        <div className="absolute top-full right-16 mt-1 w-88 bg-[#252830] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1e2025]">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <h3 className="text-white font-medium">Downloads</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onNavigate('chrome://downloads');
                  onToggleDownloads?.();
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View all
              </button>
              <button onClick={onToggleDownloads} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-[#16171d] border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>Location:</span>
            </span>
            <code className="text-cyan-300 font-mono text-[10px]">/storage/Downloads</code>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
            {downloads.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Download className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                <p>No recent downloads</p>
                <button
                  onClick={() => onDownloadSample?.('report')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium"
                >
                  Download Sample File
                </button>
              </div>
            ) : (
              downloads.map((dl) => (
                <div key={dl.id} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-200 font-medium truncate max-w-[180px]">{dl.filename}</span>
                    <span className="text-[10px] text-emerald-400 capitalize font-medium">{dl.status}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        dl.status === 'completed' ? "bg-emerald-400" : "bg-cyan-400"
                      )}
                      style={{ width: `${dl.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{dl.size || 'Saved to Local Storage'}</span>
                    {dl.url && (
                      <a
                        href={dl.url}
                        download={dl.filename}
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Save to Host
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[#1e2025] border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenDownloadsInFiles?.();
                onToggleDownloads?.();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-medium transition-all"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Show in Files</span>
            </button>
            <button
              onClick={() => onDownloadSample?.('report')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Test Download</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Extensions Popover ── */}
      {showExtensions && (
        <div className="absolute top-full right-20 mt-1 w-72 bg-[#252830] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1e2025]">
            <h3 className="text-white font-medium">Extensions</h3>
            <button onClick={onToggleExtensions} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 space-y-2">
            {extensions.map((ext) => (
              <div key={ext.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-200 font-medium">{ext.name}</span>
                </div>
                <button
                  onClick={() => onToggleExtension?.(ext.id)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    ext.isEnabled ? "bg-cyan-500" : "bg-gray-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform",
                      ext.isEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── History Popover ── */}
      {showHistory && (
        <div className="absolute top-full right-24 mt-1 w-84 bg-[#252830] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1e2025]">
            <h3 className="text-white font-medium">Recent History</h3>
            <div className="flex items-center gap-2">
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300"
                >
                  Clear All
                </button>
              )}
              <button onClick={onToggleHistory} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs text-white placeholder-gray-500 w-full"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
            {filteredHistory.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No history found</div>
            ) : (
              filteredHistory.slice(0, 15).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.url);
                    if (onToggleHistory) onToggleHistory();
                  }}
                  className="p-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-gray-200 truncate font-medium group-hover:text-cyan-300">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{item.url}</div>
                  </div>
                  <span className="text-[9px] text-gray-500 shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
