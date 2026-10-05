import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FileText, File, Image as ImageIcon, Archive,
  ChevronRight, Cloud, Upload, CheckCircle, XCircle,
  HardDrive, Loader2, Database, AlertTriangle,
  Download, RefreshCw, ExternalLink, Mouse,
  Pencil, Trash2, Play, Music2,
  Lock, Unlock, KeyRound, Eye, EyeOff, ShieldCheck,
} from "lucide-react";
import WindowChrome from "./WindowChrome";
import { supabase, isSupabaseConfigured, getSupabaseClient } from "@/lib/supabaseClient";
import { useOSStore } from "@/lib/store";
import type { VFSNode } from "@/lib/vfsUtils";
import SupabaseConfigModal from "./vfs/SupabaseConfigModal";

interface FileExplorerProps {
  onClose: () => void;
  onMinimize?: () => void;
  isActive: boolean;
  onFocus: () => void;
  initialX?: number;
  initialY?: number;
  zIndex?: number;
  onOpenMediaViewer?: (fileName: string, fileUrl: string, fileType: string) => void;
}

// ─── Media type detection from extension ──────────────────────────────────────
type MediaKind = "image" | "video" | "audio" | "unknown";

function detectMediaType(ext: string | undefined): MediaKind {
  const e = (ext ?? "").toLowerCase();
  if (["png","jpg","jpeg","gif","webp","avif","bmp","svg","ico"].includes(e)) return "image";
  if (["mp4","webm","ogv","mov","avi","mkv","m4v"].includes(e))              return "video";
  if (["mp3","wav","ogg","flac","aac","m4a","opus"].includes(e))             return "audio";
  return "unknown";
}

// ─── VFS Icon helpers ─────────────────────────────────────────────────────────
function getVFSIcon(node: VFSNode) {
  if (node.type === "folder") return Folder;
  const e = node.ext ?? "";
  if (["png","jpg","jpeg","svg","gif","webp","avif"].includes(e)) return ImageIcon;
  if (["zip","gz","tar","iso","rar","7z"].includes(e)) return Archive;
  if (["md","txt","log","json","csv"].includes(e)) return FileText;
  return File;
}

function getVFSIconColor(node: VFSNode): string {
  if (node.type === "folder") return "#00f0ff";
  const e = node.ext ?? "";
  if (["zip","gz","tar","iso","rar","7z"].includes(e)) return "#fbbf24";
  if (["png","jpg","jpeg","svg","gif","webp","avif"].includes(e)) return "#34d399";
  if (["sh","py","js","ts","rs","go"].includes(e)) return "#a78bfa";
  if (["enc","key","pem"].includes(e)) return "#f87171";
  if (["md","txt","log"].includes(e)) return "#94a3b8";
  return "#64748b";
}

// ─── Cloud file icon helper ────────────────────────────────────────────────────
function getCloudIcon(fileName: string): { Icon: React.ElementType; color: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["png","jpg","jpeg","gif","webp","avif","bmp","svg","ico"].includes(ext))
    return { Icon: ImageIcon, color: "#34d399" };
  if (["mp4","webm","ogv","mov","avi","mkv","m4v"].includes(ext))
    return { Icon: Play, color: "#a78bfa" };
  if (["mp3","wav","ogg","flac","aac","m4a","opus"].includes(ext))
    return { Icon: Music2, color: "#fb923c" };
  if (["zip","gz","tar","iso","rar","7z"].includes(ext))
    return { Icon: Archive, color: "#fbbf24" };
  if (["md","txt","log","json","csv"].includes(ext))
    return { Icon: FileText, color: "#94a3b8" };
  return { Icon: File, color: "#64748b" };
}

// ─── Supabase cloud registry row ──────────────────────────────────────────────
interface CloudFile {
  id: string;
  file_name: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

// ─── VFS Upload Security Passcode & Local Cloud Mirror ───────────────────────
const VFS_UPLOAD_PASSCODE = "2005";
const LOCAL_CLOUD_STORAGE_KEY = "monix_cloud_registry_local";

const DEFAULT_LOCAL_CLOUD_FILES: CloudFile[] = [
  {
    id: "cloud-vfs-init-1",
    file_name: "MONIX_CLOUD_VAULT.md",
    file_size: 1540,
    file_url: "data:text/markdown;charset=utf-8," + encodeURIComponent("# MONIX OS Cloud Drive\n\nVirtual File System (VFS) Cloud Storage Mirror.\nAll files uploaded are secured and synchronized across local vault & cloud endpoints.\nSecurity clearance passcode: 2005"),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cloud-vfs-init-2",
    file_name: "cyber_sentinel_manifest.json",
    file_size: 3280,
    file_url: "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ vfs: "Monix Cloud VFS v2.0", securityLevel: "AES-256-GCM", status: "Active", uploadPasscodeProtected: true, clearanceCode: "2005" }, null, 2)),
    created_at: new Date(Date.now() - 43200000).toISOString(),
  }
];

function getLocalCloudFiles(): CloudFile[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLOUD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_LOCAL_CLOUD_FILES;
}

function saveLocalCloudFiles(files: CloudFile[]) {
  try {
    localStorage.setItem(LOCAL_CLOUD_STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.warn("[MONIX OS] Failed to save local cloud mirror:", e);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastKind = "success" | "error" | "info";
interface Toast { id: number; kind: ToastKind; msg: string }

// ─── Context menu item ────────────────────────────────────────────────────────
interface CtxMenuItem { label: string; icon: React.ReactNode; action: () => void; danger?: boolean }

// ─── Main component ───────────────────────────────────────────────────────────
export default function FileExplorer({
  onClose, onMinimize, isActive, onFocus, initialX, initialY, zIndex,
  onOpenMediaViewer,
}: FileExplorerProps) {
  const [tab, setTab] = useState<"local" | "cloud">("local");
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isCloudConfigured, setIsCloudConfigured] = useState(isSupabaseConfigured());
  const [localSearch, setLocalSearch] = useState("");
  const localFileInputRef = useRef<HTMLInputElement>(null);

  // ── VFS Upload Passcode Lock state (Password: 2005) ──
  const [isVFSLocked, setIsVFSLocked]                 = useState<boolean>(true);
  const [showLockModal, setShowLockModal]             = useState<boolean>(false);
  const [passcode, setPasscode]                       = useState<string>("");
  const [passcodeError, setPasscodeError]             = useState<string>("");
  const [showPasscodeText, setShowPasscodeText]       = useState<boolean>(false);
  const [isShaking, setIsShaking]                     = useState<boolean>(false);
  const [pendingUploadTarget, setPendingUploadTarget] = useState<"local" | "cloud">("local");
  const [pendingFile, setPendingFile]                 = useState<File | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus]         = useState<"online" | "vault" | "connecting">("connecting");

  // ── VFS state (reads from store — populated by Desktop on mount) ──
  const { localFileSystem, addVFSNode, removeVFSNode, renameVFSNode } = useOSStore();

  // Navigation: stack of folder IDs; last entry = current folder
  const [navStack, setNavStack] = useState<string[]>(["root"]);
  const currentFolderId = navStack[navStack.length - 1];

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: CtxMenuItem[] } | null>(null);

  // Derive children and breadcrumb from navStack + tree
  const currentChildren = localFileSystem
    .filter((n) => n.parentId === currentFolderId)
    .filter((n) => localSearch ? n.name.toLowerCase().includes(localSearch.toLowerCase()) : true);
  const breadcrumb: VFSNode[] = navStack.map((id) =>
    localFileSystem.find((n) => n.id === id) ?? { id, name: id === "root" ? "storage" : id, type: "folder", parentId: "" }
  );

  // Reset navigation when VFS reloads (e.g., first mount)
  useEffect(() => {
    setNavStack(["root"]);
  }, [localFileSystem.length]);

  // Close ctx menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => setCtxMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [ctxMenu]);

  // External folder navigation listener (e.g. from browser downloads)
  useEffect(() => {
    const handleOpenFolder = (e: Event) => {
      const folderId = (e as CustomEvent<{ folderId: string }>).detail?.folderId;
      if (folderId) {
        setNavStack(["root", folderId]);
      }
    };
    window.addEventListener("monix-open-folder", handleOpenFolder);
    return () => window.removeEventListener("monix-open-folder", handleOpenFolder);
  }, []);

  // ── Smart file opener: media → in-OS viewer, else → download ──────────────
  const openFile = useCallback((node: VFSNode) => {
    if (!node.url) return;
    const kind = detectMediaType(node.ext);
    if (kind !== "unknown") {
      onOpenMediaViewer?.(node.name, node.url, kind);
    } else {
      // Fallback: trigger native download — never leaves the OS tab
      const a = document.createElement("a");
      a.href = node.url;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }, [onOpenMediaViewer]);

  // ── VFS navigation ──
  const navigateInto = useCallback((node: VFSNode) => {
    if (node.type === "folder") {
      setNavStack((s) => [...s, node.id]);
    } else {
      openFile(node);
    }
  }, [openFile]);

  const navigateToBreadcrumb = useCallback((idx: number) => {
    setNavStack((s) => s.slice(0, idx + 1));
  }, []);

  const downloadFile = async (node: VFSNode) => {
    if (!node.url) return;
    try {
      const res = await fetch(node.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch { /* silent — context menu usage */ }
  };

  // ── Toast System ──
  const [toasts, setToasts]                 = useState<Toast[]>([]);
  const toastCounter                        = useRef(0);

  const pushToast = useCallback((kind: ToastKind, msg: string) => {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  // ── Cloud state ──
  const [cloudFiles, setCloudFiles]         = useState<CloudFile[]>(() => getLocalCloudFiles());
  const [loadingFiles, setLoadingFiles]     = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [gridRefreshing, setGridRefreshing] = useState(false);
  const [downloadingId, setDownloadingId]   = useState<string | null>(null);
  const [cloudWindowMenu, setCloudWindowMenu] = useState<{ x: number; y: number } | null>(null);
  const [cloudItemMenu, setCloudItemMenu]   = useState<{ x: number; y: number; file: CloudFile } | null>(null);
  const [renamingId, setRenamingId]         = useState<string | null>(null);
  const [renameValue, setRenameValue]       = useState("");
  const cloudFileInputRef                   = useRef<HTMLInputElement>(null);

  // ── Local File Processing ──
  const processLocalFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const relativePath = currentFolderId === 'root' ? file.name : `${currentFolderId}/${file.name}`;
      const newNode: VFSNode = {
        id: relativePath,
        name: file.name,
        type: 'file',
        parentId: currentFolderId,
        url,
        ext,
        size: file.size,
        isUserCreated: true,
      };
      addVFSNode(newNode);
      pushToast("success", `File ${file.name} saved to local VFS`);
    };
    reader.readAsDataURL(file);
  }, [currentFolderId, addVFSNode, pushToast]);

  // ── Cloud Upload Processing ──
  const doUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    pushToast("info", `Securing ${file.name} to Cloud Drive...`);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const newFile: CloudFile = {
          id: "cf_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
          file_name: file.name,
          file_size: file.size,
          file_url: dataUrl,
          created_at: new Date().toISOString(),
        };

        // Always save to Local Cloud Vault immediately
        const current = getLocalCloudFiles().filter((f) => f.file_name !== file.name);
        const updated = [newFile, ...current];
        saveLocalCloudFiles(updated);
        setCloudFiles(updated);
        pushToast("success", `${file.name} secured to Cloud Vault`);

        // Asynchronously mirror to Supabase if configured & reachable
        if (isSupabaseConfigured()) {
          try {
            const client = getSupabaseClient();
            if (client) {
              const storagePath = `${Date.now()}_${file.name}`;
              const { error: storageError } = await client.storage
                .from("monix-drive")
                .upload(storagePath, file, { upsert: true });

              if (!storageError) {
                const { data: urlData } = client.storage.from("monix-drive").getPublicUrl(storagePath);
                await client.from("cloud_registry").insert([
                  {
                    file_name: file.name,
                    file_size: file.size,
                    file_url: urlData?.publicUrl || dataUrl,
                  },
                ]);
                setCloudSyncStatus("online");
              }
            }
          } catch (remoteErr) {
            console.warn("[MONIX OS] Remote Supabase mirror skipped, kept in Local Cloud Vault:", remoteErr);
          }
        }
      } catch (err: any) {
        console.error("[MONIX OS] Cloud upload error:", err);
        pushToast("error", `Upload failed — ${err?.message ?? "Storage error"}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [pushToast]);

  // ── Centralized Upload Authorization Gatekeeper (Password: 2005) ──
  const requestUpload = useCallback((target: "local" | "cloud", fileToUpload?: File) => {
    if (!isVFSLocked) {
      if (fileToUpload) {
        if (target === "local") processLocalFileUpload(fileToUpload);
        else doUpload(fileToUpload);
      } else {
        if (target === "local") localFileInputRef.current?.click();
        else cloudFileInputRef.current?.click();
      }
      return;
    }

    setPendingUploadTarget(target);
    setPendingFile(fileToUpload || null);
    setPasscode("");
    setPasscodeError("");
    setShowLockModal(true);
  }, [isVFSLocked, processLocalFileUpload, doUpload]);

  const handleAuthorizePasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === VFS_UPLOAD_PASSCODE) {
      setIsVFSLocked(false);
      setShowLockModal(false);
      setPasscodeError("");
      pushToast("success", "🔓 VFS Access Granted: File system write authorized");

      const target = pendingUploadTarget;
      const file = pendingFile;
      setPendingFile(null);

      setTimeout(() => {
        if (file) {
          if (target === "local") processLocalFileUpload(file);
          else doUpload(file);
        } else {
          if (target === "local") localFileInputRef.current?.click();
          else cloudFileInputRef.current?.click();
        }
      }, 150);
    } else {
      setPasscodeError("ACCESS DENIED: Incorrect passcode. Enter '2005' to authorize upload.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (isVFSLocked) {
      requestUpload("local", file);
      return;
    }
    processLocalFileUpload(file);
  };

  const handleCloudFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (isVFSLocked) {
      requestUpload("cloud", file);
      return;
    }
    doUpload(file);
  };

  const handleCreateFolder = () => {
    const name = window.prompt("Enter new folder name:");
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const folderId = currentFolderId === 'root' ? cleanName : `${currentFolderId}/${cleanName}`;
    const newFolder: VFSNode = {
      id: folderId,
      name: cleanName,
      type: 'folder',
      parentId: currentFolderId,
      isUserCreated: true,
    };
    addVFSNode(newFolder);
    pushToast("success", `Folder ${cleanName} created`);
  };

  const openCtxMenu = (e: React.MouseEvent, node: VFSNode) => {
    e.preventDefault();
    e.stopPropagation();
    const items: CtxMenuItem[] = node.type === "folder"
      ? [
          { label: "Open", icon: <Folder size={11} />, action: () => navigateInto(node) },
          ...(node.isUserCreated ? [
            { label: "Delete Folder", icon: <Trash2 size={11} />, action: () => removeVFSNode(node.id), danger: true }
          ] : [])
        ]
      : [
          { label: "Open",     icon: <ExternalLink size={11} />, action: () => openFile(node) },
          { label: "Download", icon: <Download size={11} />,     action: () => downloadFile(node) },
          ...(node.isUserCreated ? [
            { label: "Delete File", icon: <Trash2 size={11} />, action: () => removeVFSNode(node.id), danger: true }
          ] : [])
        ];
    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  // ── Resilient Cloud Registry Fetch (Local Vault Mirror + Supabase Sync) ──
  const fetchCloudFiles = useCallback(async () => {
    const local = getLocalCloudFiles();
    setCloudFiles(local);

    if (!isSupabaseConfigured()) {
      setCloudSyncStatus("vault");
      setLoadingFiles(false);
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      setCloudSyncStatus("vault");
      setLoadingFiles(false);
      return;
    }

    setLoadingFiles(true);
    try {
      const fetchPromise = client
        .from("cloud_registry")
        .select("*")
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase connection timed out")), 3500)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (res.error) throw res.error;

      const remoteFiles = (res.data as CloudFile[]) ?? [];
      if (remoteFiles.length > 0) {
        setCloudFiles(remoteFiles);
        saveLocalCloudFiles(remoteFiles);
        setCloudSyncStatus("online");
      } else {
        setCloudFiles(local);
        setCloudSyncStatus("online");
      }
    } catch (err: any) {
      console.warn("[MONIX OS] Supabase remote sync offline, running in Secure Local Vault mode:", err?.message || err);
      setCloudFiles(getLocalCloudFiles());
      setCloudSyncStatus("vault");
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "cloud") fetchCloudFiles();
  }, [tab, fetchCloudFiles]);

  useEffect(() => {
    const onCfgChange = () => {
      setIsCloudConfigured(isSupabaseConfigured());
      if (tab === "cloud") fetchCloudFiles();
    };
    window.addEventListener("monix-supabase-changed", onCfgChange);
    return () => window.removeEventListener("monix-supabase-changed", onCfgChange);
  }, [tab, fetchCloudFiles]);

  const doCloudDownload = useCallback(async (file: CloudFile) => {
    setDownloadingId(file.id);
    pushToast("info", `Fetching ${file.file_name}...`);
    try {
      if (file.file_url.startsWith("data:") || file.file_url.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = file.file_url;
        a.download = file.file_name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        pushToast("success", `${file.file_name} downloaded`);
        return;
      }

      const res = await fetch(file.file_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      pushToast("success", `${file.file_name} downloaded`);
    } catch (err: any) {
      console.warn("[MONIX OS] Cloud download fetch error, opening direct link:", err);
      try {
        const a = document.createElement("a");
        a.href = file.file_url;
        a.download = file.file_name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
        pushToast("success", `${file.file_name} downloaded`);
      } catch {
        pushToast("error", `Download failed — ${err?.message ?? JSON.stringify(err)}`);
      }
    } finally {
      setDownloadingId(null);
    }
  }, [pushToast]);

  const doCloudOpen = useCallback((file: CloudFile) => {
    const ext = file.file_name.split(".").pop()?.toLowerCase() ?? "";
    const kind = detectMediaType(ext);
    if (kind !== "unknown") {
      onOpenMediaViewer?.(file.file_name, file.file_url, kind);
    } else {
      doCloudDownload(file);
    }
  }, [onOpenMediaViewer, doCloudDownload]);

  const doCloudDelete = useCallback(async (file: CloudFile) => {
    const updated = getLocalCloudFiles().filter((f) => f.id !== file.id);
    saveLocalCloudFiles(updated);
    setCloudFiles(updated);
    pushToast("success", `${file.file_name} deleted`);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from("cloud_registry").delete().eq("id", file.id);
        }
      } catch (err) {
        console.warn("[MONIX OS] Supabase remote delete skipped:", err);
      }
    }
  }, [pushToast]);

  const doCloudRename = useCallback(async (file: CloudFile, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === file.file_name) {
      setRenamingId(null);
      return;
    }

    const updated = getLocalCloudFiles().map((f) =>
      f.id === file.id ? { ...f, file_name: trimmed } : f
    );
    saveLocalCloudFiles(updated);
    setCloudFiles(updated);
    pushToast("success", `Renamed to ${trimmed}`);
    setRenamingId(null);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from("cloud_registry").update({ file_name: trimmed }).eq("id", file.id);
        }
      } catch (err) {
        console.warn("[MONIX OS] Supabase remote rename skipped:", err);
      }
    }
  }, [pushToast]);

  // Close cloud menus on outside click
  useEffect(() => {
    if (!cloudWindowMenu && !cloudItemMenu) return;
    const handler = () => { setCloudWindowMenu(null); setCloudItemMenu(null); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [cloudWindowMenu, cloudItemMenu]);

  const toastColors: Record<ToastKind, { bg: string; border: string; color: string; shadow: string }> = {
    success: { bg:"rgba(0,255,136,0.1)",   border:"rgba(0,255,136,0.35)",   color:"#00ff88", shadow:"0 0 20px rgba(0,255,136,0.2)"   },
    error:   { bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.35)", color:"#f87171", shadow:"0 0 20px rgba(248,113,113,0.2)" },
    info:    { bg:"rgba(0,240,255,0.08)",  border:"rgba(0,240,255,0.3)",    color:"#00f0ff", shadow:"0 0 20px rgba(0,240,255,0.15)"  },
  };

  return (
    <WindowChrome
      title="MONIX Files — Secure File Manager"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      onFocus={onFocus}
      initialX={initialX}
      initialY={initialY}
      width={760}
      height={520}
      zIndex={zIndex}
    >
      <div className="flex flex-col h-full bg-[#050505] font-mono overflow-hidden">

        {/* ── Tab Bar ── */}
        <div className="flex items-center border-b border-white/[0.06] bg-[#080808] px-3 pt-2 gap-1 shrink-0">
          {[
            { id: "local" as const, label: "LOCAL SYSTEM", icon: <HardDrive size={12} /> },
            { id: "cloud" as const, label: "CLOUD DRIVE",  icon: <Cloud size={12} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] tracking-widest transition-all duration-200 rounded-t"
              style={{
                color:        tab === t.id ? "#00f0ff" : "rgba(255,255,255,0.3)",
                borderBottom: tab === t.id ? "2px solid #00f0ff" : "2px solid transparent",
                background:   tab === t.id ? "rgba(0,240,255,0.05)" : "transparent",
                textShadow:   tab === t.id ? "0 0 10px rgba(0,240,255,0.7)" : "none",
                fontWeight:   tab === t.id ? 700 : 400,
              }}
            >
              {t.icon}<span className="ml-1">{t.label}</span>
            </button>
          ))}
          <div className="ml-auto pb-1.5 flex items-center gap-2">
            {/* VFS Upload Lock Toggle */}
            <button
              onClick={() => {
                if (isVFSLocked) {
                  setShowLockModal(true);
                } else {
                  setIsVFSLocked(true);
                  pushToast("info", "🔒 VFS upload write lock re-engaged");
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono tracking-wider border transition-all hover:scale-105"
              style={{
                borderColor: isVFSLocked ? "rgba(239, 68, 68, 0.45)" : "rgba(34, 197, 94, 0.4)",
                background: isVFSLocked ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.08)",
                color: isVFSLocked ? "#f87171" : "#4ade80",
                boxShadow: isVFSLocked ? "0 0 10px rgba(239, 68, 68, 0.15)" : "0 0 10px rgba(34, 197, 94, 0.15)",
              }}
              title={isVFSLocked ? "VFS Upload Locked — Passcode: 2005 (Click to Unlock)" : "VFS Upload Unlocked — Click to Re-lock"}
            >
              {isVFSLocked ? <Lock size={10} className="text-red-400" /> : <Unlock size={10} className="text-emerald-400" />}
              <span>{isVFSLocked ? "VFS LOCKED (2005)" : "VFS UNLOCKED"}</span>
            </button>

            {/* Cloud Status / Supabase Modal trigger */}
            <button
              onClick={() => setShowSupabaseModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono tracking-wider border transition-all hover:scale-105"
              style={{
                borderColor: cloudSyncStatus === "online" ? "rgba(74, 222, 128, 0.4)" : "rgba(0, 240, 255, 0.35)",
                background: cloudSyncStatus === "online" ? "rgba(74, 222, 128, 0.08)" : "rgba(0, 240, 255, 0.06)",
                color: cloudSyncStatus === "online" ? "#4ade80" : "#00f0ff",
              }}
              title="Configure Supabase Cloud Storage"
            >
              <Database size={10} />
              <span>{cloudSyncStatus === "online" ? "SUPABASE: SYNCED" : "CLOUD VAULT: ACTIVE"}</span>
            </button>
            <span className="text-[9px] text-white/20 tracking-widest hidden sm:inline">
              {tab === "local" ? `${localFileSystem.filter(n=>n.type==="file").length} VFS FILES` : `${cloudFiles.length} CLOUD FILES`}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ══ TAB 1: LOCAL VFS (real glob-backed) ══ */}
            {tab === "local" && (
              <motion.div
                key="local"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col h-full"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCtxMenu({
                    x: e.clientX,
                    y: e.clientY,
                    items: [
                      { label: "Upload File Here", icon: <Upload size={11} />, action: () => requestUpload("local") },
                      { label: "New Folder", icon: <Folder size={11} />, action: handleCreateFolder },
                    ],
                  });
                }}
              >
                {/* Hidden file input for local uploads */}
                <input
                  ref={localFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleLocalFileChange}
                />

                {/* Breadcrumb & Action bar */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-[#060606] shrink-0">
                  <Database size={10} className="text-white/20 mr-1 shrink-0" />
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
                    {breadcrumb.map((node, i) => (
                      <span key={node.id} className="flex items-center gap-1 shrink-0">
                        {i > 0 && <ChevronRight size={10} className="text-white/15" />}
                        <button
                          onClick={() => navigateToBreadcrumb(i)}
                          className="text-[10px] tracking-wider transition-all hover:underline shrink-0"
                          style={{
                            color:      i === breadcrumb.length - 1 ? "#00f0ff" : "rgba(255,255,255,0.35)",
                            textShadow: i === breadcrumb.length - 1 ? "0 0 8px rgba(0,240,255,0.6)" : "none",
                          }}
                        >
                          {node.name}
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => requestUpload("local")}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] tracking-widest text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
                      title="Upload a file from your computer to VFS (Passcode: 2005)"
                    >
                      <Upload size={10} /> UPLOAD
                    </button>
                    <button
                      onClick={handleCreateFolder}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] tracking-widest text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      title="Create a new folder in current directory"
                    >
                      <Folder size={10} /> NEW FOLDER
                    </button>
                    <span className="text-[9px] text-white/20 tracking-widest pl-1">
                      {currentChildren.length} ITEMS
                    </span>
                  </div>
                </div>

                {/* Files grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {localFileSystem.length === 0 ? (
                    // VFS not yet loaded (shouldn't happen after Desktop mounts)
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-white/15">
                      <Loader2 size={28} className="animate-spin" style={{ color:"#00f0ff" }} />
                      <span className="text-[10px] tracking-widest">INITIALIZING VFS...</span>
                    </div>
                  ) : currentChildren.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-white/15">
                      <AlertTriangle size={28} />
                      <span className="text-[11px] tracking-widest">EMPTY DIRECTORY</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-3">
                      {currentChildren.map((node) => {
                        const Icon  = getVFSIcon(node);
                        const color = getVFSIconColor(node);
                        return (
                          <motion.div
                            key={node.id}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onDoubleClick={() => navigateInto(node)}
                            onContextMenu={(e) => openCtxMenu(e, node)}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg cursor-pointer text-center select-none"
                            style={{
                              background:  "rgba(255,255,255,0.02)",
                              border:      "1px solid rgba(255,255,255,0.04)",
                              transition:  "background 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.background   = "rgba(0,240,255,0.05)";
                              el.style.borderColor  = "rgba(0,240,255,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.background   = "rgba(255,255,255,0.02)";
                              el.style.borderColor  = "rgba(255,255,255,0.04)";
                            }}
                          >
                            <Icon size={30} style={{ color, filter:`drop-shadow(0 0 6px ${color}88)` }} />
                            <span className="text-[10px] text-white/70 truncate w-full leading-tight" title={node.name}>
                              {node.name}
                            </span>
                            {node.type === "file" && node.ext && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest"
                                style={{ background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.25)" }}>
                                .{node.ext}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Help hint */}
                <div className="shrink-0 px-4 py-1.5 border-t border-white/[0.04] flex items-center gap-3"
                  style={{ background:"rgba(0,0,0,0.3)" }}>
                  <Mouse size={9} className="text-white/15" />
                  <span className="text-[9px] text-white/15 tracking-wider">
                    DOUBLE-CLICK to open · RIGHT-CLICK for options
                  </span>
                </div>
              </motion.div>
            )}

            {/* ══ TAB 2: CLOUD DRIVE (Supabase) — Grid View ══ */}
            {tab === "cloud" && (
              <motion.div
                key="cloud"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col h-full overflow-hidden relative"
              >
                {/* Hidden file input for uploads */}
                <input ref={cloudFileInputRef} type="file" className="hidden" onChange={handleCloudFileChange} />

                {/* Toolbar */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-[#060606] shrink-0">
                  <Database size={10} className="text-white/20 mr-1 shrink-0" />
                  <span className="text-[10px] tracking-widest font-bold" style={{ color:"rgba(0,240,255,0.6)" }}>
                    cloud_registry
                  </span>
                  <span className="text-[9px] text-white/15 tracking-widest">/ monix-drive</span>

                  {isUploading && (
                    <span className="flex items-center gap-1 text-[9px] tracking-widest" style={{ color:"#00f0ff" }}>
                      <Loader2 size={9} className="animate-spin" /> UPLOADING...
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => requestUpload("cloud")}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] tracking-widest text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
                      title="Upload a file to Cloud Drive (Passcode: 2005)"
                    >
                      <Upload size={10} /> UPLOAD
                    </button>
                    <button
                      onClick={() => { setGridRefreshing(true); fetchCloudFiles().finally(() => setTimeout(() => setGridRefreshing(false), 300)); }}
                      disabled={loadingFiles}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] tracking-widest transition-all"
                      style={{ color:"rgba(255,255,255,0.3)", border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}
                    >
                      <RefreshCw size={9} className={loadingFiles ? "animate-spin" : ""} /> REFRESH
                    </button>
                    <span className="text-[9px] text-white/15 tracking-widest">{cloudFiles.length} FILES</span>
                  </div>
                </div>

                {/* Grid area — right-click opens cloud window menu */}
                <div
                  className="flex-1 min-h-0 overflow-y-auto p-4 relative"
                  style={{ minHeight: 0 }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCloudWindowMenu({ x: e.clientX, y: e.clientY });
                    setCloudItemMenu(null);
                  }}
                >
                  {/* Inner full-height wrapper ensures right-click captures entire empty area */}
                  <div
                    className="flex flex-col min-h-full transition-opacity duration-300"
                    style={{ opacity: gridRefreshing ? 0.35 : 1 }}
                  >
                  {loadingFiles ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-white/15" style={{ minHeight: 200 }}>
                      <Loader2 size={28} className="animate-spin" style={{ color:"#00f0ff" }} />
                      <span className="text-[10px] tracking-widest">QUERYING REGISTRY...</span>
                    </div>
                  ) : cloudFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-white/15" style={{ minHeight: 200 }}>
                      <Cloud size={32} />
                      <span className="text-[11px] tracking-widest">CLOUD DRIVE EMPTY</span>
                      <span className="text-[9px] text-white/10 tracking-widest">Right-click to upload a file</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-3">
                      {cloudFiles.map((f, i) => {
                        const { Icon, color } = getCloudIcon(f.file_name);
                        const isRenaming = renamingId === f.id;
                        return (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onDoubleClick={() => doCloudOpen(f)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCloudItemMenu({ x: e.clientX, y: e.clientY, file: f });
                              setCloudWindowMenu(null);
                            }}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg cursor-pointer text-center select-none relative"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.04)",
                              transition: "background 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.background  = "rgba(0,240,255,0.05)";
                              el.style.borderColor = "rgba(0,240,255,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.background  = "rgba(255,255,255,0.02)";
                              el.style.borderColor = "rgba(255,255,255,0.04)";
                            }}
                          >
                            {downloadingId === f.id
                              ? <Loader2 size={30} className="animate-spin" style={{ color:"#00f0ff" }} />
                              : <Icon size={30} style={{ color, filter:`drop-shadow(0 0 6px ${color}88)` }} />
                            }

                            {isRenaming ? (
                              <input
                                autoFocus
                                className="w-full text-[10px] text-center bg-transparent border-b border-cyan-500/50 outline-none text-white/80 leading-tight"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") doCloudRename(f, renameValue);
                                  if (e.key === "Escape") setRenamingId(null);
                                  e.stopPropagation();
                                }}
                                onBlur={() => doCloudRename(f, renameValue)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-[10px] text-white/70 truncate w-full leading-tight" title={f.file_name}>
                                {f.file_name}
                              </span>
                            )}

                            <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest"
                              style={{ background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.2)" }}>
                              {formatBytes(f.file_size)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  </div>{/* /inner min-h-full wrapper */}
                </div>

                {/* Help hint */}
                <div className="shrink-0 px-4 py-1.5 border-t border-white/[0.04] flex items-center gap-3"
                  style={{ background:"rgba(0,0,0,0.3)" }}>
                  <Mouse size={9} className="text-white/15" />
                  <span className="text-[9px] text-white/15 tracking-wider">
                    DOUBLE-CLICK to open · RIGHT-CLICK file for options · RIGHT-CLICK background to upload
                  </span>
                </div>

                {/* ── Cloud Window Context Menu (empty space) ── */}
                <AnimatePresence>
                  {cloudWindowMenu && (
                    <motion.div
                      initial={{ opacity:0, scale:0.93 }}
                      animate={{ opacity:1, scale:1 }}
                      exit={{ opacity:0, scale:0.93 }}
                      transition={{ duration:0.12 }}
                      className="fixed flex flex-col py-1 rounded-lg overflow-hidden"
                      style={{
                        left: cloudWindowMenu.x, top: cloudWindowMenu.y,
                        zIndex: (zIndex ?? 100) + 70,
                        background: "rgba(8,8,8,0.97)",
                        border: "1px solid rgba(0,240,255,0.2)",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.75), 0 0 20px rgba(0,240,255,0.08)",
                        minWidth: 160,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { label: "📤  Upload File", action: () => { setCloudWindowMenu(null); requestUpload("cloud"); } },
                        { label: "🔄  Refresh",      action: () => { setCloudWindowMenu(null); setGridRefreshing(true); fetchCloudFiles().finally(() => { setTimeout(() => setGridRefreshing(false), 300); }); } },
                      ].map(({ label, action }) => (
                        <button key={label} onClick={action}
                          className="flex items-center px-3 py-2 text-[11px] tracking-wider text-left transition-all"
                          style={{ color:"rgba(255,255,255,0.75)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,240,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color="#00f0ff"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background="transparent"; (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.75)"; }}
                        >{label}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Cloud Item Context Menu (file) ── */}
                <AnimatePresence>
                  {cloudItemMenu && (
                    <motion.div
                      initial={{ opacity:0, scale:0.93 }}
                      animate={{ opacity:1, scale:1 }}
                      exit={{ opacity:0, scale:0.93 }}
                      transition={{ duration:0.12 }}
                      className="fixed flex flex-col py-1 rounded-lg overflow-hidden"
                      style={{
                        left: cloudItemMenu.x, top: cloudItemMenu.y,
                        zIndex: (zIndex ?? 100) + 70,
                        background: "rgba(8,8,8,0.97)",
                        border: "1px solid rgba(0,240,255,0.2)",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.75), 0 0 20px rgba(0,240,255,0.08)",
                        minWidth: 160,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        {
                          label: "📂  Open",
                          icon: null,
                          danger: false,
                          action: () => { doCloudOpen(cloudItemMenu.file); setCloudItemMenu(null); },
                        },
                        {
                          label: "📥  Download",
                          icon: <Download size={11} />,
                          danger: false,
                          action: () => { doCloudDownload(cloudItemMenu.file); setCloudItemMenu(null); },
                        },
                        {
                          label: "✏️  Rename",
                          icon: <Pencil size={11} />,
                          danger: false,
                          action: () => {
                            setRenamingId(cloudItemMenu.file.id);
                            setRenameValue(cloudItemMenu.file.file_name);
                            setCloudItemMenu(null);
                          },
                        },
                        {
                          label: "🗑️  Delete",
                          icon: <Trash2 size={11} />,
                          danger: true,
                          action: () => { doCloudDelete(cloudItemMenu.file); setCloudItemMenu(null); },
                        },
                      ].map(({ label, danger, action }) => (
                        <button key={label} onClick={action}
                          className="flex items-center px-3 py-2 text-[11px] tracking-wider text-left transition-all"
                          style={{ color: danger ? "#f87171" : "rgba(255,255,255,0.75)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,240,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color= danger ? "#f87171" : "#00f0ff"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background="transparent"; (e.currentTarget as HTMLButtonElement).style.color= danger ? "#f87171" : "rgba(255,255,255,0.75)"; }}
                        >{label}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── In-explorer context menu ── */}
        <AnimatePresence>
          {ctxMenu && (
            <motion.div
              initial={{ opacity:0, scale:0.93 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.93 }}
              transition={{ duration:0.12 }}
              className="fixed flex flex-col py-1 rounded-lg overflow-hidden"
              style={{
                left:    ctxMenu.x,
                top:     ctxMenu.y,
                zIndex:  (zIndex ?? 100) + 60,
                background:    "rgba(8,8,8,0.96)",
                border:        "1px solid rgba(0,240,255,0.18)",
                backdropFilter:"blur(16px)",
                boxShadow:     "0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,240,255,0.08)",
                minWidth:      150,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {ctxMenu.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setCtxMenu(null); }}
                  className="flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-wider text-left transition-all"
                  style={{ color: item.danger ? "#f87171" : "rgba(255,255,255,0.75)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,240,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#f87171" : "#00f0ff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#f87171" : "rgba(255,255,255,0.75)"; }}
                >
                  <span style={{ color: item.danger ? "#f87171" : "rgba(0,240,255,0.7)" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toast Layer ── */}
        <div className="fixed bottom-14 right-4 flex flex-col gap-2 pointer-events-none"
          style={{ zIndex:(zIndex ?? 100) + 50 }}>
          <AnimatePresence>
            {toasts.map((t) => {
              const c = toastColors[t.kind];
              return (
                <motion.div key={t.id}
                  initial={{ opacity:0, x:40, scale:0.9 }}
                  animate={{ opacity:1, x:0,  scale:1   }}
                  exit={{ opacity:0, x:40, scale:0.9 }}
                  transition={{ duration:0.22 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[11px] tracking-wider font-bold shadow-2xl"
                  style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.color, boxShadow:`${c.shadow},0 8px 32px rgba(0,0,0,0.6)`, backdropFilter:"blur(12px)", minWidth:220, pointerEvents:"auto" }}>
                  {t.kind==="success" && <CheckCircle size={14}/>}
                  {t.kind==="error"   && <XCircle size={14}/>}
                  {t.kind==="info"    && <Cloud size={14}/>}
                  {t.msg}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── VFS Upload Security Passcode Lock Modal (Password: 2005) ── */}
        <AnimatePresence>
          {showLockModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-mono"
              onClick={() => {
                setShowLockModal(false);
                setPasscode("");
                setPasscodeError("");
                setPendingFile(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0a0c10] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0e1218]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white tracking-widest flex items-center gap-2">
                        VFS SECURITY AUTHORIZATION
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          PASSWORD: 2005
                        </span>
                      </h2>
                      <p className="text-[10px] text-gray-400 tracking-wider">
                        Upload operation locked · Clearance required
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowLockModal(false);
                      setPasscode("");
                      setPasscodeError("");
                      setPendingFile(null);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleAuthorizePasscode} className="p-5 space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[10px] text-cyan-200/90 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                      <KeyRound size={12} />
                      FILE SYSTEM WRITE PROTECTION
                    </div>
                    Target: <span className="text-white font-bold uppercase">{pendingUploadTarget} SYSTEM</span>
                    {pendingFile && <span className="text-cyan-300 ml-1">({pendingFile.name})</span>}.
                    Enter the authorized security passcode <code className="text-cyan-300 font-bold bg-black/40 px-1 py-0.5 rounded">2005</code> to unlock and authorize file upload.
                  </div>

                  <motion.div
                    animate={isShaking ? { x: [-10, 10, -10, 10, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-[10px] uppercase tracking-widest text-gray-300 font-bold">
                      Enter Security Passcode:
                    </label>
                    <div className="relative">
                      <input
                        type={showPasscodeText ? "text" : "password"}
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          if (passcodeError) setPasscodeError("");
                        }}
                        autoFocus
                        placeholder="ENTER PASSCODE (2005)"
                        className="w-full px-3.5 py-2.5 bg-black/70 border rounded-xl text-center text-sm font-mono tracking-widest text-cyan-400 placeholder:text-gray-600 outline-none transition-all"
                        style={{
                          borderColor: passcodeError ? "rgba(239, 68, 68, 0.6)" : "rgba(0, 240, 255, 0.3)",
                          boxShadow: passcodeError ? "0 0 15px rgba(239, 68, 68, 0.2)" : "0 0 15px rgba(0, 240, 255, 0.1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscodeText(!showPasscodeText)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                        title={showPasscodeText ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showPasscodeText ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {passcodeError && (
                      <p className="text-[10px] text-red-400 tracking-wider flex items-center gap-1 mt-1">
                        <AlertTriangle size={11} /> {passcodeError}
                      </p>
                    )}
                  </motion.div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLockModal(false);
                        setPasscode("");
                        setPasscodeError("");
                        setPendingFile(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-[10px] tracking-wider transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-1.5"
                    >
                      <Unlock size={11} />
                      AUTHORIZE & UNLOCK
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Supabase Cloud Settings Modal ── */}
        <SupabaseConfigModal
          isOpen={showSupabaseModal}
          onClose={() => setShowSupabaseModal(false)}
          onConfigSaved={() => {
            setIsCloudConfigured(isSupabaseConfigured());
            fetchCloudFiles();
            pushToast("success", "Supabase credentials updated successfully");
          }}
        />
      </div>
    </WindowChrome>
  );
}
