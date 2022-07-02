import { defineConfig } from 'vite';
import rollupOptions from './rollup.config';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 4000,
        strictPort: true,
    },
    build: {
        outDir: 'dist/app',
        rollupOptions,
    },
});
