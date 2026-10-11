// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // If you want to proxy API calls locally during development, 
    // you can configure it here, but since we are using /api routes 
    // which Vercel handles, this is mostly for local `npm run dev` 
    // if you had a separate backend. In this case, Vite serves 
    // the static files, and in production, Vercel serves the API.
    // For local dev, you might want to run a simple node server 
    // for the /api routes or just test the UI logic.
  }
});
