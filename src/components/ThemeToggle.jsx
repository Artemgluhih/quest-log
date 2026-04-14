export default function ThemeToggle({ theme, onToggle }) {
	return (
		<button
			onClick={onToggle}
			className='p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition'
			title={
				theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
			}
		>
			{theme === 'dark' ? '☀️' : '🌙'}
		</button>
	)
}
