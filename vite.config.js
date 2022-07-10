import { defineConfig } from 'vite';
import { resolve } from 'path';
import rollupOptions from './rollup.config';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/pixi-shadows/dist/',
    server: {
        port: 4000,
        strictPort: true,
    },
    resolve: {
        alias: { 'pixi-shadows': '../../src' },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
            ...rollupOptions,
            input: {
                index: resolve(__dirname, 'index.html'),
                advanced: resolve(__dirname, 'examples/advanced/index.html'),
                basic: resolve(__dirname, 'examples/basic/index.html'),
                'pixi-lights': resolve(__dirname, 'examples/pixi-lights/index.html'),
                system: resolve(__dirname, 'examples/system/index.html'),
            },
        },
    },
});
