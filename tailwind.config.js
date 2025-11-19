/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#030014",
                secondary: "#151312",
                light: {
                    100: "#D6C7FF",
                    200: "#A8B5DB",
                    300: "#9CA4AB",
                },
                dark: {
                    100: "#221F3D",
                    200: "#0F0D23",
                },
                ratingBox: "#221F3D",
                searchBar: "#0F0D23",
                text: "#9CA4AB",
                accent: "#AB8BFF",
                secondaryText: "#D6C7FF",
            },
        },
    },
    plugins: [],
};