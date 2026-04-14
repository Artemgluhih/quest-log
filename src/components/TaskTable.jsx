import { useState, useEffect } from 'react'
import { PRIORITY_CONFIG } from '../data/projects'

export default function TaskDetail({
	task,
	projects,
	onClose,
	onUpdate,
	onDelete,
}) {
	const [title, setTitle] = useState(task.title)
	const [description, setDescription] = useState(task.description || '')
	const [deadline, setDeadline] = useState(task.deadline || '')
	const [priority, setPriority] = useState(task.priority)
	const [subtasks, setSubtasks] = useState(task.subtasks || [])
	const [comments, setComments] = useState(task.comments || [])
	const [files, setFiles] = useState(task.files || [])
	const [newSubtask, setNewSubtask] = useState('')
	const [newComment, setNewComment] = useState('')
	const [editingTitle, setEditingTitle] = useState(false)

	const project = projects[task.projectId]
	const pc = PRIORITY_CONFIG[priority]

	// Автосохранение при изменении важных полей
	useEffect(() => {
		const timer = setTimeout(() => {
			if (
				title !== task.title ||
				description !== task.description ||
				deadline !== task.deadline ||
				priority !== task.priority
			) {
				handleSave()
			}
		}, 800)
		return () => clearTimeout(timer)
	}, [title, description, deadline, priority])

	const handleSave = () => {
		onUpdate({
			...task,
			title,
			description,
			deadline,
			priority,
			subtasks,
			comments,
			files,
			updatedAt: new Date().toISOString(),
		})
	}

	const addSubtask = () => {
		if (!newSubtask.trim()) return
		setSubtasks([
			...subtasks,
			{ id: Date.now(), title: newSubtask, completed: false },
		])
		setNewSubtask('')
	}

	const toggleSubtask = id => {
		setSubtasks(
			subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)),
		)
	}

	const deleteSubtask = id => setSubtasks(subtasks.filter(s => s.id !== id))

	const addComment = () => {
		if (!newComment.trim()) return
		setComments([
			...comments,
			{ id: Date.now(), text: newComment, createdAt: new Date().toISOString() },
		])
		setNewComment('')
	}

	const handleFileUpload = e => {
		const uploadedFiles = Array.from(e.target.files)
		const fileData = uploadedFiles.map(file => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			return new Promise(resolve => {
				reader.onload = ev =>
					resolve({
						id: Date.now() + Math.random(),
						name: file.name,
						size: (file.size / 1024).toFixed(1) + 'KB',
						type: file.type,
						content: ev.target.result,
						uploadedAt: new Date().toISOString(),
					})
			})
		})
		Promise.all(fileData).then(newFiles => setFiles([...files, ...newFiles]))
	}

	const downloadFile = file => {
		if (!file.content) return
		const link = document.createElement('a')
		link.href = file.content
		link.download = file.name
		link.click()
	}

	const deleteFile = id => setFiles(files.filter(f => f.id !== id))

	return (
		<div
			className='fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40'
			onClick={onClose}
		>
			{/* Панель задачи справа */}
			<div
				className='w-full max-w-2xl bg-gray-800 h-full overflow-y-auto border-l border-gray-700 shadow-2xl flex flex-col'
				onClick={e => e.stopPropagation()}
			>
				{/* Шапка */}
				<div className='sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-start z-10'>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-2'>
							<button
								onClick={() => {
									const u = { ...task, completed: !task.completed }
									onUpdate(u)
								}}
								className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 ${task.completed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
							>
								{task.completed ? '✅ Выполнено' : '▶️ В работе'}
							</button>
							<span className='text-xs text-gray-500'>
								#{task.id.toString().slice(-3)}
							</span>
						</div>

						{editingTitle ? (
							<input
								autoFocus
								value={title}
								onChange={e => setTitle(e.target.value)}
								onBlur={() => setEditingTitle(false)}
								onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
								className='text-xl font-bold bg-gray-700 text-white px-2 py-1 rounded outline-none w-full'
							/>
						) : (
							<h2
								onClick={() => setEditingTitle(true)}
								className='text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition'
							>
								{title}
							</h2>
						)}
					</div>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white text-xl ml-4'
					>
						✕
					</button>
				</div>

				<div className='p-6 space-y-6 flex-1'>
					{/* Основные поля (как на скриншоте) */}
					<div className='space-y-3'>
						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								📂 Проект
							</span>
							<span className='text-white text-sm bg-gray-700 px-2 py-0.5 rounded'>
								{project?.icon} {project?.name}
							</span>
						</div>

						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								📅 Дата
							</span>
							<input
								type='date'
								value={deadline ? deadline.split('T')[0] : ''}
								onChange={e =>
									setDeadline(e.target.value ? e.target.value + 'T23:59' : '')
								}
								className='bg-gray-700 text-white text-sm px-2 py-1 rounded outline-none'
							/>
						</div>

						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								{' '}
								Приоритет
							</span>
							<div className='flex gap-1'>
								{Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
									<button
										key={key}
										onClick={() => setPriority(key)}
										className={`px-2 py-1 rounded text-xs font-bold transition ${
											priority === key
												? `${cfg.dot.replace('bg-', 'bg-')} text-white ring-2 ring-white ring-opacity-30`
												: 'bg-gray-700 text-gray-400 hover:bg-gray-600'
										}`}
									>
										{cfg.label}
									</button>
								))}
							</div>
						</div>

						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								⭐ Сложность
							</span>
							<span className='text-yellow-400 text-sm'>
								{'⭐'.repeat(task.difficulty)}
							</span>
						</div>

						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								💰 XP
							</span>
							<span className='text-yellow-400 font-bold text-sm'>
								+{task.xp} XP
							</span>
						</div>
					</div>

					{/* Описание */}
					<div>
						<label className='block text-xs text-gray-500 uppercase font-bold mb-2'>
							Описание
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder="Добавь описание или нажми '/' для функций..."
							rows='4'
							className='w-full bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm'
						/>
					</div>

					{/* Подзадачи */}
					<div>
						<div className='flex justify-between items-center mb-2'>
							<label className='text-xs text-gray-500 uppercase font-bold'>
								Подзадачи {subtasks.filter(s => s.completed).length}/
								{subtasks.length}
							</label>
						</div>
						<div className='space-y-1 mb-2'>
							{subtasks.map(s => (
								<div
									key={s.id}
									className='flex items-center gap-2 bg-gray-700 p-2 rounded group'
								>
									<input
										type='checkbox'
										checked={s.completed}
										onChange={() => toggleSubtask(s.id)}
										className='accent-blue-500'
									/>
									<span
										className={`flex-1 text-sm ${s.completed ? 'line-through text-gray-500' : 'text-white'}`}
									>
										{s.title}
									</span>
									<button
										onClick={() => deleteSubtask(s.id)}
										className='opacity-0 group-hover:opacity-100 text-red-400 text-xs'
									>
										✕
									</button>
								</div>
							))}
						</div>
						<div className='flex gap-2'>
							<input
								value={newSubtask}
								onChange={e => setNewSubtask(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && addSubtask()}
								placeholder='+ Новая подзадача...'
								className='flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm outline-none'
							/>
						</div>
					</div>

					{/* Файлы */}
					<div>
						<label className='block text-xs text-gray-500 uppercase font-bold mb-2'>
							Файлы {files.length}
						</label>
						<div className='space-y-1 mb-2'>
							{files.map(f => (
								<div
									key={f.id}
									className='flex items-center justify-between bg-gray-700 p-2 rounded group'
								>
									<button
										onClick={() => downloadFile(f)}
										className='flex items-center gap-2 text-blue-400 hover:underline text-sm'
									>
										📄 {f.name}{' '}
										<span className='text-gray-500 text-xs'>({f.size})</span>
									</button>
									<button
										onClick={() => deleteFile(f.id)}
										className='opacity-0 group-hover:opacity-100 text-red-400'
									>
										✕
									</button>
								</div>
							))}
						</div>
						<label className='block w-full text-center py-2 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer text-sm transition'>
							📎 Прикрепить файлы
							<input
								type='file'
								multiple
								onChange={handleFileUpload}
								className='hidden'
							/>
						</label>
					</div>

					{/* Комментарии */}
					<div>
						<label className='block text-xs text-gray-500 uppercase font-bold mb-2'>
							Комментарии
						</label>
						<div className='space-y-2 mb-2 max-h-40 overflow-y-auto'>
							{comments.map(c => (
								<div key={c.id} className='bg-gray-700 p-2 rounded'>
									<div className='text-white text-sm'>{c.text}</div>
									<div className='text-xs text-gray-500 mt-1'>
										{new Date(c.createdAt).toLocaleString('ru-RU')}
									</div>
								</div>
							))}
						</div>
						<div className='flex gap-2'>
							<input
								value={newComment}
								onChange={e => setNewComment(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && addComment()}
								placeholder='Комментарий...'
								className='flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm outline-none'
							/>
							<button
								onClick={addComment}
								className='px-3 py-2 bg-blue-600 rounded text-white text-sm'
							>
								➕
							</button>
						</div>
					</div>
				</div>

				{/* Футер с удалением */}
				<div className='p-4 border-t border-gray-700 flex justify-between items-center bg-gray-850'>
					<span className='text-xs text-gray-500'>
						Создано: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
					</span>
					<button
						onClick={() => {
							onDelete(task.id)
							onClose()
						}}
						className='px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm font-bold transition'
					>
						🗑️ Удалить задачу
					</button>
				</div>
			</div>
		</div>
	)
}
