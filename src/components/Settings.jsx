import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { ACHIEVEMENTS } from '../utils/achievements'

export default function Settings({
	theme,
	appTheme,
	isCompact,
	onThemeChange,
	onAppThemeChange,
	onCompactChange,
	onClearData,
	unlockedAchievements,
	tasks,
	projects,
}) {
	const [activeTab, setActiveTab] = useState('profile')
	const [showConfirmClear, setShowConfirmClear] = useState(false)

	const tabs = [
		{ id: 'profile', name: 'Профиль', icon: '👤' },
		{ id: 'appearance', name: 'Внешний вид', icon: '🎨' },
		{ id: 'notifications', name: 'Уведомления', icon: '🔔' },
		{ id: 'security', name: 'Безопасность', icon: '🔐' },
		{ id: 'achievements', name: 'Достижения', icon: '🏆' },
		{ id: 'integrations', name: 'Интеграции', icon: '🔌' },
	]

	const handleClearData = () => {
		if (showConfirmClear) {
			onClearData()
			setShowConfirmClear(false)
		} else {
			setShowConfirmClear(true)
			setTimeout(() => setShowConfirmClear(false), 3000)
		}
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case 'profile':
				return <ProfileTab />
			case 'appearance':
				return (
					<AppearanceTab
						theme={theme}
						appTheme={appTheme}
						isCompact={isCompact}
						onThemeChange={onThemeChange}
						onAppThemeChange={onAppThemeChange}
						onCompactChange={onCompactChange}
					/>
				)
			case 'notifications':
				return <NotificationsTab />
			case 'security':
				return <SecurityTab />
			case 'achievements':
				return (
					<AchievementsTab
						unlocked={unlockedAchievements}
						tasks={tasks}
						projects={projects}
					/>
				)
			case 'integrations':
				return <IntegrationsTab />
			default:
				return null
		}
	}

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='flex items-center gap-3 mb-8'>
				<span className='text-4xl'>⚙️</span>
				<div>
					<h2 className='text-2xl font-bold text-white'>Настройки</h2>
					<p className='text-gray-400 text-sm'>Управление приложением</p>
				</div>
			</div>

			<div className='flex flex-col md:flex-row gap-6'>
				<div className='w-full md:w-64 flex-shrink-0'>
					<div className='bg-gray-800 rounded-xl border border-gray-700 p-2'>
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition mb-1 ${
									activeTab === tab.id
										? 'bg-blue-600 text-white'
										: 'text-gray-400 hover:bg-gray-700 hover:text-white'
								}`}
							>
								<span className='text-xl'>{tab.icon}</span>
								<span className='font-medium'>{tab.name}</span>
							</button>
						))}
					</div>
				</div>

				<div className='flex-1'>{renderTabContent()}</div>
			</div>
		</div>
	)
}

// === Вкладка: Профиль ===
function ProfileTab() {
	const [avatar, setAvatar] = useState(null)
	const [avatarPreview, setAvatarPreview] = useState(null)
	const [name, setName] = useState('User')
	const [email, setEmail] = useState('')
	const [isEmailVerified, setIsEmailVerified] = useState(false)
	const [verificationCode, setVerificationCode] = useState('')
	const [showVerification, setShowVerification] = useState(false)
	const [sentCode, setSentCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const saved = localStorage.getItem('questLog_profile')
		if (saved) {
			const profile = JSON.parse(saved)
			setName(profile.name || 'User')
			setEmail(profile.email || '')
			setAvatar(profile.avatar || null)
			setAvatarPreview(profile.avatar || null)
			setIsEmailVerified(profile.isEmailVerified || false)
		}
	}, [])

	const handleAvatarChange = e => {
		const file = e.target.files[0]
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				alert('Файл слишком большой. Максимум 2MB')
				return
			}
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatar(reader.result)
				setAvatarPreview(reader.result)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleSendCode = async () => {
		if (!email || !email.includes('@')) {
			alert('Введите корректный email')
			return
		}
		setIsLoading(true)
		try {
			const code = Math.floor(100000 + Math.random() * 900000).toString()
			const { data, error } = await supabase.functions.invoke(
				'send-verification-email',
				{
					body: { email, code },
				},
			)
			if (error) throw error
			setSentCode(code)
			setShowVerification(true)
			alert('✅ Код отправлен на email!')
		} catch (error) {
			console.error('Ошибка:', error)
			alert('❌ Не удалось отправить код: ' + error.message)
		} finally {
			setIsLoading(false)
		}
	}

	const handleVerifyEmail = () => {
		if (verificationCode === sentCode) {
			setIsEmailVerified(true)
			setShowVerification(false)
			alert('✅ Email подтвержден!')
		} else {
			alert('❌ Неверный код')
		}
	}

	const handleSave = () => {
		localStorage.setItem(
			'questLog_profile',
			JSON.stringify({ name, email, avatar, isEmailVerified }),
		)
		alert('✅ Профиль сохранен!')
	}

	return (
		<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
			<h3 className='text-lg font-bold text-white mb-6'>👤 Профиль</h3>
			<div className='space-y-6'>
				<div className='flex items-center gap-6'>
					<div className='relative'>
						<div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden'>
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt=''
									className='w-full h-full object-cover'
								/>
							) : (
								name.charAt(0).toUpperCase()
							)}
						</div>
						<label className='absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center cursor-pointer border-2 border-gray-800'>
							📷
							<input
								type='file'
								accept='image/*'
								onChange={handleAvatarChange}
								className='hidden'
							/>
						</label>
					</div>
					<div>
						<button
							onClick={() =>
								document.querySelector('input[type="file"]').click()
							}
							className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium'
						>
							Изменить аватар
						</button>
						<p className='text-xs text-gray-500 mt-2'>JPG, PNG до 2MB</p>
					</div>
				</div>
				<div>
					<label className='block text-sm text-gray-400 mb-2'>Имя</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Ваше имя'
					/>
				</div>
				<div>
					<label className='block text-sm text-gray-400 mb-2'>
						Email {isEmailVerified && <span className='text-green-400'>✓</span>}
					</label>
					<div className='flex gap-2'>
						<input
							type='email'
							value={email}
							onChange={e => {
								setEmail(e.target.value)
								setIsEmailVerified(false)
							}}
							disabled={isEmailVerified}
							className='flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
							placeholder='your@email.com'
						/>
						{!isEmailVerified ? (
							<button
								onClick={handleSendCode}
								disabled={isLoading}
								className='px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium'
							>
								{isLoading ? 'Отправка...' : 'Отправить код'}
							</button>
						) : (
							<span className='px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium border border-green-600/30'>
								Подтвержден
							</span>
						)}
					</div>
				</div>
				{showVerification && (
					<div className='p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg'>
						<label className='block text-sm text-blue-400 mb-2'>
							Код подтверждения
						</label>
						<div className='flex gap-2'>
							<input
								type='text'
								value={verificationCode}
								onChange={e =>
									setVerificationCode(e.target.value.replace(/\D/g, ''))
								}
								className='flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest'
								placeholder='000000'
								maxLength='6'
							/>
							<button
								onClick={handleVerifyEmail}
								className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium'
							>
								Подтвердить
							</button>
						</div>
					</div>
				)}
				<div className='pt-4 border-t border-gray-700 flex gap-3'>
					<button
						onClick={handleSave}
						className='px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium'
					>
						Сохранить
					</button>
					<button
						onClick={() => {
							setName('User')
							setEmail('')
							setAvatar(null)
							setAvatarPreview(null)
							setIsEmailVerified(false)
						}}
						className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium'
					>
						Сбросить
					</button>
				</div>
			</div>
		</div>
	)
}

// === Вкладка: Внешний вид ===
function AppearanceTab({
	theme,
	appTheme,
	isCompact,
	onThemeChange,
	onAppThemeChange,
	onCompactChange,
}) {
	const [weekStart, setWeekStart] = useState(
		() => localStorage.getItem('questLog_weekStart') || 'monday',
	)
	const [timeFormat, setTimeFormat] = useState(
		() => localStorage.getItem('questLog_timeFormat') || '24',
	)
	const [dateFormat, setDateFormat] = useState(
		() => localStorage.getItem('questLog_dateFormat') || 'DD.MM.YY',
	)
	const [background, setBackground] = useState(
		() => localStorage.getItem('questLog_background') || 'default',
	)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark')
		document.documentElement.classList.toggle('compact-mode', isCompact)

		const THEMES = [
			'theme-green',
			'theme-purple',
			'theme-red',
			'theme-orange',
			'theme-pink',
			'theme-cyan',
			'theme-teal',
		]
		THEMES.forEach(t => document.documentElement.classList.remove(t))
		if (appTheme && appTheme !== 'default') {
			document.documentElement.classList.add(appTheme)
		}

		localStorage.setItem('questLog_theme', theme)
		localStorage.setItem('questLog_appTheme', appTheme)
		localStorage.setItem('questLog_compact', isCompact)
	}, [theme, appTheme, isCompact])

	const colorSchemes = [
		{ id: 'default', name: 'Blue', color: 'bg-indigo-500' },
		{ id: 'theme-orange', name: 'Orange', color: 'bg-orange-400' },
		{ id: 'theme-red', name: 'Red', color: 'bg-red-500' },
		{ id: 'theme-pink', name: 'Pink', color: 'bg-pink-500' },
		{ id: 'theme-purple', name: 'Purple', color: 'bg-fuchsia-500' },
		{ id: 'theme-cyan', name: 'Cyan', color: 'bg-cyan-400' },
		{ id: 'theme-teal', name: 'Teal', color: 'bg-teal-500' },
		{ id: 'theme-green', name: 'Green', color: 'bg-emerald-500' },
	]

	const backgrounds = [
		{ id: 'default', name: 'По умолчанию', preview: 'bg-gray-100' },
		{ id: 'contrast', name: 'Contrast', preview: 'bg-gray-800' },
		{
			id: 'wisteria',
			name: 'Wisteria',
			preview: 'bg-gradient-to-br from-pink-300 to-purple-400',
		},
		{
			id: 'royal',
			name: 'Royal',
			preview: 'bg-gradient-to-br from-purple-400 to-pink-500',
		},
		{
			id: 'flax',
			name: 'Flax',
			preview: 'bg-gradient-to-br from-cyan-400 to-orange-400',
		},
		{
			id: 'dalle1',
			name: 'By DALL-E 2',
			preview: 'bg-gradient-to-br from-orange-300 to-pink-300',
		},
		{
			id: 'dalle2',
			name: 'By DALL-E',
			preview: 'bg-gradient-to-br from-blue-400 to-orange-300',
		},
		{
			id: 'fractal',
			name: 'Fractal',
			preview: 'bg-gradient-to-br from-blue-900 to-cyan-700',
		},
		{
			id: 'custom',
			name: 'Свой вариант',
			preview: 'bg-gray-700 border-2 border-dashed border-gray-500',
		},
	]

	const handleSave = () => {
		localStorage.setItem('questLog_weekStart', weekStart)
		localStorage.setItem('questLog_timeFormat', timeFormat)
		localStorage.setItem('questLog_dateFormat', dateFormat)
		localStorage.setItem('questLog_background', background)
		alert('✅ Настройки сохранены!')
	}

	return (
		<div className='space-y-8'>
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>
					⏰ Настройки отображения времени
				</h3>
				<div className='space-y-6'>
					<div>
						<label className='block text-sm text-gray-400 mb-3'>
							Начало недели
						</label>
						<div className='space-y-2'>
							{[
								{ id: 'sunday', label: 'Воскресенье' },
								{ id: 'monday', label: 'Понедельник' },
							].map(opt => (
								<label
									key={opt.id}
									className='flex items-center gap-3 cursor-pointer'
								>
									<input
										type='radio'
										name='weekStart'
										value={opt.id}
										checked={weekStart === opt.id}
										onChange={e => {
											setWeekStart(e.target.value)
											localStorage.setItem('questLog_weekStart', e.target.value)
										}}
										className='w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500'
									/>
									<span className='text-gray-300'>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
					<div>
						<label className='block text-sm text-gray-400 mb-3'>
							Формат времени
						</label>
						<div className='space-y-2'>
							{[
								{ id: '24', label: '24 часа' },
								{ id: '12', label: '12 часов' },
							].map(opt => (
								<label
									key={opt.id}
									className='flex items-center gap-3 cursor-pointer'
								>
									<input
										type='radio'
										name='timeFormat'
										value={opt.id}
										checked={timeFormat === opt.id}
										onChange={e => {
											setTimeFormat(e.target.value)
											localStorage.setItem(
												'questLog_timeFormat',
												e.target.value,
											)
										}}
										className='w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500'
									/>
									<span className='text-gray-300'>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
					<div>
						<label className='block text-sm text-gray-400 mb-3'>
							Формат даты
						</label>
						<div className='flex flex-wrap gap-4'>
							{[
								{ id: 'MM/DD/YY', label: 'MM/ДД/ГГ' },
								{ id: 'DD/MM/YY', label: 'ДД/ММ/ГГ' },
								{ id: 'MM.DD.YY', label: 'ММ.ДД.ГГ' },
								{ id: 'DD.MM.YY', label: 'ДД.ММ.ГГ' },
							].map(opt => (
								<label
									key={opt.id}
									className='flex items-center gap-2 cursor-pointer'
								>
									<input
										type='radio'
										name='dateFormat'
										value={opt.id}
										checked={dateFormat === opt.id}
										onChange={e => {
											setDateFormat(e.target.value)
											localStorage.setItem(
												'questLog_dateFormat',
												e.target.value,
											)
										}}
										className='w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500'
									/>
									<span className='text-gray-300 text-sm'>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>🎨 Цветовая схема</h3>
				<div className='grid grid-cols-4 sm:grid-cols-8 gap-3'>
					{colorSchemes.map(scheme => (
						<button
							key={scheme.id}
							onClick={() => onAppThemeChange(scheme.id)}
							className={`relative aspect-square rounded-lg ${scheme.color} transition hover:scale-110 ${
								appTheme === scheme.id
									? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white'
									: ''
							}`}
							title={scheme.name}
						>
							{appTheme === scheme.id && (
								<span className='absolute inset-0 flex items-center justify-center text-white text-lg'>
									✓
								</span>
							)}
						</button>
					))}
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>🌓 Цветовая тема</h3>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<label
						className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition ${
							theme === 'light'
								? 'border-blue-500'
								: 'border-gray-700 hover:border-gray-500'
						}`}
					>
						<input
							type='radio'
							name='theme'
							value='light'
							checked={theme === 'light'}
							onChange={e => onThemeChange(e.target.value)}
							className='sr-only'
						/>
						<div className='bg-white p-4'>
							<div className='bg-gray-100 rounded-lg p-3 mb-3'>
								<div className='flex items-center gap-2 mb-2'>
									<div className='w-6 h-6 rounded-full bg-gray-300'></div>
									<div className='h-3 bg-gray-300 rounded w-24'></div>
								</div>
								<div className='space-y-2'>
									<div className='h-2 bg-gray-300 rounded w-full'></div>
									<div className='h-2 bg-gray-300 rounded w-3/4'></div>
								</div>
							</div>
							<div className='text-center'>
								<span className='text-gray-600 font-medium'>☀️ Светлая</span>
							</div>
						</div>
						{theme === 'light' && (
							<div className='absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs'>
								✓
							</div>
						)}
					</label>

					<label
						className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition ${
							theme === 'dark'
								? 'border-blue-500'
								: 'border-gray-700 hover:border-gray-500'
						}`}
					>
						<input
							type='radio'
							name='theme'
							value='dark'
							checked={theme === 'dark'}
							onChange={e => onThemeChange(e.target.value)}
							className='sr-only'
						/>
						<div className='bg-gray-900 p-4'>
							<div className='bg-gray-800 rounded-lg p-3 mb-3'>
								<div className='flex items-center gap-2 mb-2'>
									<div className='w-6 h-6 rounded-full bg-gray-600'></div>
									<div className='h-3 bg-gray-600 rounded w-24'></div>
								</div>
								<div className='space-y-2'>
									<div className='h-2 bg-gray-600 rounded w-full'></div>
									<div className='h-2 bg-gray-600 rounded w-3/4'></div>
								</div>
							</div>
							<div className='text-center'>
								<span className='text-gray-300 font-medium'>🌙 Тёмная</span>
							</div>
						</div>
						{theme === 'dark' && (
							<div className='absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs'>
								✓
							</div>
						)}
					</label>
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>🖼️ Фоны</h3>
				<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
					{backgrounds.map(bg => (
						<label
							key={bg.id}
							className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition ${
								background === bg.id
									? 'border-blue-500'
									: 'border-gray-700 hover:border-gray-500'
							}`}
						>
							<input
								type='radio'
								name='background'
								value={bg.id}
								checked={background === bg.id}
								onChange={e => {
									setBackground(e.target.value)
									localStorage.setItem('questLog_background', e.target.value)
								}}
								className='sr-only'
							/>
							<div className={`${bg.preview} aspect-video flex items-end`}>
								<div className='w-full p-3 bg-gradient-to-t from-black/60 to-transparent'>
									<span className='text-white text-sm font-medium'>
										{bg.name}
									</span>
								</div>
							</div>
							{background === bg.id && (
								<div className='absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs'>
									✓
								</div>
							)}
							{bg.id === 'custom' && (
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='text-gray-400 text-3xl'>+</div>
								</div>
							)}
						</label>
					))}
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<div className='flex items-center justify-between'>
					<div>
						<div className='text-white font-medium'>Компактный режим</div>
						<div className='text-xs text-gray-500'>
							Уменьшает отступы для большего количества данных
						</div>
					</div>
					<button
						onClick={() => onCompactChange(!isCompact)}
						className={`w-12 h-6 rounded-full relative transition ${isCompact ? 'bg-blue-500' : 'bg-gray-600'}`}
					>
						<span
							className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${isCompact ? 'left-6' : 'left-0.5'}`}
						></span>
					</button>
				</div>
			</div>

			<div className='flex justify-end'>
				<button
					onClick={handleSave}
					className='px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition'
				>
					Обновить профиль
				</button>
			</div>
		</div>
	)
}

// === Вкладка: УВЕДОМЛЕНИЯ ===
function NotificationsTab() {
	const [soundEnabled, setSoundEnabled] = useState(false)
	const [channels, setChannels] = useState({
		center: true,
		push: false,
		messengers: false,
		inApp: true,
		mobile: false,
		email: false,
	})

	const toggleChannel = key => {
		setChannels(prev => ({ ...prev, [key]: !prev[key] }))
	}

	return (
		<div className='space-y-6'>
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>
					⚙️ Настройки уведомлений
				</h3>

				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6'>
					{[
						{ id: 'center', label: 'Центр уведомлений', icon: '🔔' },
						{ id: 'push', label: 'Web push', icon: '🌐' },
						{ id: 'messengers', label: 'В мессенджеры', icon: '💬' },
						{ id: 'inApp', label: 'Внутри сервиса', icon: '⚡' },
						{ id: 'mobile', label: 'В мобильные', icon: '📱' },
						{ id: 'email', label: 'По почте', icon: '✉️' },
					].map(ch => (
						<button
							key={ch.id}
							onClick={() => toggleChannel(ch.id)}
							className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition ${
								channels[ch.id]
									? 'bg-blue-600/10 border-blue-500 text-white'
									: 'bg-gray-700/30 border-gray-600 text-gray-400 hover:bg-gray-700'
							}`}
						>
							<span className='text-2xl mb-2'>{ch.icon}</span>
							<span className='text-xs text-center font-medium'>
								{ch.label}
							</span>
							{channels[ch.id] && (
								<div className='absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
									<span className='text-[10px] text-white'>✓</span>
								</div>
							)}
						</button>
					))}
				</div>

				<div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600'>
					<div className='flex items-center gap-3'>
						<span className='text-xl'>🔊</span>
						<span className='text-white font-medium'>Звуковой эффект</span>
					</div>
					<button
						onClick={() => setSoundEnabled(!soundEnabled)}
						className={`w-10 h-6 rounded-full relative transition ${soundEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}
					>
						<span
							className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${soundEnabled ? 'left-5' : 'left-1'}`}
						></span>
					</button>
				</div>
			</div>

			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-4'>
					Уведомления из сервисов
				</h3>
				<div className='space-y-2'>
					{[
						{
							icon: '✅',
							title: 'Задачи',
							desc: 'Изменения в задачах и напоминания о них',
						},
						{ icon: '📁', title: 'Проекты', desc: 'Изменения в проектах' },
					].map((item, idx) => (
						<div
							key={idx}
							className='flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition cursor-pointer group'
						>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white transition'>
									{item.icon}
								</div>
								<div>
									<div className='text-white text-sm font-medium'>
										{item.title}
									</div>
									<div className='text-gray-500 text-xs'>{item.desc}</div>
								</div>
							</div>
							<span className='text-gray-500 group-hover:text-white transition'>
								›
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

// === Вкладка: Безопасность ===
function SecurityTab() {
	const [showPinChange, setShowPinChange] = useState(false)
	return (
		<div className='space-y-6'>
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>🔐 Безопасность</h3>
				<div className='space-y-6'>
					<div className='p-4 bg-green-900/20 border border-green-700/50 rounded-lg'>
						<div className='flex items-center gap-2 text-green-400 font-medium mb-1'>
							<span>✓</span> PIN-код установлен
						</div>
						<div className='text-sm text-gray-400'>
							Ваш аккаунт защищён PIN-кодом
						</div>
					</div>
					<div>
						<button
							onClick={() => setShowPinChange(!showPinChange)}
							className='w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition'
						>
							{showPinChange ? 'Отмена' : 'Изменить PIN-код'}
						</button>
						{showPinChange && (
							<div className='mt-4 space-y-3'>
								<input
									type='password'
									placeholder='Текущий PIN'
									className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
								/>
								<input
									type='password'
									placeholder='Новый PIN'
									className='w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
								/>
								<button className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium'>
									Сохранить
								</button>
							</div>
						)}
					</div>
					<div className='pt-4 border-t border-gray-700'>
						<button className='w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg font-medium'>
							Выйти из аккаунта
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

// === Вкладка: Достижения ===
function AchievementsTab({ unlocked, tasks, projects }) {
	const completedTasks = tasks.filter(t => t.completed).length
	const totalXP = tasks
		.filter(t => t.completed)
		.reduce((sum, t) => sum + (t.xp || 0), 0)
	const level = Math.floor(totalXP / 100) + 1

	const totalAchievements = Object.keys(ACHIEVEMENTS).length
	const unlockedCount = unlocked.length
	const progress = Math.round((unlockedCount / totalAchievements) * 100)

	const sortedAchievements = Object.values(ACHIEVEMENTS).sort((a, b) => {
		const aUnlocked = unlocked.includes(a.id)
		const bUnlocked = unlocked.includes(b.id)
		if (aUnlocked && !bUnlocked) return -1
		if (!aUnlocked && bUnlocked) return 1
		return 0
	})

	return (
		<div className='space-y-6'>
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-bold text-white'>🏆 Достижения</h3>
					<div className='text-sm text-gray-400'>
						{unlockedCount} из {totalAchievements}
					</div>
				</div>

				<div className='mb-6'>
					<div className='flex justify-between text-sm mb-2'>
						<span className='text-gray-400'>Общий прогресс</span>
						<span className='text-white font-bold'>{progress}%</span>
					</div>
					<div className='w-full bg-gray-700 rounded-full h-3'>
						<div
							className='bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all'
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6'>
					<div className='bg-gray-700/50 p-3 rounded-lg text-center'>
						<div className='text-2xl font-bold text-blue-400'>
							{tasks.length}
						</div>
						<div className='text-xs text-gray-400'>Всего задач</div>
					</div>
					<div className='bg-gray-700/50 p-3 rounded-lg text-center'>
						<div className='text-2xl font-bold text-green-400'>
							{completedTasks}
						</div>
						<div className='text-xs text-gray-400'>Выполнено</div>
					</div>
					<div className='bg-gray-700/50 p-3 rounded-lg text-center'>
						<div className='text-2xl font-bold text-purple-400'>{level}</div>
						<div className='text-xs text-gray-400'>Уровень</div>
					</div>
					<div className='bg-gray-700/50 p-3 rounded-lg text-center'>
						<div className='text-2xl font-bold text-yellow-400'>{totalXP}</div>
						<div className='text-xs text-gray-400'>XP заработано</div>
					</div>
				</div>

				<div className='space-y-3'>
					{sortedAchievements.map(achievement => {
						const isUnlocked = unlocked.includes(achievement.id)
						return (
							<div
								key={achievement.id}
								className={`flex items-center gap-4 p-4 rounded-lg border transition ${
									isUnlocked
										? 'bg-yellow-500/10 border-yellow-500/30'
										: 'bg-gray-700/30 border-gray-700 opacity-60'
								}`}
							>
								<div className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>
									{achievement.icon}
								</div>
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<h4
											className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}
										>
											{achievement.name}
										</h4>
										{isUnlocked && (
											<span className='text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded'>
												Получено
											</span>
										)}
									</div>
									<p className='text-sm text-gray-400 mt-1'>
										{achievement.description}
									</p>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

// === Вкладка: Интеграции ===
function IntegrationsTab() {
	return (
		<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
			<h3 className='text-lg font-bold text-white mb-6'>🔌 Интеграции</h3>
			<div className='space-y-4'>
				{[
					{
						icon: '📊',
						name: 'Google Calendar',
						desc: 'Синхронизация с календарём',
						btn: 'Подключить',
						disabled: false,
					},
					{
						icon: '💬',
						name: 'Telegram',
						desc: 'Уведомления в Telegram',
						btn: 'Подключить',
						disabled: false,
					},
					{
						icon: '📁',
						name: 'Google Drive',
						desc: 'Хранение файлов',
						btn: 'Скоро',
						disabled: true,
					},
				].map((item, idx) => (
					<div
						key={idx}
						className='p-4 bg-gray-700/50 rounded-lg border border-gray-700'
					>
						<div className='flex items-center justify-between mb-2'>
							<div className='flex items-center gap-3'>
								<span className='text-2xl'>{item.icon}</span>
								<div>
									<div className='text-white font-medium'>{item.name}</div>
									<div className='text-xs text-gray-500'>{item.desc}</div>
								</div>
							</div>
							<button
								className={`px-4 py-2 rounded-lg text-sm font-medium transition ${item.disabled ? 'bg-gray-600 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
								disabled={item.disabled}
							>
								{item.btn}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
