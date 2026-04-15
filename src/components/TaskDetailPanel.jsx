import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import DatePicker from './DatePicker' // <-- Импортируем красивый календарь

export default function TaskDetailPanel({
	task,
	projects,
	onClose,
	onUpdate,
	onDelete,
	onToggle,
}) {
	const [title, setTitle] = useState(task?.title || '')
	const [description, setDescription] = useState(task?.description || '')
	const [priority, setPriority] = useState(task?.priority || 'medium')

	// Храним дату как ISO строку или null
	const [deadline, setDeadline] = useState(task?.deadline || null)

	const [subtasks, setSubtasks] = useState(task?.subtasks || [])
	const [comments, setComments] = useState(task?.comments || [])
	const [files, setFiles] = useState(task?.files || [])
	const [newSubtask, setNewSubtask] = useState('')
	const [newComment, setNewComment] = useState('')

	const handleFileUpload = async e => {
		const uploadedFiles = Array.from(e.target.files)

		for (const file of uploadedFiles) {
			try {
				// 1. Загружаем файл в Supabase Storage
				const fileExt = file.name.split('.').pop()
				const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('task-files')
					.upload(fileName, file)

				if (uploadError) throw uploadError

				// 2. Получаем публичную ссылку
				const {
					data: { publicUrl },
				} = supabase.storage.from('task-files').getPublicUrl(fileName)

				// 3. Добавляем ссылку в список файлов
				const fileData = {
					id: Date.now() + Math.random(),
					name: file.name,
					size: (file.size / 1024).toFixed(1) + 'KB',
					type: file.type,
					url: publicUrl,
					uploadedAt: new Date().toISOString(),
				}

				setFiles(prev => [...prev, fileData])
			} catch (error) {
				console.error('Ошибка загрузки:', error)
				alert(`Не удалось загрузить ${file.name}`)
			}
		}
	}

	const downloadFile = file => {
		if (file.url) {
			window.open(file.url, '_blank')
		} else if (file.content) {
			window.open(file.content, '_blank')
		}
	}

	const deleteFile = fileId => {
		setFiles(prev => prev.filter(f => f.id !== fileId))
	}

	const handleSave = () => {
		if (!title.trim()) {
			alert('Введите название задачи!')
			return
		}

		// ✅ СОХРАНЯЕМ ТОЛЬКО МЕТАДАННЫЕ ФАЙЛОВ (URL), А НЕ BASE64
		const filesToSave = files.map(f => ({
			id: f.id,
			name: f.name,
			size: f.size,
			type: f.type,
			url: f.url,
			uploadedAt: f.uploadedAt,
		}))

		const updatedTask = {
			...task,
			title: title.trim(),
			description: description.trim(),
			priority,
			deadline: deadline || null, // Сохраняем дату из DatePicker
			subtasks,
			comments,
			files: filesToSave,
		}

		onUpdate(updatedTask)
		onClose()
	}

	const addSubtask = () => {
		if (!newSubtask.trim()) return
		setSubtasks(prev => [
			...prev,
			{ id: Date.now(), title: newSubtask.trim(), completed: false },
		])
		setNewSubtask('')
	}

	const toggleSubtask = id => {
		setSubtasks(prev =>
			prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)),
		)
	}

	const deleteSubtask = id => {
		setSubtasks(prev => prev.filter(s => s.id !== id))
	}

	const addComment = () => {
		if (!newComment.trim()) return
		setComments(prev => [
			...prev,
			{
				id: Date.now(),
				text: newComment.trim(),
				author: 'User',
				createdAt: new Date().toISOString(),
			},
		])
		setNewComment('')
	}

	return (
		<div className='h-full flex flex-col bg-gray-800'>
			{/* Header */}
			<div className='flex items-center justify-between p-4 border-b border-gray-700'>
				<h2 className='text-lg font-bold text-white flex items-center gap-2'>
					<span className='text-xl'>📝</span>
					<span>Детали задачи</span>
				</h2>
				<button
					onClick={onClose}
					className='text-gray-400 hover:text-white text-2xl transition'
				>
					✕
				</button>
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar'>
				{/* Title */}
				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Название
					</label>
					<input
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
						className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Введите название задачи'
					/>
				</div>

				{/* Description */}
				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Описание
					</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={3}
						className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none'
						placeholder='Добавьте описание...'
					/>
				</div>

				{/* Priority & Deadline */}
				<div className='grid grid-cols-2 gap-3'>
					<div>
						<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
							Приоритет
						</label>
						<select
							value={priority}
							onChange={e => setPriority(e.target.value)}
							className='w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
						>
							<option value='low'>🌱 Низкий</option>
							<option value='medium'>⚡ Средний</option>
							<option value='high'>🔥 Высокий</option>
						</select>
					</div>

					{/* 🔥 ТУТ ВСТАВЛЕН ДАТПИКЕР */}
					<div>
						<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
							Дедлайн
						</label>
						<div className='relative'>
							<DatePicker value={deadline} onChange={setDeadline} />
						</div>
					</div>
				</div>

				{/* Subtasks */}
				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Подзадачи {subtasks.filter(s => s.completed).length}/
						{subtasks.length}
					</label>
					<div className='space-y-2 mb-2'>
						{subtasks.map(subtask => (
							<div
								key={subtask.id}
								className='flex items-center gap-2 bg-gray-700/30 p-2 rounded-lg group'
							>
								<input
									type='checkbox'
									checked={subtask.completed}
									onChange={() => toggleSubtask(subtask.id)}
									className='w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-0 bg-transparent cursor-pointer'
								/>
								<span
									className={`flex-1 text-sm ${
										subtask.completed
											? 'line-through text-gray-500'
											: 'text-gray-300'
									}`}
								>
									{subtask.title}
								</span>
								<button
									onClick={() => deleteSubtask(subtask.id)}
									className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition'
								>
									✕
								</button>
							</div>
						))}
					</div>
					<div className='flex gap-2'>
						<input
							type='text'
							value={newSubtask}
							onChange={e => setNewSubtask(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && addSubtask()}
							placeholder='Добавить подзадачу...'
							className='flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
						/>
						<button
							onClick={addSubtask}
							className='px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition'
						>
							+
						</button>
					</div>
				</div>

				{/* Files */}
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

				{/* Comments */}
				<div>
					<label className='block text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide'>
						Комментарии {comments.length}
					</label>
					<div className='space-y-2 mb-2 max-h-40 overflow-y-auto custom-scrollbar'>
						{comments.map(comment => (
							<div key={comment.id} className='bg-gray-700/30 p-3 rounded-lg'>
								<div className='flex items-center justify-between mb-1'>
									<span className='text-xs font-bold text-blue-400'>
										{comment.author || 'User'}
									</span>
									<span className='text-xs text-gray-500'>
										{new Date(comment.createdAt).toLocaleDateString('ru-RU')}
									</span>
								</div>
								<p className='text-sm text-gray-300'>{comment.text}</p>
							</div>
						))}
					</div>
					<div className='flex gap-2'>
						<input
							type='text'
							value={newComment}
							onChange={e => setNewComment(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && addComment()}
							placeholder='Добавить комментарий...'
							className='flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
						/>
						<button
							onClick={addComment}
							className='px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition'
						>
							+
						</button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='p-4 border-t border-gray-700 bg-gray-800 space-y-3'>
				<button
					onClick={handleSave}
					className='w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition'
				>
					💾 Сохранить изменения
				</button>
				<div className='flex gap-3'>
					<button
						onClick={() => {
							onToggle(task.id)
							onClose()
						}}
						className={`flex-1 py-2 rounded-lg font-medium transition ${
							task.completed
								? 'bg-yellow-600 hover:bg-yellow-500 text-white'
								: 'bg-green-600 hover:bg-green-500 text-white'
						}`}
					>
						{task.completed ? '↩️ Вернуть' : '✅ Выполнить'}
					</button>
					<button
						onClick={() => {
							if (confirm('Удалить задачу?')) {
								onDelete(task.id)
								onClose()
							}
						}}
						className='flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition'
					>
						🗑️ Удалить
					</button>
				</div>
			</div>
		</div>
	)
}
