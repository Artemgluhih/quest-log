import { useState, useEffect } from 'react'
import { DEFAULT_PROJECTS } from './data/projects'
import { calculateAutoPriority, suggestDifficulty } from './utils/autoPriority'
import { checkAchievements, ACHIEVEMENTS } from './utils/achievements'
import { supabase } from './supabaseClient'

import {
	fetchProjects,
	addProjectToDB,
	deleteProjectFromDB,
	fetchTasks,
	addTaskToDB,
	updateTaskInDB,
	deleteTaskFromDB,
} from './api'

import Sidebar from './components/Sidebar'
import ProjectView from './components/ProjectView'
import CalendarView from './components/CalendarView'
import QuickAddForm from './components/QuickAddForm'
import TaskDetailPanel from './components/TaskDetailPanel'
import StatsDashboard from './components/StatsDashboard'
import NotificationBell from './components/NotificationBell'
import ThemeSelector from './components/ThemeSelector'
import Achievements from './components/Achievements'
import LoginScreen from './components/LoginScreen'
import Settings from './components/Settings'
import FinanceView from './components/finance/FinanceView'
import AssistantView from './components/AssistantView'

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isCheckingAuth, setIsCheckingAuth] = useState(true)

	useEffect(() => {
		const isSetup = localStorage.getItem('questLog_isSetup') === 'true'
		if (!isSetup) setIsAuthenticated(true)
		setIsCheckingAuth(false)
	}, [])

	const handleLogin = () => setIsAuthenticated(true)
	const handleLogout = () => {
		setIsAuthenticated(false)
		setSelectedTask(null)
		setSidebarOpen(false)
	}

	const [theme, setTheme] = useState(
		() => localStorage.getItem('questLog_theme') || 'dark',
	)
	const [appTheme, setAppTheme] = useState(
		() => localStorage.getItem('questLog_appTheme') || 'default',
	)
	const [isCompact, setIsCompact] = useState(
		() => localStorage.getItem('questLog_compact') === 'true',
	)
	const [showThemeSelector, setShowThemeSelector] = useState(false)
	const [showAchievements, setShowAchievements] = useState(false)
	const [showSettings, setShowSettings] = useState(false)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark')
		document.documentElement.classList.toggle('compact-mode', isCompact)

		const THEMES = [
			'theme-green',
			'theme-purple',
			'theme-red',
			'theme-orange',
			'theme-pink',
			'theme-cyan',
			'theme-teal',
		]
		THEMES.forEach(t => document.documentElement.classList.remove(t))
		if (appTheme !== 'default') {
			document.documentElement.classList.add(appTheme)
		}

		localStorage.setItem('questLog_theme', theme)
		localStorage.setItem('questLog_appTheme', appTheme)
		localStorage.setItem('questLog_compact', isCompact)
	}, [theme, appTheme, isCompact])

	const [projects, setProjects] = useState([])
	const [tasks, setTasks] = useState([])
	const [isLoadingDB, setIsLoadingDB] = useState(true)

	const [activeProjectId, setActiveProjectId] = useState(null)
	const [viewMode, setViewMode] = useState('dashboard')
	const [selectedTask, setSelectedTask] = useState(null)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const [expandedProjects, setExpandedProjects] = useState({})
	const [expandedTasks, setExpandedTasks] = useState({})

	const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
		const saved = localStorage.getItem('questLog_achievements')
		return saved ? JSON.parse(saved) : []
	})

	useEffect(() => {
		const loadData = async () => {
			try {
				const dbProjects = await fetchProjects()
				if (dbProjects.length === 0) {
					const defaults = Object.values(DEFAULT_PROJECTS)
					for (const p of defaults) {
						await addProjectToDB(p)
					}
					setProjects(defaults)
				} else {
					const formatted = dbProjects.map(p => ({
						id: p.id,
						name: p.name,
						icon: p.icon,
						priority: p.priority,
						xpMultiplier: p.xp_multiplier,
						color: p.color,
						textColor: p.textColor,
						borderColor: p.borderColor,
					}))
					setProjects(formatted)
				}

				const dbTasks = await fetchTasks()
				if (dbTasks && dbTasks.length > 0) {
					const formatted = dbTasks.map(t => ({
						id: t.id,
						title: t.title,
						description: t.description,
						projectId: t.project_id,
						completed: t.completed,
						priority: t.priority,
						difficulty: t.difficulty,
						xp: t.xp,
						deadline: t.deadline,
						subtasks: t.subtasks || [],
						comments: t.comments || [],
						files: t.files || [],
						createdAt: t.created_at,
					}))
					setTasks(formatted)
				} else {
					setTasks([])
				}
			} catch (err) {
				console.error('❌ Ошибка загрузки:', err)
			} finally {
				setIsLoadingDB(false)
			}
		}
		loadData()
	}, [])

	useEffect(() => {
		localStorage.setItem(
			'questLog_achievements',
			JSON.stringify(unlockedAchievements),
		)
	}, [unlockedAchievements])

	useEffect(() => {
		if (isLoadingDB) return

		const stats = {
			totalTasks: tasks.length,
			completedTasks: tasks.filter(t => t.completed).length,
			totalProjects: projects.length,
			level:
				Math.floor(
					tasks
						.filter(t => t.completed)
						.reduce((sum, t) => sum + (t.xp || 0), 0) / 100,
				) + 1,
			totalXP: tasks
				.filter(t => t.completed)
				.reduce((sum, t) => sum + (t.xp || 0), 0),
		}

		const newAch = checkAchievements(
			tasks,
			projects,
			unlockedAchievements,
			stats,
		)
		if (newAch.length > 0) {
			setUnlockedAchievements(prev => [...new Set([...prev, ...newAch])])
			newAch.forEach(achId => {
				const ach = ACHIEVEMENTS[achId]
				if (ach) {
					setTimeout(() => {
						alert(`🏆 Новое достижение: ${ach.name}!\n${ach.description}`)
					}, 500)
				}
			})
		}
	}, [tasks, projects, unlockedAchievements, isLoadingDB])

	const addTask = async newTask => {
		if (!newTask.projectId) {
			alert('Выберите проект!')
			return
		}

		const proj = projects.find(p => p.id === newTask.projectId)
		if (!proj) {
			alert('Проект не найден!')
			return
		}

		const autoP = calculateAutoPriority(newTask)
		const diff = suggestDifficulty(newTask.title, newTask.description || '')

		const taskData = {
			id: Date.now().toString(),
			title: newTask.title,
			description: newTask.description || '',
			projectId: newTask.projectId,
			completed: false,
			priority: newTask.priority || autoP.priority,
			difficulty: newTask.difficulty || diff,
			xp: Math.round(
				(newTask.difficulty || diff) * 10 * (proj.xpMultiplier || 1),
			),
			deadline: newTask.deadline || null,
			subtasks: [],
			comments: [],
			files: [],
			createdAt: new Date().toISOString(),
		}

		try {
			console.log('📝 Добавляем задачу:', taskData)
			await addTaskToDB(taskData)
			setTasks(prev => [taskData, ...prev])
			console.log('✅ Задача добавлена!')
		} catch (err) {
			console.error('❌ Ошибка при добавлении задачи:', err)
			alert('Не удалось создать задачу: ' + err.message)
		}
	}

	const updateTask = async updatedTask => {
		try {
			await updateTaskInDB(updatedTask)
			setTasks(prev =>
				prev.map(t => (t.id === updatedTask.id ? updatedTask : t)),
			)
			setSelectedTask(updatedTask)
		} catch (err) {
			console.error('❌ Ошибка обновления:', err)
		}
	}

	const toggleTask = async id => {
		const task = tasks.find(t => t.id === id)
		if (!task) return

		const updated = {
			...task,
			completed: !task.completed,
			completedAt: !task.completed ? new Date().toISOString() : null,
		}

		try {
			await updateTaskInDB(updated)
			setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
			if (selectedTask && selectedTask.id === id) {
				setSelectedTask(updated)
			}
		} catch (err) {
			console.error('❌ Ошибка:', err)
		}
	}

	const deleteTask = async id => {
		try {
			await deleteTaskFromDB(id)
			setTasks(prev => prev.filter(t => t.id !== id))
			if (selectedTask && selectedTask.id === id) {
				setSelectedTask(null)
			}
		} catch (err) {
			console.error('❌ Ошибка:', err)
		}
	}

	const addProject = async p => {
		try {
			await addProjectToDB(p)
			setProjects(prev => [...prev, p])
		} catch (err) {
			console.error('❌ Ошибка:', err)
		}
	}

	const deleteProject = async id => {
		if (tasks.some(t => t.projectId === id)) {
			alert('❌ Сначала удали все задачи из этого проекта!')
			return
		}
		try {
			await deleteProjectFromDB(id)
			setProjects(prev => prev.filter(p => p.id !== id))
			if (activeProjectId === id) setActiveProjectId(null)
		} catch (err) {
			console.error('❌ Ошибка:', err)
		}
	}

	const handleClearAllData = async () => {
		if (
			window.confirm(
				'⚠️ Это удалит ВСЕ задачи и проекты безвозвратно! Продолжить?',
			)
		) {
			try {
				await supabase.from('tasks').delete().neq('id', '0')
				await supabase.from('projects').delete().neq('id', '0')

				localStorage.removeItem('questLog_tasks_v6')
				localStorage.removeItem('questLog_projects')
				localStorage.removeItem('questLog_achievements')

				setTasks([])
				setProjects(Object.values(DEFAULT_PROJECTS))
				setUnlockedAchievements([])

				alert('✅ Данные очищены!')
				setShowSettings(false)
			} catch (err) {
				alert('❌ Ошибка при очистке: ' + err.message)
			}
		}
	}

	const handleSelectProject = id => {
		setActiveProjectId(id)
		setViewMode(id ? 'project' : 'dashboard')
		setSelectedTask(null)
		setShowSettings(false)
	}

	const handleViewChange = mode => {
		setViewMode(mode)
		if (mode !== 'project') setActiveProjectId(null)
		setSelectedTask(null)
		setShowSettings(false)
	}

	const handleOpenSettings = () => {
		setViewMode('settings')
		setShowSettings(true)
		setActiveProjectId(null)
		setSelectedTask(null)
	}

	const toggleProjectExpand = projectId => {
		setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }))
	}

	const toggleTaskExpand = taskId => {
		setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
	}

	const totalXP = tasks
		.filter(t => t.completed)
		.reduce((s, t) => s + (t.xp || 0), 0)
	const level = Math.floor(totalXP / 100) + 1
	const hasOverdue = tasks.some(
		t => !t.completed && t.deadline && new Date(t.deadline) < new Date(),
	)

	if (isCheckingAuth)
		return (
			<div className='bg-gray-900 h-screen text-white flex items-center justify-center'>
				Загрузка...
			</div>
		)
	if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />
	if (isLoadingDB)
		return (
			<div className='bg-gray-900 h-screen text-white flex items-center justify-center'>
				Подключение к базе...
			</div>
		)

	return (
		<div className='h-screen bg-gray-900 dark:bg-gray-900 text-gray-100 dark:text-gray-100 flex overflow-hidden transition-colors duration-300'>
			{hasOverdue && (
				<div className='fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm font-bold z-[60] shadow-lg animate-pulse'>
					⚠️ У вас есть просроченные задачи!
				</div>
			)}

			<Sidebar
				projects={projects}
				tasks={tasks}
				activeProjectId={activeProjectId}
				onSelectProject={handleSelectProject}
				onAddProject={addProject}
				onDeleteProject={deleteProject}
				level={level}
				xp={totalXP}
				viewMode={viewMode}
				onViewChange={handleViewChange}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				onOpenSettings={handleOpenSettings}
				onOpenFinance={() => setViewMode('finance')}
			/>

			<div className='flex-1 flex flex-col h-screen overflow-hidden relative'>
				<header
					className={`bg-gray-800 dark:bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center z-10 shadow-sm ${hasOverdue ? 'mt-7' : ''}`}
				>
					<div className='flex items-center'>
						<button
							onClick={() => setSidebarOpen(true)}
							className='lg:hidden text-gray-400 hover:text-white text-2xl mr-4'
						>
							☰
						</button>
						<h2 className='text-xl font-bold text-white dark:text-white'>
							{viewMode === 'dashboard' && '📋 Все задачи'}
							{viewMode === 'calendar' && '📅 Календарь'}
							{viewMode === 'project' &&
							projects.find(p => p.id === activeProjectId)
								? projects.find(p => p.id === activeProjectId).icon +
									' ' +
									projects.find(p => p.id === activeProjectId).name
								: ''}
							{viewMode === 'settings' && '⚙️ Настройки'}
							{viewMode === 'finance' && '💰 Финансы'}
							{viewMode === 'assistant' && '🤖 AI Ассистент'}
						</h2>
					</div>

					<div className='flex items-center gap-3'>
						<div className='text-sm text-gray-400 hidden sm:block'>
							{tasks.filter(t => !t.completed).length} активных
						</div>
						<NotificationBell tasks={tasks} onSelect={setSelectedTask} />
						<button
							onClick={handleLogout}
							className='text-gray-400 hover:text-red-400 text-xl transition'
							title='Выйти'
						>
							🚪
						</button>
					</div>
				</header>

				<div
					className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedTask ? 'mr-0 md:mr-[450px]' : ''} ${viewMode === 'finance' || viewMode === 'assistant' ? 'w-full h-full bg-gray-900' : 'p-4'}`}
				>
					{viewMode === 'dashboard' && (
						<div className='space-y-6'>
							<StatsDashboard tasks={tasks} projects={projects} />
							<div className='border-t border-gray-700 pt-6'>
								<h3 className='text-lg font-bold text-white mb-4'>
									Список всех задач
								</h3>
								<QuickAddForm projects={projects} onAdd={addTask} />
								<GroupedTasksTable
									tasks={tasks}
									projects={projects}
									onToggle={toggleTask}
									onDelete={deleteTask}
									onSelect={setSelectedTask}
									expandedProjects={expandedProjects}
									expandedTasks={expandedTasks}
									onToggleProjectExpand={toggleProjectExpand}
									onToggleTaskExpand={toggleTaskExpand}
									onUpdateTask={updateTask}
								/>
							</div>
						</div>
					)}

					{viewMode === 'calendar' && (
						<CalendarView
							tasks={tasks}
							projects={projects}
							onClick={setSelectedTask}
							onAddTask={addTask}
							activeProjectId={activeProjectId}
						/>
					)}

					{viewMode === 'project' &&
						activeProjectId &&
						projects.find(p => p.id === activeProjectId) && (
							<ProjectView
								project={projects.find(p => p.id === activeProjectId)}
								tasks={tasks}
								onAddTask={addTask}
								onToggleTask={toggleTask}
								onDeleteTask={deleteTask}
								onSelectTask={setSelectedTask}
								onUpdateTask={updateTask}
							/>
						)}

					{viewMode === 'settings' && (
						<Settings
							theme={theme}
							appTheme={appTheme}
							isCompact={isCompact}
							onThemeChange={setTheme}
							onAppThemeChange={setAppTheme}
							onCompactChange={setIsCompact}
							onClearData={handleClearAllData}
							unlockedAchievements={unlockedAchievements}
							tasks={tasks}
							projects={projects}
						/>
					)}

					{/* 🔥 ФИНАНСЫ (БЕЗ ОТСТУПОВ, НА ВЕСЬ ЭКРАН) */}
					{viewMode === 'finance' && <FinanceView />}

					{/* 🔥 AI АССИСТЕНТ (БЕЗ ОТСТУПОВ, НА ВЕСЬ ЭКРАН) */}
					{viewMode === 'assistant' && <AssistantView tasks={tasks} />}
				</div>

				{selectedTask && (
					<div className='absolute top-0 right-0 h-full w-full md:w-[450px] bg-gray-800 shadow-2xl z-20 overflow-hidden'>
						<TaskDetailPanel
							task={selectedTask}
							projects={projects}
							onClose={() => setSelectedTask(null)}
							onUpdate={updateTask}
							onDelete={deleteTask}
							onToggle={toggleTask}
						/>
					</div>
				)}
			</div>

			{showThemeSelector && (
				<ThemeSelector
					currentTheme={appTheme}
					isCompact={isCompact}
					onThemeChange={setAppTheme}
					onCompactChange={setIsCompact}
					onClose={() => setShowThemeSelector(false)}
				/>
			)}
			{showAchievements && (
				<Achievements
					unlocked={unlockedAchievements}
					onClose={() => setShowAchievements(false)}
				/>
			)}
		</div>
	)
}

// --- ТАБЛИЦА ЗАДАЧ (СОКРАЩЕННАЯ ВЕРСИЯ) ---
function GroupedTasksTable({
	tasks,
	projects,
	onToggle,
	onDelete,
	onSelect,
	expandedProjects,
	expandedTasks,
	onToggleProjectExpand,
	onToggleTaskExpand,
	onUpdateTask,
}) {
	const groupedByProject = tasks.reduce((acc, task) => {
		if (!acc[task.projectId]) acc[task.projectId] = []
		acc[task.projectId].push(task)
		return acc
	}, {})

	const sortedProjectIds = Object.keys(groupedByProject).sort(
		(a, b) =>
			groupedByProject[b].filter(t => !t.completed).length -
			groupedByProject[a].filter(t => !t.completed).length,
	)

	const handleToggleSubtask = (parentId, subtaskId) => {
		const parentTask = tasks.find(t => t.id === parentId)
		if (!parentTask) return
		const updated = {
			...parentTask,
			subtasks: parentTask.subtasks.map(s =>
				s.id === subtaskId ? { ...s, completed: !s.completed } : s,
			),
		}
		onUpdateTask(updated)
	}

	const formatDate = dateString => {
		if (!dateString) return null
		const date = new Date(dateString)
		const today = new Date()
		const isOverdue = date < today
		const day = date.getDate()
		const monthNames = [
			'янв',
			'фев',
			'мар',
			'апр',
			'май',
			'июн',
			'июл',
			'авг',
			'сен',
			'окт',
			'ноя',
			'дек',
		]
		const month = monthNames[date.getMonth()]
		return { text: `${day} ${month}`, isOverdue }
	}

	return (
		<div className='space-y-4'>
			{sortedProjectIds.map(projectId => {
				const project = projects.find(p => p.id === projectId)
				if (!project) return null
				const projectTasks = groupedByProject[projectId]
				const activeCount = projectTasks.filter(t => !t.completed).length
				const isExpanded = expandedProjects[projectId] !== false

				return (
					<div
						key={projectId}
						className='bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'
					>
						<div
							onClick={() => onToggleProjectExpand(projectId)}
							className='flex items-center justify-between p-3 bg-gray-750 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition'
						>
							<div className='flex items-center gap-3'>
								<span className='text-lg'>{project.icon}</span>
								<span className='font-bold text-white'>{project.name}</span>
								<span className='text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full'>
									{activeCount} активных
								</span>
							</div>
							<span className='text-gray-400 text-lg'>
								{isExpanded ? '▼' : '▶'}
							</span>
						</div>

						{isExpanded && (
							<div className='divide-y divide-gray-700'>
								{projectTasks
									.sort((a, b) => a.completed - b.completed)
									.map(task => {
										const pc = {
											high: 'text-red-400',
											medium: 'text-yellow-400',
											low: 'text-green-400',
										}[task.priority]
										const dot = {
											high: 'bg-red-500',
											medium: 'bg-yellow-500',
											low: 'bg-green-500',
										}[task.priority]
										const isTaskExpanded = expandedTasks[task.id]
										const hasSubtasks =
											task.subtasks && task.subtasks.length > 0
										const deadlineData = formatDate(task.deadline)

										return (
											<div
												key={task.id}
												className='bg-gray-800 dark:bg-gray-800'
											>
												<div className='grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-700/50 transition group'>
													<div className='col-span-1 flex justify-center'>
														{hasSubtasks && (
															<button
																onClick={() => onToggleTaskExpand(task.id)}
																className='text-gray-500 hover:text-white transition'
															>
																{isTaskExpanded ? '▼' : '▶'}
															</button>
														)}
													</div>
													<div className='col-span-4 flex gap-2 items-center'>
														<div
															onClick={e => {
																e.stopPropagation()
																onToggle(task.id)
															}}
															className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500 hover:border-blue-400'}`}
														>
															{task.completed && '✓'}
														</div>
														<span
															onClick={() => onSelect(task)}
															className={`text-sm truncate cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-200 hover:text-white'}`}
														>
															{task.title}
														</span>
														{hasSubtasks && (
															<span className='text-xs text-gray-500 bg-gray-700 px-1.5 rounded-full'>
																{task.subtasks.filter(s => s.completed).length}/
																{task.subtasks.length}
															</span>
														)}
													</div>
													<div className='col-span-3 flex justify-center'>
														{deadlineData ? (
															<span
																className={`text-xs font-medium px-2 py-0.5 rounded-full ${deadlineData.isOverdue && !task.completed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 text-gray-400'}`}
															>
																{deadlineData.isOverdue && !task.completed
																	? '⚠️ '
																	: '📅 '}
																{deadlineData.text}
															</span>
														) : (
															<span className='text-xs text-gray-600'>—</span>
														)}
													</div>
													<div className='col-span-1 flex justify-center'>
														<span
															className={`flex items-center gap-1 text-xs ${pc}`}
														>
															<span
																className={`w-1.5 h-1.5 rounded-full ${dot}`}
															></span>
														</span>
													</div>
													<div className='col-span-2 flex justify-center'>
														<span
															className={`text-xs font-bold ${task.completed ? 'text-green-400' : 'text-yellow-400'}`}
														>
															{task.completed ? '✅' : `+${task.xp}`}
														</span>
													</div>
													<div className='col-span-1 flex justify-end opacity-0 group-hover:opacity-100'>
														<button
															onClick={e => {
																e.stopPropagation()
																onDelete(task.id)
															}}
															className='text-red-500 hover:text-red-400'
														>
															🗑️
														</button>
													</div>
												</div>

												{hasSubtasks && isTaskExpanded && (
													<div className='bg-gray-900/50 pl-12 pr-4 py-2 space-y-1'>
														{task.subtasks.map(sub => (
															<div
																key={sub.id}
																className='flex items-center gap-3 p-2 rounded hover:bg-gray-700/30 transition group/sub'
															>
																<input
																	type='checkbox'
																	checked={sub.completed}
																	onChange={() =>
																		handleToggleSubtask(task.id, sub.id)
																	}
																	className='w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-0 bg-transparent cursor-pointer'
																/>
																<span
																	className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-600' : 'text-gray-300'}`}
																>
																	{sub.title}
																</span>
																<button
																	onClick={() => {
																		const updated = {
																			...task,
																			subtasks: task.subtasks.filter(
																				s => s.id !== sub.id,
																			),
																		}
																		onUpdateTask(updated)
																	}}
																	className='opacity-0 group-hover/sub:opacity-100 text-gray-600 hover:text-red-400 text-xs'
																>
																	✕
																</button>
															</div>
														))}
													</div>
												)}
											</div>
										)
									})}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

export default App
