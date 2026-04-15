export default function TransactionItem({ tx, onDelete }) {
	return (
		<div className='flex items-center justify-between p-4 hover:bg-gray-700/30 transition group'>
			<div className='flex items-center gap-4'>
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}
				>
					{tx.type === 'income' ? '📥' : '📤'}
				</div>
				<div>
					<div className='font-medium text-white'>
						{tx.description || tx.category}
					</div>
					<div className='text-xs text-gray-500 flex items-center gap-2'>
						<span className='bg-gray-700 px-2 py-0.5 rounded text-gray-300'>
							{tx.category}
						</span>
						<span>
							{new Date(tx.date).toLocaleTimeString('ru-RU', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
					</div>
				</div>
			</div>
			<div className='flex items-center gap-4'>
				<span
					className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}
				>
					{tx.type === 'income' ? '+' : '-'}
					{tx.amount.toLocaleString()} ₽
				</span>
				<button
					onClick={onDelete}
					className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-2'
					title='Удалить'
				>
					🗑️
				</button>
			</div>
		</div>
	)
}
