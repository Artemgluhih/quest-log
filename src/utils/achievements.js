export const ACHIEVEMENTS = {
	first_task: {
		id: 'first_task',
		name: 'Первый шаг',
		description: 'Создай первую задачу',
		icon: '🌱',
		condition: stats => stats.totalTasks >= 1,
	},
	task_master: {
		id: 'task_master',
		name: 'Мастер задач',
		description: 'Выполни 10 задач',
		icon: '🏆',
		condition: stats => stats.completedTasks >= 10,
	},
	streak_3: {
		id: 'streak_3',
		name: 'Три дня подряд',
		description: 'Выполняй задачи 3 дня подряд',
		icon: '🔥',
		condition: stats => stats.currentStreak >= 3,
	},
	night_owl: {
		id: 'night_owl',
		name: 'Сова',
		description: 'Выполни задачу после полуночи',
		icon: '🦉',
		condition: stats => stats.nightTasks >= 1,
	},
	early_bird: {
		id: 'early_bird',
		name: 'Жаворонок',
		description: 'Выполни задачу до 6 утра',
		icon: '🐦',
		condition: stats => stats.earlyTasks >= 1,
	},
	project_hopper: {
		id: 'project_hopper',
		name: 'Мультизадачность',
		description: 'Работай над 3 разными проектами',
		icon: '🎪',
		condition: stats => stats.activeProjects >= 3,
	},
	xp_1000: {
		id: 'xp_1000',
		name: 'Опытный',
		description: 'Заработай 1000 XP',
		icon: '⚡',
		condition: stats => stats.totalXP >= 1000,
	},
	completionist: {
		id: 'completionist',
		name: 'Перфекционист',
		description: 'Выполни все задачи в один день',
		icon: '💎',
		condition: stats => stats.perfectDay === true,
	},
}

export function checkAchievements(tasks, unlockedAchievements) {
	const stats = calculateStats(tasks)
	const newAchievements = []

	Object.values(ACHIEVEMENTS).forEach(achievement => {
		if (
			!unlockedAchievements.includes(achievement.id) &&
			achievement.condition(stats)
		) {
			newAchievements.push(achievement)
		}
	})

	return newAchievements
}

function calculateStats(tasks) {
	const completedTasks = tasks.filter(t => t.completed)
	const today = new Date().toDateString()
	const completedToday = completedTasks.filter(
		t => new Date(t.completedAt || t.createdAt).toDateString() === today,
	)

	// Считаем стрик
	let streak = 0
	const dates = [
		...new Set(
			completedTasks.map(t =>
				new Date(t.completedAt || t.createdAt).toDateString(),
			),
		),
	]
		.sort()
		.reverse()
	for (let i = 0; i < dates.length; i++) {
		const date = new Date(dates[i])
		const expectedDate = new Date()
		expectedDate.setDate(expectedDate.getDate() - i)
		if (date.toDateString() === expectedDate.toDateString()) {
			streak++
		} else {
			break
		}
	}

	return {
		totalTasks: tasks.length,
		completedTasks: completedTasks.length,
		currentStreak: streak,
		nightTasks: completedTasks.filter(t => {
			const hour = new Date(t.completedAt || t.createdAt).getHours()
			return hour >= 0 && hour < 6
		}).length,
		earlyTasks: completedTasks.filter(t => {
			const hour = new Date(t.completedAt || t.createdAt).getHours()
			return hour >= 0 && hour < 6
		}).length,
		activeProjects: new Set(tasks.map(t => t.projectId)).size,
		totalXP: completedTasks.reduce((sum, t) => sum + t.xp, 0),
		perfectDay:
			completedToday.length > 0 && tasks.filter(t => !t.completed).length === 0,
	}
}
