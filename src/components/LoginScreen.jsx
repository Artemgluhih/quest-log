import { useState, useEffect } from 'react'
import { hashPin } from '../utils/auth'

export default function LoginScreen({ onLogin }) {
	const [pin, setPin] = useState('')
	const [confirmPin, setConfirmPin] = useState('')
	const [error, setError] = useState('')
	const [isSetup, setIsSetup] = useState(null)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const setupStatus = localStorage.getItem('questLog_isSetup')
		setIsSetup(setupStatus === 'true')
	}, [])

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		if (!pin || pin.length < 4) {
			setError('Пин-код должен быть не менее 4 цифр')
			setIsLoading(false)
			return
		}

		try {
			const hashedPin = await hashPin(pin)

			if (isSetup) {
				// Режим входа
				const storedHash = localStorage.getItem('questLog_authHash')
				if (hashedPin === storedHash) {
					onLogin()
				} else {
					setError('Неверный пин-код')
				}
			} else {
				// Режим первой настройки
				if (pin !== confirmPin) {
					setError('Пин-коды не совпадают')
				} else {
					localStorage.setItem('questLog_authHash', hashedPin)
					localStorage.setItem('questLog_isSetup', 'true')
					onLogin()
				}
			}
		} catch (err) {
			setError('Ошибка при проверке пин-кода')
		} finally {
			setIsLoading(false)
		}
	}

	if (isSetup === null) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center text-white'>
				<div className='animate-pulse text-xl'>Загрузка защиты...</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
			<div className='bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl'>
				<div className='text-center mb-6'>
					<div className='text-4xl mb-2'>🔒</div>
					<h2 className='text-2xl font-bold text-white'>
						{isSetup ? 'Добро пожаловать' : 'Настройка защиты'}
					</h2>
					<p className='text-gray-400 text-sm mt-2'>
						{isSetup
							? 'Введите ваш пин-код для доступа к задачам'
							: 'Создайте пин-код, чтобы никто не увидел ваши данные'}
					</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<input
							type='password'
							inputMode='numeric'
							value={pin}
							onChange={e => setPin(e.target.value)}
							placeholder='••••'
							className='w-full bg-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest placeholder:text-gray-500'
							maxLength={8}
							autoFocus
						/>
					</div>

					{!isSetup && (
						<div>
							<input
								type='password'
								inputMode='numeric'
								value={confirmPin}
								onChange={e => setConfirmPin(e.target.value)}
								placeholder='Повторите пин-код'
								className='w-full bg-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest placeholder:text-gray-500'
								maxLength={8}
							/>
						</div>
					)}

					{error && (
						<div className='text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/30'>
							⚠️ {error}
						</div>
					)}

					<button
						type='submit'
						disabled={isLoading}
						className='w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/20'
					>
						{isLoading
							? 'Проверка...'
							: isSetup
								? '🔓 Войти'
								: '🛡️ Включить защиту'}
					</button>
				</form>

				<div className='mt-6 text-center text-xs text-gray-500'>
					🔐 Данные хранятся только в вашем браузере
				</div>
			</div>
		</div>
	)
}
