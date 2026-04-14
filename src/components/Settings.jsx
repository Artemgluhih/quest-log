import { useState } from 'react'
import { ACHIEVEMENTS } from '../utils/achievements'
import emailjs from '@emailjs/browser'

export default function Settings({
	theme,
	appTheme,
	isCompact,
	onThemeChange,
	onAppThemeChange,
	onCompactChange,
	onClearData,
	unlockedAchievements,
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
				return <AchievementsTab unlocked={unlockedAchievements} />
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

  // Загрузка данных при монтировании
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

  const handleAvatarChange = (e) => {
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
    
    // Генерация кода
const handleSendCode = async () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // ОТПРАВКА EMAIL ЧЕРЕЗ EMAILJS (бесплатно до 200 писем/месяц)
    try {
      // 1. Зарегистрируйся на https://www.emailjs.com/
      // 2. Создай сервис (Gmail или другой)
      // 3. Создай шаблон письма с переменными {{code}}
      // 4. Установи: npm install @emailjs/browser
      // 5. Раскомментируй этот код:
      
      await emailjs.send(
        'service_s2yekjd',
        'Ytemplate_w3fzht9',
        {
          to_email: email,
          code: code
        },
        'LGUyK-S-41ICVcsYP'
      )
    
      
      // ВРЕМЕННО: показываем код в alert
      alert(`Код подтверждения: ${code}\n(Отправлен на ${email})`)
      
    } catch (error) {
      console.error('Ошибка отправки:', error)
      alert('Не удалось отправить код. Попробуйте позже.')
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
    const profileData = {
      name,
      email,
      avatar,
      isEmailVerified,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('questLog_profile', JSON.stringify(profileData))
    alert('✅ Профиль сохранен!')
    
    // Если используешь Supabase, можешь сохранить туда тоже:
    // await supabase.from('profiles').upsert(profileData)
  }

  const handleRemoveAvatar = () => {
    setAvatar(null)
    setAvatarPreview(null)
  }

  return (
    // ... (тот же JSX код что был выше)
  )
} (
		<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
			<h3 className='text-lg font-bold text-white mb-6'>👤 Профиль</h3>

			<div className='space-y-6'>
				{/* Аватар */}
				<div className='flex items-center gap-6'>
					<div className='relative'>
						<div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden'>
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt='Avatar'
									className='w-full h-full object-cover'
								/>
							) : (
								name.charAt(0).toUpperCase()
							)}
						</div>
						<label className='absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transition border-2 border-gray-800'>
							<span className='text-sm'>📷</span>
							<input
								type='file'
								accept='image/*'
								onChange={handleAvatarChange}
								className='hidden'
							/>
						</label>
						{avatarPreview && (
							<button
								onClick={handleRemoveAvatar}
								className='absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-xs transition border-2 border-gray-800'
							>
								✕
							</button>
						)}
					</div>
					<div>
						<button
							onClick={() =>
								document.querySelector('input[type="file"]').click()
							}
							className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition'
						>
							Изменить аватар
						</button>
						<p className='text-xs text-gray-500 mt-2'>JPG, PNG до 2MB</p>
					</div>
				</div>

				{/* Имя */}
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

				{/* Email */}
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
								className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap'
							>
								Отправить код
							</button>
						) : (
							<span className='px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium border border-green-600/30'>
								Подтвержден
							</span>
						)}
					</div>
				</div>

				{/* Поле ввода кода */}
				{showVerification && (
					<div className='p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg'>
						<label className='block text-sm text-blue-400 mb-2'>
							Введите код подтверждения
						</label>
						<div className='flex gap-2'>
							<input
								type='text'
								value={verificationCode}
								onChange={e => setVerificationCode(e.target.value)}
								className='flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest'
								placeholder='000000'
								maxLength='6'
							/>
							<button
								onClick={handleVerifyEmail}
								className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition'
							>
								Подтвердить
							</button>
						</div>
					</div>
				)}

				{/* Кнопка сохранения */}
				<div className='pt-4 border-t border-gray-700 flex gap-3'>
					<button
						onClick={handleSave}
						className='px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition'
					>
						Сохранить изменения
					</button>
					<button
						onClick={() => {
							setName('User')
							setEmail('')
							setAvatar(null)
							setAvatarPreview(null)
							setIsEmailVerified(false)
						}}
						className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition'
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
	return (
		<div className='space-y-6'>
			<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
				<h3 className='text-lg font-bold text-white mb-6'>🎨 Внешний вид</h3>

				<div className='space-y-6'>
					<div>
						<label className='block text-sm text-gray-400 mb-3'>
							Тема оформления
						</label>
						<div className='flex gap-3'>
							<button
								onClick={() => onThemeChange('light')}
								className={`flex-1 p-4 rounded-lg border-2 transition ${
									theme === 'light'
										? 'border-blue-500 bg-white text-gray-900'
										: 'border-gray-700 bg-gray-700 text-gray-300'
								}`}
							>
								☀️ Светлая
							</button>
							<button
								onClick={() => onThemeChange('dark')}
								className={`flex-1 p-4 rounded-lg border-2 transition ${
									theme === 'dark'
										? 'border-blue-500 bg-gray-900 text-white'
										: 'border-gray-700 bg-gray-700 text-gray-300'
								}`}
							>
								🌙 Тёмная
							</button>
						</div>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-3'>
							Цветовая схема
						</label>
						<div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
							{[
								{ id: 'default', name: 'Синяя', color: 'bg-blue-500' },
								{ id: 'theme-green', name: 'Зеленая', color: 'bg-green-500' },
								{ id: 'theme-purple', name: 'Фиолет.', color: 'bg-purple-500' },
								{ id: 'theme-red', name: 'Красная', color: 'bg-red-500' },
								{ id: 'theme-orange', name: 'Оранж.', color: 'bg-orange-500' },
							].map(t => (
								<button
									key={t.id}
									onClick={() => onAppThemeChange(t.id)}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										appTheme === t.id
											? 'border-blue-500 bg-gray-700'
											: 'border-gray-700 hover:bg-gray-750'
									}`}
								>
									<div
										className={`w-8 h-8 rounded-full ${t.color} ${appTheme === t.id ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
									></div>
									<span className='text-xs text-gray-300'>{t.name}</span>
								</button>
							))}
						</div>
					</div>

					<div className='flex items-center justify-between py-3 border-t border-gray-700'>
						<div>
							<div className='text-white font-medium'>Компактный режим</div>
							<div className='text-xs text-gray-500'>Уменьшает отступы</div>
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
			</div>
		</div>
	)
}

// === Вкладка: Уведомления ===
function NotificationsTab() {
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		deadline: true,
		achievements: true,
	})

	return (
		<div className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
			<h3 className='text-lg font-bold text-white mb-6'>🔔 Уведомления</h3>

			<div className='space-y-4'>
				{[
					{
						key: 'email',
						title: 'Email уведомления',
						desc: 'Получать уведомления на почту',
					},
					{
						key: 'push',
						title: 'Push уведомления',
						desc: 'Показывать уведомления в браузере',
					},
					{
						key: 'deadline',
						title: 'Дедлайны',
						desc: 'Напоминания о приближающихся дедлайнах',
					},
					{
						key: 'achievements',
						title: 'Достижения',
						desc: 'Уведомлять о новых достижениях',
					},
				].map(item => (
					<div
						key={item.key}
						className='flex items-center justify-between py-3 border-b border-gray-700 last:border-0'
					>
						<div>
							<div className='text-white font-medium'>{item.title}</div>
							<div className='text-xs text-gray-500'>{item.desc}</div>
						</div>
						<button
							onClick={() =>
								setNotifications({
									...notifications,
									[item.key]: !notifications[item.key],
								})
							}
							className={`w-12 h-6 rounded-full relative transition ${notifications[item.key] ? 'bg-blue-500' : 'bg-gray-600'}`}
						>
							<span
								className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications[item.key] ? 'left-6' : 'left-0.5'}`}
							></span>
						</button>
					</div>
				))}
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
								<button className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition'>
									Сохранить
								</button>
							</div>
						)}
					</div>

					<div className='pt-4 border-t border-gray-700'>
						<button className='w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg font-medium transition'>
							Выйти из аккаунта
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

// === Вкладка: Достижения ===
function AchievementsTab({ unlocked }) {
	const totalAchievements = Object.keys(ACHIEVEMENTS).length
	const unlockedCount = unlocked.length
	const progress = Math.round((unlockedCount / totalAchievements) * 100)

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

				<div className='space-y-3'>
					{Object.values(ACHIEVEMENTS).map(achievement => {
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
								className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
									item.disabled
										? 'bg-gray-600 cursor-not-allowed text-white'
										: 'bg-blue-600 hover:bg-blue-500 text-white'
								}`}
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
