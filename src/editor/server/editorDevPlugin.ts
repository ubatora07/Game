import type { Plugin, ViteDevServer } from 'vite';

declare const process: any;
declare const Buffer: any;
declare function require(module: string): any;

export function editorDevPlugin(): Plugin {
  return {
    name: 'vite-plugin-editor-dev',
    apply: 'serve', // Strictly runs in development server; omitted from production builds
    configureServer(server: ViteDevServer) {
      let fs: any;
      let path: any;
      try {
        fs = require('fs');
        path = require('path');
      } catch {
        // Fallback for non-CJS environments
      }

      const rootDir = server.config.root || (typeof process !== 'undefined' ? process.cwd() : '.');
      const editorDir = path ? path.join(rootDir, '.editor') : '.editor';
      const layoutsDir = path ? path.join(editorDir, 'layouts') : '.editor/layouts';
      const exportsDir = path ? path.join(editorDir, 'exports') : '.editor/exports';
      const userAssetsDir = path ? path.join(rootDir, 'public', 'assets', 'user') : 'public/assets/user';

      // Ensure directories exist
      if (fs) {
        [editorDir, layoutsDir, exportsDir, userAssetsDir].forEach((dir) => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        });
      }

      // API Middleware
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ? new URL(req.url, 'http://localhost') : null;
        if (!url || !url.pathname.startsWith('/__editor-api/') || !fs || !path) {
          return next();
        }

        const endpoint = url.pathname.replace('/__editor-api/', '');

        // 1. GET /assets/list
        if (req.method === 'GET' && endpoint === 'assets/list') {
          try {
            const files = fs.readdirSync(userAssetsDir);
            const list = files
              .filter((f: string) => /\.(png|webp|jpe?g|svg)$/i.test(f))
              .map((filename: string) => {
                const ext = path.extname(filename).toLowerCase().replace('.', '');
                return {
                  id: `user_${filename}`,
                  filename,
                  relativePath: `/assets/user/${filename}`,
                  category: 'user',
                  format: ext,
                  thumbnailUrl: `/assets/user/${filename}`,
                };
              });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(list));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // 2. POST /assets/upload
        if (req.method === 'POST' && endpoint === 'assets/upload') {
          const chunks: any[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';
              let filename = `asset_${Date.now()}.png`;

              if (contentType.includes('multipart/form-data')) {
                const match = buffer.toString('binary').match(/filename="([^"]+)"/);
                if (match && match[1]) {
                  filename = path.basename(match[1]).replace(/[^a-zA-Z0-9._-]/g, '_');
                }
                const boundary = contentType.split('boundary=')[1];
                if (boundary) {
                  const boundaryStr = `--${boundary}`;
                  const bodyStr = buffer.toString('binary');
                  const headerEnd = bodyStr.indexOf('\r\n\r\n');
                  const footerStart = bodyStr.lastIndexOf(boundaryStr);
                  if (headerEnd !== -1 && footerStart !== -1) {
                    const binaryContent = bodyStr.slice(headerEnd + 4, footerStart - 2);
                    const fileBuffer = Buffer.from(binaryContent, 'binary');
                    fs.writeFileSync(path.join(userAssetsDir, filename), fileBuffer);
                  }
                }
              } else {
                fs.writeFileSync(path.join(userAssetsDir, filename), buffer);
              }

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, url: `/assets/user/${filename}`, filename }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 3. POST /layout/save
        if (req.method === 'POST' && endpoint === 'layout/save') {
          let body = '';
          req.on('data', (chunk: any) => (body += chunk));
          req.on('end', () => {
            try {
              const draft = JSON.parse(body);
              const safeName = `${draft.screenId}${draft.modalId ? `_${draft.modalId}` : ''}`.replace(/[^a-zA-Z0-9_-]/g, '');
              const filePath = path.join(layoutsDir, `${safeName}.json`);
              fs.writeFileSync(filePath, JSON.stringify(draft, null, 2), 'utf8');

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, path: filePath }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 4. GET /layout/load
        if (req.method === 'GET' && endpoint === 'layout/load') {
          const screenId = url.searchParams.get('screenId') || 'battle';
          const modalId = url.searchParams.get('modalId');
          const safeName = `${screenId}${modalId ? `_${modalId}` : ''}`.replace(/[^a-zA-Z0-9_-]/g, '');
          const filePath = path.join(layoutsDir, `${safeName}.json`);

          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            return res.end(content);
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Draft not found' }));
          }
        }

        // 5. POST /layout/export
        if (req.method === 'POST' && endpoint === 'layout/export') {
          let body = '';
          req.on('data', (chunk: any) => (body += chunk));
          req.on('end', () => {
            try {
              const pkg = JSON.parse(body);
              const safeScreen = (pkg.screenId || 'screen').replace(/[^a-zA-Z0-9_-]/g, '');
              const targetExportDir = path.join(exportsDir, safeScreen);

              if (!fs.existsSync(targetExportDir)) {
                fs.mkdirSync(targetExportDir, { recursive: true });
              }

              fs.writeFileSync(path.join(targetExportDir, 'layout.json'), JSON.stringify(pkg.layoutJson, null, 2), 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'elements.json'), JSON.stringify(pkg.elementsJson, null, 2), 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'notes.md'), pkg.notesMd || '', 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'assets.json'), JSON.stringify(pkg.assetsJson, null, 2), 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'changes.md'), pkg.changesMd || '', 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'source-map.json'), JSON.stringify(pkg.sourceMapJson, null, 2), 'utf8');
              fs.writeFileSync(path.join(targetExportDir, 'AI_TASK.md'), pkg.aiTaskMd || '', 'utf8');

              // Update ART_TODO.md if any missing assets
              if (pkg.assetsJson?.missingAssetTasks?.length > 0) {
                const artTodoPath = path.join(editorDir, 'ART_TODO.md');
                let artContent = `# Art Asset TODO List\n\n`;
                pkg.assetsJson.missingAssetTasks.forEach((task: any) => {
                  artContent += `- [ ] **\`${task.elementId}\`**: ${task.description} (${task.dimensions})\n`;
                });
                fs.writeFileSync(artTodoPath, artContent, 'utf8');
              }

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, exportDir: targetExportDir }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Endpoint not found' }));
      });
    },
  };
}
