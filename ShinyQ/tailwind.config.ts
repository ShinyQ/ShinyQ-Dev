import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
    darkMode: "class",
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                mono: ["'JetBrains Mono'", "monospace"],
                sans: ["Inter", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))"
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))"
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))"
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))"
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))"
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" }
                },
                "marquee": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" }
                },
                "marquee-slow": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" }
                },
                "marquee-fast": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" }
                },
                "logo-spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" }
                },
                "blink": {
                    "0%, 49%": { opacity: "1" },
                    "50%, 100%": { opacity: "0" }
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.5s ease-out forwards",
                "marquee": "marquee 25s linear infinite",
                "marquee-slow": "marquee-slow 35s linear infinite",
                "marquee-fast": "marquee-fast 15s linear infinite",
                "logo-spin": "logo-spin 20s linear infinite",
                "blink": "blink 1s step-end infinite",
                "float": "float 6s ease-in-out infinite"
            },
        }
    },
    plugins: [animate],
} satisfies Config;
