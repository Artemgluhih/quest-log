export default function SearchBar({ value, onChange }) {
	return (
		<div className='relative'>
			<input
				type='text'
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder='🔍 Поиск задач...'
				className='w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
			/>
			<span className='absolute left-3 top-2.5 text-gray-400'>🔍</span>
		</div>
	)
}
