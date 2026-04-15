export default function StatCard({
	label,
	value,
	color,
	icon,
	change,
	prevValue,
}) {
	return (
		<div className='bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center justify-between hover:border-gray-600 transition'>
			<div>
				<div className='text-gray-400 text-sm font-medium mb-1'>{label}</div>
				<div className={`text-2xl font-bold ${color}`}>{value}</div>
				{change !== undefined && prevValue !== undefined && (
					<div className='text-xs text-gray-500 mt-1'>
						Прошлый: {prevValue}
						{change && (
							<span
								className={`ml-1 ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'}`}
							>
								{change > 0 ? '+' : ''}
								{change}%
							</span>
						)}
					</div>
				)}
			</div>
			<div className='text-3xl opacity-80'>{icon}</div>
		</div>
	)
}
