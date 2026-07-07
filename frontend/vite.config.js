import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use esbuild's automatic JSX runtime for Vitest transforms (avoids
  // "React is not defined" when files don't import React directly). Only applied
  // under Vitest — during `vite dev`/`build` the React plugin (Oxc) handles JSX,
  // and setting esbuild.jsx there just prints an "options ignored" warning.
  ...(process.env.VITEST ? { esbuild: { jsx: 'automatic' } } : {}),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    // This environment transforms/renders slowly; give interaction-heavy
    // tests room rather than tripping the 5s default.
    testTimeout: 30000,
  },
})
