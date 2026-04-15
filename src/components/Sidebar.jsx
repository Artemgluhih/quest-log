import { useState } from 'react'
import { PROJECT_STYLES } from '../data/projects'

export default function Sidebar({
	projects,
	tasks,
	activeProjectId,
	onSelectProject,
	onAddProject,
	onDeleteProject,
	level,
	xp,
	viewMode,
	onViewChange,
	isOpen,
	onClose,
	onOpenSettings,
	onOpenFinance, // <--- Добавили проп
}) {
	// ... (остальной код без изменений)

	return (
		<>
			{/* Мобильный оверлей */}
			{isOpen && (
				<div
					className='fixed inset-0 bg-black/50 z-40 lg:hidden'
					onClick={onClose}
				/>
			)}

			<aside
				className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-800 dark:bg-gray-800 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}
			>
				{/* Header */}
				<div className='p-4 border-b border-gray-700 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>🎮</span>
						<h1 className='text-xl font-bold text-white'>QuestLog</h1>
					</div>
					<button
						onClick={onClose}
						className='lg:hidden text-gray-400 hover:text-white text-2xl'
					>
						✕
					</button>
				</div>

				{/* Content */}
				<div className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
					{/* Stats */}
					<div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm font-medium text-blue-100'>
								Уровень {level}
							</span>
							<span className='text-xs text-blue-200'>{xp} XP</span>
						</div>
						<div className='w-full bg-black/20 rounded-full h-2'>
							<div
								className='bg-white rounded-full h-2 transition-all duration-500'
								style={{ width: `${xp % 100}%` }}
							/>
						</div>
					</div>

					{/* Navigation */}
					<div className='mb-6'>
						<button
							onClick={() => {
								onViewChange('dashboard')
								onSelectProject(null)
							}}
							className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition mb-1 ${
								viewMode === 'dashboard'
									? 'bg-blue-600 text-white'
									: 'text-gray-400 hover:bg-gray-700 hover:text-white'
							}`}
						>
							<span className='text-xl'>📋</span>
							<span className='font-medium'>Все задачи</span>
						</button>

						<button
							onClick={() => onViewChange('calendar')}
							className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition mb-1 ${
								viewMode === 'calendar'
									? 'bg-blue-600 text-white'
									: 'text-gray-400 hover:bg-gray-700 hover:text-white'
							}`}
						>
							<span className='text-xl'>📅</span>
							<span className='font-medium'>Календарь</span>
						</button>
					</div>

					{/* Projects */}
					<div className='mb-4'>
						<div className='flex items-center justify-between mb-2 px-3'>
							<span className='text-xs text-gray-500 uppercase font-bold tracking-wide'>
								Проекты
							</span>
							<button
								onClick={onAddProject}
								className='text-blue-400 hover:text-blue-300 text-lg leading-none'
							>
								+
							</button>
						</div>

						{projects.map(project => {
							const projectTasks = tasks.filter(t => t.projectId === project.id)
							const activeCount = projectTasks.filter(t => !t.completed).length

							return (
								<div key={project.id} className='group relative mb-1'>
									<button
										onClick={() => onSelectProject(project.id)}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
											activeProjectId === project.id
												? 'bg-blue-600 text-white'
												: 'text-gray-400 hover:bg-gray-700 hover:text-white'
										}`}
									>
										<span className='text-lg'>{project.icon}</span>
										<span className='font-medium flex-1 truncate'>
											{project.name}
										</span>
										<span
											className={`text-xs px-2 py-0.5 rounded-full ${
												activeProjectId === project.id
													? 'bg-white/20 text-white'
													: 'bg-gray-700 text-gray-400'
											}`}
										>
											{activeCount}
										</span>
									</button>

									{activeProjectId === project.id && (
										<button
											onClick={e => {
												e.stopPropagation()
												onDeleteProject(project.id)
											}}
											className='absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1'
										>
											✕
										</button>
									)}
								</div>
							)
						})}
					</div>

					{/* 🔥 КНОПКА ФИНАНСЫ (ДОБАВЛЕНО) */}
					<div className='my-4 border-t border-gray-700 mx-3'></div>

					<button
						onClick={onOpenFinance}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition mb-1 ${
							viewMode === 'finance'
								? 'bg-blue-600 text-white'
								: 'text-gray-400 hover:bg-gray-700 hover:text-white'
						}`}
					>
						<span className='text-xl'>💰</span>
						<span className='font-bold'>Финансы</span>
					</button>

					{/* Settings */}
					<button
						onClick={onOpenSettings}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition mt-4 ${
							viewMode === 'settings'
								? 'bg-blue-600 text-white'
								: 'text-gray-400 hover:bg-gray-700 hover:text-white'
						}`}
					>
						<span className='text-xl'>⚙️</span>
						<span className='font-medium'>Настройки</span>
					</button>
				</div>
			</aside>
		</>
	)
}
