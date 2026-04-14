export default function Stats({ total, completed, streak, achievementsCount }) {
	const percentage = total > 0 ? ((completed / total) * 100).toFixed(0) : 0

	return (
		<div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
			<div className='bg-gray-800 dark:bg-gray-800 bg-white dark:text-white text-gray-900 rounded-lg p-4 shadow-md border border-gray-700'>
				<div className='text-gray-400 text-xs uppercase font-bold'>Всего</div>
				<div className='text-2xl font-bold text-blue-400'>{total}</div>
			</div>
			<div className='bg-gray-800 dark:bg-gray-800 bg-white dark:text-white text-gray-900 rounded-lg p-4 shadow-md border border-gray-700'>
				<div className='text-gray-400 text-xs uppercase font-bold'>
					Выполнено
				</div>
				<div className='text-2xl font-bold text-green-400'>{completed}</div>
			</div>
			<div className='bg-gray-800 dark:bg-gray-800 bg-white dark:text-white text-gray-900 rounded-lg p-4 shadow-md border border-gray-700'>
				<div className='text-gray-400 text-xs uppercase font-bold'>
					🔥 Стрик
				</div>
				<div className='text-2xl font-bold text-orange-400'>{streak} дн.</div>
			</div>
			<div className='bg-gray-800 dark:bg-gray-800 bg-white dark:text-white text-gray-900 rounded-lg p-4 shadow-md border border-gray-700'>
				<div className='text-gray-400 text-xs uppercase font-bold'>
					🏆 Ачивки
				</div>
				<div className='text-2xl font-bold text-yellow-400'>
					{achievementsCount}
				</div>
			</div>
		</div>
	)
}
