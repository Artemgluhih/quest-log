import { useMemo } from 'react'

export default function StatsDashboard({ tasks, projects }) {
	// 1. Общая статистика
	const stats = useMemo(() => {
		const total = tasks.length
		const completed = tasks.filter(t => t.completed).length
		const pending = total - completed
		const totalXP = tasks
			.filter(t => t.completed)
			.reduce((acc, t) => acc + (t.xp || 0), 0)
		const completionRate =
			total === 0 ? 0 : Math.round((completed / total) * 100)

		// 2. Статистика по проектам
		const projectStats = Object.values(projects)
			.map(proj => {
				const projTasks = tasks.filter(t => t.projectId === proj.id)
				const projCompleted = projTasks.filter(t => t.completed).length
				const percent =
					projTasks.length === 0
						? 0
						: Math.round((projCompleted / projTasks.length) * 100)
				return {
					...proj,
					total: projTasks.length,
					completed: projCompleted,
					pending: projTasks.length - projCompleted,
					percent,
				}
			})
			.filter(p => p.total > 0) // Показываем только проекты с задачами
			.sort((a, b) => b.total - a.total) // Сортируем по количеству задач

		return { total, completed, pending, totalXP, completionRate, projectStats }
	}, [tasks, projects])

	return (
		<div className='space-y-6'>
			{/* --- ВЕРХНИЕ КАРТОЧКИ --- */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				{/* Всего задач */}
				<div className='bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl'>
							📋
						</div>
						<span className='text-gray-400 text-sm font-medium'>
							Всего задач
						</span>
					</div>
					<div className='text-3xl font-bold text-white'>{stats.total}</div>
				</div>

				{/* Выполнено */}
				<div className='bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-xl'>
							✅
						</div>
						<span className='text-gray-400 text-sm font-medium'>Выполнено</span>
					</div>
					<div className='text-3xl font-bold text-white'>{stats.completed}</div>
					<div className='text-xs text-green-400 mt-1'>
						{stats.completionRate}% успеха
					</div>
				</div>

				{/* Осталось */}
				<div className='bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-xl'>
							⏳
						</div>
						<span className='text-gray-400 text-sm font-medium'>В работе</span>
					</div>
					<div className='text-3xl font-bold text-white'>{stats.pending}</div>
				</div>

				{/* XP */}
				<div className='bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl'>
							⚡
						</div>
						<span className='text-gray-400 text-sm font-medium'>
							Заработано XP
						</span>
					</div>
					<div className='text-3xl font-bold text-white'>{stats.totalXP}</div>
				</div>
			</div>

			{/* --- ПРОГРЕСС ПО ПРОЕКТАМ --- */}
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-sm'>
				<h3 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
					📊 Прогресс по проектам
				</h3>

				{stats.projectStats.length === 0 ? (
					<p className='text-gray-500 text-center py-4'>
						Пока нет задач для статистики
					</p>
				) : (
					<div className='space-y-5'>
						{stats.projectStats.map(proj => (
							<div key={proj.id} className='group'>
								<div className='flex justify-between items-center mb-2'>
									<div className='flex items-center gap-2'>
										<span className='text-xl'>{proj.icon}</span>
										<span className='font-semibold text-gray-200'>
											{proj.name}
										</span>
									</div>
									<div className='text-sm text-gray-400'>
										{proj.completed} <span className='text-gray-600'>/</span>{' '}
										{proj.total}
									</div>
								</div>

								{/* Шкала прогресса */}
								<div className='w-full bg-gray-700 rounded-full h-3 overflow-hidden'>
									<div
										className={`h-full rounded-full transition-all duration-500 ease-out ${
											proj.percent === 100 ? 'bg-green-500' : 'bg-blue-500'
										}`}
										style={{ width: `${proj.percent}%` }}
									></div>
								</div>
								<div className='flex justify-between mt-1'>
									<span className='text-xs text-gray-500'>
										{proj.percent === 100
											? '🎉 Проект завершен!'
											: `Осталось ${proj.pending} задач`}
									</span>
									<span className='text-xs font-bold text-gray-300'>
										{proj.percent}%
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
