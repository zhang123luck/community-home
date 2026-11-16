import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Vite 配置：Vue3 + Tailwind CSS v4；双入口（居民端小程序 + 物业管理后台）
export default defineConfig({
  // 相对路径：既能在根域名运行，也能在 GitHub Pages 的 /仓库名/ 子路径下运行
  base: './',
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    // 允许通过反向代理域名访问（云端预览 / 内网穿透时需要）
    allowedHosts: true,
    port: 5173,
    // 开发模式：把 /api 转发到 Express 后端，避免跨域
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    // 产物输出到 site/，由 Express 直接托管（生产环境单端口部署）
    outDir: 'site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url))
      }
    }
  }
})
