import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icon.svg'], // Подключаем нашу иконку
			manifest: {
				name: 'QuestLog',
				short_name: 'QuestLog',
				description: 'Твой трекер задач в стиле RPG',
				theme_color: '#111827', // Цвет шапки приложения (темный, как у нас)
				background_color: '#111827',
				display: 'standalone', // Убирает интерфейс браузера!
				start_url: '/',
				icons: [
					{
						src: 'icon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,xml}'],
			},
		}),
	],
	server: {
		proxy: {
			'/api/moex': {
				target: 'https://iss.moex.com',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api\/moex/, ''),
				configure: proxy => {
					proxy.on('proxyReq', proxyReq => {
						proxyReq.setHeader('User-Agent', 'Mozilla/5.0')
					})
				},
			},
		},
	},
})
