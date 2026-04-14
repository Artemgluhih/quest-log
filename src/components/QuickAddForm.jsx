import { useState } from 'react'
import DatePicker from './DatePicker'

export default function QuickAddForm({ projects, onAdd }) {
	const [title, setTitle] = useState('')
	const [projectId, setProjectId] = useState(Object.keys(projects)[0] || '')
	const [deadline, setDeadline] = useState(null)

	const handleSubmit = async e => {
		e.preventDefault()
		console.log('📝 Отправка формы...')

		if (!title.trim()) {
			alert('Введите название задачи!')
			return
		}

		if (!projectId) {
			alert('Выберите проект!')
			return
		}

		console.log('📦 Данные задачи:', {
			title: title.trim(),
			projectId,
			deadline,
		})

		try {
			await onAdd({
				title: title.trim(),
				projectId,
				deadline: deadline || null,
				description: '',
			})

			setTitle('')
			setDeadline(null)

			console.log('✅ Задача создана!')
		} catch (error) {
			console.error('❌ Ошибка:', error)
			alert('Не удалось создать задачу: ' + error.message)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='bg-gray-800 rounded-xl p-4 border border-gray-700'
		>
			<div className='flex flex-col sm:flex-row gap-3'>
				<input
					type='text'
					value={title}
					onChange={e => setTitle(e.target.value)}
					placeholder='Новая задача...'
					className='flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
				/>

				<div className='w-[160px] flex-shrink-0'>
					<DatePicker value={deadline} onChange={setDeadline} />
				</div>

				<select
					value={projectId}
					onChange={e => setProjectId(e.target.value)}
					className='bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm max-w-[200px]'
				>
					{Object.values(projects).map(p => (
						<option key={p.id} value={p.id}>
							{p.icon} {p.name}
						</option>
					))}
				</select>

				<button
					type='submit'
					className='bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-bold transition text-sm whitespace-nowrap'
				>
					+ Создать
				</button>
			</div>
		</form>
	)
}
