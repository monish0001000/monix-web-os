import React, { useState } from 'react';
import { Bookmark } from './types';
import { cn } from '@/lib/utils';
import { Globe, MoreVertical, Trash2, ExternalLink } from 'lucide-react';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenNewTab?: (url: string) => void;
  onRemoveBookmark?: (id: string) => void;
  isIncognito?: boolean;
}

export function BookmarksBar({
  bookmarks,
  onNavigate,
  onOpenNewTab,
  onRemoveBookmark,
  isIncognito
}: BookmarksBarProps) {
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; bookmark: Bookmark } | null>(null);

  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-1 px-2 py-0.5 border-b h-8 overflow-x-auto scrollbar-hide text-xs relative select-none",
        isIncognito ? "bg-[#1e1e1e] border-[#333]" : "bg-[#332734] border-[#433342]"
      )}
      onClick={() => setCtxMenu(null)}
    >
      {bookmarks.map((bookmark) => {
        let domain = "";
        try {
          domain = new URL(bookmark.url).hostname;
        } catch {
          domain = bookmark.title;
        }
        const faviconSrc = bookmark.icon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        return (
          <button
            key={bookmark.id}
            onClick={() => onNavigate(bookmark.url)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCtxMenu({ x: e.clientX, y: e.clientY, bookmark });
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors group shrink-0"
            title={`${bookmark.title} (${bookmark.url}) - Right-click for options`}
          >
            <img
              src={faviconSrc}
              alt=""
              className="w-3.5 h-3.5 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xs text-gray-200 group-hover:text-white max-w-[120px] truncate">
              {bookmark.title}
            </span>
          </button>
        );
      })}

      {/* Bookmarks Context Menu */}
      {ctxMenu && (
        <div
          className="fixed z-50 bg-[#292a2d] border border-[#3c4043] rounded-lg shadow-2xl py-1 text-xs text-gray-200 min-w-[160px]"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 font-semibold text-[11px] text-gray-400 border-b border-white/10 truncate max-w-[200px]">
            {ctxMenu.bookmark.title}
          </div>
          <button
            onClick={() => {
              onNavigate(ctxMenu.bookmark.url);
              setCtxMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-left"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Open
          </button>
          {onOpenNewTab && (
            <button
              onClick={() => {
                onOpenNewTab(ctxMenu.bookmark.url);
                setCtxMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-left"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Open in New Tab
            </button>
          )}
          {onRemoveBookmark && (
            <button
              onClick={() => {
                onRemoveBookmark(ctxMenu.bookmark.id);
                setCtxMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/20 text-rose-400 text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Bookmark
            </button>
          )}
        </div>
      )}
    </div>
  );
}
