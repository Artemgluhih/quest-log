import { useState } from 'react'
import { PROJECT_STYLES, PRIORITY_CONFIG } from '../data/projects'

export default function ProjectManager({ projects, onAdd, onDelete, onClose }) {
	const [name, setName] = useState('')
	const [multiplier, setMultiplier] = useState(1.0)
	const [priority, setPriority] = useState('medium')
	const [styleIndex, setStyleIndex] = useState(0)

	const handleAdd = () => {
		if (!name.trim()) return
		const style = PROJECT_STYLES[styleIndex]
		const id = 'proj_' + Date.now()

		onAdd({
			id,
			name: name.trim(),
			priority,
			xpMultiplier: parseFloat(multiplier),
			color: style.color,
			textColor: style.textColor,
			icon: style.icon,
		})
		setName('')
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 rounded-xl w-full max-w-md overflow-hidden'>
				<div className='p-4 border-b border-gray-700 flex justify-between items-center'>
					<h2 className='text-lg font-bold text-white'>
						⚙️ Управление проектами
					</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						✕
					</button>
				</div>

				<div className='p-4 space-y-4'>
					{/* Список текущих */}
					<div className='space-y-2 max-h-48 overflow-y-auto'>
						{Object.values(projects).map(p => (
							<div
								key={p.id}
								className='flex items-center justify-between bg-gray-700 p-2 rounded'
							>
								<div className='flex items-center gap-2'>
									<span>{p.icon}</span>
									<span className='text-sm text-white'>{p.name}</span>
									<span className='text-xs text-gray-400'>
										(x{p.xpMultiplier})
									</span>
								</div>
								<button
									onClick={() => onDelete(p.id)}
									className='text-red-400 hover:text-red-300 text-xs'
									disabled={Object.keys(projects).length <= 1}
								>
									🗑️
								</button>
							</div>
						))}
					</div>

					{/* Форма добавления */}
					<div className='border-t border-gray-700 pt-4 space-y-3'>
						<h3 className='text-sm font-semibold text-gray-400'>
							Добавить новый
						</h3>
						<input
							type='text'
							placeholder='Название проекта'
							value={name}
							onChange={e => setName(e.target.value)}
							className='w-full bg-gray-700 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm'
						/>
						<div className='flex gap-2'>
							<select
								value={priority}
								onChange={e => setPriority(e.target.value)}
								className='flex-1 bg-gray-700 text-white px-2 py-2 rounded text-sm'
							>
								{Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
									<option key={key} value={key}>
										{val.label}
									</option>
								))}
							</select>
							<input
								type='number'
								step='0.1'
								min='0.1'
								max='3'
								value={multiplier}
								onChange={e => setMultiplier(e.target.value)}
								className='w-20 bg-gray-700 text-white px-2 py-2 rounded text-sm'
							/>
							<select
								value={styleIndex}
								onChange={e => setStyleIndex(Number(e.target.value))}
								className='flex-1 bg-gray-700 text-white px-2 py-2 rounded text-sm'
							>
								{PROJECT_STYLES.map((s, i) => (
									<option key={i} value={i}>
										{s.icon} {s.color.replace('bg-', '')}
									</option>
								))}
							</select>
						</div>
						<button
							onClick={handleAdd}
							className='w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold transition'
						>
							➕ Создать проект
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
