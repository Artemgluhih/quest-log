import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const AI_MODELS = [
	{
		id: 'qwen/qwen-2.5-7b-instruct:free',
		name: 'Qwen 2.5 7B',
		description: '⭐ Лучший русский язык',
		value: 'qwen/qwen-2.5-7b-instruct:free',
	},
	{
		id: 'google/gemma-2-9b-it:free',
		name: 'Google Gemma 2 9B',
		description: '💚 От Google, качественная',
		value: 'google/gemma-2-9b-it:free',
	},
	{
		id: 'meta-llama/llama-3.1-8b-instruct:free',
		name: 'Llama 3.1 8B',
		description: '🦙 От Meta, универсальная',
		value: 'meta-llama/llama-3.1-8b-instruct:free',
	},
	{
		id: 'mistralai/mistral-7b-instruct:free',
		name: 'Mistral 7B',
		description: '🌪️ Быстрая, стабильная',
		value: 'mistralai/mistral-7b-instruct:free',
	},
	{
		id: 'huggingfaceh4/zephyr-7b-beta:free',
		name: 'Zephyr 7B Beta',
		description: '🤗 От Hugging Face',
		value: 'huggingfaceh4/zephyr-7b-beta:free',
	},
]

export default function AssistantView({ tasks = [] }) {
	const [sessions, setSessions] = useState([])
	const [currentSessionId, setCurrentSessionId] = useState(null)
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].value)
	const [userId, setUserId] = useState(null)
	const chatEndRef = useRef(null)
	const [showModelDropdown, setShowModelDropdown] = useState(false)

	// 1. АВТОМАТИЧЕСКАЯ АВТОРИЗАЦИЯ ПРИ ЗАГРУЗКЕ
	useEffect(() => {
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (session?.user) {
				// Если пользователь уже есть (логин или аноним)
				setUserId(session.user.id)
			} else {
				// Если нет - входим АНОНИМНО
				console.log('🔐 Входим анонимно...')
				const { data, error } = await supabase.auth.signInAnonymously()

				if (error) {
					console.error('❌ Ошибка входа:', error)
				} else {
					setUserId(data.user.id)
					console.log('✅ Успешный анонимный вход:', data.user.id)
				}
			}
		}
		initAuth()
	}, [])

	// 2. ЗАГРУЗКА ЧАТОВ ПОСЛЕ ПОЛУЧЕНИЯ USER_ID
	useEffect(() => {
		if (userId) {
			loadSessions()
		}
	}, [userId])

	// 3. ЗАГРУЗКА СООБЩЕНИЙ ПРИ СМЕНЕ ЧАТА
	useEffect(() => {
		if (currentSessionId) {
			loadMessages(currentSessionId)
		}
	}, [currentSessionId])

	// Автоскролл
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// --- ФУНКЦИИ РАБОТЫ С БАЗОЙ ---

	const loadSessions = async () => {
		try {
			const { data, error } = await supabase
				.from('chat_sessions')
				.select('*')
				.eq('user_id', userId)
				.order('updated_at', { ascending: false })

			if (error) throw error

			setSessions(data || [])

			if ((!data || data.length === 0) && !currentSessionId) {
				await createNewSession()
			} else if (!currentSessionId && data?.length > 0) {
				setCurrentSessionId(data[0].id)
			}
		} catch (err) {
			console.error('❌ Ошибка загрузки сессий:', err)
		}
	}

	const loadMessages = async sessionId => {
		try {
			const { data, error } = await supabase
				.from('chat_messages')
				.select('*')
				.eq('session_id', sessionId)
				.order('created_at', { ascending: true })

			if (error) throw error
			setMessages(data || [])
		} catch (err) {
			console.error('❌ Ошибка загрузки сообщений:', err)
		}
	}

	const createNewSession = async () => {
		try {
			const newSession = {
				user_id: userId,
				title: 'Новый чат',
				updated_at: new Date().toISOString(),
			}

			const { data, error } = await supabase
				.from('chat_sessions')
				.insert(newSession)
				.select()
				.single()

			if (error) throw error

			setSessions(prev => [data, ...prev])
			setCurrentSessionId(data.id)
			setMessages([])
			console.log('✅ Сессия создана в базе:', data.id)
		} catch (err) {
			console.error('❌ Ошибка создания сессии:', err)
		}
	}

	const deleteSession = async (sessionId, e) => {
		e.stopPropagation()
		try {
			const { error } = await supabase
				.from('chat_sessions')
				.delete()
				.eq('id', sessionId)

			if (error) throw error

			const newSessions = sessions.filter(s => s.id !== sessionId)
			setSessions(newSessions)

			if (currentSessionId === sessionId) {
				setCurrentSessionId(newSessions[0]?.id || null)
			}
		} catch (err) {
			console.error('❌ Ошибка удаления:', err)
		}
	}

	const sendMessage = async () => {
		if (!input.trim() || loading || !currentSessionId) return

		const userMessage = input.trim()
		setInput('')
		setLoading(true)

		const newUserMsg = {
			role: 'user',
			content: userMessage,
			temp_id: Date.now(),
		}
		setMessages(prev => [...prev, newUserMsg])

		try {
			const context = {
				tasks: tasks.slice(0, 10).map(t => ({
					title: t.title,
					priority: t.priority,
					status: t.completed ? 'done' : 'active',
				})),
			}

			console.log('🔄 Модель:', selectedModel)
			console.log('📤 Запрос:', userMessage)

			const { data, error } = await supabase.functions.invoke('ai-assistant', {
				body: {
					message: userMessage,
					context,
					model: selectedModel,
				},
			})

			console.log('📥 Ответ:', { data, error })

			if (error) {
				console.error('❌ Supabase error:', error)
				throw error
			}

			if (!data?.choices?.[0]) {
				console.error('❌ Пустой ответ:', data)
				throw new Error(
					'Пустой ответ от AI. Проверь модель в OpenRouter: https://openrouter.ai/models',
				)
			}

			const aiResponse = data.choices[0].message.content
			const newAiMsg = {
				role: 'assistant',
				content: aiResponse,
				temp_id: Date.now() + 1,
			}
			setMessages(prev => [...prev, newAiMsg])

			// ... остальной код сохранения ...
		} catch (err) {
			console.error('❌ AI Error:', err)
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: `❌ Ошибка модели:\n\n${err.message}\n\nПопробуй другую модель из списка.`,
					temp_id: Date.now() + 1,
				},
			])
		} finally {
			setLoading(false)
		}
	}

	const quickActions = [
		{ label: '📋 Задачи', msg: 'Отсортируй задачи' },
		{ label: '🧩 Подзадачи', msg: 'Разбей на подзадачи' },
		{ label: '💰 Финансы', msg: 'Совет по инвестициям' },
		{ label: '🎮 RPG', msg: 'RPG планирование' },
	]

	return (
		<div className='h-full flex bg-gray-900'>
			{/* Боковая панель */}
			{sidebarOpen && (
				<div className='w-72 bg-gray-800 border-r border-gray-700 flex flex-col'>
					<div className='p-4 border-b border-gray-700'>
						<button
							onClick={createNewSession}
							className='w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition'
						>
							➕ Новый чат
						</button>
					</div>

					<div className='flex-1 overflow-y-auto p-2 space-y-1'>
						{sessions.length === 0 ? (
							<div className='text-center text-gray-500 text-sm py-4'>
								Загрузка...
							</div>
						) : (
							sessions.map(session => (
								<div
									key={session.id}
									onClick={() => setCurrentSessionId(session.id)}
									className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
										currentSessionId === session.id
											? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
											: 'text-gray-300 hover:bg-gray-700'
									}`}
								>
									<div className='flex-1 truncate text-sm'>
										💬 {session.title}
									</div>
									<button
										onClick={e => deleteSession(session.id, e)}
										className='opacity-0 group-hover:opacity-100 text-red-400 ml-2'
									>
										🗑️
									</button>
								</div>
							))
						)}
					</div>

					<div className='p-2 border-t border-gray-700'>
						<button
							onClick={() => setSidebarOpen(false)}
							className='w-full px-3 py-2 text-gray-400 hover:text-white transition text-sm'
						>
							← Скрыть
						</button>
					</div>
				</div>
			)}

			{/* Основной чат */}
			<div className='flex-1 flex flex-col'>
				<div className='bg-gradient-to-r from-purple-600 to-indigo-600 p-4 border-b border-purple-500/30'>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex items-center gap-3'>
							{!sidebarOpen && (
								<button
									onClick={() => setSidebarOpen(true)}
									className='text-white/80 hover:text-white transition'
								>
									☰
								</button>
							)}
							<div>
								<h1 className='text-xl font-bold text-white'>
									🤖 AI Ассистент
								</h1>
								<p className='text-purple-100 text-sm text-xs'>
									{userId ? 'Авторизован' : 'Ожидание...'}
								</p>
							</div>
						</div>

						{/* Кастомный dropdown */}
						<div className='relative'>
							<button
								onClick={() => setShowModelDropdown(!showModelDropdown)}
								className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm flex items-center gap-2 transition'
							>
								<span>🤖</span>
								<span>
									{AI_MODELS.find(m => m.value === selectedModel)?.name}
								</span>
								<span>{showModelDropdown ? '▲' : '▼'}</span>
							</button>

							{showModelDropdown && (
								<div className='absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden'>
									{AI_MODELS.map(model => (
										<button
											key={model.id}
											onClick={() => {
												setSelectedModel(model.value)
												setShowModelDropdown(false)
											}}
											className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition flex items-center gap-3 ${
												selectedModel === model.value
													? 'bg-purple-600/20 text-purple-400'
													: 'text-white'
											}`}
										>
											<span className='text-lg'>{model.icon || '🤖'}</span>
											<div>
												<div className='font-medium text-sm'>{model.name}</div>
												<div className='text-xs text-gray-400'>
													{model.description}
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						<button
							onClick={createNewSession}
							className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition'
						>
							+ Чат
						</button>
					</div>
				</div>

				{/* Быстрые действия */}
				<div className='p-3 bg-gray-800/50 border-b border-gray-700 flex gap-2 overflow-x-auto'>
					{quickActions.map((action, i) => (
						<button
							key={i}
							onClick={() => setInput(action.msg)}
							className='px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded-full whitespace-nowrap transition border border-gray-600'
						>
							{action.label}
						</button>
					))}
				</div>

				{/* Сообщения */}
				<div className='flex-1 overflow-y-auto p-4 space-y-4'>
					{messages.length === 0 ? (
						<div className='text-center py-12 text-gray-400'>
							<div className='text-6xl mb-4'>👋</div>
							<h3 className='text-lg font-medium text-white mb-2'>Привет!</h3>
							<p className='text-sm'>Выбери модель и задай вопрос</p>
						</div>
					) : (
						messages.map((msg, i) => (
							<div
								key={i}
								className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
										msg.role === 'user'
											? 'bg-purple-600 text-white rounded-br-md shadow-lg'
											: 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700 shadow'
									}`}
								>
									{msg.content}
								</div>
							</div>
						))
					)}
					{loading && (
						<div className='flex justify-start'>
							<div className='bg-gray-800 text-gray-400 p-4 rounded-2xl rounded-bl-md text-sm animate-pulse border border-gray-700'>
								🤔 Думаю...
							</div>
						</div>
					)}
					<div ref={chatEndRef} />
				</div>

				{/* Ввод */}
				<div className='p-4 border-t border-gray-700 bg-gray-800/50'>
					<div className='flex gap-3 max-w-4xl mx-auto'>
						<input
							type='text'
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && sendMessage()}
							placeholder='Напиши сообщение...'
							className='flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 placeholder-gray-400'
							disabled={loading}
						/>
						<button
							onClick={sendMessage}
							disabled={loading || !input.trim()}
							className='px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition font-medium shadow-lg shadow-purple-500/20'
						>
							➤
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
