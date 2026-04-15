const TEST_EMAIL = 'artemgkuhih@gmail.com' // ← ЗАМЕНИ НА СВОЮ ПОЧТУ!
const PROJECT_URL = 'https://eltwrlyuingwlrccrjso.supabase.co'
const ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHdybHl1aW5nd2xyY2NyanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjI3ODAsImV4cCI6MjA5MTY5ODc4MH0.avsThNJEsIWSmIA7EFm3fqmcyzIrTdECVaKTMSND2yk' // ← Вставь свой anon key из Supabase Dashboard

async function testEmail() {
	const code = Math.floor(100000 + Math.random() * 900000).toString()

	console.log('📤 Отправка тестового email...')
	console.log('Email:', TEST_EMAIL)
	console.log('Code:', code)

	try {
		const response = await fetch(
			`${PROJECT_URL}/functions/v1/send-verification-email`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					apikey: ANON_KEY,
					Authorization: `Bearer ${ANON_KEY}`,
				},
				body: JSON.stringify({
					email: TEST_EMAIL,
					code: code,
				}),
			},
		)

		const result = await response.json()

		if (response.ok) {
			console.log('✅ Успех! Email отправлен.')
			console.log('Ответ сервера:', result)
		} else {
			console.log('❌ Ошибка:', result)
		}
	} catch (error) {
		console.error('❌ Ошибка сети:', error)
	}
}

testEmail()
