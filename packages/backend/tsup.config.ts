import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  tsconfig: './tsconfig.json',
  format: ['esm', 'cjs'],
  external: ['react', 'react-dom'],
})
