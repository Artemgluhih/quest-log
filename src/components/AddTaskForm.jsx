import { useState } from 'react'
import { suggestDifficulty } from '../utils/autoPriority'

export default function AddTaskForm({ projects, onAdd }) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [projectId, setProjectId] = useState(Object.keys(projects)[0] || '')
	const [deadline, setDeadline] = useState('')

	const handleSubmit = e => {
		if (e) e.preventDefault()
		if (!title.trim() || !projectId) return

		const difficulty = suggestDifficulty(title, description)
		const project = projects[projectId]
		const xp = Math.round(difficulty * 10 * project.xpMultiplier)

		onAdd({
			id: Date.now(),
			title,
			description,
			projectId,
			deadline: deadline || null,
			difficulty,
			priority: project.priority,
			xp,
			completed: false,
			subtasks: [],
			comments: [],
			files: [],
		})

		setTitle('')
		setDescription('')
		setDeadline('')
	}

	return (
		<div className='bg-gray-800 rounded-lg p-3 mb-4'>
			<form onSubmit={handleSubmit} className='space-y-2'>
				<div className='flex gap-2'>
					<input
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Название задачи...'
						className='flex-1 bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
					/>
					<select
						value={projectId}
						onChange={e => setProjectId(e.target.value)}
						className='bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
					>
						{Object.values(projects).map(p => (
							<option key={p.id} value={p.id}>
								{p.icon} {p.name}
							</option>
						))}
					</select>
				</div>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='Описание (влияет на авто-сложность)...'
					rows='2'
					className='w-full bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500'
				/>
				<div className='flex gap-2 items-center'>
					<input
						type='datetime-local'
						value={deadline}
						onChange={e => setDeadline(e.target.value)}
						className='bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm'
					/>
					<button
						type='submit'
						className='flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition text-white font-semibold'
					>
						➕ Создать
					</button>
				</div>
			</form>
			<div className='mt-2 text-xs text-gray-500'>
				💡 Приоритет и XP рассчитаются автоматически
			</div>
		</div>
	)
}
