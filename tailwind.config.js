/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Some boilerplates use a 'src' folder
  ],
  theme: {
    extend: {
      colors: {
        sentientGreen: '#1b270e',
        sentientSage: '#c9ccbb',
        sentientGold: '#b5a642',
      },
    },
  },
  plugins: [],
}
