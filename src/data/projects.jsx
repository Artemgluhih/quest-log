export const PRIORITY_CONFIG = {
	high: { label: 'Высокий', color: 'text-red-400', dot: 'bg-red-500' },
	medium: { label: 'Средний', color: 'text-yellow-400', dot: 'bg-yellow-500' },
	low: { label: 'Низкий', color: 'text-gray-400', dot: 'bg-gray-500' },
}

// Цвета и иконки для новых проектов (будут выбираться случайно или по кругу)
export const PROJECT_STYLES = [
	{ color: 'bg-blue-600', textColor: 'text-blue-400', icon: '💼' },
	{ color: 'bg-purple-600', textColor: 'text-purple-400', icon: '🚀' },
	{ color: 'bg-green-600', textColor: 'text-green-400', icon: '🌿' },
	{ color: 'bg-orange-600', textColor: 'text-orange-400', icon: '🔥' },
	{ color: 'bg-pink-600', textColor: 'text-pink-400', icon: '💎' },
	{ color: 'bg-teal-600', textColor: 'text-teal-400', icon: '📦' },
]

export const DEFAULT_PROJECTS = {
	main_job: {
		id: 'main_job',
		name: 'Основная работа',
		priority: 'high',
		xpMultiplier: 1.5,
		...PROJECT_STYLES[0],
	},
	side_1: {
		id: 'side_1',
		name: 'Подработка 1',
		priority: 'medium',
		xpMultiplier: 1.2,
		...PROJECT_STYLES[1],
	},
	personal: {
		id: 'personal',
		name: 'Личные проекты',
		priority: 'medium',
		xpMultiplier: 1.0,
		...PROJECT_STYLES[2],
	},
	secondary: {
		id: 'secondary',
		name: 'Второстепенное',
		priority: 'low',
		xpMultiplier: 0.5,
		...PROJECT_STYLES[3],
	},
}
