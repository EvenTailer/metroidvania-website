import type { Plugin, Connect } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

function loadItems(dataFile: string): Array<{ id: string; title: string; url: string }> {
  if (!fs.existsSync(dataFile)) return [];
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(raw) as { items?: unknown };
    return Array.isArray(data.items) ? (data.items as Array<{ id: string; title: string; url: string }>) : [];
  } catch {
    return [];
  }
}

function saveItems(dataFile: string, items: Array<{ id: string; title: string; url: string }>) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ items }, null, 2), 'utf8');
}

function loadChat(dataFile: string): unknown[] {
  if (!fs.existsSync(dataFile)) return [];
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(raw) as { messages?: unknown[] };
    return Array.isArray(data.messages) ? data.messages : [];
  } catch {
    return [];
  }
}

function saveChat(dataFile: string, messages: unknown[]) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ messages }, null, 2), 'utf8');
}

function loadNarrative(dataFile: string): unknown[] {
  if (!fs.existsSync(dataFile)) return [];
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(raw) as { chapters?: unknown[] };
    return Array.isArray(data.chapters) ? data.chapters : [];
  } catch {
    return [];
  }
}

function saveNarrative(dataFile: string, chapters: unknown[]) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ chapters }, null, 2), 'utf8');
}

function loadAssets(dataFile: string): { initialized: boolean; savedAt: string | null; items: unknown[] } {
  if (!fs.existsSync(dataFile)) return { initialized: false, savedAt: null, items: [] };
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8')) as { savedAt?: unknown; items?: unknown[] };
    return {
      initialized: true,
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : null,
      items: Array.isArray(data.items) ? data.items : []
    };
  } catch {
    return { initialized: true, savedAt: null, items: [] };
  }
}

function saveAssets(dataFile: string, items: unknown[], savedAt: string) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ savedAt, items }, null, 2), 'utf8');
}

function readGodotRoot(publicDir: string, projectRoot: string): string | null {
  const files = [
    path.join(publicDir, 'data', 'godot-project.path'),
    path.join(projectRoot, 'godot-project.path')
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const value = fs.readFileSync(file, 'utf8').trim();
    if (value) return value;
  }
  return null;
}

function probeResPath(root: string | null, resPath: string): { configured: boolean; exists: boolean | null } {
  if (!root) return { configured: false, exists: null };
  if (!resPath.startsWith('res://')) return { configured: true, exists: false };
  const relative = resPath.slice('res://'.length).replace(/[\\/]/g, path.sep);
  const base = path.resolve(root);
  const target = path.resolve(base, relative);
  const baseWithSep = base.endsWith(path.sep) ? base : `${base}${path.sep}`;
  if (target !== base && !target.startsWith(baseWithSep)) return { configured: true, exists: false };
  return { configured: true, exists: fs.existsSync(target) };
}

function loadBoard(dataFile: string): {
  initialized: boolean;
  tasks: unknown[];
  sprintStepId: string | null;
  stepsDone: Record<string, boolean>;
} {
  const empty = {
    initialized: false,
    tasks: [] as unknown[],
    sprintStepId: null as string | null,
    stepsDone: {} as Record<string, boolean>
  };
  if (!fs.existsSync(dataFile)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8')) as {
      tasks?: unknown[];
      sprintStepId?: unknown;
      stepsDone?: unknown;
    };
    const stepsDone: Record<string, boolean> = {};
    if (data.stepsDone && typeof data.stepsDone === 'object' && !Array.isArray(data.stepsDone)) {
      for (const [key, flag] of Object.entries(data.stepsDone)) {
        if (flag) stepsDone[key] = true;
      }
    }
    return {
      initialized: true,
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      sprintStepId: typeof data.sprintStepId === 'string' ? data.sprintStepId : null,
      stepsDone
    };
  } catch {
    return empty;
  }
}

function saveBoard(
  dataFile: string,
  snapshot: { tasks: unknown[]; sprintStepId: string | null; stepsDone: Record<string, boolean> }
) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(snapshot, null, 2), 'utf8');
}

function readBody(req: Connect.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** Dev-only: replicates server APIs when PHP is not running locally. */
export function galleryDevApiPlugin(root: string): Plugin {
  const publicDir = path.join(root, 'public');
  const uploadDir = path.join(publicDir, 'uploads', 'gallery');
  const galleryDataFile = path.join(publicDir, 'data', 'gallery.json');
  const chatDataFile = path.join(publicDir, 'data', 'chat.json');
  const narrativeDataFile = path.join(publicDir, 'data', 'narrative.json');
  const boardDataFile = path.join(publicDir, 'data', 'board.json');
  const assetsDataFile = path.join(publicDir, 'data', 'assets.json');
  const maxBytes = 5 * 1024 * 1024;
  const token = '1111';

  return {
    name: 'dev-api-router',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        // --- 1. CHAT API ---
        if (url === '/api/chat.php') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ messages: loadChat(chatDataFile) }));
            return;
          }

          if (req.method === 'POST') {
            const bodyBuf = await readBody(req);
            let body: Record<string, unknown> = {};
            try {
              body = JSON.parse(bodyBuf.toString('utf8'));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }

            const current = loadChat(chatDataFile) as Array<{ id: string }>;
            const action = body.action || 'send';

            if (action === 'send') {
              const msg = body.message;
              if (!msg) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing message' }));
                return;
              }
              current.unshift(msg as { id: string });
              const trimmed = current.slice(0, 200);
              saveChat(chatDataFile, trimmed);
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true, message: msg, total: trimmed.length }));
              return;
            }

            if (action === 'delete') {
              const id = body.id;
              const nextList = current.filter((m) => m && m.id !== id);
              saveChat(chatDataFile, nextList);
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true, deletedId: id, total: nextList.length }));
              return;
            }

            if (action === 'sync') {
              const list = Array.isArray(body.messages) ? body.messages : [];
              saveChat(chatDataFile, list.slice(0, 200));
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true, total: list.length }));
              return;
            }
          }
        }

        // --- 2. NARRATIVE API ---
        if (url === '/api/narrative.php') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ chapters: loadNarrative(narrativeDataFile) }));
            return;
          }

          if (req.method === 'POST') {
            const bodyBuf = await readBody(req);
            try {
              const body = JSON.parse(bodyBuf.toString('utf8')) as { chapters?: unknown[] };
              if (Array.isArray(body.chapters)) {
                saveNarrative(narrativeDataFile, body.chapters);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ ok: true, total: body.chapters.length }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }
          }
        }

        // --- 3. BOARD API (tasks, sprint, roadmap flags) ---
        if (url === '/api/board.php') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(loadBoard(boardDataFile)));
            return;
          }
          if (req.method === 'POST') {
            const bodyBuf = await readBody(req);
            try {
              const body = JSON.parse(bodyBuf.toString('utf8')) as {
                tasks?: unknown[];
                sprintStepId?: unknown;
                stepsDone?: unknown;
              };
              if (!Array.isArray(body.tasks)) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
              }
              const stepsDone: Record<string, boolean> = {};
              if (body.stepsDone && typeof body.stepsDone === 'object' && !Array.isArray(body.stepsDone)) {
                for (const [key, flag] of Object.entries(body.stepsDone)) {
                  if (flag) stepsDone[key] = true;
                }
              }
              saveBoard(boardDataFile, {
                tasks: body.tasks,
                sprintStepId: typeof body.sprintStepId === 'string' ? body.sprintStepId : null,
                stepsDone
              });
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true }));
              return;
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }
          }
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // --- 4. ASSET PIPELINE API ---
        if (url === '/api/assets.php') {
          const query = new URL(req.url ?? '', 'http://localhost').searchParams;
          const probe = query.get('probe');
          if (req.method === 'GET' && probe !== null) {
            const result = probeResPath(readGodotRoot(publicDir, root), probe);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(result));
            return;
          }
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(loadAssets(assetsDataFile)));
            return;
          }
          if (req.method === 'POST') {
            const bodyBuf = await readBody(req);
            try {
              const body = JSON.parse(bodyBuf.toString('utf8')) as { items?: unknown[] };
              if (!Array.isArray(body.items)) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
              }
              const savedAt = new Date().toISOString();
              saveAssets(assetsDataFile, body.items, savedAt);
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true, savedAt }));
              return;
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }
          }
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // --- 5. GALLERY API ---
        if (url !== '/api/gallery.php') {
          next();
          return;
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ items: loadItems(galleryDataFile) }));
          return;
        }

        if (req.method === 'POST') {
          const given = req.headers['x-hub-token'];
          if (given !== token) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
          }

          const body = await readBody(req);
          const contentType = req.headers['content-type'] ?? '';
          const boundaryMatch = /boundary=(.+)$/i.exec(contentType);
          if (!boundaryMatch) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Expected multipart' }));
            return;
          }
          const boundary = boundaryMatch[1];
          const parts = body.toString('binary').split(`--${boundary}`);
          let fileBuf: Buffer | null = null;
          let fileName = 'image';
          let mime = 'image/png';
          let title = '';

          for (const part of parts) {
            if (!part.includes('Content-Disposition')) continue;
            const nameMatch = /name="([^"]+)"/.exec(part);
            const filenameMatch = /filename="([^"]+)"/.exec(part);
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1 || !nameMatch) continue;
            const field = nameMatch[1];
            const valueBin = part.slice(headerEnd + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '');
            if (field === 'title') {
              title = Buffer.from(valueBin, 'binary').toString('utf8').trim();
            }
            if (field === 'file' && filenameMatch) {
              fileName = filenameMatch[1];
              const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(part);
              mime = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';
              fileBuf = Buffer.from(valueBin, 'binary');
            }
          }

          if (!fileBuf || fileBuf.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'No file uploaded' }));
            return;
          }
          if (fileBuf.length > maxBytes) {
            res.statusCode = 413;
            res.end(JSON.stringify({ error: 'File too large' }));
            return;
          }
          const ext = MIME_EXT[mime];
          if (!ext) {
            res.statusCode = 415;
            res.end(JSON.stringify({ error: 'Unsupported image type' }));
            return;
          }

          fs.mkdirSync(uploadDir, { recursive: true });
          const id = `g-${Date.now()}-${randomBytes(3).toString('hex')}`;
          const filename = `${id}.${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), fileBuf);

          if (!title) {
            title = fileName.replace(/\.[^.]+$/, '') || 'Новый арт';
          }
          const item = { id, title, url: `/uploads/gallery/${filename}` };
          const items = loadItems(galleryDataFile);
          items.unshift(item);
          saveItems(galleryDataFile, items);

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ item }));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    }
  };
}
