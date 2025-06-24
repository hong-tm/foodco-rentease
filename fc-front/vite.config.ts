import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import oxlintPlugin from 'vite-plugin-oxlint'

// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const baseConfig = {
    plugins: [
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      tailwindcss(),
      oxlintPlugin({
        params: '--deny-warnings --quiet',
      }),
      // visualizer({
      // 	open: true,
      // 	gzipSize: true,
      // 	filename: "stats.html",
      // }) as PluginOption,
    ] as PluginOption[],
    build: {
      minify: true, // 禁用压缩，减少内存使用
      target: 'esnext',
      chunkSizeWarningLimit: 1000, // 增加警告的 chunk 大小限制
      outDir: '../fc-back/webpage',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@server': resolve(__dirname, '../fc-back'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    base: '/',
  }

  if (command === 'serve') {
    // Development config - no native plugin
    return {
      ...baseConfig,
      experimental: {
        enableNativePlugin: 'resolver',
      },
    }
  } else {
    // Build config - enable native plugin
    return {
      ...baseConfig,
      experimental: {
        enableNativePlugin: true,
      },
    }
  }
})
