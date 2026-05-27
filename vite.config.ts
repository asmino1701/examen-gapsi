import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import JavaScriptObfuscator from 'javascript-obfuscator';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Plugin inline para ofuscar solo en build, no en dev.
    command === 'build' && {
      name: 'rollup-plugin-obfuscator',
      enforce: 'post' as const,
      renderChunk(code: string, chunk: { fileName: string }) {
        // Solo ofuscar archivos .js (no source maps ni assets)
        if (!chunk.fileName.endsWith('.js')) return null;

        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          selfDefending: false,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
        });

        return {
          code: obfuscated.getObfuscatedCode(),
          map: null,
        };
      },
    },
  ].filter(Boolean),
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    sourcemap: false,
  },
}));