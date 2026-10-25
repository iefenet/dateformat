import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // 发布产物压缩：esbuild minify（去空白 + 混淆局部标识符 + 语法精简），
  // sourcemap 一并发布，下游仍可调试定位。
  minify: true,
  outDir: 'dist',
  splitting: false,
  treeshake: true,
});
