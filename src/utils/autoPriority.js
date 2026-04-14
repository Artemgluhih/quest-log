// Ключевые слова для определения приоритета
const HIGH_PRIORITY_KEYWORDS = [
	'срочно',
	'urgent',
	'важно',
	'important',
	'асп',
	'горящее',
	'deadline',
	'дедлайн',
	'сегодня',
	'now',
	'сейчас',
]

const MEDIUM_PRIORITY_KEYWORDS = ['завтра', 'неделя', 'week', 'скоро', 'soon']

export function calculateAutoPriority(task) {
	let priority = 'low'
	let score = 0
	const reasons = []

	const title = task.title.toLowerCase()
	const description = (task.description || '').toLowerCase()
	const fullText = title + ' ' + description

	// 1. Проверка ключевых слов
	HIGH_PRIORITY_KEYWORDS.forEach(keyword => {
		if (fullText.includes(keyword)) {
			score += 30
			reasons.push(`Ключевое слово: "${keyword}"`)
		}
	})

	MEDIUM_PRIORITY_KEYWORDS.forEach(keyword => {
		if (fullText.includes(keyword)) {
			score += 15
			reasons.push(`Ключевое слово: "${keyword}"`)
		}
	})

	// 2. Проверка дедлайна
	if (task.deadline) {
		const deadline = new Date(task.deadline)
		const now = new Date()
		const hoursLeft = (deadline - now) / (1000 * 60 * 60)

		if (hoursLeft < 0) {
			score += 50
			reasons.push('Дедлайн просрочен!')
		} else if (hoursLeft < 24) {
			score += 40
			reasons.push('Дедлайн сегодня/завтра')
		} else if (hoursLeft < 72) {
			score += 20
			reasons.push('Дедлайн в течение 3 дней')
		}
	}

	// 3. Возраст задачи
	if (task.createdAt) {
		const created = new Date(task.createdAt)
		const daysOld = (new Date() - created) / (1000 * 60 * 60 * 24)

		if (daysOld > 7) {
			score += 20
			reasons.push('Задача висит больше недели')
		} else if (daysOld > 3) {
			score += 10
			reasons.push('Задача висит больше 3 дней')
		}
	}

	// Определяем финальный приоритет
	if (score >= 30) {
		priority = 'high'
	} else if (score >= 15) {
		priority = 'medium'
	} else {
		priority = 'low'
	}

	return { priority, score, reasons }
}

export function suggestDifficulty(title, description = '') {
	const text = (title + ' ' + description).toLowerCase()

	const simpleIndicators = ['проверить', 'отправить', 'позвонить', 'написать']
	const mediumIndicators = [
		'сделать',
		'создать',
		'подготовить',
		'разработать план',
	]
	const complexIndicators = [
		'разработать',
		'спроектировать',
		'архитектура',
		'рефакторинг',
		'интеграция',
	]

	let difficulty = 2

	if (complexIndicators.some(word => text.includes(word))) {
		difficulty = 4
	} else if (mediumIndicators.some(word => text.includes(word))) {
		difficulty = 3
	}

	if (text.length > 200) {
		difficulty = Math.min(difficulty + 1, 5)
	}

	return difficulty
}
