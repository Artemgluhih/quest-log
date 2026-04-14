import { useState, useEffect } from 'react'
import { PRIORITY_CONFIG } from '../data/projects'
import DatePicker from './DatePicker'

export default function TaskDetailPanel({
	task,
	projects,
	onClose,
	onUpdate,
	onDelete,
	onToggle,
}) {
	const [title, setTitle] = useState(task.title)
	const [description, setDescription] = useState(task.description || '')
	const [deadline, setDeadline] = useState(task.deadline || null)
	const [priority, setPriority] = useState(task.priority)
	const [subtasks, setSubtasks] = useState(task.subtasks || [])
	const [comments, setComments] = useState(task.comments || [])
	const [files, setFiles] = useState(task.files || [])

	const [newSubtask, setNewSubtask] = useState('')
	const [newComment, setNewComment] = useState('')

	const project = projects[task.projectId]

	useEffect(() => {
		setTitle(task.title)
		setDescription(task.description || '')
		setDeadline(task.deadline || null)
		setPriority(task.priority)
		setSubtasks(task.subtasks || [])
		setComments(task.comments || [])
		setFiles(task.files || [])
	}, [task.id])

	useEffect(() => {
		const timer = setTimeout(() => {
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
		}, 800)
		return () => clearTimeout(timer)
	}, [title, description, deadline, priority, subtasks, comments, files])

	const handleToggle = () => onToggle(task.id)

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
		Promise.all(fileData).then(newFiles =>
			setFiles(prev => [...prev, ...newFiles]),
		)
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
		<div className='flex flex-col h-full bg-gray-800 text-gray-100 border-l border-gray-700 shadow-2xl fixed inset-y-0 right-0 w-full sm:w-[450px] z-50'>
			<div className='p-4 sm:p-5 border-b border-gray-700 flex justify-between items-start bg-gray-800 flex-shrink-0'>
				<div className='flex-1 mr-4'>
					<div className='flex items-center gap-2 mb-3'>
						<button
							onClick={handleToggle}
							className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
								task.completed
									? 'bg-green-600 text-white'
									: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
							}`}
						>
							<span className='w-2 h-2 rounded-full bg-current'></span>
							{task.completed ? 'Выполнено' : 'В работе'}
						</button>
						<span className='text-xs text-gray-500 font-mono hidden sm:inline'>
							#{task.id.toString().slice(-4)}
						</span>
					</div>
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						className='text-lg sm:text-xl font-bold bg-transparent text-white outline-none w-full placeholder-gray-600'
						placeholder='Название задачи'
					/>
					<div className='text-sm text-gray-400 mt-1 flex items-center gap-1'>
						<span>📂</span> {project?.name}
					</div>
				</div>
				<button
					onClick={onClose}
					className='text-gray-400 hover:text-white text-2xl leading-none flex-shrink-0'
				>
					✕
				</button>
			</div>

			<div className='p-4 sm:p-5 space-y-4 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='space-y-3 sm:space-y-4'>
					<div className='flex items-center justify-between group'>
						<span className='text-gray-400 text-sm font-medium flex items-center gap-2 w-24'>
							📅 Дата
						</span>
						<div className='flex-1'>
							<DatePicker value={deadline} onChange={setDeadline} />
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<span className='text-gray-400 text-sm font-medium w-24'>
							Приоритет
						</span>
						<div className='flex bg-gray-900 rounded-lg p-1 gap-1'>
							{Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
								<button
									key={key}
									onClick={() => setPriority(key)}
									className={`px-2 sm:px-3 py-1 rounded text-xs font-bold transition-all ${
										priority === key
											? `${cfg.dot.replace('bg-', 'bg-')} text-white shadow-md`
											: 'text-gray-500 hover:text-gray-300'
									}`}
								>
									<span className='hidden sm:inline'>{cfg.label}</span>
									<span className='sm:hidden'>
										{key === 'high' ? '🔴' : key === 'medium' ? '🟡' : '🟢'}
									</span>
								</button>
							))}
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<span className='text-gray-400 text-sm font-medium w-24'>
							Сложность
						</span>
						<span className='text-yellow-400 text-sm tracking-widest'>
							{'⭐'.repeat(task.difficulty)}
						</span>
					</div>
				</div>

				<hr className='border-gray-700' />

				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Описание
					</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder='Добавь описание...'
						rows='3'
						className='w-full bg-gray-700/50 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none placeholder-gray-500 transition'
					/>
				</div>

				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Подзадачи{' '}
						<span className='text-gray-600'>
							({subtasks.filter(s => s.completed).length}/{subtasks.length})
						</span>
					</label>
					<div className='space-y-1 mb-3'>
						{subtasks.map(s => (
							<div
								key={s.id}
								className='flex items-center gap-3 bg-gray-700/30 hover:bg-gray-700/50 p-2 rounded-lg group transition'
							>
								<input
									type='checkbox'
									checked={s.completed}
									onChange={() => toggleSubtask(s.id)}
									className='w-4 h-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500 bg-transparent cursor-pointer flex-shrink-0'
								/>
								<span
									className={`flex-1 text-sm ${s.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}
								>
									{s.title}
								</span>
								<button
									onClick={() => deleteSubtask(s.id)}
									className='opacity-0 group-hover:opacity-100 text-red-400 text-xs flex-shrink-0'
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
							className='flex-1 bg-gray-700/50 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500'
						/>
					</div>
				</div>

				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Файлы {files.length}
					</label>
					<div className='space-y-2 mb-2'>
						{files.map(f => (
							<div
								key={f.id}
								className='flex items-center justify-between bg-gray-700/30 p-2 rounded-lg group'
							>
								<button
									onClick={() => downloadFile(f)}
									className='flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm truncate max-w-[200px]'
								>
									📎 {f.name}
								</button>
								<button
									onClick={() => deleteFile(f.id)}
									className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 flex-shrink-0'
								>
									✕
								</button>
							</div>
						))}
					</div>
					<label className='flex flex-col items-center justify-center w-full h-12 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/30 hover:border-gray-500 transition'>
						<span className='text-xs text-gray-400'>📂 Прикрепить файлы</span>
						<input
							type='file'
							multiple
							onChange={handleFileUpload}
							className='hidden'
						/>
					</label>
				</div>

				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Комментарии
					</label>
					<div className='space-y-3 mb-3 max-h-40 overflow-y-auto custom-scrollbar pr-1'>
						{comments.map(c => (
							<div key={c.id} className='bg-gray-700/30 p-3 rounded-lg'>
								<div className='text-gray-200 text-sm'>{c.text}</div>
								<div className='text-xs text-gray-500 mt-1.5'>
									{new Date(c.createdAt).toLocaleString('ru-RU', {
										hour: '2-digit',
										minute: '2-digit',
										day: 'numeric',
										month: 'short',
									})}
								</div>
							</div>
						))}
					</div>
					<div className='flex gap-2'>
						<input
							value={newComment}
							onChange={e => setNewComment(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && addComment()}
							placeholder='Написать комментарий...'
							className='flex-1 bg-gray-700/50 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500'
						/>
						<button
							onClick={addComment}
							className='bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-lg flex items-center justify-center transition shadow-lg shadow-blue-900/20 flex-shrink-0'
						>
							➕
						</button>
					</div>
				</div>
			</div>

			<div className='p-4 border-t border-gray-700 flex justify-between items-center bg-gray-800 flex-shrink-0'>
				<span className='text-xs text-gray-600 hidden sm:inline'>
					Создано: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
				</span>
				<button
					onClick={() => {
						onDelete(task.id)
						onClose()
					}}
					className='px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-sm font-bold transition border border-red-600/20 hover:border-red-600'
				>
					🗑️ Удалить
				</button>
			</div>
		</div>
	)
}
