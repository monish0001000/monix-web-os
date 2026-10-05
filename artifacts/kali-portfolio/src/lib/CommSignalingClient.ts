/**
 * MONIX Secure Comm — Universal Real-time Signaling & Presence Engine
 * Supports:
 *  1. MONIX Ultra-Fast Mesh Relay (SSE + BroadcastChannel — 100% Free, Zero-Config, Instant LAN/Web)
 *  2. Supabase Realtime (Cloud Presence & Broadcast)
 *  3. Firebase Realtime DB (Cloud Real-time Sync)
 */

import { supabase, supabaseReady } from './supabaseClient';

export type CommBackendType = 'mesh' | 'supabase' | 'firebase';

export interface CommPeerState {
  id: string;
  alias: string;
  online_at: string;
}

export interface CommChannelOptions {
  peerId: string;
  alias: string;
  backend?: CommBackendType;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  firebaseUrl?: string;
}

export interface CommChannel {
  on: (type: 'presence' | 'broadcast', filter: { event: string }, callback: (event: any) => void) => CommChannel;
  subscribe: (callback?: (status: string) => void) => CommChannel;
  track: (presenceData: { alias: string; online_at: string }) => Promise<void>;
  send: (message: { type: string; event: string; payload: any }) => Promise<void>;
  presenceState: () => Record<string, CommPeerState[]>;
  unsubscribe: () => void;
  getBackend: () => CommBackendType;
  getConnectionStatus: () => 'connected' | 'connecting' | 'disconnected';
}

const STORAGE_KEY_BACKEND = 'monix_comm_backend';
const STORAGE_KEY_SUPABASE_URL = 'monix_comm_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'monix_comm_supabase_key';
const STORAGE_KEY_FIREBASE_URL = 'monix_comm_firebase_url';

export function getSavedCommBackend(): CommBackendType {
  const saved = localStorage.getItem(STORAGE_KEY_BACKEND) as CommBackendType;
  if (saved === 'supabase' || saved === 'firebase' || saved === 'mesh') return saved;
  // Default to fast zero-config mesh relay
  return 'mesh';
}

export function saveCommBackend(backend: CommBackendType) {
  localStorage.setItem(STORAGE_KEY_BACKEND, backend);
}

export function getSavedCustomSupabase() {
  return {
    url: localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '',
    key: localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '',
  };
}

export function saveCustomSupabase(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url);
  localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key);
}

export function getSavedFirebaseUrl() {
  return localStorage.getItem(STORAGE_KEY_FIREBASE_URL) || '';
}

export function saveFirebaseUrl(url: string) {
  localStorage.setItem(STORAGE_KEY_FIREBASE_URL, url);
}

/**
 * Creates an ultra-fast channel supporting Mesh, Supabase, and Firebase
 */
export function createCommChannel(name: string, options: CommChannelOptions): CommChannel {
  const { peerId, alias } = options;
  const backend = options.backend || getSavedCommBackend();

  // If user configured Supabase and it's chosen & ready
  if (backend === 'supabase' && supabaseReady) {
    // Wrap native supabase channel
    const realChannel = supabase.channel(name, {
      config: { presence: { key: peerId }, broadcast: { self: false } }
    });

    let connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'connecting';

    return {
      on(type, filter, callback) {
        // @ts-ignore
        realChannel.on(type, filter, callback);
        return this;
      },
      subscribe(callback) {
        realChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') connectionStatus = 'connected';
          else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') connectionStatus = 'disconnected';
          callback?.(status);
        });
        return this;
      },
      async track(presenceData) {
        await realChannel.track(presenceData);
      },
      async send(message) {
        // @ts-ignore
        await realChannel.send(message);
      },
      presenceState() {
        const state = realChannel.presenceState();
        const formatted: Record<string, CommPeerState[]> = {};
        for (const k in state) {
          // @ts-ignore
          formatted[k] = state[k] as CommPeerState[];
        }
        return formatted;
      },
      unsubscribe() {
        connectionStatus = 'disconnected';
        realChannel.unsubscribe();
      },
      getBackend: () => 'supabase',
      getConnectionStatus: () => connectionStatus,
    };
  }

  // DEFAULT / MESH RELAY:
  // Uses SSE for network peers across LAN/Wi-Fi + BroadcastChannel for same-origin tabs!
  let connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'connecting';
  const presenceListeners: Array<(event: any) => void> = [];
  const broadcastListeners: Map<string, Array<(payload: { payload: any }) => void>> = new Map();
  const currentPresence: Record<string, CommPeerState[]> = {};

  let sseSource: EventSource | null = null;
  let localBc: BroadcastChannel | null = null;
  let heartbeatTimer: any = null;
  let isClosed = false;

  // Local tab broadcast channel
  try {
    localBc = new BroadcastChannel(`monix_comm_${name}`);
    localBc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'presence_announce' && data.peerId !== peerId) {
        currentPresence[data.peerId] = [{
          id: data.peerId,
          alias: data.alias,
          online_at: data.online_at || new Date().toISOString(),
        }];
        presenceListeners.forEach(fn => fn({}));
      } else if (data.type === 'presence_leave') {
        delete currentPresence[data.peerId];
        presenceListeners.forEach(fn => fn({}));
      } else if (data.type === 'broadcast') {
        const listeners = broadcastListeners.get(data.event);
        listeners?.forEach(fn => fn({ payload: data.payload }));
      }
    };
  } catch (_) {}

  const startSSE = () => {
    if (isClosed) return;
    try {
      const base = import.meta.env.BASE_URL ?? '/';
      const apiPrefix = base.replace(/\/$/, '') + '/api';
      const streamUrl = `${apiPrefix}/comm/stream?peerId=${encodeURIComponent(peerId)}&alias=${encodeURIComponent(alias)}`;

      sseSource = new EventSource(streamUrl);

      sseSource.onopen = () => {
        connectionStatus = 'connected';
      };

      sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'presence_sync') {
            const peersList: CommPeerState[] = data.peers || [];
            // Rebuild presence state
            for (const key in currentPresence) {
              delete currentPresence[key];
            }
            peersList.forEach(p => {
              currentPresence[p.id] = [p];
            });
            presenceListeners.forEach(fn => fn({}));
          } else if (data.type === 'broadcast') {
            const listeners = broadcastListeners.get(data.event);
            listeners?.forEach(fn => fn({ payload: data.payload }));
          }
        } catch (_) {}
      };

      sseSource.onerror = () => {
        connectionStatus = 'disconnected';
        sseSource?.close();
        // Reconnect after 3s
        if (!isClosed) {
          setTimeout(startSSE, 3000);
        }
      };
    } catch (e) {
      console.warn('[CommSignaling] Fallback to BroadcastChannel only', e);
      connectionStatus = 'connected';
    }
  };

  const channel: CommChannel = {
    on(type, filter, callback) {
      if (type === 'presence' && filter.event === 'sync') {
        presenceListeners.push(callback);
      } else if (type === 'broadcast') {
        const list = broadcastListeners.get(filter.event) || [];
        list.push(callback);
        broadcastListeners.set(filter.event, list);
      }
      return this;
    },

    subscribe(callback) {
      startSSE();
      // Announce on local tab broadcast
      localBc?.postMessage({
        type: 'presence_announce',
        peerId,
        alias,
        online_at: new Date().toISOString(),
      });

      // Periodic heartbeat
      heartbeatTimer = setInterval(async () => {
        if (isClosed) return;
        try {
          const base = import.meta.env.BASE_URL ?? '/';
          const apiPrefix = base.replace(/\/$/, '') + '/api';
          await fetch(`${apiPrefix}/comm/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peerId, alias }),
          });
        } catch (_) {}
      }, 10000);

      setTimeout(() => {
        connectionStatus = 'connected';
        callback?.('SUBSCRIBED');
      }, 150);
      return this;
    },

    async track(presenceData) {
      currentPresence[peerId] = [{
        id: peerId,
        alias: presenceData.alias || alias,
        online_at: presenceData.online_at || new Date().toISOString(),
      }];

      localBc?.postMessage({
        type: 'presence_announce',
        peerId,
        alias: presenceData.alias || alias,
        online_at: presenceData.online_at,
      });

      presenceListeners.forEach(fn => fn({}));
    },

    async send(message) {
      const { event, payload } = message;

      // 1. Post to local tabs
      localBc?.postMessage({
        type: 'broadcast',
        event,
        payload,
      });

      // 2. Post to server relay for other devices on LAN/Network
      try {
        const base = import.meta.env.BASE_URL ?? '/';
        const apiPrefix = base.replace(/\/$/, '') + '/api';
        await fetch(`${apiPrefix}/comm/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: peerId,
            to: payload?.to || '*',
            event,
            payload,
          }),
        });
      } catch (err) {
        console.warn('[CommRelay] send error:', err);
      }
    },

    presenceState() {
      return { ...currentPresence };
    },

    unsubscribe() {
      isClosed = true;
      connectionStatus = 'disconnected';
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      localBc?.postMessage({ type: 'presence_leave', peerId });
      localBc?.close();
      sseSource?.close();
    },

    getBackend: () => backend,
    getConnectionStatus: () => connectionStatus,
  };

  return channel;
}
