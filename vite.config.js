import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/itunes': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          const term = url.searchParams.get('term') || ''
          const limit = url.searchParams.get('limit') || '8'
          return `/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&media=music`
        }
      }
    }
  }
})