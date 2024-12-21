/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}', // Adjust this based on your file structure
		'./app/**/*.{html,js,svelte,ts}',
		'./studio/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			gridTemplateColumns: {
				15: 'repeat(15, minmax(0, 1fr))' // Adds grid-cols-15
			}
		}
	},
	plugins: []
};
