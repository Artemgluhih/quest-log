import { useState, useEffect } from 'react'
import { PRIORITY_CONFIG } from '../data/projects'
import DatePicker from './DatePicker'

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
	const [subtasks, setSubtasks] = useState(task.subtasks || [])
	const [comments, setComments] = useState(task.comments || [])
	const [files, setFiles] = useState(task.files || [])
	const [newSubtask, setNewSubtask] = useState('')
	const [newComment, setNewComment] = useState('')

	const project = projects[task.projectId]
	const priorityConfig = PRIORITY_CONFIG[task.priority]

	useEffect(() => {
		const timer = setTimeout(() => {
			if (
				title !== task.title ||
				description !== task.description ||
				deadline !== task.deadline
			) {
				handleSave()
			}
		}, 1000)
		return () => clearTimeout(timer)
	}, [title, description, deadline])

	const handleSave = () => {
		onUpdate({
			...task,
			title,
			description,
			deadline,
			subtasks,
			comments,
			files,
			updatedAt: new Date().toISOString(),
		})
	}

	const addSubtask = () => {
		if (newSubtask.trim() === '') return
		setSubtasks([
			...subtasks,
			{ id: Date.now(), title: newSubtask, completed: false },
		])
		setNewSubtask('')
	}

	const toggleSubtask = id => {
		setSubtasks(
			subtasks.map(st =>
				st.id === id ? { ...st, completed: !st.completed } : st,
			),
		)
	}

	const deleteSubtask = id => {
		setSubtasks(subtasks.filter(st => st.id !== id))
	}

	const addComment = () => {
		if (newComment.trim() === '') return
		setComments([
			...comments,
			{ id: Date.now(), text: newComment, createdAt: new Date().toISOString() },
		])
		setNewComment('')
	}

	const handleFileUpload = async e => {
		const uploadedFiles = Array.from(e.target.files)

		const fileDataPromises = uploadedFiles.map(file => {
			return new Promise(resolve => {
				const reader = new FileReader()
				reader.onload = event => {
					resolve({
						id: Date.now() + Math.random(),
						name: file.name,
						size: (file.size / 1024).toFixed(1) + ' KB',
						type: file.type,
						content: event.target.result, // Base64 содержимое
						uploadedAt: new Date().toISOString(),
					})
				}
				reader.readAsDataURL(file)
			})
		})

		const newFiles = await Promise.all(fileDataPromises)
		setFiles([...files, ...newFiles])
	}

	const downloadFile = file => {
		if (!file.content) {
			alert(
				'❌ Файл не содержит данных (возможно, он был загружен ранее без содержимого)',
			)
			return
		}
		const link = document.createElement('a')
		link.href = file.content
		link.download = file.name
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
	const deleteFile = fileId => {
		setFiles(files.filter(f => f.id !== fileId))
	}

	if (!project) return null

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
				<div className='sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
					<div className='flex items-center gap-3'>
						<span className='text-2xl'>{project.icon}</span>
						<div>
							<input
								type='text'
								value={title}
								onChange={e => setTitle(e.target.value)}
								className='bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-blue-500'
							/>
							<div className='flex gap-2 mt-1'>
								<span
									className={`text-xs px-2 py-0.5 rounded ${project.color} bg-opacity-20`}
								>
									{project.name}
								</span>
								<span
									className={`text-xs px-2 py-0.5 rounded ${priorityConfig.color} bg-opacity-20`}
								>
									{priorityConfig.label}
								</span>
								<span className='text-xs text-yellow-400'>+{task.xp} XP</span>
							</div>
						</div>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={handleSave}
							className='px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm'
						>
							💾
						</button>
						<button
							onClick={onClose}
							className='px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm'
						>
							✕
						</button>
					</div>
				</div>

				<div className='p-4 space-y-6'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='flex justify-between items-center py-2 border-b border-gray-700'>
							<span className='text-gray-400 text-sm flex items-center gap-2'>
								📅 Дата
							</span>
							<DatePicker value={deadline} onChange={setDeadline} />
						</div>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								⭐ Сложность
							</label>
							<div className='bg-gray-700 px-3 py-2 rounded text-white'>
								{'⭐'.repeat(task.difficulty)} ({task.difficulty}/5)
							</div>
						</div>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-1'>
							📝 Описание
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder='Добавь описание...'
							rows='4'
							className='w-full bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-2'>
							✅ Подзадачи
						</label>
						<div className='space-y-2 mb-2'>
							{subtasks.map(st => (
								<div
									key={st.id}
									className='flex items-center gap-2 bg-gray-700 p-2 rounded'
								>
									<input
										type='checkbox'
										checked={st.completed}
										onChange={() => toggleSubtask(st.id)}
										className='w-4 h-4 rounded accent-blue-500'
									/>
									<span
										className={`flex-1 ${st.completed ? 'line-through text-gray-500' : 'text-white'}`}
									>
										{st.title}
									</span>
									<button
										onClick={() => deleteSubtask(st.id)}
										className='text-red-400'
									>
										🗑️
									</button>
								</div>
							))}
						</div>
						<div className='flex gap-2'>
							<input
								type='text'
								value={newSubtask}
								onChange={e => setNewSubtask(e.target.value)}
								onKeyPress={e => e.key === 'Enter' && addSubtask()}
								placeholder='Новая подзадача...'
								className='flex-1 bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
							/>
							<button
								onClick={addSubtask}
								className='px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white'
							>
								➕
							</button>
						</div>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-2'>📎 Файлы</label>
						<div className='space-y-2 mb-2'>
							{files.map(file => (
								<div
									key={file.id}
									className='flex items-center justify-between bg-gray-700 p-2 rounded'
								>
									<div className='flex items-center gap-2'>
										<span className='text-blue-400'>📄</span>
										<div>
											<div className='text-white text-sm'>{file.name}</div>
											<div className='text-xs text-gray-500'>{file.size}</div>
										</div>
									</div>
									<div className='flex gap-2'>
										{file.content && (
											<button
												onClick={() => downloadFile(file)}
												className='text-blue-400 hover:text-blue-300 text-sm'
											>
												⬇️ Скачать
											</button>
										)}
										<button
											onClick={() => deleteFile(file.id)}
											className='text-red-400 hover:text-red-300'
										>
											🗑️
										</button>
									</div>
								</div>
							))}
						</div>
						<input
							type='file'
							multiple
							onChange={handleFileUpload}
							className='block w-full text-sm text-gray-400'
						/>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-2'>
							💬 Комментарии
						</label>
						<div className='space-y-2 mb-2 max-h-48 overflow-y-auto'>
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
								type='text'
								value={newComment}
								onChange={e => setNewComment(e.target.value)}
								onKeyPress={e => e.key === 'Enter' && addComment()}
								placeholder='Комментарий...'
								className='flex-1 bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
							/>
							<button
								onClick={addComment}
								className='px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white'
							>
								➕
							</button>
						</div>
					</div>

					<div className='pt-4 border-t border-gray-700'>
						<button
							onClick={() => {
								onDelete(task.id)
								onClose()
							}}
							className='px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm'
						>
							🗑️ Удалить задачу
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
