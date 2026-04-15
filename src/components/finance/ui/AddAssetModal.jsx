import { useState, useEffect } from 'react'

export default function AddAssetModal({ asset, onClose, onAdd }) {
	const [amount, setAmount] = useState('1')
	const [buyPrice, setBuyPrice] = useState('')

	// 🔹 Устанавливаем цену при открытии модалки
	useEffect(() => {
		if (asset?.currentPrice) {
			setBuyPrice(asset.currentPrice.toString())
		} else {
			// Если цены нет, ставим 0 или запрашиваем у пользователя
			setBuyPrice('0')
		}
	}, [asset])

	if (!asset) return null

	const handleSubmit = e => {
		e.preventDefault()

		const numAmount = parseFloat(amount)
		const numBuyPrice = parseFloat(buyPrice)

		// 🔹 ВАЛИДАЦИЯ: проверяем что числа валидны
		if (!numAmount || numAmount <= 0) {
			alert('Введите корректное количество')
			return
		}

		if (!numBuyPrice || numBuyPrice <= 0) {
			alert('Введите корректную цену покупки')
			return
		}

		onAdd({
			code: asset.code,
			amount: numAmount,
			buyPrice: numBuyPrice,
		})
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
			<div className='bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden'>
				<div className='p-5 border-b border-gray-700 flex justify-between items-center'>
					<h3 className='text-lg font-bold text-white flex items-center gap-2'>
						➕ Добавить {asset.code}
					</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white text-xl transition'
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-5 space-y-4'>
					<div className='bg-gray-700/50 p-4 rounded-xl border border-gray-600'>
						<div className='text-xs text-gray-400 uppercase tracking-wide font-bold'>
							Актив
						</div>
						<div className='text-xl font-bold text-white mt-1'>
							{asset.name}
						</div>
						{asset.unit && (
							<div className='text-xs text-gray-500 mt-1'>
								Единица: {asset.unit}
							</div>
						)}
					</div>

					<div>
						<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
							Количество
						</label>
						<input
							type='number'
							step='any'
							required
							min='0.000001'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold transition'
							placeholder='0.00'
						/>
					</div>

					<div>
						<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
							Цена покупки (₽)
						</label>
						<input
							type='number'
							step='any'
							required
							min='0.01'
							value={buyPrice}
							onChange={e => setBuyPrice(e.target.value)}
							className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold transition'
							placeholder='0.00'
						/>
						<div className='flex justify-between text-xs mt-1'>
							<span className='text-gray-500'>
								Текущий курс:{' '}
								{asset.currentPrice?.toLocaleString('ru-RU', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 4,
								}) || 'неизвестно'}{' '}
								₽
							</span>
							{buyPrice !== asset.currentPrice?.toString() &&
								asset.currentPrice && (
									<button
										type='button'
										onClick={() => setBuyPrice(asset.currentPrice.toString())}
										className='text-blue-400 hover:text-blue-300 underline'
									>
										Сбросить к рынку
									</button>
								)}
						</div>
					</div>

					<div className='flex gap-3 pt-2'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition'
						>
							Отмена
						</button>
						<button
							type='submit'
							className='flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition shadow-lg shadow-green-500/20'
						>
							💾 В портфель
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
