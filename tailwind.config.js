/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: 'var(--color-primary)',
				'primary-hover': 'var(--color-primary-hover)',
				'primary-light': 'var(--color-primary-light)',
			},
		},
	},
	plugins: [],
}
