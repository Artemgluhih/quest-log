import { ACHIEVEMENTS } from '../utils/achievements'

export default function Achievements({ unlocked, onClose }) {
	return (
		<div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 dark:bg-gray-800 bg-white dark:text-white text-gray-900 rounded-xl w-full max-w-md p-6 relative shadow-2xl'>
				<button
					onClick={onClose}
					className='absolute top-4 right-4 text-gray-400 hover:text-white'
				>
					✕
				</button>
				<h2 className='text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2'>
					🏆 Достижения
				</h2>
				<div className='space-y-3 max-h-[60vh] overflow-y-auto pr-2'>
					{Object.values(ACHIEVEMENTS).map(ach => {
						const isUnlocked = unlocked.includes(ach.id)
						return (
							<div
								key={ach.id}
								className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isUnlocked ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 shadow-md' : 'border-gray-700 bg-gray-700 bg-opacity-30 opacity-60 grayscale'}`}
							>
								<div className='text-3xl filter drop-shadow-lg'>{ach.icon}</div>
								<div>
									<div
										className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}
									>
										{ach.name}
									</div>
									<div className='text-xs text-gray-400'>{ach.description}</div>
								</div>
								{isUnlocked && (
									<div className='ml-auto text-green-400 text-lg animate-bounce'>
										✓
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
