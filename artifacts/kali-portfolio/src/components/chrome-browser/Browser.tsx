import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Download, Extension, HistoryEntry, Bookmark } from './types';
import { TabBar } from './TabBar';
import { NavigationBar } from './NavigationBar';
import { BookmarksBar } from './BookmarksBar';
import { BrowserContent } from './BrowserContent';
import { AIPanel } from './AIPanel';
import { cn } from '@/lib/utils';
import { useOSStore } from '@/lib/store';
import type { VFSNode } from '@/lib/vfsUtils';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com/?igu=1&hl=en' },
  { id: '2', title: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Operating_system' },
  { id: '3', title: 'GitHub', url: 'https://github.com' },
  { id: '4', title: 'Hacker News', url: 'https://news.ycombinator.com' },
  { id: '5', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: '6', title: 'Reddit', url: 'https://www.reddit.com' },
];

export function Browser() {
  const [normalTabs, setNormalTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'New Tab',
      url: 'chrome://newtab',
      isLoading: false,
      history: ['chrome://newtab'],
      historyIndex: 0,
      mode: 'proxy',
      reloadKey: 0
    }
  ]);
  const [incognitoTabs, setIncognitoTabs] = useState<Tab[]>([
    {
      id: 'incognito-1',
      title: 'New Incognito Tab',
      url: 'chrome://newtab',
      isLoading: false,
      history: ['chrome://newtab'],
      historyIndex: 0,
      mode: 'proxy',
      reloadKey: 0
    }
  ]);
  const [activeNormalTabId, setActiveNormalTabId] = useState<string>('1');
  const [activeIncognitoTabId, setActiveIncognitoTabId] = useState<string>('incognito-1');

  const [isIncognito, setIsIncognito] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [initialAIQuery, setInitialAIQuery] = useState<string>('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');

  // Bookmarks with local persistence
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('monix_browser_bookmarks');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // History with local persistence
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('monix_browser_history');
      return saved ? JSON.parse(saved) : [
        { id: '1', url: 'https://en.wikipedia.org/wiki/Operating_system', title: 'Operating system - Wikipedia', timestamp: Date.now() - 100000 },
        { id: '2', url: 'https://github.com', title: 'GitHub', timestamp: Date.now() - 500000 },
      ];
    } catch {
      return [];
    }
  });

  // Downloads with local persistence
  const [downloads, setDownloads] = useState<Download[]>(() => {
    try {
      const saved = localStorage.getItem('monix_browser_downloads');
      return saved ? JSON.parse(saved) : [
        { id: '1', filename: 'monix_os_manual.pdf', progress: 100, status: 'completed', size: '1.2 MB', timestamp: Date.now() - 3600000 },
        { id: '2', filename: 'cyber_security_report.json', progress: 100, status: 'completed', size: '420 KB', timestamp: Date.now() - 7200000 }
      ];
    } catch {
      return [];
    }
  });
  const [showDownloads, setShowDownloads] = useState(false);

  const [extensions, setExtensions] = useState<Extension[]>([
    { id: '1', name: 'Monix Shield Proxy', icon: 'Shield', isEnabled: true },
    { id: '2', name: 'AI Web Companion', icon: 'Sparkles', isEnabled: true },
    { id: '3', name: 'Developer Tools', icon: 'Code', isEnabled: true }
  ]);
  const [showExtensions, setShowExtensions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const tabs = isIncognito ? incognitoTabs : normalTabs;
  const activeTabId = isIncognito ? activeIncognitoTabId : activeNormalTabId;
  const setTabs = isIncognito ? setIncognitoTabs : setNormalTabs;
  const setActiveTabId = isIncognito ? setActiveIncognitoTabId : setActiveNormalTabId;

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Save bookmarks
  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    try {
      localStorage.setItem('monix_browser_bookmarks', JSON.stringify(newBookmarks));
    } catch {}
  };

  // Add / Remove Bookmark
  const handleToggleBookmark = () => {
    if (!activeTab.url || activeTab.url === 'chrome://newtab') return;
    const exists = bookmarks.some(b => b.url === activeTab.url);
    if (exists) {
      saveBookmarks(bookmarks.filter(b => b.url !== activeTab.url));
    } else {
      const newBm: Bookmark = {
        id: Date.now().toString(),
        title: activeTab.title || activeTab.url,
        url: activeTab.url
      };
      saveBookmarks([...bookmarks, newBm]);
    }
  };

  const handleRemoveBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const isCurrentBookmarked = bookmarks.some(b => b.url === activeTab?.url);

  // Add Tab
  const handleAddTab = (initialUrl = 'chrome://newtab') => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: initialUrl === 'chrome://newtab' ? 'New Tab' : initialUrl,
      url: initialUrl,
      isLoading: false,
      history: [initialUrl],
      historyIndex: 0,
      mode: 'proxy',
      reloadKey: 0
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close Tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Don't close the only tab; reset to newtab instead
      setTabs([{
        id: Date.now().toString(),
        title: 'New Tab',
        url: 'chrome://newtab',
        isLoading: false,
        history: ['chrome://newtab'],
        historyIndex: 0,
        mode: 'proxy'
      }]);
      return;
    }

    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // Navigation
  const handleNavigate = (url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl) {
      finalUrl = 'chrome://newtab';
    }

    // Determine target URL vs Search query
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('chrome://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        // Query search engine -> Route to SGE AI Search Overview
        if (searchEngine === 'duckduckgo') {
          finalUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(finalUrl)}`;
        } else if (searchEngine === 'bing') {
          finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
        } else {
          finalUrl = `chrome://search?q=${encodeURIComponent(finalUrl)}`;
        }
      }
    }

    // Normalize google search URLs to native SGE AI overview if desirable
    if (/^https?:\/\/(www\.)?google\.[a-z.]+(\/)?$/i.test(finalUrl)) {
      finalUrl = 'https://www.google.com/?igu=1&hl=en';
    } else if (/^https?:\/\/(www\.)?google\.[a-z.]+\/search/i.test(finalUrl) && !finalUrl.includes('igu=1')) {
      try {
        const u = new URL(finalUrl);
        const q = u.searchParams.get('q');
        if (q) {
          finalUrl = `chrome://search?q=${encodeURIComponent(q)}`;
        } else {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'igu=1&hl=en';
        }
      } catch {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'igu=1&hl=en';
      }
    }

    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const curHist = t.history || [t.url];
        const curIdx = t.historyIndex ?? (curHist.length - 1);
        const newHist = [...curHist.slice(0, curIdx + 1), finalUrl];

        let title = 'New Tab';
        if (finalUrl === 'chrome://ai') title = 'AI Mode';
        else if (finalUrl === 'chrome://history') title = 'History';
        else if (finalUrl === 'chrome://settings') title = 'Settings';
        else if (finalUrl === 'chrome://downloads') title = 'Downloads';
        else if (finalUrl === 'chrome://bookmarks') title = 'Bookmarks';
        else if (finalUrl.startsWith('chrome://search')) {
          try {
            const q = new URL(finalUrl.replace('chrome://', 'http://')).searchParams.get('q');
            title = q ? `${q} - Google Search` : 'Google Search';
          } catch {
            title = 'Google Search';
          }
        }
        else if (finalUrl !== 'chrome://newtab') {
          try {
            title = new URL(finalUrl).hostname;
          } catch {
            title = finalUrl;
          }
        }

        return {
          ...t,
          url: finalUrl,
          title,
          isLoading: !finalUrl.startsWith('chrome://'),
          history: newHist,
          historyIndex: newHist.length - 1,
          mode: t.mode || 'proxy',
          reloadKey: (t.reloadKey || 0) + 1
        };
      }
      return t;
    }));

    // Record in history if not incognito
    if (finalUrl && !isIncognito) {
      if (finalUrl.startsWith('chrome://search')) {
        let q = '';
        try {
          q = new URL(finalUrl.replace('chrome://', 'http://')).searchParams.get('q') || '';
        } catch {}
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          url: finalUrl,
          title: q ? `${q} - Google Search` : 'Google Search',
          timestamp: Date.now()
        };
        setHistoryEntries(prev => {
          const updated = [newEntry, ...prev.filter(h => h.url !== finalUrl).slice(0, 99)];
          try {
            localStorage.setItem('monix_browser_history', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } else if (!finalUrl.startsWith('chrome://')) {
        let title = finalUrl;
        try {
          title = new URL(finalUrl).hostname;
        } catch {}
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          url: finalUrl,
          title,
          timestamp: Date.now()
        };
        setHistoryEntries(prev => {
          const updated = [newEntry, ...prev.slice(0, 99)];
          try {
            localStorage.setItem('monix_browser_history', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }

    setIsAIPanelOpen(false);
  };

  // Back / Forward / Reload / Home
  const canGoBack = (activeTab?.historyIndex ?? 0) > 0;
  const canGoForward = (activeTab?.historyIndex ?? 0) < ((activeTab?.history?.length ?? 1) - 1);

  const handleBack = () => {
    if (!canGoBack) return;
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const newIdx = (t.historyIndex || 0) - 1;
        const prevUrl = t.history?.[newIdx] || 'chrome://newtab';
        return {
          ...t,
          url: prevUrl,
          historyIndex: newIdx,
          isLoading: !prevUrl.startsWith('chrome://'),
          reloadKey: (t.reloadKey || 0) + 1
        };
      }
      return t;
    }));
  };

  const handleForward = () => {
    if (!canGoForward) return;
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const newIdx = (t.historyIndex || 0) + 1;
        const nextUrl = t.history?.[newIdx] || t.url;
        return {
          ...t,
          url: nextUrl,
          historyIndex: newIdx,
          isLoading: !nextUrl.startsWith('chrome://'),
          reloadKey: (t.reloadKey || 0) + 1
        };
      }
      return t;
    }));
  };

  const handleReload = () => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          isLoading: !t.url.startsWith('chrome://'),
          reloadKey: (t.reloadKey || 0) + 1
        };
      }
      return t;
    }));
  };

  const handleHome = () => {
    handleNavigate('chrome://newtab');
  };

  const handleChangeMode = (mode: 'proxy' | 'direct' | 'reader') => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        return { ...t, mode, reloadKey: (t.reloadKey || 0) + 1 };
      }
      return t;
    }));
  };

  const handleLoadComplete = useCallback((id: string) => {
    setTabs(prev => prev.map(t =>
      t.id === id ? (t.isLoading ? { ...t, isLoading: false } : t) : t
    ));
  }, []);

  const handleUpdateTitle = (newTitle: string) => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        return { ...t, title: newTitle };
      }
      return t;
    }));
  };

  const handleAskAI = (queryText: string) => {
    setIsAIPanelOpen(true);
    setInitialAIQuery(queryText);
  };

  const handleClearHistory = () => {
    setHistoryEntries([]);
    try {
      localStorage.removeItem('monix_browser_history');
    } catch {}
  };

  const handleRemoveDownload = (id: string) => {
    const target = downloads.find(d => d.id === id);
    if (target) {
      useOSStore.getState().removeVFSNode(`Downloads/${target.filename}`);
    }
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    try {
      localStorage.setItem('monix_browser_downloads', JSON.stringify(updated));
    } catch {}
  };

  const handleOpenDownloadsInFiles = useCallback(() => {
    window.dispatchEvent(new CustomEvent('monix-open-app', { detail: { appId: 'files' } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('monix-open-folder', { detail: { folderId: 'Downloads' } }));
    }, 120);
  }, []);

  const handleDownload = useCallback(async (url: string, customFilename?: string) => {
    let filename = customFilename?.trim();
    if (!filename) {
      try {
        filename = new URL(url).pathname.split('/').filter(Boolean).pop() || 'download';
      } catch {
        filename = 'download_' + Date.now();
      }
    }

    const dotIdx = filename.lastIndexOf('.');
    const ext = dotIdx !== -1 ? filename.slice(dotIdx + 1).toLowerCase() : 'txt';

    const downloadId = Date.now().toString();
    const newEntry: Download = {
      id: downloadId,
      filename,
      progress: 30,
      status: 'downloading',
      url,
      timestamp: Date.now()
    };

    setDownloads(prev => {
      const updated = [newEntry, ...prev.filter(d => d.filename !== filename)];
      try {
        localStorage.setItem('monix_browser_downloads', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      let resolvedBlobUrl = url;
      let sizeBytes = 1024;

      if (url.startsWith('http://') || url.startsWith('https://')) {
        const fetchUrl = url.includes('/api/proxy') ? url : `/api/proxy?url=${encodeURIComponent(url)}`;
        try {
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const blob = await res.blob();
            sizeBytes = blob.size;
            resolvedBlobUrl = URL.createObjectURL(blob);
          }
        } catch (e) {
          console.warn("[Browser Download] Remote fetch failed, saving direct reference:", e);
        }
      }

      const sizeStr = sizeBytes < 1024 ? `${sizeBytes} B` : sizeBytes < 1024 * 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;

      // 1. Save directly to Virtual File System (~/storage/Downloads)
      // This is persisted to localStorage under `monix_user_vfs_nodes`
      const vfsNode: VFSNode = {
        id: `Downloads/${filename}`,
        name: filename,
        type: 'file',
        parentId: 'Downloads',
        url: resolvedBlobUrl,
        ext,
        size: sizeBytes,
        isUserCreated: true,
      };
      useOSStore.getState().addVFSNode(vfsNode);

      // 2. Trigger native device file download (saves directly to host machine Downloads folder!)
      const a = document.createElement('a');
      a.href = resolvedBlobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 3. Update download record to completed
      setDownloads(prev => {
        const updated = prev.map(d => d.id === downloadId ? { ...d, progress: 100, status: 'completed' as const, size: sizeStr, url: resolvedBlobUrl } : d);
        try {
          localStorage.setItem('monix_browser_downloads', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setShowDownloads(true);
    } catch (err: any) {
      console.error("[Browser Download] Error saving download:", err);
      setDownloads(prev => {
        const updated = prev.map(d => d.id === downloadId ? { ...d, status: 'failed' as const } : d);
        try {
          localStorage.setItem('monix_browser_downloads', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, []);

  const handleDownloadSample = useCallback((type: 'pdf' | 'report' | 'image' | 'script' = 'report') => {
    let filename = 'monix_system_security_report.json';
    let content = JSON.stringify({
      os: "Monix Web-OS 2.0",
      timestamp: new Date().toISOString(),
      security_level: "Quantum Secure",
      firewall: "Sentinel Active",
      vfs_storage: "localFileSystem & localStorage",
      status: "Verified",
      engine: "Groq LPU Aura Engine",
    }, null, 2);
    let mimeType = 'application/json';

    if (type === 'image') {
      filename = 'monix_cyber_logo.svg';
      content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0d1117"/><polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="#00f0ff" stroke-width="6"/><circle cx="100" cy="100" r="40" fill="#00f0ff" opacity="0.8"/></svg>`;
      mimeType = 'image/svg+xml';
    } else if (type === 'script') {
      filename = 'monix_quick_diagnostics.sh';
      content = `#!/bin/bash\n# Monix OS Diagnostic Script\necho "Running Monix diagnostics..."\nuname -a\nuptime\necho "Monix OS integrity OK."\n`;
      mimeType = 'text/x-shellscript';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    handleDownload(url, filename);
  }, [handleDownload]);

  // Listen for downloads triggered from within browser iframes
  useEffect(() => {
    function handleWindowMessage(e: MessageEvent) {
      if (e.data?.type === 'monix-browser-download' && e.data?.url) {
        handleDownload(e.data.url, e.data.filename);
      }
    }
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [handleDownload]);

  // External listener from Monix OS (e.g. Aura terminal or other apps)
  useEffect(() => {
    function onAuraSearch(e: Event) {
      const queryText = (e as CustomEvent<{ query: string }>).detail?.query;
      if (!queryText) return;
      handleNavigate(queryText);
    }
    window.addEventListener('aura-browser-search', onAuraSearch);
    return () => window.removeEventListener('aura-browser-search', onAuraSearch);
  }, [activeTabId, isIncognito]);

  return (
    <div
      className={cn("flex flex-col w-full overflow-hidden font-sans select-none", isIncognito ? "bg-[#121212]" : "bg-[#1f1d24]")}
      style={{ height: '100%' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={cn("flex flex-col shrink-0", isIncognito ? "bg-[#1e1e1e]" : "bg-[#2e232f]")}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onCloseTab={handleCloseTab}
          onAddTab={() => handleAddTab('chrome://newtab')}
          isIncognito={isIncognito}
        />
        <NavigationBar
          activeTab={activeTab}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          onHome={handleHome}
          onNavigate={handleNavigate}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
          currentMode={activeTab.mode || 'proxy'}
          onChangeMode={handleChangeMode}
          onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
          isAIPanelOpen={isAIPanelOpen}
          isIncognito={isIncognito}
          onToggleIncognito={() => setIsIncognito(!isIncognito)}
          showDownloads={showDownloads}
          onToggleDownloads={() => {
            setShowDownloads(!showDownloads);
            setShowExtensions(false);
            setShowHistory(false);
          }}
          showExtensions={showExtensions}
          onToggleExtensions={() => {
            setShowExtensions(!showExtensions);
            setShowDownloads(false);
            setShowHistory(false);
          }}
          showHistory={showHistory}
          onToggleHistory={() => {
            setShowHistory(!showHistory);
            setShowDownloads(false);
            setShowExtensions(false);
          }}
          onClearHistory={handleClearHistory}
          downloads={downloads}
          extensions={extensions}
          historyEntries={historyEntries}
          onToggleExtension={(id) => {
            setExtensions(extensions.map(ext => ext.id === id ? { ...ext, isEnabled: !ext.isEnabled } : ext));
          }}
          onOpenDownloadsInFiles={handleOpenDownloadsInFiles}
          onDownloadSample={handleDownloadSample}
        />
        <BookmarksBar
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onOpenNewTab={(url) => handleAddTab(url)}
          onRemoveBookmark={handleRemoveBookmark}
          isIncognito={isIncognito}
        />
      </div>

      <div className={cn("flex flex-1 overflow-hidden relative", isIncognito ? "bg-[#121212]" : "bg-[#16171d]")}>
        <div className="flex-1 h-full relative">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'block' : 'hidden'}`}
            >
              <BrowserContent
                tab={tab}
                onLoadComplete={() => handleLoadComplete(tab.id)}
                onNavigate={handleNavigate}
                onAskAI={handleAskAI}
                onUpdateTitle={handleUpdateTitle}
                historyEntries={historyEntries}
                onClearHistory={handleClearHistory}
                bookmarks={bookmarks}
                onAddBookmark={(title, url) => saveBookmarks([...bookmarks, { id: Date.now().toString(), title, url }])}
                onRemoveBookmark={handleRemoveBookmark}
                searchEngine={searchEngine}
                onChangeSearchEngine={setSearchEngine}
                downloads={downloads}
                onDownload={handleDownload}
                onDownloadSample={handleDownloadSample}
                onRemoveDownload={handleRemoveDownload}
                onOpenDownloadsInFiles={handleOpenDownloadsInFiles}
              />
            </div>
          ))}
        </div>

        {/* AI Sidebar Panel */}
        <div className={cn(
          "absolute sm:relative right-0 h-full w-full sm:w-[400px] border-l border-white/10 bg-[#16171d] flex-col shadow-2xl z-20 transition-all",
          isAIPanelOpen ? "flex" : "hidden"
        )}>
          <AIPanel
            onClose={() => setIsAIPanelOpen(false)}
            currentUrl={activeTab.url}
            initialQuery={initialAIQuery}
            onClearInitialQuery={() => setInitialAIQuery('')}
          />
        </div>
      </div>
    </div>
  );
}
