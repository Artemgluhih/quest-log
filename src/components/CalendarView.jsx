import { useState, useMemo } from 'react'

const MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const getMonthMatrix = (year, month) => {
	const firstDay = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)

	let startDay = firstDay.getDay() - 1
	if (startDay === -1) startDay = 6

	const days = []

	const prevMonthLastDay = new Date(year, month, 0).getDate()
	for (let i = startDay - 1; i >= 0; i--) {
		days.push({
			date: prevMonthLastDay - i,
			isCurrentMonth: false,
			isPrev: true,
			monthOffset: -1,
		})
	}

	for (let d = 1; d <= lastDay.getDate(); d++) {
		days.push({
			date: d,
			isCurrentMonth: true,
			isPrev: false,
			monthOffset: 0,
		})
	}

	const nextMonthDays = 42 - days.length
	for (let d = 1; d <= nextMonthDays; d++) {
		days.push({
			date: d,
			isCurrentMonth: false,
			isPrev: false,
			monthOffset: 1,
		})
	}

	return days
}

const isSameDate = (date1, date2) => {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	)
}

export default function CalendarView({
	tasks,
	projects,
	onClick,
	onAddTask,
	activeProjectId,
}) {
	const today = new Date()
	const [currentDate, setCurrentDate] = useState(
		new Date(today.getFullYear(), today.getMonth(), 1),
	)
	const [showQuickAdd, setShowQuickAdd] = useState(false)
	const [selectedDate, setSelectedDate] = useState(null)
	const [quickTaskTitle, setQuickTaskTitle] = useState('')
	const [quickTaskPriority, setQuickTaskPriority] = useState('medium')
	const [quickTaskProjectId, setQuickTaskProjectId] = useState(
		activeProjectId || Object.keys(projects)[0],
	)

	const year = currentDate.getFullYear()
	const month = currentDate.getMonth()
	const days = useMemo(() => getMonthMatrix(year, month), [year, month])

	const goPrev = () => setCurrentDate(new Date(year, month - 1, 1))
	const goNext = () => setCurrentDate(new Date(year, month + 1, 1))
	const goToday = () =>
		setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

	const handleDayClick = dayObj => {
		if (!dayObj.isCurrentMonth) return

		const clickedDate = new Date(year, month + dayObj.monthOffset, dayObj.date)
		clickedDate.setHours(0, 0, 0, 0)

		setSelectedDate(clickedDate)
		setQuickTaskProjectId(activeProjectId || Object.keys(projects)[0])
		setShowQuickAdd(true)
		setQuickTaskTitle('')
	}

	const handleQuickAdd = () => {
		if (!quickTaskTitle.trim() || !selectedDate) return

		const deadline = new Date(selectedDate)
		deadline.setHours(23, 59, 59, 999)

		onAddTask({
			title: quickTaskTitle,
			projectId: quickTaskProjectId,
			deadline: deadline.toISOString(),
			priority: quickTaskPriority,
			description: '',
		})

		setShowQuickAdd(false)
		setQuickTaskTitle('')
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			handleQuickAdd()
		}
	}

	const getTasksForDay = dayObj => {
		const cellDate = new Date(
			year,
			month + (dayObj.monthOffset || 0),
			dayObj.date,
		)
		cellDate.setHours(0, 0, 0, 0)

		return tasks.filter(task => {
			if (!task.deadline) return false

			const taskDate = new Date(task.deadline)
			taskDate.setHours(0, 0, 0, 0)

			return isSameDate(cellDate, taskDate)
		})
	}

	return (
		<div className='flex flex-col h-full bg-gray-900 text-gray-100 overflow-hidden'>
			<div className='flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800'>
				<div className='flex items-center gap-4'>
					<h2 className='text-xl sm:text-2xl font-bold text-white'>
						{MONTHS[month]} {year}
					</h2>
					<button
						onClick={goToday}
						className='px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition hidden sm:block'
					>
						Сегодня
					</button>
				</div>
				<div className='flex gap-2'>
					<button
						onClick={goPrev}
						className='p-2 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white'
					>
						◀
					</button>
					<button
						onClick={goNext}
						className='p-2 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white'
					>
						▶
					</button>
				</div>
			</div>

			<div className='flex-1 p-2 sm:p-3 overflow-hidden flex flex-col'>
				<div className='flex-shrink-0 grid grid-cols-7 mb-2 px-1 hidden sm:grid'>
					{WEEKDAYS.map((day, i) => (
						<div
							key={i}
							className={`text-center text-xs font-bold uppercase py-2 ${
								i >= 5 ? 'text-red-400' : 'text-gray-500'
							}`}
						>
							{day}
						</div>
					))}
				</div>

				<div className='flex-shrink-0 grid grid-cols-7 mb-2 px-1 sm:hidden'>
					{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
						<div
							key={i}
							className={`text-center text-[10px] font-bold py-1 ${
								i >= 5 ? 'text-red-400' : 'text-gray-500'
							}`}
						>
							{day}
						</div>
					))}
				</div>

				<div className='flex-1 grid grid-cols-7 grid-rows-6 gap-1 sm:gap-2 min-h-0'>
					{days.map((dayObj, idx) => {
						const dayTasks = getTasksForDay(dayObj)
						const cellDate = new Date(
							year,
							month + (dayObj.monthOffset || 0),
							dayObj.date,
						)
						const isToday = dayObj.isCurrentMonth && isSameDate(cellDate, today)
						const isWeekend = idx % 7 >= 5

						return (
							<div
								key={idx}
								onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj)}
								className={`relative border rounded-lg sm:rounded-xl p-1 sm:p-2 flex flex-col cursor-pointer transition-all ${
									dayObj.isCurrentMonth
										? isWeekend
											? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50'
											: 'bg-gray-800 border-gray-700 hover:border-blue-500'
										: 'bg-gray-900/30 border-gray-800 text-gray-600 opacity-60'
								} ${isToday ? 'ring-1 sm:ring-2 ring-blue-500' : ''}`}
							>
								<div
									className={`text-xs sm:text-sm font-bold mb-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
										isToday
											? 'bg-blue-500 text-white'
											: isWeekend && dayObj.isCurrentMonth
												? 'text-red-400'
												: 'text-gray-400'
									}`}
								>
									{dayObj.date}
								</div>

								<div className='flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto custom-scrollbar min-h-0'>
									{dayTasks.map(task => {
										const proj = projects[task.projectId] || {}
										return (
											<div
												key={task.id}
												onClick={e => {
													e.stopPropagation()
													onClick(task)
												}}
												className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer hover:brightness-125 transition border-l-2 ${
													task.completed
														? 'opacity-40 line-through bg-gray-700 border-gray-500'
														: `bg-gray-700 border-${proj.color?.split('-')[1] || 'blue'}-500 hover:bg-gray-600`
												}`}
												title={task.title}
											>
												<div className='font-medium truncate'>{task.title}</div>
												<div className='text-[8px] sm:text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 hidden sm:flex'>
													<span>{proj.icon}</span>
													<span className='truncate'>{proj.name}</span>
												</div>
											</div>
										)
									})}
								</div>

								{dayObj.isCurrentMonth && (
									<div className='absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 hover:opacity-100 transition hidden sm:block'>
										<span className='text-blue-400 text-lg font-bold'>+</span>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>

			{showQuickAdd && (
				<div
					className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'
					onClick={() => setShowQuickAdd(false)}
				>
					<div
						className='bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700 shadow-2xl'
						onClick={e => e.stopPropagation()}
					>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='text-lg sm:text-xl font-bold text-white'>
								📅{' '}
								{selectedDate?.toLocaleDateString('ru-RU', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}
							</h3>
							<button
								onClick={() => setShowQuickAdd(false)}
								className='text-gray-400 hover:text-white text-xl'
							>
								✕
							</button>
						</div>

						<div className='space-y-4'>
							<div>
								<label className='block text-xs text-gray-400 uppercase font-bold mb-2'>
									Название задачи
								</label>
								<input
									type='text'
									value={quickTaskTitle}
									onChange={e => setQuickTaskTitle(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder='Что нужно сделать?'
									autoFocus
									className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
								/>
							</div>

							<div>
								<label className='block text-xs text-gray-400 uppercase font-bold mb-2'>
									Проект
								</label>
								<select
									value={quickTaskProjectId}
									onChange={e => setQuickTaskProjectId(e.target.value)}
									className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
								>
									{Object.values(projects).map(p => (
										<option key={p.id} value={p.id}>
											{p.icon} {p.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-xs text-gray-400 uppercase font-bold mb-2'>
									Приоритет
								</label>
								<div className='flex gap-2'>
									{Object.entries({
										high: '🔴 Высокий',
										medium: '🟡 Средний',
										low: '🟢 Низкий',
									}).map(([key, label]) => (
										<button
											key={key}
											onClick={() => setQuickTaskPriority(key)}
											className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
												quickTaskPriority === key
													? key === 'high'
														? 'bg-red-600 text-white'
														: key === 'medium'
															? 'bg-yellow-600 text-white'
															: 'bg-green-600 text-white'
													: 'bg-gray-700 text-gray-400 hover:bg-gray-600'
											}`}
										>
											{label}
										</button>
									))}
								</div>
							</div>

							<div className='flex gap-2 pt-2'>
								<button
									onClick={() => setShowQuickAdd(false)}
									className='flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition text-sm'
								>
									Отмена
								</button>
								<button
									onClick={handleQuickAdd}
									className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition text-sm'
								>
									+ Создать
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
