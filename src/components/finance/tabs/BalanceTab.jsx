import { useFinanceData } from '../hooks/useFinanceData'
import StatCard from '../ui/StatCard'

export default function BalanceTab() {
	const { totals, categories, transactions } = useFinanceData()

	// 🔥 РАСЧЁТ ИЗМЕНЕНИЯ ПО СРАВНЕНИЮ С ПРОШЛЫМ МЕСЯЦЕМ
	const calculateChange = () => {
		const now = new Date()
		const currentMonth = now.getMonth()
		const currentYear = now.getFullYear()

		// Прошлый месяц
		const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
		const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

		let currentIncome = 0
		let currentExpense = 0
		let lastIncome = 0
		let lastExpense = 0

		transactions.forEach(tx => {
			const txDate = new Date(tx.date)
			const txMonth = txDate.getMonth()
			const txYear = txDate.getFullYear()

			if (txMonth === currentMonth && txYear === currentYear) {
				if (tx.type === 'income') currentIncome += tx.amount
				else currentExpense += tx.amount
			}

			if (txMonth === lastMonth && txYear === lastMonthYear) {
				if (tx.type === 'income') lastIncome += tx.amount
				else lastExpense += tx.amount
			}
		})

		// Процент изменения
		const incomeChange =
			lastIncome > 0
				? (((currentIncome - lastIncome) / lastIncome) * 100).toFixed(1)
				: null
		const expenseChange =
			lastExpense > 0
				? (((currentExpense - lastExpense) / lastExpense) * 100).toFixed(1)
				: null

		return {
			incomeChange: incomeChange ? parseFloat(incomeChange) : null,
			expenseChange: expenseChange ? parseFloat(expenseChange) : null,
			lastIncome: lastIncome > 0 ? lastIncome : null,
			lastExpense: lastExpense > 0 ? lastExpense : null,
		}
	}

	const changes = calculateChange()

	// ... (остальной код с группировкой по месяцам остаётся без изменений)
	const monthlyData = (() => {
		const grouped = transactions.reduce((acc, tx) => {
			const date = new Date(tx.date)
			const monthKey = `${date.toLocaleString('ru-RU', { month: 'long' })} ${date.getFullYear()}`

			if (!acc[monthKey]) {
				acc[monthKey] = { income: 0, expense: 0 }
			}

			if (tx.type === 'income') {
				acc[monthKey].income += tx.amount
			} else {
				acc[monthKey].expense += tx.amount
			}

			return acc
		}, {})

		return Object.entries(grouped)
			.sort((a, b) => {
				const [monthA, yearA] = a[0].split(' ')
				const [monthB, yearB] = b[0].split(' ')
				const dateA = new Date(`${monthA} ${yearA}`)
				const dateB = new Date(`${monthB} ${yearB}`)
				return dateB - dateA
			})
			.slice(0, 3)
			.reverse()
	})()

	const categoryList = Object.entries(categories)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 4)
		.map(([name, amount], i) => ({
			name,
			amount: `${amount.toLocaleString()} ₽`,
			percent:
				totals.expense > 0 ? Math.round((amount / totals.expense) * 100) : 0,
			color: ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'][
				i
			],
			icon:
				{
					Еда: '🍔',
					Жилье: '🏠',
					Транспорт: '🚗',
					Подписки: '📺',
					Развлечения: '🎬',
					Здоровье: '💊',
					Одежда: '👕',
					Зарплата: '💰',
					Фриланс: '💻',
					Инвестиции: '📈',
				}[name] || '📦',
		}))

	return (
		<div className='w-full space-y-6'>
			{/* ВЕРХНИЙ РЯД */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]'>
				{/* БАЛАНС */}
				<div className='lg:col-span-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-900/20 h-full'>
					<div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2'></div>
					<div className='relative z-10'>
						<div className='flex items-center gap-2 text-blue-200 mb-1'>
							<span className='w-2 h-2 rounded-full bg-green-400 animate-pulse'></span>
							<span className='text-sm font-medium tracking-wide uppercase'>
								Общий баланс
							</span>
						</div>
						<div className='text-4xl font-bold text-white tracking-tight mt-2'>
							{totals.balance.toLocaleString()} ₽
						</div>
					</div>
					<div className='relative z-10 mt-8'>
						<div className='bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10'>
							<div className='text-xs text-blue-200 mb-1'>
								Доступно к выводу
							</div>
							<div className='text-xl font-semibold text-white'>
								{totals.balance.toLocaleString()} ₽
							</div>
						</div>
					</div>
				</div>

				{/* ДОХОДЫ / РАСХОДЫ */}
				<div className='lg:col-span-2 grid grid-rows-2 gap-6 h-full'>
					<StatCard
						label='Доходы'
						value={`+${totals.income.toLocaleString()} ₽`}
						color='text-green-400'
						icon='📥'
						change={changes.incomeChange}
						prevValue={
							changes.lastIncome
								? `${changes.lastIncome.toLocaleString()} ₽`
								: undefined
						}
					/>
					<StatCard
						label='Расходы'
						value={`-${totals.expense.toLocaleString()} ₽`}
						color='text-red-400'
						icon='📤'
						change={changes.expenseChange}
						prevValue={
							changes.lastExpense
								? `${changes.lastExpense.toLocaleString()} ₽`
								: undefined
						}
					/>
				</div>
			</div>

			{/* НИЖНИЙ РЯД: КАТЕГОРИИ + ДИНАМИКА */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* КАТЕГОРИИ */}
				<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h3 className='text-white font-bold text-lg'>Частые траты</h3>
						<button className='text-xs text-blue-400 hover:text-blue-300 transition'>
							Настроить
						</button>
					</div>
					<div className='space-y-5'>
						{categoryList.length === 0 ? (
							<div className='text-center py-8 text-gray-500'>
								<div className='text-3xl mb-2'>📭</div>
								<p>Пока нет трат</p>
							</div>
						) : (
							categoryList.map((cat, i) => (
								<div key={i} className='group'>
									<div className='flex items-center justify-between mb-2'>
										<div className='flex items-center gap-3'>
											<div className='w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm'>
												{cat.icon}
											</div>
											<span className='text-gray-300 font-medium'>
												{cat.name}
											</span>
										</div>
										<span className='text-white font-bold text-sm'>
											{cat.amount}
										</span>
									</div>
									<div className='w-full bg-gray-700 rounded-full h-1.5 overflow-hidden'>
										<div
											className={`h-full rounded-full ${cat.color} transition-all duration-500 group-hover:brightness-110`}
											style={{ width: `${cat.percent}%` }}
										></div>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* ДИНАМИКА */}
				<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
					<h3 className='text-white font-bold mb-4'>Динамика за 3 месяца</h3>
					<div className='space-y-4'>
						{monthlyData && monthlyData.length > 0 ? (
							monthlyData.map(([month, data], i) => {
								const total = data.income + data.expense
								const incomePercent =
									total > 0 ? (data.income / total) * 100 : 50
								const expensePercent =
									total > 0 ? (data.expense / total) * 100 : 50

								return (
									<div
										key={i}
										className='flex items-center justify-between p-2 hover:bg-gray-700/30 rounded-lg transition'
									>
										<span className='text-gray-400 w-28 text-sm font-medium'>
											{month}
										</span>

										<div className='flex-1 mx-4'>
											<div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden flex'>
												<div
													className='bg-green-500 h-full transition-all duration-500'
													style={{ width: `${incomePercent}%` }}
												></div>
												<div
													className='bg-red-500 h-full transition-all duration-500'
													style={{ width: `${expensePercent}%` }}
												></div>
											</div>
										</div>

										<div className='flex gap-4 w-32 justify-end'>
											<span className='text-green-400 font-medium text-xs'>
												+{data.income.toLocaleString()}
											</span>
											<span className='text-red-400 font-medium text-xs'>
												-{data.expense.toLocaleString()}
											</span>
										</div>
									</div>
								)
							})
						) : (
							<div className='text-center py-8 text-gray-500'>
								<div className='text-3xl mb-2'>📊</div>
								<p>Нет данных за последние месяцы</p>
								<p className='text-xs mt-1'>
									Добавь транзакции чтобы увидеть динамику
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
