/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { editorDevPlugin } from './src/editor/server/editorDevPlugin';

export default defineConfig({
  base: './',
  plugins: [editorDevPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020'
  },
  server: {
    port: 3000,
    open: false
  },
  test: {
    include: ['tests/**/*.test.ts']
  }
});

