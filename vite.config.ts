import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { build as esbuildBuild } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryDevApiPlugin } from './vite.galleryDevApi';

function serviceWorkerPlugin(projectRoot: string): Plugin {
  return {
    name: 'cyber-duck-service-worker',
    apply: 'build',
    async generateBundle(_options, bundle) {
      const files = new Set<string>([
        '/index.html',
        '/favicon.svg',
        '/manifest.webmanifest',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/icon-maskable-512.png'
      ]);
      for (const item of Object.values(bundle)) {
        if (item.fileName.endsWith('.map') || item.fileName === 'sw.js') continue;
        files.add(`/${item.fileName}`);
      }
      const result = await esbuildBuild({
        absWorkingDir: projectRoot,
        entryPoints: [path.join(projectRoot, 'src/app/sw.ts')],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: 'es2020',
        write: false,
        define: {
          __PRECACHE_URLS__: JSON.stringify([...files])
        }
      });
      const source = result.outputFiles[0]?.text;
      if (!source) throw new Error('Service worker bundle is empty');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    }
  };
}

const root = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), galleryDevApiPlugin(root), serviceWorkerPlugin(root)],
  server: {
    port: 5173,
    host: true
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts']
  }
});
