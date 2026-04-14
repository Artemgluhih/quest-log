import { useState } from 'react'

export default function ExportImport({ data, onLoad }) {
	const [status, setStatus] = useState('')

	const handleExport = () => {
		const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `questlog-backup-${new Date().toISOString().slice(0, 10)}.json`
		a.click()
		URL.revokeObjectURL(url)
		setStatus('✅ Экспорт завершен')
		setTimeout(() => setStatus(''), 3000)
	}

	const handleImport = e => {
		const file = e.target.files[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = event => {
			try {
				const parsed = JSON.parse(event.target.result)
				onLoad(parsed)
				setStatus('✅ Импорт завершен! Страница перезагрузится...')
				setTimeout(() => window.location.reload(), 1000)
			} catch (err) {
				setStatus('❌ Ошибка файла')
			}
		}
		reader.readAsText(file)
	}

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex gap-2'>
				<button
					onClick={handleExport}
					className='flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-xs text-white font-bold transition'
				>
					📤 Сохранить
				</button>
				<label className='flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white font-bold cursor-pointer transition text-center'>
					📥 Загрузить
					<input
						type='file'
						accept='.json'
						onChange={handleImport}
						className='hidden'
					/>
				</label>
			</div>
			{status && (
				<div className='text-xs text-center text-yellow-400 animate-pulse font-bold'>
					{status}
				</div>
			)}
		</div>
	)
}
