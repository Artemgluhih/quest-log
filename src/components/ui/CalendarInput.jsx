import { useState, useEffect, useRef } from 'react'

export default function CalendarInput({ value, onChange, label }) {
	const [isOpen, setIsOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState(() =>
		value ? new Date(value) : new Date(),
	)
	const wrapperRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = e => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const formatDate = dateStr => {
		if (!dateStr) return 'Выберите дату'
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
	}

	const getDaysInMonth = date => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const firstDay = new Date(year, month, 1).getDay()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const days = []
		const startOffset = firstDay === 0 ? 6 : firstDay - 1
		for (let i = 0; i < startOffset; i++) days.push(null)
		for (let i = 1; i <= daysInMonth; i++) days.push(i)
		return days
	}

	const handleDateClick = day => {
		if (!day) return
		const year = currentMonth.getFullYear()
		const month = String(currentMonth.getMonth() + 1).padStart(2, '0')
		const dayStr = String(day).padStart(2, '0')
		onChange(`${year}-${month}-${dayStr}`)
		setIsOpen(false)
	}

	const isSelected = day => {
		if (!value || !day) return false
		return (
			value ===
			`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
		)
	}

	const days = getDaysInMonth(currentMonth)
	const monthName = currentMonth.toLocaleString('ru-RU', {
		month: 'long',
		year: 'numeric',
	})

	return (
		<div className='relative' ref={wrapperRef}>
			{label && (
				<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
					{label}
				</label>
			)}

			<button
				type='button' // ← ВАЖНО: предотвращает отправку формы
				onClick={e => {
					e.preventDefault()
					e.stopPropagation()
					setIsOpen(!isOpen)
				}}
				className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-between hover:bg-gray-600 transition'
			>
				<span>{formatDate(value)}</span>
				<span className='text-gray-400'>📅</span>
			</button>

			{isOpen && (
				<div className='absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 w-72'>
					<div className='flex justify-between items-center mb-4'>
						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								setCurrentMonth(
									new Date(
										currentMonth.getFullYear(),
										currentMonth.getMonth() - 1,
										1,
									),
								)
							}}
							className='p-1 hover:bg-gray-700 rounded transition text-gray-400 hover:text-white'
						>
							◀
						</button>
						<span className='font-bold capitalize text-white'>{monthName}</span>
						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								setCurrentMonth(
									new Date(
										currentMonth.getFullYear(),
										currentMonth.getMonth() + 1,
										1,
									),
								)
							}}
							className='p-1 hover:bg-gray-700 rounded transition text-gray-400 hover:text-white'
						>
							▶
						</button>
					</div>

					<div className='grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2 font-medium'>
						{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
							<div key={d}>{d}</div>
						))}
					</div>

					<div className='grid grid-cols-7 gap-1'>
						{days.map((day, i) => (
							<button
								key={i}
								type='button'
								onClick={e => {
									e.preventDefault()
									handleDateClick(day)
								}}
								className={`w-8 h-8 rounded-full flex items-center justify-center transition text-sm font-medium
                  ${!day ? 'invisible' : 'hover:bg-gray-700 text-gray-300'}
                  ${isSelected(day) ? 'bg-blue-600 text-white font-bold hover:bg-blue-500' : ''}
                `}
							>
								{day}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
