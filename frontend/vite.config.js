import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig({
  server: {

    host: '0.0.0.0', 
    https: {
              key: fs.readFileSync('./.cert/key.pem'),
              cert: fs.readFileSync('./.cert/cert.pem'),
            },
  },
  plugins: [react(), tailwindcss()],
})
