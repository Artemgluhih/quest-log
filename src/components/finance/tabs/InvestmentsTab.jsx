import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import CalendarInput from '../../ui/CalendarInput'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	Legend,
} from 'recharts'

export default function InvestmentsTab() {
	const [activeSection, setActiveSection] = useState('calculator')
	const [goals, setGoals] = useState([])
	const [portfolioStocks, setPortfolioStocks] = useState([])
	const [showAddStockModal, setShowAddStockModal] = useState(false)
	const [selectedStock, setSelectedStock] = useState(null)
	const [lastUpdate, setLastUpdate] = useState(null)

	// 🔵 СОСТОЯНИЕ ДЛЯ ДИВИДЕНДОВ (на уровне родителя)
	const [dividendStocks, setDividendStocks] = useState([])
	const [dividendsLoading, setDividendsLoading] = useState(true)

	useEffect(() => {
		const fetchGoals = async () => {
			const { data } = await supabase
				.from('investment_goals')
				.select('*')
				.order('created_at', { ascending: false })
			if (data) setGoals(data)
		}
		fetchGoals()
	}, [])

	useEffect(() => {
		const fetchPortfolio = async () => {
			const { data } = await supabase
				.from('portfolio_stocks')
				.select('*')
				.order('created_at', { ascending: false })
			if (data) setPortfolioStocks(data)
		}
		fetchPortfolio()
	}, [])

	const addGoal = async goal => {
		try {
			const { data, error } = await supabase
				.from('investment_goals')
				.insert({
					name: goal.name,
					target_amount: goal.target,
					current_amount: 0,
					// deadline убрали, он больше не нужен
				})
				.select()
				.single()

			if (error) throw error
			setGoals([...goals, data])
		} catch (err) {
			console.error('Ошибка создания цели:', err)
			alert('❌ Не удалось создать цель: ' + err.message)
		}
	}

	const updateGoal = async (id, updates) => {
		await supabase
			.from('investment_goals')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', id)
		setGoals(goals.map(g => (g.id === id ? { ...g, ...updates } : g)))
	}

	const deleteGoal = async id => {
		await supabase.from('investment_goals').delete().eq('id', id)
		setGoals(goals.filter(g => g.id !== id))
	}

	const addStockToPortfolio = async stockData => {
		try {
			const { data } = await supabase
				.from('portfolio_stocks')
				.insert({
					symbol: stockData.symbol,
					name: stockData.name,
					market: stockData.market,
					shares: stockData.shares,
					buy_price: stockData.sharePrice,
					current_price: stockData.sharePrice,
					currency: stockData.currency,
				})
				.select()
				.single()

			if (data) {
				setPortfolioStocks([...portfolioStocks, data])
				alert('✅ Добавлено в портфель!')
			}
		} catch (err) {
			alert('❌ Ошибка: ' + err.message)
		}
	}

	const deleteStockFromPortfolio = async id => {
		await supabase.from('portfolio_stocks').delete().eq('id', id)
		setPortfolioStocks(portfolioStocks.filter(s => s.id !== id))
	}

	// 🔵 ФУНКЦИЯ ЗАГРУЗКИ ДИВИДЕНДНЫХ АКЦИЙ (С РЕАЛЬНЫМИ ЦЕНАМИ)
	const loadDividendStocks = async () => {
		try {
			const prices = {}
			const stocksData = [
				{ symbol: 'SBER', name: 'Сбербанк', dividend: 25.5, price: 285.5 },
				{ symbol: 'GAZP', name: 'Газпром', dividend: 15.2, price: 125.3 },
				{ symbol: 'LKOH', name: 'Лукойл', dividend: 320.0, price: 6850.0 },
				{ symbol: 'YNDX', name: 'Яндекс', dividend: 45.0, price: 3250.0 },
				{ symbol: 'ROSN', name: 'Роснефть', dividend: 12.3, price: 565.0 },
				{ symbol: 'TCSG', name: 'Тинькофф', dividend: 185.5, price: 1950.0 },
				{ symbol: 'GMKN', name: 'Норникель', dividend: 450.0, price: 12500.0 },
				{ symbol: 'PLZL', name: 'Полюс', dividend: 125.0, price: 1850.0 },
				{ symbol: 'NVTK', name: 'Новатэк', dividend: 35.5, price: 985.0 },
				{ symbol: 'TATN', name: 'Татнефть', dividend: 42.0, price: 625.0 },
				{ symbol: 'SNGS', name: 'Сургутнефтегаз', dividend: 0.85, price: 42.5 },
				{
					symbol: 'SNGSP',
					name: 'Сургутнефтегаз-п',
					dividend: 1.2,
					price: 58.3,
				},
				{ symbol: 'MTSS', name: 'МТС', dividend: 28.5, price: 285.0 },
				{ symbol: 'MOEX', name: 'Мосбиржа', dividend: 12.8, price: 185.5 },
				{ symbol: 'NLMK', name: 'НЛМК', dividend: 8.5, price: 165.0 },
				{ symbol: 'CHMF', name: 'Северсталь', dividend: 15.2, price: 125.5 },
				{
					symbol: 'MAGN',
					name: 'Магнитогорский МК',
					dividend: 6.8,
					price: 58.3,
				},
				{ symbol: 'RTKM', name: 'Ростелеком', dividend: 4.5, price: 68.5 },
				{ symbol: 'VTBR', name: 'ВТБ', dividend: 0.0035, price: 0.0385 },
				{ symbol: 'PIK', name: 'ПИК', dividend: 12.5, price: 485.0 },
				{ symbol: 'AFLT', name: 'Аэрофлот', dividend: 0, price: 42.5 },
				{ symbol: 'HYDR', name: 'РусГидро', dividend: 0.0035, price: 0.0485 },
				{
					symbol: 'UPRO',
					name: 'Группа Уралсиб',
					dividend: 0.35,
					price: 125.5,
				},
				{ symbol: 'MVID', name: 'М.Видео', dividend: 0, price: 125.5 },
				{ symbol: 'LSRG', name: 'ЛСР', dividend: 45.0, price: 685.0 },
				{ symbol: 'FLOT', name: 'Совкомфлот', dividend: 0, price: 85.3 },
				{ symbol: 'KMAZ', name: 'КамАЗ', dividend: 2.5, price: 85.3 },
				{ symbol: 'OZON', name: 'Ozon', dividend: 0, price: 1250.0 },
				{ symbol: 'POLY', name: 'Полиметалл', dividend: 0, price: 485.0 },
				{ symbol: 'SGZH', name: 'Сегежа', dividend: 0, price: 2.85 },
				{ symbol: 'AKRN', name: 'Акрон', dividend: 125.0, price: 2850.0 },
				{ symbol: 'FOSI', name: 'ФосАгро', dividend: 185.0, price: 4850.0 },
				{ symbol: 'SIBN', name: 'Газпром нефть', dividend: 18.5, price: 485.0 },
			]

			// Загружаем реальные цены с MOEX
			for (const stock of stocksData) {
				try {
					const url = `/api/moex/iss/engines/stock/markets/shares/securities/${stock.symbol}.json`
					const controller = new AbortController()
					const timeoutId = setTimeout(() => controller.abort(), 10000)

					const response = await fetch(url, {
						signal: controller.signal,
						headers: { Accept: 'application/json' },
					})

					clearTimeout(timeoutId)

					if (response.ok) {
						const data = await response.json()
						let price = null

						// Ищем цену в marketdata (индекс 12 = LAST)
						if (
							data.marketdata &&
							data.marketdata.data &&
							data.marketdata.data.length > 0
						) {
							const marketData =
								data.marketdata.data.find(d => d[1] === 'TQBR') ||
								data.marketdata.data[0]
							price = marketData[12]
						}

						// Если не нашли, пробуем securities (индекс 3 = PREVPRICE)
						if (
							!price &&
							data.securities &&
							data.securities.data &&
							data.securities.data.length > 0
						) {
							price = data.securities.data[0][3]
						}

						if (price && price > 0) {
							prices[stock.symbol] = price
						}
					}

					await new Promise(r => setTimeout(r, 300))
				} catch (err) {
					console.warn(`❌ ${stock.symbol}:`, err.message)
				}
			}

			// Создаём итоговый массив с реальными или базовыми ценами
			const stocks = stocksData.map(stock => {
				const price = prices[stock.symbol] || stock.price
				const dividend = stock.dividend
				const yieldPercent =
					price > 0 && dividend > 0
						? parseFloat(((dividend / price) * 100).toFixed(2))
						: 0

				return {
					symbol: stock.symbol,
					name: stock.name,
					price: price,
					dividend: dividend,
					yield: parseFloat(yieldPercent),
					currency: 'RUB',
					market: 'RU',
					sharePrice: price,
					exDate: null,
					isRealPrice: !!prices[stock.symbol],
				}
			})

			stocks.sort((a, b) => a.symbol.localeCompare(b.symbol))

			setDividendStocks(stocks)
			setLastUpdate(new Date())
			setDividendsLoading(false)

			console.log('✅ Загружено', stocks.length, 'акций')
		} catch (err) {
			console.error('❌ Ошибка загрузки:', err)
			setDividendsLoading(false)
		}
	}

	// 🔵 АВТООБНОВЛЕНИЕ ПРИ МОНТАЖЕ КОМПОНЕНТА
	useEffect(() => {
		loadDividendStocks()
		const interval = setInterval(loadDividendStocks, 10 * 60 * 1000) // Каждые 10 минут
		return () => clearInterval(interval)
	}, [])

	const updateAllPrices = async () => {
		await loadDividendStocks()
		alert('✅ Цены обновлены!')
	}

	return (
		<div className='w-full max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold text-white'>📈 Инвестиции</h2>
					<p className='text-gray-400 text-sm mt-1'>
						Планируй будущее{' '}
						{lastUpdate && (
							<span className='text-xs text-gray-500'>
								• Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
							</span>
						)}
					</p>
				</div>
				<div className='flex bg-gray-800 rounded-lg p-1 border border-gray-700'>
					{[
						{ id: 'calculator', label: '🧮 Калькулятор' },
						{
							id: 'portfolio',
							label: `💼 Портфель (${portfolioStocks.length})`,
						},
						{ id: 'goals', label: '🎯 Цели' },
						{ id: 'market', label: '🌍 Дивиденды' },
					].map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveSection(tab.id)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeSection === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{activeSection === 'calculator' && <CompoundCalculator />}
			{activeSection === 'portfolio' && (
				<PortfolioSection
					stocks={portfolioStocks}
					onDeleteStock={deleteStockFromPortfolio}
					onUpdateAllPrices={updateAllPrices}
				/>
			)}
			{activeSection === 'goals' && (
				<InvestmentGoals
					goals={goals}
					onAdd={addGoal}
					onUpdate={updateGoal}
					onDelete={deleteGoal}
				/>
			)}
			{activeSection === 'market' && (
				<DividendMarketCalendar
					onAddToPortfolio={stock => {
						setSelectedStock(stock)
						setShowAddStockModal(true)
					}}
					dividendStocks={dividendStocks}
					loading={dividendsLoading}
					lastUpdate={lastUpdate}
				/>
			)}

			{showAddStockModal && selectedStock && (
				<AddStockModal
					stock={selectedStock}
					onClose={() => setShowAddStockModal(false)}
					onConfirm={shares => {
						addStockToPortfolio({ ...selectedStock, shares })
						setShowAddStockModal(false)
					}}
				/>
			)}
		</div>
	)
}

// 🔹 КАЛЬКУЛЯТОР (без изменений - используй свой код)
function CompoundCalculator() {
	// ... твой существующий код калькулятора ...
	const [initialAmount, setInitialAmount] = useState(100000)
	const [monthlyContribution, setMonthlyContribution] = useState(10000)
	const [interestRate, setInterestRate] = useState(12)
	const [years, setYears] = useState(10)

	const projectionData = useMemo(() => {
		const data = []
		let balance = initialAmount
		const monthlyRate = interestRate / 100 / 12

		for (let year = 0; year <= years; year++) {
			const investedCapital = initialAmount + monthlyContribution * 12 * year
			data.push({
				year,
				total: Math.round(balance),
				invested: Math.round(investedCapital),
				profit: Math.round(balance - investedCapital),
				label: `${year} г.`,
			})
			for (let month = 0; month < 12; month++)
				balance = balance * (1 + monthlyRate) + monthlyContribution
		}
		return data
	}, [initialAmount, monthlyContribution, interestRate, years])

	const finalAmount = projectionData[projectionData.length - 1]?.total || 0
	const totalInvested = initialAmount + monthlyContribution * 12 * years

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
					<label className='text-xs text-gray-400 uppercase font-bold block mb-2'>
						💰 Начальный капитал
					</label>
					<input
						type='number'
						value={initialAmount}
						onChange={e => setInitialAmount(Number(e.target.value))}
						className='w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold'
					/>
				</div>
				<div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
					<label className='text-xs text-gray-400 uppercase font-bold block mb-2'>
						📅 В месяц
					</label>
					<input
						type='number'
						value={monthlyContribution}
						onChange={e => setMonthlyContribution(Number(e.target.value))}
						className='w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold'
					/>
				</div>
				<div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
					<label className='text-xs text-gray-400 uppercase font-bold block mb-2'>
						📈 Ставка в год
					</label>
					<input
						type='number'
						value={interestRate}
						onChange={e => setInterestRate(Number(e.target.value))}
						className='w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold'
					/>
				</div>
				<div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
					<label className='text-xs text-gray-400 uppercase font-bold block mb-2'>
						⏳ Срок
					</label>
					<input
						type='number'
						value={years}
						onChange={e => setYears(Number(e.target.value))}
						className='w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg'>
					<div className='text-blue-100 text-xs font-medium uppercase mb-1'>
						Итоговая сумма
					</div>
					<div className='text-3xl font-bold text-white'>
						{finalAmount.toLocaleString('ru-RU')} ₽
					</div>
				</div>
				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl'>
					<div className='text-gray-400 text-xs font-medium mb-1'>Вложено</div>
					<div className='text-2xl font-bold text-white'>
						{totalInvested.toLocaleString('ru-RU')} ₽
					</div>
				</div>
				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl'>
					<div className='text-gray-400 text-xs font-medium mb-1'>Прибыль</div>
					<div className='text-2xl font-bold text-green-400'>
						+{(finalAmount - totalInvested).toLocaleString('ru-RU')} ₽
					</div>
				</div>
			</div>

			<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
				<h3 className='text-lg font-bold text-white mb-4'>📊 График роста</h3>
				<div className='h-80'>
					<ResponsiveContainer width='100%' height='100%'>
						<AreaChart data={projectionData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
							<XAxis dataKey='label' stroke='#9CA3AF' />
							<YAxis stroke='#9CA3AF' />
							<Tooltip
								contentStyle={{
									backgroundColor: '#1F2937',
									border: '1px solid #374151',
								}}
							/>
							<Area
								type='monotone'
								dataKey='total'
								stroke='#3B82F6'
								fill='#3B82F6'
								fillOpacity={0.3}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
				<h3 className='text-lg font-bold text-white mb-4'>
					💰 Динамика прибыли
				</h3>
				<div className='h-80'>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={projectionData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
							<XAxis dataKey='label' stroke='#9CA3AF' />
							<YAxis stroke='#9CA3AF' />
							<Tooltip
								contentStyle={{
									backgroundColor: '#1F2937',
									border: '1px solid #374151',
								}}
							/>
							<Bar dataKey='profit' fill='#10B981' />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	)
}

// 🔹 ПОРТФЕЛЬ (без изменений - используй свой код)
function PortfolioSection({ stocks, onDeleteStock, onUpdateAllPrices }) {
	const totalValue = stocks.reduce(
		(sum, s) => sum + s.shares * s.current_price,
		0,
	)
	const totalCost = stocks.reduce((sum, s) => sum + s.shares * s.buy_price, 0)
	const totalProfit = totalValue - totalCost
	const totalProfitPercent =
		totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : 0

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg'>
					<div className='text-blue-100 text-xs font-medium uppercase mb-1'>
						Стоимость портфеля
					</div>
					<div className='text-3xl font-bold text-white'>
						{totalValue.toLocaleString('ru-RU')} ₽
					</div>
				</div>
				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl'>
					<div className='text-gray-400 text-xs font-medium mb-1'>Вложено</div>
					<div className='text-2xl font-bold text-white'>
						{totalCost.toLocaleString('ru-RU')} ₽
					</div>
				</div>
				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl'>
					<div className='text-gray-400 text-xs font-medium mb-1'>
						Прибыль/Убыток
					</div>
					<div
						className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
					>
						{totalProfit >= 0 ? '+' : ''}
						{totalProfit.toLocaleString('ru-RU')} ₽ ({totalProfitPercent}%)
					</div>
				</div>
			</div>

			<div className='flex justify-between items-center bg-gray-800 border border-gray-700 rounded-xl p-4'>
				<div>
					<h3 className='text-lg font-bold text-white'>📊 Ваши акции</h3>
					<p className='text-sm text-gray-400'>{stocks.length} позиций</p>
				</div>
				<button
					onClick={onUpdateAllPrices}
					className='px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition shadow-lg shadow-blue-500/20'
				>
					🔄 Обновить цены
				</button>
			</div>

			{stocks.length === 0 ? (
				<div className='text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700'>
					<div className='text-4xl mb-3'>📦</div>
					<p>Портфель пуст</p>
					<p className='text-sm mt-2'>Добавьте акции из раздела "Дивиденды"</p>
				</div>
			) : (
				<div className='bg-gray-800 border border-gray-700 rounded-xl overflow-hidden'>
					<table className='w-full'>
						<thead className='bg-gray-900/50 border-b border-gray-700'>
							<tr className='text-left text-xs text-gray-400 uppercase'>
								<th className='px-6 py-4'>Актив</th>
								<th className='px-6 py-4 text-right'>Кол-во</th>
								<th className='px-6 py-4 text-right'>Цена покупки</th>
								<th className='px-6 py-4 text-right'>Текущая цена</th>
								<th className='px-6 py-4 text-right'>Стоимость</th>
								<th className='px-6 py-4 text-right'>Прибыль</th>
								<th className='px-6 py-4 text-center'>Действия</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-700/50'>
							{stocks.map(stock => {
								const value = stock.shares * stock.current_price
								const cost = stock.shares * stock.buy_price
								const profit = value - cost
								const profitPercent =
									cost > 0 ? ((profit / cost) * 100).toFixed(2) : 0

								return (
									<tr
										key={stock.id}
										className='hover:bg-gray-700/30 transition group'
									>
										<td className='px-6 py-4'>
											<div className='flex items-center gap-3'>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${stock.market === 'US' ? 'bg-indigo-600' : 'bg-blue-600'}`}
												>
													{stock.symbol.substring(0, 2)}
												</div>
												<div>
													<div className='font-bold text-white'>
														{stock.symbol}
													</div>
													<div className='text-xs text-gray-400'>
														{stock.name}
													</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 text-right text-white font-medium'>
											{stock.shares}
										</td>
										<td className='px-6 py-4 text-right text-gray-300'>
											{stock.buy_price.toLocaleString()} {stock.currency}
										</td>
										<td className='px-6 py-4 text-right text-gray-300'>
											{stock.current_price.toLocaleString()} {stock.currency}
										</td>
										<td className='px-6 py-4 text-right text-white font-bold'>
											{value.toLocaleString()} {stock.currency}
										</td>
										<td
											className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}
										>
											<div>
												{profit >= 0 ? '+' : ''}
												{profit.toLocaleString()} {stock.currency}
											</div>
											<div className='text-xs'>({profitPercent}%)</div>
										</td>
										<td className='px-6 py-4 text-center'>
											<button
												onClick={() => {
													if (confirm(`Удалить ${stock.symbol}?`))
														onDeleteStock(stock.id)
												}}
												className='opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition'
											>
												🗑️
											</button>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

// 🔹 МОДАЛКА (исправленная версия)
function AddStockModal({ stock, onClose, onConfirm }) {
	const [shares, setShares] = useState(1)

	const safePrice = stock.sharePrice || stock.price || 0
	const totalCost = shares * safePrice
	const expectedDividend =
		shares * (stock.dividendAmount || stock.dividend || 0)

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'>
			<div className='bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden'>
				<div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6'>
					<div className='flex justify-between items-start'>
						<div className='flex items-center gap-4'>
							<div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white'>
								{stock.symbol.substring(0, 2)}
							</div>
							<div>
								<h3 className='text-2xl font-bold text-white'>
									{stock.symbol}
								</h3>
								<p className='text-blue-100'>{stock.name}</p>
								<span
									className={`inline-block mt-1 text-xs px-2 py-1 rounded ${stock.market === 'US' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-blue-500/30 text-blue-200'}`}
								>
									{stock.market === 'US' ? '🇺🇸 NASDAQ/NYSE' : '🇷🇺 MOEX'}
									{stock.isRealPrice && ' ✅'}
								</span>
							</div>
						</div>
						<button
							onClick={onClose}
							className='text-white/70 hover:text-white text-2xl transition'
						>
							✕
						</button>
					</div>
				</div>

				<div className='p-6 space-y-6'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='bg-gray-700/50 p-4 rounded-xl border border-gray-600'>
							<div className='text-xs text-gray-400 uppercase font-bold mb-1'>
								Цена акции
							</div>
							<div className='text-xl font-bold text-white'>
								{safePrice > 0
									? safePrice.toLocaleString('ru-RU', {
											minimumFractionDigits: 2,
										})
									: '—'}{' '}
								{stock.currency || '₽'}
							</div>
							{stock.isRealPrice && (
								<div className='text-xs text-green-400 mt-1'>
									✅ Реальная цена
								</div>
							)}
							{!stock.isRealPrice && (
								<div className='text-xs text-yellow-400 mt-1'>
									⚠️ Базовая цена
								</div>
							)}
						</div>
						<div className='bg-gray-700/50 p-4 rounded-xl border border-gray-600'>
							<div className='text-xs text-gray-400 uppercase font-bold mb-1'>
								Дивиденд
							</div>
							<div className='text-xl font-bold text-green-400'>
								{(stock.dividendAmount || stock.dividend || 0).toLocaleString(
									'ru-RU',
									{ minimumFractionDigits: 2 },
								)}{' '}
								{stock.currency || '₽'}
							</div>
							<div className='text-xs text-gray-500 mt-1'>
								Доходность: {stock.yield || 0}%
							</div>
						</div>
					</div>

					<div>
						<label className='block text-xs text-gray-400 mb-2 uppercase font-bold'>
							Количество акций
						</label>
						<div className='flex items-center gap-4'>
							<button
								onClick={() => setShares(Math.max(1, shares - 1))}
								className='w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-2xl font-bold transition'
							>
								−
							</button>
							<input
								type='number'
								value={shares}
								onChange={e => setShares(Math.max(1, Number(e.target.value)))}
								className='flex-1 bg-gray-700 text-white text-center text-2xl font-bold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500'
							/>
							<button
								onClick={() => setShares(shares + 1)}
								className='w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-2xl font-bold transition'
							>
								+
							</button>
						</div>
					</div>

					<div className='bg-gradient-to-br from-gray-700/50 to-gray-600/50 p-5 rounded-xl border border-gray-600 space-y-3'>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-400'>Стоимость покупки:</span>
							<span className='text-white font-bold'>
								{totalCost > 0
									? totalCost.toLocaleString('ru-RU', {
											minimumFractionDigits: 2,
										})
									: '—'}{' '}
								{stock.currency || '₽'}
							</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-400'>Ожидаемый дивиденд:</span>
							<span className='text-green-400 font-bold'>
								{expectedDividend > 0
									? expectedDividend.toLocaleString('ru-RU', {
											minimumFractionDigits: 2,
										})
									: '—'}{' '}
								{stock.currency || '₽'}
							</span>
						</div>
						<div className='border-t border-gray-600 pt-3 flex justify-between items-center'>
							<span className='text-gray-400 text-xs'>
								Доходность на вложения:
							</span>
							<span className='text-green-400 font-bold text-lg'>
								{stock.yield || 0}%
							</span>
						</div>
					</div>

					{safePrice === 0 && (
						<div className='bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4'>
							<div className='text-yellow-200 text-sm'>
								⚠️ <strong>Внимание!</strong> Для этой акции нет реальной цены.
							</div>
						</div>
					)}
				</div>

				<div className='p-6 border-t border-gray-700 flex gap-3'>
					<button
						onClick={onClose}
						className='flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition'
					>
						Отмена
					</button>
					<button
						onClick={() => onConfirm(shares)}
						disabled={safePrice === 0}
						className='flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-lg shadow-green-500/20'
					>
						✅ Добавить в портфель
					</button>
				</div>
			</div>
		</div>
	)
}

// 🔹 ДИВИДЕНДНЫЙ КАЛЕНДАРЬ (ПРИНИМАЕТ ДАННЫЕ ИЗ PROPS)
function DividendMarketCalendar({
	onAddToPortfolio,
	dividendStocks,
	loading,
	lastUpdate,
}) {
	const [filter, setFilter] = useState('all')
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 50

	// Фильтрация
	const filtered = useMemo(() => {
		let res = [...dividendStocks]
		if (filter === 'dividend') res = res.filter(d => d.dividend > 0)
		if (search)
			res = res.filter(
				d =>
					d.symbol.toLowerCase().includes(search.toLowerCase()) ||
					d.name.toLowerCase().includes(search.toLowerCase()),
			)
		return res
	}, [dividendStocks, filter, search])

	// Пагинация
	const totalPages = Math.ceil(filtered.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const currentStocks = filtered.slice(startIndex, startIndex + itemsPerPage)

	useEffect(() => {
		setCurrentPage(1)
	}, [filter, search])

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h3 className='text-xl font-bold text-white'>
						🇷🇺 Дивидендный календарь
					</h3>
					<p className='text-sm text-gray-400'>
						{dividendStocks.length} акций •
						{lastUpdate &&
							`Обновлено: ${lastUpdate.toLocaleTimeString('ru-RU')}`}{' '}
						• Автообновление: 10 мин
					</p>
				</div>
				<input
					type='text'
					placeholder='🔍 Поиск...'
					value={search}
					onChange={e => setSearch(e.target.value)}
					className='bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg w-64'
				/>
			</div>

			{loading ? (
				<div className='text-center py-12 text-gray-500 animate-pulse'>
					<div className='text-2xl mb-2'>🔄</div>
					<div>Загрузка реальных цен с MOEX...</div>
					<div className='text-sm mt-2'>Это займёт около 30-60 секунд</div>
				</div>
			) : (
				<div className='bg-gray-800 border border-gray-700 rounded-xl overflow-hidden'>
					<table className='w-full'>
						<thead className='bg-gray-900/50 border-b border-gray-700'>
							<tr className='text-left text-xs text-gray-400 uppercase'>
								<th className='px-6 py-4'>Компания</th>
								<th className='px-6 py-4 text-right'>Цена</th>
								<th className='px-6 py-4 text-right'>Дивиденд</th>
								<th className='px-6 py-4 text-right'>Доходность</th>
								<th className='px-6 py-4 text-center'>Действие</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-700/50'>
							{currentStocks.map((d, i) => (
								<tr
									key={`${d.symbol}-${i}`}
									className='hover:bg-gray-700/30 transition group'
								>
									<td className='px-6 py-4'>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs'>
												{d.symbol.substring(0, 2)}
											</div>
											<div>
												<div className='font-bold text-white'>{d.symbol}</div>
												<div className='text-xs text-gray-400'>{d.name}</div>
											</div>
										</div>
									</td>
									<td className='px-6 py-4 text-right text-white font-bold'>
										{d.price > 0
											? d.price.toLocaleString('ru-RU', {
													minimumFractionDigits: 2,
												})
											: '—'}{' '}
										₽
									</td>
									<td className='px-6 py-4 text-right text-green-400 font-bold'>
										{d.dividend > 0
											? d.dividend.toLocaleString('ru-RU', {
													minimumFractionDigits: 2,
												})
											: '—'}{' '}
										₽
									</td>
									<td className='px-6 py-4 text-right'>
										{d.yield > 0 ? (
											<span className='text-green-400 font-bold'>
												{d.yield}%
											</span>
										) : (
											<span className='text-gray-500'>—</span>
										)}
									</td>
									<td className='px-6 py-4 text-center'>
										<button
											onClick={() => onAddToPortfolio(d)}
											className='opacity-0 group-hover:opacity-100 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition'
										>
											➕ В портфель
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{totalPages > 1 && (
						<div className='flex justify-center gap-2 p-4 bg-gray-800/50 border-t border-gray-700'>
							<button
								onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className='px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded'
							>
								←
							</button>
							<span className='px-3 py-1 text-white'>
								{currentPage} / {totalPages}
							</span>
							<button
								onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								className='px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded'
							>
								→
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

// 🔹 ЦЕЛИ (без изменений - используй свой код)
function InvestmentGoals({ goals, onAdd, onUpdate, onDelete }) {
	const [showModal, setShowModal] = useState(false)
	const [showAddAmountModal, setShowAddAmountModal] = useState(false)
	const [selectedGoal, setSelectedGoal] = useState(null)
	const [form, setForm] = useState({ name: '', target: '' })
	const [amountForm, setAmountForm] = useState('')

	const handleSubmit = e => {
		e.preventDefault()
		if (!form.name.trim() || !form.target) return

		onAdd({ name: form.name.trim(), target: Number(form.target) })
		setForm({ name: '', target: '' })
		setShowModal(false)
	}

	const handleAddAmount = goal => {
		setSelectedGoal(goal)
		setAmountForm('')
		setShowAddAmountModal(true)
	}

	const handleSubmitAmount = async e => {
		e.preventDefault()
		if (!amountForm || !selectedGoal) return

		const newAmount = (selectedGoal.current_amount || 0) + Number(amountForm)
		await onUpdate(selectedGoal.id, { current_amount: newAmount })
		setShowAddAmountModal(false)
		setSelectedGoal(null)
		setAmountForm('')
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h3 className='text-xl font-bold text-white'>🎯 Мои цели</h3>
				<button
					onClick={() => setShowModal(true)}
					className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition'
				>
					+ Добавить цель
				</button>
			</div>

			{goals.length === 0 ? (
				<div className='text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700'>
					<div className='text-4xl mb-3'>🎯</div>
					<p>Пока нет целей</p>
					<p className='text-sm mt-1'>Создай первую финансовую цель</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{goals.map(goal => {
						const current = goal.current_amount || 0
						const progressPercent = Math.min(
							(current / goal.target_amount) * 100,
							100,
						).toFixed(1)
						const isComplete = progressPercent >= 100

						return (
							<div
								key={goal.id}
								className={`bg-gray-800 border rounded-xl p-5 transition-all ${isComplete ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'}`}
							>
								<div className='flex justify-between items-start mb-3'>
									<h4 className='font-bold text-white text-lg'>{goal.name}</h4>
									<button
										onClick={() => onDelete(goal.id)}
										className='text-gray-500 hover:text-red-400 transition p-1'
									>
										🗑️
									</button>
								</div>

								{/* Проценты и суммы */}
								<div className='flex items-end justify-between mb-2'>
									<div>
										<span
											className={`text-2xl font-black ${isComplete ? 'text-green-400' : 'text-blue-400'}`}
										>
											{progressPercent}%
										</span>
										<span className='text-xs text-gray-500 ml-1'>
											выполнено
										</span>
									</div>
									<div className='text-right'>
										<div className='text-sm font-bold text-white'>
											{current.toLocaleString('ru-RU')} ₽
										</div>
										<div className='text-xs text-gray-500'>
											из {goal.target_amount.toLocaleString('ru-RU')} ₽
										</div>
									</div>
								</div>

								{/* Прогресс-бар */}
								<div className='w-full bg-gray-700 h-2.5 rounded-full overflow-hidden mb-4'>
									<div
										className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
										style={{ width: `${progressPercent}%` }}
									/>
								</div>

								{/* Кнопки действий */}
								<div className='flex gap-2'>
									<button
										onClick={() => handleAddAmount(goal)}
										className='flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2'
									>
										💰 Добавить
									</button>
									<button
										onClick={() => onUpdate(goal.id, { current_amount: 0 })}
										className='px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition'
										title='Сбросить прогресс'
									>
										🔄
									</button>
								</div>

								{isComplete && (
									<div className='mt-3 text-center text-green-400 font-bold text-sm animate-pulse bg-green-500/10 py-1.5 rounded-lg border border-green-500/20'>
										🎉 Цель достигнута!
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}

			{/* Модалка создания цели */}
			{showModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
					<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl'>
						<h3 className='text-lg font-bold text-white mb-4'>
							Новая финансовая цель
						</h3>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div>
								<label className='text-xs text-gray-400 block mb-1 font-medium'>
									Название цели
								</label>
								<input
									type='text'
									value={form.name}
									onChange={e => setForm({ ...form, name: e.target.value })}
									placeholder='Например: Подушка безопасности'
									required
									className='w-full bg-gray-700 text-white px-3 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 placeholder-gray-500'
								/>
							</div>
							<div>
								<label className='text-xs text-gray-400 block mb-1 font-medium'>
									Сумма (₽)
								</label>
								<input
									type='number'
									value={form.target}
									onChange={e => setForm({ ...form, target: e.target.value })}
									placeholder='500000'
									required
									min='1'
									className='w-full bg-gray-700 text-white px-3 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 placeholder-gray-500'
								/>
							</div>
							<div className='flex gap-3 pt-2'>
								<button
									type='button'
									onClick={() => setShowModal(false)}
									className='flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition'
								>
									Отмена
								</button>
								<button
									type='submit'
									className='flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/20'
								>
									✅ Создать
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Модалка добавления суммы */}
			{showAddAmountModal && selectedGoal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
					<div className='bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl'>
						<h3 className='text-lg font-bold text-white mb-2'>
							💰 Добавить накопления
						</h3>
						<p className='text-sm text-gray-400 mb-4'>
							Цель: {selectedGoal.name}
						</p>
						<form onSubmit={handleSubmitAmount} className='space-y-4'>
							<div>
								<label className='text-xs text-gray-400 block mb-1 font-medium'>
									Сумма (₽)
								</label>
								<input
									type='number'
									value={amountForm}
									onChange={e => setAmountForm(e.target.value)}
									placeholder='10000'
									required
									min='1'
									autoFocus
									className='w-full bg-gray-700 text-white px-3 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 border border-gray-600 placeholder-gray-500'
								/>
							</div>
							<div className='bg-gray-700/50 p-3 rounded-lg space-y-2'>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>Текущая сумма:</span>
									<span className='text-white font-bold'>
										{(selectedGoal.current_amount || 0).toLocaleString('ru-RU')}{' '}
										₽
									</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>После добавления:</span>
									<span className='text-green-400 font-bold'>
										{(
											(selectedGoal.current_amount || 0) +
											Number(amountForm || 0)
										).toLocaleString('ru-RU')}{' '}
										₽
									</span>
								</div>
							</div>
							<div className='flex gap-3 pt-2'>
								<button
									type='button'
									onClick={() => setShowAddAmountModal(false)}
									className='flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition'
								>
									Отмена
								</button>
								<button
									type='submit'
									className='flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition shadow-lg shadow-green-500/20'
								>
									✅ Добавить
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
