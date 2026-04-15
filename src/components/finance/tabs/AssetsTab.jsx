import { useState, useMemo } from 'react'

export default function AssetsTab({
	assets,
	prices,
	loading,
	lastUpdate,
	addAsset,
	removeAsset,
}) {
	const [activeCategory, setActiveCategory] = useState('all')
	const [showAddModal, setShowAddModal] = useState(false)

	const filteredAssets = useMemo(() => {
		return assets.filter(a => {
			const type = prices[a.code]?.type
			if (activeCategory === 'all') return true
			return type === activeCategory
		})
	}, [assets, prices, activeCategory])

	const portfolioStats = useMemo(() => {
		let totalValue = 0
		let totalProfit = 0

		assets.forEach(asset => {
			// БЕЗОПАСНЫЙ ДОСТУП
			const currentRate = prices[asset.code]?.rate || asset.buy_price || 0
			const value = (asset.amount || 0) * currentRate
			const profit =
				(currentRate - (asset.buy_price || 0)) * (asset.amount || 0)

			totalValue += value
			totalProfit += profit
		})

		return { totalValue, totalProfit }
	}, [assets, prices])

	return (
		<div className='w-full space-y-6 max-w-6xl mx-auto'>
			{/* Статистика */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white'>
					<div className='text-blue-200 text-sm font-medium uppercase mb-1'>
						Стоимость портфеля
					</div>
					<div className='text-3xl font-bold'>
						{portfolioStats.totalValue.toLocaleString('ru-RU', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}{' '}
						₽
					</div>
					{lastUpdate && (
						<div className='text-xs text-blue-200 mt-2 opacity-80'>
							Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
						</div>
					)}
				</div>

				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl flex flex-col justify-between'>
					<div className='text-gray-400 text-sm font-medium'>Общая прибыль</div>
					<div
						className={`text-3xl font-bold ${portfolioStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
					>
						{portfolioStats.totalProfit >= 0 ? '+' : ''}
						{portfolioStats.totalProfit.toLocaleString('ru-RU', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}{' '}
						₽
					</div>
					<div className='text-xs text-gray-500'>
						{portfolioStats.totalValue > 0
							? (
									(portfolioStats.totalProfit / portfolioStats.totalValue) *
									100
								).toFixed(2)
							: 0}
						% доходность
					</div>
				</div>

				<div className='bg-gray-800 border border-gray-700 p-6 rounded-2xl'>
					<div className='text-gray-400 text-sm font-medium mb-2'>Активов</div>
					<div className='text-3xl font-bold text-white'>{assets.length}</div>
				</div>
			</div>

			{/* Управление */}
			<div className='flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700'>
				<div className='flex bg-gray-700 rounded-lg p-1'>
					{[
						{ id: 'all', label: '🌐 Все' },
						{ id: 'fiat', label: '💱 Валюты' },
						{ id: 'crypto', label: '₿ Крипта' },
						{ id: 'metal', label: '🏆 Металлы' },
					].map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveCategory(tab.id)}
							className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
								activeCategory === tab.id
									? 'bg-blue-600 text-white shadow-sm'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				<button
					onClick={() => setShowAddModal(true)}
					className='w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2'
				>
					➕ Добавить актив
				</button>
			</div>

			{/* Список */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{filteredAssets.length === 0 && (
					<div className='col-span-full text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700'>
						<div className='text-4xl mb-3'>📦</div>
						<p>У тебя пока нет активов</p>
					</div>
				)}

				{filteredAssets.map(asset => {
					// БЕЗОПАСНЫЙ ДОСТУП
					const currentRate = prices[asset.code]?.rate || asset.buy_price || 0
					const amount = asset.amount || 0
					const buyPrice = asset.buy_price || 0

					const totalValue = amount * currentRate
					const profit = (currentRate - buyPrice) * amount
					const profitPercent =
						buyPrice > 0 ? ((profit / (amount * buyPrice)) * 100).toFixed(2) : 0

					return (
						<div
							key={asset.code}
							className='bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-blue-500/50 transition group relative'
						>
							<div className='flex justify-between items-start mb-4'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold'>
										{asset.code[0]}
									</div>
									<div>
										<div className='font-bold text-white'>{asset.code}</div>
										<div className='text-xs text-gray-400'>
											{prices[asset.code]?.type === 'crypto'
												? 'Crypto'
												: 'Fiat'}
										</div>
									</div>
								</div>
								<button
									onClick={() => {
										if (window.confirm(`Удалить ${asset.code} из портфеля?`)) {
											removeAsset(asset.code)
										}
									}}
									className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition'
								>
									🗑️
								</button>
							</div>

							<div className='space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>Кол-во:</span>
									<span className='text-white font-medium'>{amount}</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>Курс:</span>
									<span className='text-white font-medium'>
										{currentRate.toLocaleString('ru-RU', {
											maximumFractionDigits: 4,
										})}{' '}
										₽
									</span>
								</div>

								<div className='border-t border-gray-700 pt-3 mt-2'>
									<div className='flex justify-between items-end'>
										<span className='text-xs text-gray-500 uppercase'>
											Стоимость
										</span>
										<span className='text-xl font-bold text-white'>
											{totalValue.toLocaleString('ru-RU', {
												maximumFractionDigits: 2,
											})}{' '}
											₽
										</span>
									</div>
									<div className='flex justify-between items-end mt-1'>
										<span className='text-xs text-gray-500'>Прибыль</span>
										<span
											className={`text-sm font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}
										>
											{profit >= 0 ? '+' : ''}
											{profit.toLocaleString('ru-RU', {
												maximumFractionDigits: 2,
											})}{' '}
											₽ ({profitPercent}%)
										</span>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
