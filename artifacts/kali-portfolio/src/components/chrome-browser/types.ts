export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  history?: string[];
  historyIndex?: number;
  mode?: 'proxy' | 'direct' | 'reader';
  reloadKey?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  groundingChunks?: any[];
}

export interface Download {
  id: string;
  filename: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
  url?: string;
  size?: string;
  timestamp?: number;
}

export interface Extension {
  id: string;
  name: string;
  icon: string;
  isEnabled: boolean;
  description?: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  favicon?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
}
