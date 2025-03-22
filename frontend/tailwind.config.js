/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6c5ce7", // Violet
        secondary: "#ff7675", // Pink
        accent: "#0984e3", // Blue
        dark: "#1e1e1e", // Black/Grey background
      },
    },
  },
  plugins: [],
};
