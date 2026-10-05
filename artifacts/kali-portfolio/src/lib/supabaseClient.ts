import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem("monix_supabase_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch {}

  const DEFAULT_SUPABASE_URL = "https://qlxhfngeebymtzkheqsx.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_LqBAfchD8HH3sbcsrz97PQ_rbadSpE4";

  return {
    url: ((import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL).trim(),
    anonKey: ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY).trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const cfg = getSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    !cfg.url.includes("placeholder.supabase.co") &&
    cfg.anonKey !== "placeholder-anon-key"
  );
}

// Global cached client instance
let cachedClient: SupabaseClient | null = null;
let lastKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || cfg.url.includes("placeholder.supabase.co") || cfg.anonKey === "placeholder-anon-key") {
    return null;
  }
  const currentKey = `${cfg.url}:::${cfg.anonKey}`;
  if (!cachedClient || lastKey !== currentKey) {
    cachedClient = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    lastKey = currentKey;
  }
  return cachedClient;
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  localStorage.setItem(
    "monix_supabase_config",
    JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
  );
  cachedClient = null;
  lastKey = "";
  window.dispatchEvent(new CustomEvent("monix-supabase-changed"));
}

export function clearSupabaseConfig() {
  localStorage.removeItem("monix_supabase_config");
  cachedClient = null;
  lastKey = "";
  window.dispatchEvent(new CustomEvent("monix-supabase-changed"));
}

/**
 * Diagnostic ping test for Supabase connection, table and storage bucket
 */
export async function testSupabaseConnection(
  targetUrl?: string,
  targetKey?: string
): Promise<{
  success: boolean;
  message: string;
  tableReady: boolean;
  storageReady: boolean;
}> {
  const url = (targetUrl ?? getSupabaseConfig().url).trim();
  const key = (targetKey ?? getSupabaseConfig().anonKey).trim();

  if (!url || !key) {
    return {
      success: false,
      message: "Please enter both Supabase URL and Anon Key.",
      tableReady: false,
      storageReady: false,
    };
  }

  try {
    const testClient = createClient(url, key, { auth: { persistSession: false } });

    // 1. Test database table `cloud_registry`
    let tableReady = false;
    let tableError = "";
    try {
      const { error: tblErr } = await testClient.from("cloud_registry").select("id").limit(1);
      if (!tblErr) {
        tableReady = true;
      } else {
        tableError = tblErr.message;
      }
    } catch (e: any) {
      tableError = e?.message || "Table check failed";
    }

    // 2. Test storage bucket `monix-drive`
    let storageReady = false;
    let storageError = "";
    try {
      const { error: bktErr } = await testClient.storage.from("monix-drive").list("", { limit: 1 });
      if (!bktErr) {
        storageReady = true;
      } else {
        storageError = bktErr.message;
      }
    } catch (e: any) {
      storageError = e?.message || "Bucket check failed";
    }

    if (tableReady && storageReady) {
      return {
        success: true,
        message: "Connected to Supabase! Table and Storage Bucket verified.",
        tableReady: true,
        storageReady: true,
      };
    } else if (tableReady && !storageReady) {
      return {
        success: true,
        message: `Database connected, but 'monix-drive' bucket not found (${storageError || 'create a public bucket named monix-drive'}).`,
        tableReady: true,
        storageReady: false,
      };
    } else if (!tableReady && storageReady) {
      return {
        success: true,
        message: `Storage connected, but 'cloud_registry' table not found (${tableError || 'run SQL migration script'}).`,
        tableReady: false,
        storageReady: true,
      };
    } else {
      const isNetworkErr =
        tableError.toLowerCase().includes("failed to fetch") ||
        storageError.toLowerCase().includes("failed to fetch");
      return {
        success: false,
        message: isNetworkErr
          ? `Cannot reach Supabase host (${url}). Host is offline or unresolvable. Local Cloud Vault remains active.`
          : `Connected to Supabase endpoint, but setup required: ${tableError || storageError}`,
        tableReady: false,
        storageReady: false,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || "Invalid URL or Anon Key"}`,
      tableReady: false,
      storageReady: false,
    };
  }
}

// Safe proxy client that doesn't crash when unconfigured
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (client) {
      const value = (client as any)[prop];
      return typeof value === "function" ? value.bind(client) : value;
    }

    // Unconfigured stub that returns safe chainable objects instead of crashing
    if (prop === "from") {
      return () => ({
        select: () => Promise.resolve({ data: [], error: new Error("Supabase credentials not configured") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase credentials not configured") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase credentials not configured") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase credentials not configured") }),
      });
    }

    if (prop === "storage") {
      return {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error("Supabase storage not configured") }),
          download: () => Promise.resolve({ data: null, error: new Error("Supabase storage not configured") }),
          remove: () => Promise.resolve({ data: null, error: new Error("Supabase storage not configured") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          list: () => Promise.resolve({ data: [], error: new Error("Supabase storage not configured") }),
        }),
      };
    }

    return () => ({ error: new Error("Supabase not configured") });
  },
});

export const supabaseReady = isSupabaseConfigured();
