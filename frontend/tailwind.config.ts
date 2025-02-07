import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            'h1, h2, h3, h4': {
              color: '#091E42',
              fontWeight: '600',
            },
            p: {
              color: 'rgba(9, 30, 66, 0.8)',
              lineHeight: '1.75',
            },
            a: {
              color: '#FF8B00',
              textDecoration: 'none',
              '&:hover': {
                color: '#E67E00',
              },
            },
            strong: {
              color: '#091E42',
            },
            ul: {
              li: {
                '&::marker': {
                  color: '#FF8B00',
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
