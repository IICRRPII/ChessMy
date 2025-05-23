/*
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      '/api' : {
        target: env.VITE_API_URL || 'https://chessmyproduccion.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Connection: 'keep-alive'
        }
      },
    },
  },
  
  define: {
    'process.env': process.env
  }
});
*/
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    
    server: {
      proxy: {
        '/api': {
          target:  'https://chessmyproduccion.onrender.com',
          changeOrigin: true,
          secure: false,
          // Headers adicionales si es necesario
          headers: {
            Connection: 'keep-alive'
          }
        },
      },
    },
    
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL || 'https://chessmyproduccion.onrender.com')
      }
    },
    
    // Configuración importante para producción
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        }
      }
    }
  };
});
