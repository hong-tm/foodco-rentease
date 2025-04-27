import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import type { PluginOption } from "vite";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		viteReact(),
		// visualizer({
		// 	open: true,
		// 	gzipSize: true,
		// 	filename: "stats.html",
		// }) as PluginOption,
	] as PluginOption[],
	build: {
		minify: false, // 禁用压缩，减少内存使用
		target: "esnext",
		chunkSizeWarningLimit: 1000, // 增加警告的 chunk 大小限制
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@server": resolve(__dirname, "../fc-back"),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				// Set API to modern to avoid legacy warnings
				api: "modern",
			},
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	base: "/",
});
