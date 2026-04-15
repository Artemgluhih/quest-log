import { useState } from 'react'
import DatePicker from '../../DatePicker' // Импортируем существующий DatePicker

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

export default function AddTransactionModal({ onClose, onSave }) {
	const [type, setType] = useState('expense')
	const [amount, setAmount] = useState('')
	const [category, setCategory] = useState('Еда')
	const [description, setDescription] = useState('')
	const [date, setDate] = useState(new Date().toISOString())

	const handleSubmit = e => {
		e.preventDefault()
		if (!amount || parseFloat(amount) <= 0) return
		onSave({
			type,
			amount: parseFloat(amount),
			category,
			description,
			date: new Date(date).toISOString(),
		})
	}

	// Форматируем дату для отображения
	const formatDate = dateString => {
		if (!dateString) return 'Выберите дату'
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm '>
			<div className='bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 overflow-visible'>
				<div className='p-5 border-b border-gray-700 flex justify-between items-center'>
					<h3 className='text-lg font-bold text-white'>Новая операция</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white text-xl'
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-5 space-y-4'>
					{/* Тип */}
					<div className='flex bg-gray-700 rounded-lg p-1'>
						<button
							type='button'
							onClick={() => setType('income')}
							className={`flex-1 py-2.5 rounded-md text-sm font-bold transition flex items-center justify-center gap-2 ${
								type === 'income'
									? 'bg-green-600 text-white shadow-lg'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							📥 Доход
						</button>
						<button
							type='button'
							onClick={() => setType('expense')}
							className={`flex-1 py-2.5 rounded-md text-sm font-bold transition flex items-center justify-center gap-2 ${
								type === 'expense'
									? 'bg-red-600 text-white shadow-lg'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							📤 Расход
						</button>
					</div>

					{/* Сумма */}
					<div>
						<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
							Сумма (₽)
						</label>
						<input
							type='number'
							step='0.01'
							required
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='0.00'
							className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold placeholder-gray-500'
						/>
					</div>

					{/* Категория */}
					<div>
						<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
							Категория
						</label>
						<select
							value={category}
							onChange={e => setCategory(e.target.value)}
							className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium'
						>
							{CATEGORIES.map(c => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					{/* Дата и Описание */}
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
								Дата
							</label>
							<div className='relative z-50 overflow-visible'>
								<DatePicker
									value={date}
									onChange={setDate}
									placeholder='Выбрать дату'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wide'>
								Описание
							</label>
							<input
								type='text'
								value={description}
								onChange={e => setDescription(e.target.value)}
								placeholder='Например: Обед'
								className='w-full bg-gray-700 text-white px-3 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
							/>
						</div>
					</div>

					{/* Кнопки */}
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
							className='flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2'
						>
							💾 Сохранить
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
