import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export function useAssetData() {
	const [assets, setAssets] = useState([])
	const [prices, setPrices] = useState({})
	const [loading, setLoading] = useState(true)
	const [lastUpdate, setLastUpdate] = useState(null)

	// 1. Загрузка портфеля
	useEffect(() => {
		const fetchAssets = async () => {
			try {
				const { data, error } = await supabase
					.from('assets')
					.select('*')
					.order('created_at', { ascending: false })

				if (error) throw error
				setAssets(data || [])
			} catch (err) {
				console.error('Ошибка загрузки портфеля:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchAssets()
	}, [])

	// 2. Загрузка курсов
	useEffect(() => {
		const fetchPrices = async () => {
			try {
				// Пытаемся загрузить курсы
				const cbrRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js')
				const cbrData = await cbrRes.json()

				let newPrices = {}

				// Если ЦБ ответил, берем оттуда
				if (cbrData.Valute) {
					if (cbrData.Valute.USD)
						newPrices['USD'] = {
							rate: cbrData.Valute.USD.Value,
							type: 'fiat',
							name: 'Доллар США',
						}
					if (cbrData.Valute.EUR)
						newPrices['EUR'] = {
							rate: cbrData.Valute.EUR.Value,
							type: 'fiat',
							name: 'Евро',
						}
					if (cbrData.Valute.CNY)
						newPrices['CNY'] = {
							rate: cbrData.Valute.CNY.Value,
							type: 'fiat',
							name: 'Юань',
						}
				} else {
					// Иначе ставим жесткие значения (Fallback)
					newPrices['USD'] = { rate: 92.5, type: 'fiat', name: 'Доллар США' }
					newPrices['EUR'] = { rate: 99.8, type: 'fiat', name: 'Евро' }
					newPrices['CNY'] = { rate: 12.7, type: 'fiat', name: 'Юань' }
				}

				// Металлы (считаем от доллара)
				const usdRate = newPrices['USD']?.rate || 92.5
				const OUNCE_TO_GRAM = 31.1035

				newPrices['XAU'] = {
					rate: (2350 * usdRate) / OUNCE_TO_GRAM,
					type: 'metal',
					name: 'Золото',
				}
				newPrices['XAG'] = {
					rate: (28.5 * usdRate) / OUNCE_TO_GRAM,
					type: 'metal',
					name: 'Серебро',
				}
				newPrices['XPT'] = {
					rate: (1020 * usdRate) / OUNCE_TO_GRAM,
					type: 'metal',
					name: 'Платина',
				}

				// Крипта (Если не грузится, ставим заглушки)
				try {
					const cryptoRes = await fetch(
						'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=rub',
					)
					const cryptoData = await cryptoRes.json()
					if (cryptoData.bitcoin)
						newPrices['BTC'] = {
							rate: cryptoData.bitcoin.rub,
							type: 'crypto',
							name: 'Bitcoin',
						}
					if (cryptoData.ethereum)
						newPrices['ETH'] = {
							rate: cryptoData.ethereum.rub,
							type: 'crypto',
							name: 'Ethereum',
						}
					if (cryptoData.tether)
						newPrices['USDT'] = {
							rate: cryptoData.tether.rub,
							type: 'crypto',
							name: 'Tether',
						}
				} catch (e) {
					console.warn('Крипта не загрузилась, используем заглушки')
					newPrices['BTC'] = { rate: 6500000, type: 'crypto', name: 'Bitcoin' }
					newPrices['ETH'] = { rate: 350000, type: 'crypto', name: 'Ethereum' }
					newPrices['USDT'] = { rate: 92, type: 'crypto', name: 'Tether' }
				}

				setPrices(newPrices)
				setLastUpdate(new Date())
			} catch (err) {
				console.error('Ошибка курсов:', err)
			}
		}

		fetchPrices()
	}, [])

	// 3. Добавить / Обновить актив
	const addAsset = async (code, amount, buyPrice) => {
		try {
			// 🔹 ВАЛИДАЦИЯ
			if (!buyPrice || buyPrice <= 0 || isNaN(buyPrice)) {
				throw new Error(`Некорректная цена покупки: ${buyPrice}`)
			}
			if (!amount || amount <= 0 || isNaN(amount)) {
				throw new Error(`Некорректное количество: ${amount}`)
			}

			const existing = assets.find(a => a.code === code)
			let finalAmount = amount
			let finalBuyPrice = buyPrice

			if (existing) {
				// 🔥 ПЕРЕСЧЁТ СРЕДНЕЙ ЦЕНЫ
				const oldAmount = existing.amount || 0
				const oldBuyPrice = existing.buy_price || 0

				console.log('📊 Существующий актив:', { oldAmount, oldBuyPrice })
				console.log('📊 Новая покупка:', { amount, buyPrice })

				const totalAmount = oldAmount + amount
				const totalCost = oldAmount * oldBuyPrice + amount * buyPrice

				finalAmount = totalAmount
				finalBuyPrice = totalCost / totalAmount

				console.log('📊 Итого:', { finalAmount, finalBuyPrice })
			}

			// 🔹 ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ
			if (!finalBuyPrice || isNaN(finalBuyPrice)) {
				throw new Error('Не удалось рассчитать цену покупки')
			}

			const assetData = {
				code,
				amount: finalAmount,
				buy_price: finalBuyPrice, // <-- Теперь точно будет число!
				updated_at: new Date().toISOString(),
			}

			console.log('💾 Отправляем в БД:', assetData)

			const { error } = await supabase
				.from('assets')
				.upsert(assetData, { onConflict: 'code' })

			if (error) {
				console.error('❌ Ошибка Supabase:', error)
				throw error
			}

			// Обновляем локально
			setAssets(prev => {
				const exists = prev.find(a => a.code === code)
				if (exists) {
					return prev.map(a => (a.code === code ? { ...a, ...assetData } : a))
				}
				return [...prev, { id: Date.now(), ...assetData }]
			})

			alert('✅ Успешно добавлено!')
		} catch (err) {
			console.error('❌ Ошибка сохранения:', err)
			alert('Не удалось сохранить: ' + err.message)
		}
	}

	// 4. Удалить актив (ИСПРАВЛЕНО)
	const removeAsset = async code => {
		try {
			// Удаляем из БД
			const { error } = await supabase.from('assets').delete().eq('code', code) // Ищем по коду (USD, BTC)

			if (error) throw error

			// Удаляем из состояния
			setAssets(prev => prev.filter(a => a.code !== code))
		} catch (err) {
			console.error('Ошибка удаления:', err)
			alert('Не удалось удалить: ' + err.message)
		}
	}

	return {
		assets,
		prices,
		loading,
		lastUpdate,
		addAsset,
		removeAsset, // <--- Убедись, что это здесь!
	}
}
