import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const src = path.resolve('src');
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;
type Layer = (typeof layers)[number];

const forbidden: Record<Layer, Layer[]> = {
  shared: ['entities', 'features', 'widgets', 'pages', 'app'],
  entities: ['features', 'widgets', 'pages', 'app'],
  features: ['widgets', 'pages', 'app'],
  widgets: ['pages', 'app'],
  pages: ['app'],
  app: []
};

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full.endsWith('.ts') || full.endsWith('.tsx') ? [full] : [];
  });
}

function layerOf(file: string): Layer | null {
  const rel = path.relative(src, file).replace(/\\/g, '/');
  return layers.find(layer => rel === `${layer}.ts` || rel === `${layer}.tsx` || rel.startsWith(`${layer}/`)) ?? null;
}

describe('слои FSD', () => {
  it('не импортирует верхние слои', () => {
    const breaks: string[] = [];
    const importRe = /from ['"](\.[^'"]+)['"]/g;
    for (const file of walk(src)) {
      const from = layerOf(file);
      if (!from) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(importRe)) {
        const target = path.resolve(path.dirname(file), match[1]);
        const candidates = [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts'), path.join(target, 'index.tsx')];
        const hit = candidates.find(item => fs.existsSync(item));
        if (!hit) continue;
        const to = layerOf(hit);
        if (!to || to === from) continue;
        if (forbidden[from].includes(to)) {
          breaks.push(`${path.relative(src, file)} -> ${to}`);
        }
      }
    }
    expect(breaks).toEqual([]);
  });

  it('корень приложения без useState доски', () => {
    const app = fs.readFileSync(path.join(src, 'app', 'App.tsx'), 'utf8');
    expect(app.includes('useState')).toBe(false);
    expect(fs.existsSync(path.join(src, 'app', 'store.ts'))).toBe(true);
    expect(fs.existsSync(path.join(src, 'app', 'providers', 'index.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(src, 'App.tsx'))).toBe(false);
  });
});
