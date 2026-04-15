import { useState, useMemo, useEffect, useRef } from 'react'
import { useFinanceData } from '../hooks/useFinanceData'
import TransactionItem from '../ui/TransactionItem'
import StatCard from '../ui/StatCard'

const CATEGORIES = [
	'Еда',
	'Транспорт',
	'Жилье',
	'Подписки',
	'Развлечения',
	'Здоровье',
	'Одежда',
	'Зарплата',
	'Фриланс',
	'Инвестиции',
	'Другое',
]

// 🔹 ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: генерация списка месяцев
const generateMonthOptions = () => {
	const months = []
	const now = new Date()

	// Начинаем с января 2026
	const startYear = 2026
	const startMonth = 0 // Январь (0 = январь)

	// Генерируем месяцы с января 2026 до текущего месяца
	for (let year = startYear; year <= now.getFullYear(); year++) {
		const firstMonth = year === startYear ? startMonth : 0
		const lastMonth = year === now.getFullYear() ? now.getMonth() : 11

		for (let month = firstMonth; month <= lastMonth; month++) {
			const date = new Date(year, month, 1)
			const value = `${year}-${String(month + 1).padStart(2, '0')}`
			const label = date.toLocaleString('ru-RU', {
				month: 'long',
				year: 'numeric',
			})
			months.push({ value, label, date })
		}
	}

	return months.reverse() // Новые месяцы сверху
}

export default function TransactionsTab({ onAdd, onDelete }) {
	const { transactions } = useFinanceData()

	// Состояния периода
	const [period, setPeriod] = useState('month')
	const [selectedMonth, setSelectedMonth] = useState(() => {
		// По умолчанию текущий месяц
		const now = new Date()
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
	})
	const [rangeStart, setRangeStart] = useState(null)
	const [rangeEnd, setRangeEnd] = useState(null)

	const [filterType, setFilterType] = useState('all')
	const [search, setSearch] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')

	// 🔹 ОПРЕДЕЛЯЕМ ДИАПАЗОН ДАТ ПО ПЕРИОДУ
	const getDateRange = periodType => {
		const now = new Date()
		const start = new Date()

		switch (periodType) {
			case 'week':
				const dayOfWeek = now.getDay()
				const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
				start.setDate(now.getDate() - diff)
				start.setHours(0, 0, 0, 0)
				break
			case 'month':
				start.setDate(1)
				start.setHours(0, 0, 0, 0)
				break
			case 'byMonth':
				if (!selectedMonth) return { start: null, end: null }
				const [year, month] = selectedMonth.split('-').map(Number)
				const monthStart = new Date(year, month - 1, 1)
				const monthEnd = new Date(year, month, 0, 23, 59, 59)
				return { start: monthStart, end: monthEnd }
			case 'year':
				start.setMonth(0, 1)
				start.setHours(0, 0, 0, 0)
				break
			case 'custom':
				if (!rangeStart || !rangeEnd) return { start: null, end: null }
				return {
					start: new Date(rangeStart),
					end: new Date(rangeEnd + 'T23:59:59'),
				}
			case 'all':
			default:
				start.setFullYear(2000, 0, 1)
				start.setHours(0, 0, 0, 0)
				break
		}
		return { start, end: now }
	}
	// 🔹 ФИЛЬТРАЦИЯ И ПОДСЧЁТ
	const { filteredTx, totals, periodLabel } = useMemo(() => {
		const { start, end } = getDateRange(period)

		const rangeCheck = txDate => {
			if ((period === 'custom' || period === 'byMonth') && (!start || !end))
				return true
			return txDate >= start && txDate <= end
		}

		let result = transactions.filter(t => {
			const txDate = new Date(t.date)
			return rangeCheck(txDate)
		})

		if (filterType !== 'all') result = result.filter(t => t.type === filterType)
		if (selectedCategory !== 'all')
			result = result.filter(t => t.category === selectedCategory)
		if (search)
			result = result.filter(
				t =>
					t.description?.toLowerCase().includes(search.toLowerCase()) ||
					t.category?.toLowerCase().includes(search.toLowerCase()),
			)

		const income = result
			.filter(t => t.type === 'income')
			.reduce((s, t) => s + t.amount, 0)
		const expense = result
			.filter(t => t.type === 'expense')
			.reduce((s, t) => s + t.amount, 0)
		const balance = income - expense

		// Подпись периода для отображения
		let label = ''
		if (period === 'byMonth' && selectedMonth) {
			const [y, m] = selectedMonth.split('-')
			label = new Date(y, m - 1).toLocaleString('ru-RU', {
				month: 'long',
				year: 'numeric',
			})
		} else if (period === 'week') label = 'Текущая неделя'
		else if (period === 'month') label = 'Текущий месяц'
		else if (period === 'year') label = 'Текущий год'
		else if (period === 'custom') label = 'Выбранный период'
		else label = 'Все время'

		// Группировка по дате
		const grouped = result.reduce((acc, tx) => {
			const dateKey = new Date(tx.date).toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			})
			if (!acc[dateKey]) acc[dateKey] = []
			acc[dateKey].push(tx)
			return acc
		}, {})

		const sortedGrouped = Object.keys(grouped)
			.sort((a, b) => new Date(b) - new Date(a))
			.reduce((obj, key) => {
				obj[key] = grouped[key]
				return obj
			}, {})

		return {
			filteredTx: sortedGrouped,
			totals: { income, expense, balance },
			periodLabel: label,
		}
	}, [
		transactions,
		period,
		selectedMonth,
		rangeStart,
		rangeEnd,
		filterType,
		selectedCategory,
		search,
	])

	const monthOptions = useMemo(() => generateMonthOptions(), [])

	return (
		<div className='w-full space-y-6 max-w-5xl mx-auto'>
			{/* 🔹 СТАТИСТИКА С ПОДПИСЬЮ ПЕРИОДА */}
			<div className='flex items-center justify-between'>
				<div className='text-sm text-gray-400'>
					Период: <span className='text-white font-medium'>{periodLabel}</span>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<StatCard
					label='Доходы'
					value={`+${totals.income.toLocaleString()} ₽`}
					color='text-green-400'
					icon='📥'
				/>
				<StatCard
					label='Расходы'
					value={`-${totals.expense.toLocaleString()} ₽`}
					color='text-red-400'
					icon='📤'
				/>
				<StatCard
					label='Баланс'
					value={`${totals.balance >= 0 ? '+' : ''}${totals.balance.toLocaleString()} ₽`}
					color={totals.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}
					icon='⚖️'
				/>
			</div>

			{/* 🔹 ПАНЕЛЬ УПРАВЛЕНИЯ */}
			<div className='bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4'>
				<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
					<div className='flex flex-col w-full md:w-auto gap-3'>
						{/* Кнопки переключения периода */}
						<div className='flex flex-wrap bg-gray-700 rounded-lg p-1 gap-1'>
							{[
								{ id: 'week', label: 'Неделя' },
								{ id: 'month', label: 'Месяц' },
								{ id: 'byMonth', label: '📅 По месяцам' },
								{ id: 'year', label: 'Год' },
								{ id: 'custom', label: 'Свой' },
								{ id: 'all', label: 'Всё' },
							].map(p => (
								<button
									key={p.id}
									onClick={() => setPeriod(p.id)}
									className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
										period === p.id
											? 'bg-blue-600 text-white shadow-sm'
											: 'text-gray-400 hover:text-white'
									}`}
								>
									{p.label}
								</button>
							))}
						</div>

						{/* 🔹 СЕЛЕКТОР МЕСЯЦА (показывается только в режиме "По месяцам") */}
						{period === 'byMonth' && (
							<div className='flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg border border-gray-600 animate-in fade-in'>
								<span className='text-xs text-gray-400 font-medium'>
									Выберите месяц:
								</span>
								<select
									value={selectedMonth}
									onChange={e => setSelectedMonth(e.target.value)}
									className='bg-gray-800 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none cursor-pointer'
								>
									{monthOptions.map(opt => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						)}

						{/* 🔹 КАЛЕНДАРЬ ВЫБОРА ДИАПАЗОНА (для режима "Свой") */}
						{period === 'custom' && (
							<div className='relative'>
								<DateRangePicker
									start={rangeStart}
									end={rangeEnd}
									onChange={(start, end) => {
										setRangeStart(start)
										setRangeEnd(end)
									}}
								/>
							</div>
						)}
					</div>

					{/* Поиск и фильтры */}
					<div className='flex flex-1 gap-3 w-full md:w-auto'>
						<input
							type='text'
							placeholder='🔍 Поиск...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className='flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500'
						/>
						<select
							value={selectedCategory}
							onChange={e => setSelectedCategory(e.target.value)}
							className='bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
						>
							<option value='all'>Все категории</option>
							{CATEGORIES.map(c => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
						<button
							onClick={onAdd}
							className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap'
						>
							➕ Добавить
						</button>
					</div>
				</div>

				{/* Фильтр по типу */}
				<div className='flex gap-2'>
					{[
						{ id: 'all', label: 'Все' },
						{ id: 'income', label: '🟢 Доходы' },
						{ id: 'expense', label: '🔴 Расходы' },
					].map(btn => (
						<button
							key={btn.id}
							onClick={() => setFilterType(btn.id)}
							className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
								filterType === btn.id
									? 'bg-gray-600 text-white'
									: 'bg-gray-700/50 text-gray-400 hover:text-white'
							}`}
						>
							{btn.label}
						</button>
					))}
				</div>
			</div>

			{/* 🔹 СПИСОК ТРАНЗАКЦИЙ */}
			<div className='space-y-6'>
				{Object.keys(filteredTx).length === 0 ? (
					<div className='text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed'>
						<div className='text-4xl mb-3'>📭</div>
						<p>Транзакций за выбранный период не найдено</p>
						<button
							onClick={onAdd}
							className='mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium'
						>
							+ Добавить первую
						</button>
					</div>
				) : (
					Object.entries(filteredTx).map(([date, txs]) => (
						<div key={date}>
							<div className='text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 px-1'>
								{date}
							</div>
							<div className='bg-gray-800 border border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-700/50'>
								{txs.map(tx => (
									<TransactionItem
										key={tx.id}
										tx={tx}
										onDelete={() => onDelete(tx.id)}
									/>
								))}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

// 🔹 КОМПОНЕНТ ВЫБОРА ДИАПАЗОНА ДАТ (без изменений)
function DateRangePicker({ start, end, onChange }) {
	const [isOpen, setIsOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const wrapperRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = event => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const getDaysInMonth = date => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const firstDay = new Date(year, month, 1).getDay()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const days = []
		const startDay = firstDay === 0 ? 6 : firstDay - 1
		for (let i = 0; i < startDay; i++) days.push(null)
		for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))
		return days
	}

	const handleDateClick = date => {
		if (!date) return
		const dateStr = date.toISOString().split('T')[0]
		if (!start || (start && end)) {
			onChange(dateStr, null)
		} else {
			if (dateStr < start) onChange(dateStr, start)
			else onChange(start, dateStr)
			setIsOpen(false)
		}
	}

	const isInRange = date => {
		if (!date || !start || !end) return false
		const d = date.toISOString().split('T')[0]
		return d >= start && d <= end
	}

	const days = getDaysInMonth(currentMonth)
	const monthName = currentMonth.toLocaleString('ru-RU', {
		month: 'long',
		year: 'numeric',
	})

	return (
		<div className='relative' ref={wrapperRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 bg-gray-700/50 text-white px-3 py-1.5 rounded-lg text-sm border border-gray-600 hover:bg-gray-700 transition w-full justify-between'
			>
				<span className='font-medium'>
					{start && end
						? `${new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
						: start
							? `${new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ...`
							: 'Выберите даты'}
				</span>
				<span className='text-gray-400'>📅</span>
			</button>

			{isOpen && (
				<div className='absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 w-72'>
					<div className='flex justify-between items-center mb-4'>
						<button
							onClick={() =>
								setCurrentMonth(
									new Date(
										currentMonth.getFullYear(),
										currentMonth.getMonth() - 1,
									),
								)
							}
							className='p-1 hover:bg-gray-700 rounded'
						>
							◀
						</button>
						<span className='font-bold capitalize'>{monthName}</span>
						<button
							onClick={() =>
								setCurrentMonth(
									new Date(
										currentMonth.getFullYear(),
										currentMonth.getMonth() + 1,
									),
								)
							}
							className='p-1 hover:bg-gray-700 rounded'
						>
							▶
						</button>
					</div>
					<div className='grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2'>
						{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
							<div key={d}>{d}</div>
						))}
					</div>
					<div className='grid grid-cols-7 gap-1'>
						{days.map((date, i) => {
							if (!date) return <div key={i}></div>
							const dStr = date.toISOString().split('T')[0]
							const isSelStart = start === dStr
							const isSelEnd = end === dStr
							const inRange = isInRange(date)
							let bgClass = 'hover:bg-gray-700'
							if (isSelStart || isSelEnd)
								bgClass = 'bg-blue-600 text-white font-bold hover:bg-blue-500'
							else if (inRange) bgClass = 'bg-blue-600/30 text-white'
							return (
								<button
									key={i}
									onClick={() => handleDateClick(date)}
									className={`w-8 h-8 rounded-full flex items-center justify-center transition ${bgClass}`}
								>
									{date.getDate()}
								</button>
							)
						})}
					</div>
					{(start || end) && (
						<div className='mt-3 text-xs text-center text-gray-400 border-t border-gray-700 pt-2'>
							{start && end ? 'Период выбран' : 'Выберите вторую дату'}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
