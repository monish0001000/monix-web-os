// ─── VFS Node ─────────────────────────────────────────────────────────────────
export interface VFSNode {
  id: string;          // unique path-based id, e.g. "sangeetha_makeover" or "sangeetha_makeover/Screenshot (509).webp"
  name: string;        // display name
  type: "folder" | "file";
  parentId: string;    // "root" for top-level, else parent folder id
  url?: string;        // bundled asset URL or object URL / data URL (files only)
  ext?: string;        // lowercase extension (files only)
  size?: number;       // bytes (optional)
  isUserCreated?: boolean;
}

const USER_VFS_STORAGE_KEY = "monix_user_vfs_nodes";

export function getUserVFSNodes(): VFSNode[] {
  try {
    const raw = localStorage.getItem(USER_VFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserVFSNodes(nodes: VFSNode[]) {
  try {
    localStorage.setItem(USER_VFS_STORAGE_KEY, JSON.stringify(nodes));
  } catch (err) {
    console.warn("[VFS] Failed to persist user VFS nodes to localStorage:", err);
  }
}

// ─── Build tree from Vite glob output ─────────────────────────────────────────
export function buildVFSTree(rawFiles: Record<string, string>): VFSNode[] {
  const nodes: VFSNode[] = [
    { id: "root", name: "storage", type: "folder", parentId: "" },
  ];
  const seenFolders = new Set<string>(["root"]);

  for (const [key, url] of Object.entries(rawFiles)) {
    // Strip the Vite glob prefix to get a relative path
    // Key format: "/src/storage/foo/bar/file.ext"
    const relativePath = key.replace(/^\/src\/storage\//, "");
    if (!relativePath) continue;

    const parts = relativePath.split("/");

    // Ensure every ancestor folder exists
    let parentId = "root";
    for (let i = 0; i < parts.length - 1; i++) {
      const folderPath = parts.slice(0, i + 1).join("/");
      if (!seenFolders.has(folderPath)) {
        nodes.push({
          id: folderPath,
          name: parts[i],
          type: "folder",
          parentId,
        });
        seenFolders.add(folderPath);
      }
      parentId = folderPath;
    }

    // File node
    const fileName = parts[parts.length - 1];
    const dotIdx = fileName.lastIndexOf(".");
    const ext = dotIdx !== -1 ? fileName.slice(dotIdx + 1).toLowerCase() : "";

    nodes.push({
      id: relativePath,
      name: fileName,
      type: "file",
      parentId,
      url,
      ext,
    });
  }

  // Merge user-created files/folders from localStorage
  const userNodes = getUserVFSNodes();
  for (const u of userNodes) {
    if (!nodes.some(n => n.id === u.id)) {
      nodes.push(u);
    }
  }

  // Ensure default Downloads folder exists
  if (!nodes.some(n => n.id === "Downloads")) {
    nodes.push({
      id: "Downloads",
      name: "Downloads",
      type: "folder",
      parentId: "root",
      isUserCreated: true,
    });
  }

  return nodes;
}

// ─── Run the glob scan (called at startup or reload) ──────────────────────────
export function scanStorage(): VFSNode[] {
  // Vite resolves this at build-time; eager:true makes it synchronous
  const rawFiles = import.meta.glob("/src/storage/**/*", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  return buildVFSTree(rawFiles);
}
