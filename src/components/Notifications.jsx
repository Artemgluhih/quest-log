import { useState, useRef, useEffect } from 'react'

export default function NotificationBell({ tasks, onSelect }) {
	const [isOpen, setIsOpen] = useState(false)
	const ref = useRef(null)

	// Закрытие при клике вне меню
	useEffect(() => {
		const handleClickOutside = event => {
			if (ref.current && !ref.current.contains(event.target)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const now = new Date()
	// Фильтруем только активные задачи с дедлайном
	const activeWithDeadline = tasks.filter(t => !t.completed && t.deadline)

	const notifications = activeWithDeadline
		.map(task => {
			const deadline = new Date(task.deadline)
			const diffMs = deadline - now
			const diffHours = diffMs / (1000 * 60 * 60)

			let type = 'normal'
			let text = ''

			if (diffHours < 0) {
				type = 'overdue'
				text = `Просрочено на ${Math.abs(Math.floor(diffHours))} ч.`
			} else if (diffHours < 24) {
				type = 'urgent'
				text = 'Сегодня!'
			} else if (diffHours < 48) {
				type = 'soon'
				text = 'Завтра'
			}

			return { ...task, type, text }
		})
		.filter(n => n.type !== 'normal') // Оставляем только срочные и просроченные

	const overdueCount = notifications.filter(n => n.type === 'overdue').length
	const totalCount = notifications.length

	return (
		<div className='relative' ref={ref}>
			{/* Колокольчик */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='relative p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-700'
			>
				<span className='text-xl'>🔔</span>
				{totalCount > 0 && (
					<span
						className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
							overdueCount > 0
								? 'bg-red-500 text-white'
								: 'bg-yellow-500 text-black'
						}`}
					>
						{totalCount}
					</span>
				)}
			</button>

			{/* Выпадающее меню */}
			{isOpen && (
				<div className='absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50'>
					<div className='p-3 border-b border-gray-700 bg-gray-800'>
						<h3 className='font-bold text-white text-sm'>Уведомления</h3>
					</div>

					<div className='max-h-64 overflow-y-auto custom-scrollbar'>
						{notifications.length === 0 ? (
							<div className='p-4 text-center text-gray-500 text-sm'>
								🎉 Все задачи в срок!
							</div>
						) : (
							notifications.map(notif => (
								<div
									key={notif.id}
									onClick={() => {
										onSelect(notif)
										setIsOpen(false)
									}}
									className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition flex justify-between items-center ${
										notif.type === 'overdue' ? 'bg-red-900/10' : ''
									}`}
								>
									<div className='flex-1 min-w-0'>
										<div className='text-sm text-gray-200 truncate font-medium'>
											{notif.title}
										</div>
										<div
											className={`text-xs mt-1 ${
												notif.type === 'overdue'
													? 'text-red-400'
													: notif.type === 'urgent'
														? 'text-yellow-400'
														: 'text-blue-400'
											}`}
										>
											{notif.text} •{' '}
											{new Date(notif.deadline).toLocaleDateString('ru-RU', {
												day: 'numeric',
												month: 'short',
											})}
										</div>
									</div>
									<span className='text-gray-500 ml-2'>›</span>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}
