import type { TailwindConfig } from 'tailwindcss/tailwind-config';
// import rtl from "tailwindcss-rtl";
const  config = {
    content: ["./src/**/*.{html,js,ts,jsx,tsx}", "./src/**/*.css"],
    theme: {
        extend: {
            screens: {
            },
            colors: {
                babyBlue: "#89CFF0",
                softPurple: "#B19CD9",
            },
            animation:{
                'spin-slow': 'spin 5s linear infinite'
            },

        },
    },
    // plugins: [rtl()],
}satisfies TailwindConfig;

export default config;
