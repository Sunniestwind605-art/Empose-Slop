import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Empose-Slop/',
  plugins: [react()],
  test: {
    environment: 'node',
    coverage: { reporter: ['text', 'json', 'html'] },
  },
});

