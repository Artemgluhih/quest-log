import { PRIORITY_CONFIG } from '../data/projects'

export default function TaskRow({
	task,
	project,
	onToggle,
	onDelete,
	onClick,
}) {
	if (!project) return null
	const pc = PRIORITY_CONFIG[task.priority]
	return (
		<tr
			onClick={() => onClick(task)}
			className={`hover:bg-gray-700 transition cursor-pointer ${task.completed ? 'opacity-50' : ''}`}
		>
			<td className='px-4 py-3'>
				<div className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={task.completed}
						onChange={e => {
							e.stopPropagation()
							onToggle(task.id)
						}}
						className='w-4 h-4 rounded accent-blue-500'
					/>
					<span className={task.completed ? 'line-through text-gray-500' : ''}>
						{task.title}
					</span>
				</div>
			</td>
			<td className='px-4 py-3'>
				<span
					className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${project.color} bg-opacity-20`}
				>
					{project.icon} {project.name}
				</span>
			</td>
			<td className='px-4 py-3'>
				<div className='flex items-center gap-2'>
					<span className={`w-2 h-2 rounded-full ${pc.dot}`} />
					<span className={pc.color}>{pc.label}</span>
				</div>
			</td>
			<td className='px-4 py-3 text-gray-400'>
				{'⭐'.repeat(task.difficulty)}
			</td>
			<td className='px-4 py-3 text-yellow-400 font-semibold'>+{task.xp} XP</td>
			<td className='px-4 py-3'>
				<span
					className={`px-2 py-1 rounded text-xs ${task.completed ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
				>
					{task.completed ? '✓ Готово' : '○ В работе'}
				</span>
			</td>
			<td className='px-4 py-3 text-right'>
				<button
					onClick={e => {
						e.stopPropagation()
						onDelete(task.id)
					}}
					className='text-red-400 hover:text-red-300'
				>
					🗑️
				</button>
			</td>
		</tr>
	)
}
