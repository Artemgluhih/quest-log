import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../supabaseClient'

export function useFinanceData() {
	const [transactions, setTransactions] = useState([])
	const [loading, setLoading] = useState(true)

	// ЗАГРУЗКА ДАННЫХ
	useEffect(() => {
		let isMounted = true

		const fetchData = async () => {
			try {
				const { data, error } = await supabase
					.from('transactions')
					.select('*')
					.order('date', { ascending: false })

				if (error) {
					console.error('Ошибка загрузки:', error)
					return
				}

				if (isMounted) {
					setTransactions(data || [])
					setLoading(false)
				}
			} catch (err) {
				console.error('Ошибка:', err)
				setLoading(false)
			}
		}

		fetchData()

		// Простая подписка на изменения (без real-time)
		const interval = setInterval(() => {
			fetchData()
		}, 5000) // Обновление каждые 5 секунд

		return () => {
			isMounted = false
			clearInterval(interval)
		}
	}, [])

	// ПОДСЧЁТ МЕТРИК
	const totals = useMemo(() => {
		const income = transactions
			.filter(t => t.type === 'income')
			.reduce((s, t) => s + t.amount, 0)
		const expense = transactions
			.filter(t => t.type === 'expense')
			.reduce((s, t) => s + t.amount, 0)
		return {
			income,
			expense,
			balance: income - expense,
		}
	}, [transactions])

	const categories = useMemo(() => {
		return transactions
			.filter(t => t.type === 'expense')
			.reduce((acc, t) => {
				acc[t.category] = (acc[t.category] || 0) + t.amount
				return acc
			}, {})
	}, [transactions])

	// ФУНКЦИИ ИЗМЕНЕНИЯ
	const addTransaction = async tx => {
		const newTx = { ...tx, id: Date.now().toString() }

		try {
			const { error } = await supabase.from('transactions').insert(newTx)
			if (error) {
				alert('Ошибка сохранения: ' + error.message)
				return
			}
			// Обновляем локально сразу
			setTransactions(prev => [newTx, ...prev])
		} catch (err) {
			alert('Ошибка: ' + err.message)
		}
	}

	const deleteTransaction = async id => {
		try {
			const { error } = await supabase
				.from('transactions')
				.delete()
				.eq('id', id)
			if (error) {
				alert('Ошибка удаления: ' + error.message)
				return
			}
			// Обновляем локально сразу
			setTransactions(prev => prev.filter(t => t.id !== id))
		} catch (err) {
			alert('Ошибка: ' + err.message)
		}
	}

	return {
		transactions,
		totals,
		categories,
		loading,
		addTransaction,
		deleteTransaction,
	}
}
