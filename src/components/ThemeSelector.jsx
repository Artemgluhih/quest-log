import { useState } from 'react'

const THEMES = [
	{
		id: 'default',
		name: 'Синяя (Default)',
		color: 'bg-blue-500',
		ring: 'ring-blue-500',
	},
	{
		id: 'theme-green',
		name: 'Зеленая (Matrix)',
		color: 'bg-green-500',
		ring: 'ring-green-500',
	},
	{
		id: 'theme-purple',
		name: 'Фиолетовая (Cyber)',
		color: 'bg-purple-500',
		ring: 'ring-purple-500',
	},
	{
		id: 'theme-red',
		name: 'Красная (Fire)',
		color: 'bg-red-500',
		ring: 'ring-red-500',
	},
	{
		id: 'theme-orange',
		name: 'Оранжевая (Sunset)',
		color: 'bg-orange-500',
		ring: 'ring-orange-500',
	},
]

export default function ThemeSelector({
	currentTheme,
	isCompact,
	onThemeChange,
	onCompactChange,
	onClose,
}) {
	const [activeTheme, setActiveTheme] = useState(currentTheme)

	const handleSave = () => {
		onThemeChange(activeTheme)
		onClose()
	}

	return (
		<div
			className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4'
			onClick={onClose}
		>
			<div
				className='bg-gray-800 rounded-xl w-full max-w-sm p-6 border border-gray-700 shadow-2xl'
				onClick={e => e.stopPropagation()}
			>
				<div className='flex justify-between items-center mb-6'>
					<h3 className='text-xl font-bold text-white'>🎨 Настройки вида</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white text-xl'
					>
						✕
					</button>
				</div>

				{/* Выбор темы */}
				<div className='mb-6'>
					<label className='block text-xs text-gray-400 uppercase font-bold mb-3'>
						Цветовая схема
					</label>
					<div className='grid grid-cols-3 gap-3'>
						{THEMES.map(theme => (
							<button
								key={theme.id}
								onClick={() => setActiveTheme(theme.id)}
								className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
									activeTheme === theme.id
										? 'border-gray-500 bg-gray-700'
										: 'border-gray-700 bg-gray-800 hover:bg-gray-750'
								}`}
							>
								<div
									className={`w-8 h-8 rounded-full ${theme.color} ${activeTheme === theme.id ? `ring-2 ring-offset-2 ring-offset-gray-800 ${theme.ring}` : ''}`}
								></div>
								<span className='text-xs text-gray-300'>
									{theme.name.split(' ')[0]}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Компактный режим */}
				<div className='mb-6'>
					<label className='block text-xs text-gray-400 uppercase font-bold mb-3'>
						Интерфейс
					</label>
					<button
						onClick={() => onCompactChange(!isCompact)}
						className={`w-full py-3 rounded-lg flex items-center justify-between px-4 transition border ${
							isCompact
								? 'bg-primary text-white border-primary'
								: 'bg-gray-700 text-gray-300 border-gray-700 hover:bg-gray-600'
						}`}
					>
						<span>Компактный режим</span>
						<span
							className={`w-10 h-5 rounded-full relative transition ${isCompact ? 'bg-white/20' : 'bg-gray-600'}`}
						>
							<span
								className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${isCompact ? 'left-5' : 'left-0.5'}`}
							></span>
						</span>
					</button>
				</div>

				<button
					onClick={handleSave}
					className='w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition'
				>
					Применить
				</button>
			</div>
		</div>
	)
}
