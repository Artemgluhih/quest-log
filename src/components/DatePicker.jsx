import { useState, useRef, useEffect } from 'react'

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
const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

const getCalendarDays = (year, month) => {
	const firstDay = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)
	let startDay = firstDay.getDay() - 1
	if (startDay === -1) startDay = 6

	const days = []
	const prevLast = new Date(year, month, 0).getDate()

	for (let i = startDay - 1; i >= 0; i--) {
		days.push({ date: prevLast - i, current: false })
	}
	for (let d = 1; d <= lastDay.getDate(); d++) {
		days.push({ date: d, current: true })
	}

	const nextDays = 42 - days.length
	for (let d = 1; d <= nextDays; d++) {
		days.push({ date: d, current: false })
	}

	return days
}

const formatDateRu = isoString => {
	if (!isoString) return null
	const d = new Date(isoString)
	const day = d.getDate()
	const month = d.getMonth()
	const monthNames = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря',
	]
	return `${day} ${monthNames[month]}`
}

export default function DatePicker({ value, onChange }) {
	const [open, setOpen] = useState(false)
	const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
	const ref = useRef(null)

	const today = new Date()
	const year = viewDate.getFullYear()
	const month = viewDate.getMonth()
	const days = getCalendarDays(year, month)

	useEffect(() => {
		const handler = e => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const selectedDate = value ? new Date(value) : null
	const isToday = d =>
		d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear()
	const isSelected = d =>
		selectedDate &&
		d.getDate() === selectedDate.getDate() &&
		d.getMonth() === selectedDate.getMonth() &&
		d.getFullYear() === selectedDate.getFullYear()

	const handleDayClick = dayObj => {
		if (!dayObj.current) return
		const newDate = new Date(year, month, dayObj.date)
		if (selectedDate) {
			newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes())
		}
		onChange(newDate.toISOString())
		// НЕ закрываем календарь сразу, чтобы форма не отправлялась
		// setOpen(false)
	}

	const handleClear = e => {
		e.stopPropagation()
		e.preventDefault()
		onChange(null)
		setOpen(false)
	}

	return (
		<div className='relative w-full' ref={ref}>
			<button
				type='button'
				onClick={e => {
					e.preventDefault()
					e.stopPropagation()
					setOpen(!open)
				}}
				className='w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm transition flex items-center justify-between'
			>
				<span className={value ? 'text-white' : 'text-gray-500'}>
					{value ? formatDateRu(value) : 'Выбрать дату...'}
				</span>
				<span className='text-gray-500 ml-2'>📅</span>
			</button>

			{open && (
				<div className='absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 p-4 min-w-[280px]'>
					<div className='flex items-center justify-between mb-4'>
						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								e.stopPropagation()
								setViewDate(new Date(year, month - 1, 1))
							}}
							className='text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition'
						>
							◀
						</button>
						<span className='text-white font-bold text-sm'>
							{MONTHS[month]} {year}
						</span>
						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								e.stopPropagation()
								setViewDate(new Date(year, month + 1, 1))
							}}
							className='text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition'
						>
							▶
						</button>
					</div>

					<div className='grid grid-cols-7 mb-2'>
						{WEEKDAYS.map((wd, i) => (
							<div
								key={wd}
								className={`text-center text-[10px] font-bold uppercase py-1 ${i >= 5 ? 'text-red-400' : 'text-gray-500'}`}
							>
								{wd}
							</div>
						))}
					</div>

					<div className='grid grid-cols-7 gap-1 mb-3'>
						{days.map((dayObj, idx) => {
							const d = new Date(
								year,
								month + (dayObj.current ? 0 : dayObj.date > 15 ? -1 : 1),
								dayObj.date,
							)
							const todayFlag = isToday(d)
							const selectedFlag = isSelected(d)
							const isWeekend = idx % 7 >= 5

							return (
								<button
									key={idx}
									type='button'
									onClick={e => {
										e.preventDefault()
										e.stopPropagation()
										handleDayClick(dayObj)
									}}
									disabled={!dayObj.current}
									className={`aspect-square rounded-lg text-xs flex items-center justify-center transition relative ${
										!dayObj.current
											? 'text-gray-700 cursor-default'
											: selectedFlag
												? 'bg-gray-600 text-white font-bold'
												: todayFlag
													? 'bg-blue-600 text-white font-bold'
													: isWeekend
														? 'text-red-300 hover:bg-gray-700'
														: 'text-gray-300 hover:bg-gray-700'
									}`}
								>
									{dayObj.date}
									{todayFlag && !selectedFlag && (
										<span className='absolute bottom-0.5 w-1 h-1 bg-red-400 rounded-full'></span>
									)}
								</button>
							)
						})}
					</div>

					<div className='flex items-center justify-between pt-3 border-t border-gray-700'>
						<span className='text-xs text-gray-500'>Время</span>
						<button
							type='button'
							onClick={handleClear}
							className='text-xs text-gray-400 hover:text-white transition'
						>
							Очистить всё
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
