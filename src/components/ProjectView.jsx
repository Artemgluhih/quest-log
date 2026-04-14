import { useState } from 'react'
import { PRIORITY_CONFIG } from '../data/projects'
import DatePicker from './DatePicker'

export default function ProjectView({
	project,
	tasks,
	onAddTask,
	onToggleTask,
	onDeleteTask,
	onSelectTask,
	onUpdateTask,
}) {
	const [title, setTitle] = useState('')
	const [deadline, setDeadline] = useState(null)
	const [priority, setPriority] = useState('medium')

	const projectTasks = tasks.filter(t => t.projectId === project.id)

	const handleAdd = () => {
		if (!title.trim()) return

		onAddTask({
			title,
			projectId: project.id,
			deadline: deadline || null,
			priority,
			description: '',
		})
		setTitle('')
		setDeadline(null)
		setPriority('medium')
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAdd()
		}
	}

	const handleToggleSubtask = (parentId, subtaskId) => {
		const parentTask = tasks.find(t => t.id === parentId)
		if (!parentTask) return

		const updatedSubtasks = parentTask.subtasks.map(s =>
			s.id === subtaskId ? { ...s, completed: !s.completed } : s,
		)

		onUpdateTask({ ...parentTask, subtasks: updatedSubtasks })
	}

	return (
		<div className='flex flex-col h-full'>
			<div className='flex items-center gap-3 mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg'>
				<span className='text-4xl'>{project.icon}</span>
				<div>
					<h2 className='text-2xl font-bold text-white'>{project.name}</h2>
					<p className='text-sm text-gray-400'>
						Активных задач: {projectTasks.filter(t => !t.completed).length}
					</p>
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex-1 flex flex-col'>
				<div className='grid grid-cols-12 gap-2 p-3 bg-gray-750 border-b border-gray-700 text-xs font-bold text-gray-400 uppercase'>
					<div className='col-span-5 pl-2'>Название</div>
					<div className='col-span-2 text-center'>Дата</div>
					<div className='col-span-2 text-center'>Приоритет</div>
					<div className='col-span-1 text-center'>Сложность</div>
					<div className='col-span-1 text-center'>Статус</div>
					<div className='col-span-1'></div>
				</div>

				{/* Убрали form, теперь это просто div */}
				<div className='grid grid-cols-12 gap-2 p-3 bg-gray-700 border-b border-gray-600 items-center'>
					<div className='col-span-5 flex gap-2 items-center'>
						<div className='w-4 h-4 border-2 border-gray-500 rounded-full flex-shrink-0'></div>
						<input
							type='text'
							value={title}
							onChange={e => setTitle(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder='Новая задача...'
							className='bg-transparent text-white outline-none flex-1 placeholder-gray-400 text-sm'
						/>
					</div>

					<div className='col-span-2 flex justify-center'>
						<DatePicker value={deadline} onChange={setDeadline} />
					</div>

					<div className='col-span-2 text-center'>
						<select
							value={priority}
							onChange={e => setPriority(e.target.value)}
							className='bg-gray-800 text-gray-300 text-xs py-1 px-2 rounded border border-gray-600 outline-none w-full'
						>
							<option value='high'>🔴 Высокий</option>
							<option value='medium'>🟡 Средний</option>
							<option value='low'>🟢 Низкий</option>
						</select>
					</div>

					<div className='col-span-1 text-center text-gray-500 text-xs'>
						Авто
					</div>

					<div className='col-span-2 flex justify-center'>
						<button
							type='button'
							onClick={handleAdd}
							className='text-blue-500 hover:text-blue-400 font-bold text-lg px-2'
						>
							+
						</button>
					</div>
				</div>

				<div className='flex-1 overflow-y-auto'>
					{projectTasks.length === 0 ? (
						<div className='text-center py-10 text-gray-500'>
							Задач нет. Начни с создания!
						</div>
					) : (
						projectTasks.map(task => {
							const pc = PRIORITY_CONFIG[task.priority]
							return (
								<div
									key={task.id}
									className='border-b border-gray-700 last:border-0'
								>
									<div
										onClick={() => onSelectTask(task)}
										className='grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-700/50 transition cursor-pointer group'
									>
										<div className='col-span-5 flex gap-2 items-center'>
											<div
												onClick={e => {
													e.stopPropagation()
													onToggleTask(task.id)
												}}
												className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition ${
													task.completed
														? 'bg-green-500 border-green-500 text-white'
														: 'border-gray-500 hover:border-blue-400'
												}`}
											>
												{task.completed && <span className='text-xs'>✓</span>}
											</div>
											<span
												className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}
											>
												{task.title}
											</span>
											{task.subtasks && task.subtasks.length > 0 && (
												<span className='text-xs text-gray-500 bg-gray-700 px-1.5 rounded-full ml-1'>
													{task.subtasks.filter(s => s.completed).length}/
													{task.subtasks.length}
												</span>
											)}
										</div>

										<div className='col-span-2 flex justify-center'>
											<span className='text-xs text-gray-400'>
												{task.deadline
													? new Date(task.deadline).toLocaleDateString(
															'ru-RU',
															{ day: 'numeric', month: 'short' },
														)
													: '—'}
											</span>
										</div>

										<div className='col-span-2 flex justify-center'>
											<span
												className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
													task.priority === 'high'
														? 'bg-red-500/20 text-red-400'
														: task.priority === 'medium'
															? 'bg-yellow-500/20 text-yellow-400'
															: 'bg-green-500/20 text-green-400'
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${pc.dot}`}
												></span>{' '}
												{pc.label}
											</span>
										</div>

										<div className='col-span-1 text-center text-gray-400 text-sm'>
											{'⭐'.repeat(task.difficulty)}
										</div>

										<div className='col-span-1 flex justify-center'>
											<span
												className={`text-xs font-bold ${task.completed ? 'text-green-400' : 'text-yellow-400'}`}
											>
												{task.completed ? '✅' : `+${task.xp}`}
											</span>
										</div>

										<div className='col-span-1 flex justify-center opacity-0 group-hover:opacity-100'>
											<button
												onClick={e => {
													e.stopPropagation()
													onDeleteTask(task.id)
												}}
												className='text-red-500 hover:text-red-400'
											>
												🗑️
											</button>
										</div>
									</div>

									{task.subtasks && task.subtasks.length > 0 && (
										<div className='bg-gray-900/30'>
											{task.subtasks.map(sub => (
												<div
													key={sub.id}
													className='grid grid-cols-12 gap-2 px-4 py-2 border-l-2 border-gray-700 ml-6 hover:bg-gray-700/30 transition group/sub'
												>
													<div className='col-span-7 flex items-center gap-2'>
														<input
															type='checkbox'
															checked={sub.completed}
															onChange={() =>
																handleToggleSubtask(task.id, sub.id)
															}
															className='w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-0 bg-transparent cursor-pointer'
														/>
														<span
															className={`text-xs truncate ${sub.completed ? 'line-through text-gray-600' : 'text-gray-300'}`}
														>
															{sub.title}
														</span>
													</div>
													<div className='col-span-4'></div>
													<div className='col-span-1 flex justify-end opacity-0 group-hover/sub:opacity-100'>
														<button
															onClick={() => {
																const updated = task.subtasks.filter(
																	s => s.id !== sub.id,
																)
																onUpdateTask({ ...task, subtasks: updated })
															}}
															className='text-gray-600 hover:text-red-400 text-xs'
														>
															✕
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)
						})
					)}
				</div>
			</div>
		</div>
	)
}
