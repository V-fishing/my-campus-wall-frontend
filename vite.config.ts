import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { resolve } from "path";
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite';

// 加上 @ts-ignore 忽略类型检查，让编辑器闭嘴
// @ts-ignore
import tailwindcss from 'tailwindcss';
// @ts-ignore
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  // 强行把 postcss 配置写在 vite 内部
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  },
  plugins: [
    uni(),
    // 将插件挂载到 Vite 上
    uvtw()
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components")
    }
  }
});