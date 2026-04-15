export const ACHIEVEMENTS = {
	first_task: {
		id: 'first_task',
		name: 'Первый шаг',
		description: 'Создайте первую задачу',
		icon: '',
		condition: stats => stats.totalTasks >= 1,
	},
	ten_tasks: {
		id: 'ten_tasks',
		name: 'Десятка',
		description: 'Создайте 10 задач',
		icon: '🔟',
		condition: stats => stats.totalTasks >= 10,
	},
	fifty_tasks: {
		id: 'fifty_tasks',
		name: 'Полсотни',
		description: 'Создайте 50 задач',
		icon: '💯',
		condition: stats => stats.totalTasks >= 50,
	},
	first_complete: {
		id: 'first_complete',
		name: 'Готово!',
		description: 'Выполните первую задачу',
		icon: '✅',
		condition: stats => stats.completedTasks >= 1,
	},
	ten_complete: {
		id: 'ten_complete',
		name: 'Мастер выполнения',
		description: 'Выполните 10 задач',
		icon: '🏆',
		condition: stats => stats.completedTasks >= 10,
	},
	fifty_complete: {
		id: 'fifty_complete',
		name: 'Легенда продуктивности',
		description: 'Выполните 50 задач',
		icon: '👑',
		condition: stats => stats.completedTasks >= 50,
	},
	first_project: {
		id: 'first_project',
		name: 'Организатор',
		description: 'Создайте первый проект',
		icon: '📁',
		condition: stats => stats.totalProjects >= 1,
	},
	five_projects: {
		id: 'five_projects',
		name: 'Мультизадачность',
		description: 'Создайте 5 проектов',
		icon: '🗂️',
		condition: stats => stats.totalProjects >= 5,
	},
	level_5: {
		id: 'level_5',
		name: 'Новичок',
		description: 'Достигните 5 уровня',
		icon: '⭐',
		condition: stats => stats.level >= 5,
	},
	level_10: {
		id: 'level_10',
		name: 'Продвинутый',
		description: 'Достигните 10 уровня',
		icon: '🌟',
		condition: stats => stats.level >= 10,
	},
	level_20: {
		id: 'level_20',
		name: 'Эксперт',
		description: 'Достигните 20 уровня',
		icon: '💫',
		condition: stats => stats.level >= 20,
	},
	streak_3: {
		id: 'streak_3',
		name: 'Три дня подряд',
		description: 'Выполняйте задачи 3 дня подряд',
		icon: '🔥',
		condition: stats => stats.streak >= 3,
	},
	streak_7: {
		id: 'streak_7',
		name: 'Неделя продуктивности',
		description: 'Выполняйте задачи 7 дней подряд',
		icon: '🔥',
		condition: stats => stats.streak >= 7,
	},
	early_bird: {
		id: 'early_bird',
		name: 'Жаворонок',
		description: 'Выполните задачу до 8 утра',
		icon: '🌅',
		condition: stats => stats.earlyTask === true,
	},
	night_owl: {
		id: 'night_owl',
		name: 'Сова',
		description: 'Выполните задачу после 23:00',
		icon: '🌙',
		condition: stats => stats.nightTask === true,
	},
	deadline_master: {
		id: 'deadline_master',
		name: 'Успеваю всё',
		description: 'Выполните 5 задач до дедлайна',
		icon: '⏰',
		condition: stats => stats.onTimeTasks >= 5,
	},
	xp_100: {
		id: 'xp_100',
		name: 'Соточка',
		description: 'Заработайте 100 XP',
		icon: '💎',
		condition: stats => stats.totalXP >= 100,
	},
	xp_500: {
		id: 'xp_500',
		name: 'Полтысячи',
		description: 'Заработайте 500 XP',
		icon: '💎💎',
		condition: stats => stats.totalXP >= 500,
	},
	xp_1000: {
		id: 'xp_1000',
		name: 'Тысячник',
		description: 'Заработайте 1000 XP',
		icon: '💎💎',
		condition: stats => stats.totalXP >= 1000,
	},
}

// Функция для проверки всех достижений
export const checkAchievements = (
	tasks,
	projects,
	unlockedAchievements,
	stats,
) => {
	const newAchievements = []

	// Собираем статистику
	const taskStats = {
		totalTasks: tasks.length,
		completedTasks: tasks.filter(t => t.completed).length,
		totalProjects: Object.keys(projects).length,
		level:
			Math.floor(
				tasks
					.filter(t => t.completed)
					.reduce((sum, t) => sum + (t.xp || 0), 0) / 100,
			) + 1,
		totalXP: tasks
			.filter(t => t.completed)
			.reduce((sum, t) => sum + (t.xp || 0), 0),
		streak: calculateStreak(tasks),
		earlyTask: checkEarlyTask(tasks),
		nightTask: checkNightTask(tasks),
		onTimeTasks: checkOnTimeTasks(tasks),
	}

	// Проверяем каждое достижение
	Object.values(ACHIEVEMENTS).forEach(achievement => {
		if (!unlockedAchievements.includes(achievement.id)) {
			if (achievement.condition(taskStats)) {
				newAchievements.push(achievement.id)
			}
		}
	})

	return newAchievements
}

// Вспомогательные функции
const calculateStreak = tasks => {
	const completedDates = [
		...new Set(
			tasks
				.filter(t => t.completed)
				.map(t => new Date(t.createdAt).toDateString()),
		),
	]

	// Упрощённый расчёт streak
	return completedDates.length
}

const checkEarlyTask = tasks => {
	return tasks.some(t => {
		if (!t.completed || !t.createdAt) return false
		const hour = new Date(t.createdAt).getHours()
		return hour < 8
	})
}

const checkNightTask = tasks => {
	return tasks.some(t => {
		if (!t.completed || !t.createdAt) return false
		const hour = new Date(t.createdAt).getHours()
		return hour >= 23
	})
}

const checkOnTimeTasks = tasks => {
	return tasks.filter(t => {
		if (!t.completed || !t.deadline) return false
		return new Date(t.createdAt) <= new Date(t.deadline)
	}).length
}
