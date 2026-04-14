import { useState } from 'react'
import { PROJECT_STYLES } from '../data/projects'

export default function Sidebar({
	projects,
	tasks,
	activeProjectId,
	onSelectProject,
	onAddProject,
	onDeleteProject,
	onOpenSettings,
	level,
	xp,
	viewMode,
	onViewChange,
	isOpen,
	onClose,
}) {
	const [newProjName, setNewProjName] = useState('')
	const [showInput, setShowInput] = useState(false)

	const handleAdd = () => {
		if (!newProjName.trim()) return
		const style =
			PROJECT_STYLES[Math.floor(Math.random() * PROJECT_STYLES.length)]
		onAddProject({
			id: 'proj_' + Date.now(),
			name: newProjName,
			priority: 'medium',
			xpMultiplier: 1.0,
			...style,
		})
		setNewProjName('')
		setShowInput(false)
	}

	return (
		<>
			{isOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
					onClick={onClose}
				/>
			)}

			<aside
				className={`
        fixed lg:static top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700 
        flex flex-col
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
			>
				<div className='flex-1 flex flex-col overflow-hidden'>
					<div className='p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0'>
						<h1 className='text-xl font-bold text-blue-400 flex items-center gap-2'>
							<span className='hidden lg:inline'>🎮</span> QuestLog
						</h1>
						<button
							onClick={onClose}
							className='lg:hidden text-gray-400 hover:text-white text-2xl'
						>
							✕
						</button>
					</div>

					<div className='p-2 flex-shrink-0'>
						<div className='flex bg-gray-700 rounded-lg p-1'>
							<button
								onClick={() => {
									onViewChange('dashboard')
									onClose()
								}}
								className={`flex-1 py-2 rounded-md text-xs font-bold transition ${
									viewMode === 'dashboard'
										? 'bg-blue-600 text-white'
										: 'text-gray-400'
								}`}
							>
								📋 Все
							</button>
							<button
								onClick={() => {
									onViewChange('calendar')
									onClose()
								}}
								className={`flex-1 py-2 rounded-md text-xs font-bold transition ${
									viewMode === 'calendar'
										? 'bg-blue-600 text-white'
										: 'text-gray-400'
								}`}
							>
								📅 Календарь
							</button>
						</div>
					</div>

					<nav className='flex-1 overflow-y-auto p-2 custom-scrollbar'>
						<div className='flex justify-between items-center mb-2 px-2'>
							<span className='text-xs text-gray-500 uppercase font-bold'>
								Проекты
							</span>
							<button
								onClick={() => setShowInput(!showInput)}
								className='text-blue-500 hover:text-blue-400 text-xl font-bold'
							>
								+
							</button>
						</div>

						{showInput && (
							<div className='flex gap-1 mb-2 px-1'>
								<input
									autoFocus
									type='text'
									value={newProjName}
									onChange={e => setNewProjName(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && handleAdd()}
									placeholder='Новый проект...'
									className='flex-1 bg-gray-700 text-sm px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-500 text-white'
								/>
								<button
									onClick={handleAdd}
									className='bg-blue-600 px-2 rounded text-xs text-white'
								>
									Ok
								</button>
							</div>
						)}

						{Object.values(projects).map(project => {
							const isActive = activeProjectId === project.id
							const count = tasks.filter(t => t.projectId === project.id).length

							return (
								<div
									key={project.id}
									className={`group flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer transition relative ${
										isActive
											? 'bg-gray-700 text-white border-l-4 border-blue-500'
											: 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
									}`}
									onClick={() => {
										onSelectProject(project.id)
										onClose()
									}}
								>
									<span className='text-lg'>{project.icon}</span>
									<span className='flex-1 text-sm truncate'>
										{project.name}
									</span>
									<span className='text-xs text-gray-500 bg-gray-800 px-1.5 rounded-full'>
										{count}
									</span>

									<button
										onClick={e => {
											e.stopPropagation()
											onDeleteProject(project.id)
										}}
										className='absolute right-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-xs'
									>
										✕
									</button>
								</div>
							)
						})}
					</nav>
				</div>

				<div className='p-3 border-t border-gray-700 bg-gray-800 flex-shrink-0'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg'>
							{level}
						</div>
						<div className='flex-1'>
							<div className='text-xs text-gray-400'>Уровень {level}</div>
							<div className='w-full bg-gray-700 rounded-full h-1.5 mt-1'>
								<div
									className='bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full'
									style={{ width: `${xp % 100}%` }}
								/>
							</div>
						</div>
					</div>

					<button
						onClick={() => {
							console.log('⚙️ Кнопка настроек нажата!')
							onOpenSettings()
							onClose()
						}}
						className='w-full py-2 bg-gray-700 hover:bg-blue-600 rounded-lg text-xs text-gray-300 hover:text-white transition flex items-center justify-center gap-2 border border-gray-600 hover:border-blue-500'
					>
						<span className='text-base'>⚙️</span>
						<span className='font-medium'>Настройки</span>
					</button>
				</div>
			</aside>
		</>
	)
}
