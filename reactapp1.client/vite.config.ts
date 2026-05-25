import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react()],

    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:7037',
                secure: false,
                changeOrigin: true,
            },
            '/gameHub': {
                target: 'https://localhost:7037',
                secure: false,
                changeOrigin: true,
                ws: true, // importante para WebSockets
            },
            '/gamehub': {
                target: 'https://localhost:7037',
                secure: false,
                changeOrigin: true,
                ws: true,
            }
        }
    },
});
