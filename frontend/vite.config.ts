import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite mandiri (tanpa Laravel). Frontend jalan di 5173, /api diteruskan ke Bun di 3000.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: { '/api': 'http://localhost:3000' },
    },
    build: { outDir: 'dist' },
});
