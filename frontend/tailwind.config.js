/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./public/index.html"
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// Enhanced Futuristic Medical Palette
				neon: {
					cyan: "#00f3ff",
					blue: "#0066ff",
					purple: "#bc13fe",
					green: "#0aff68",
					pink: "#ff00aa",
					orange: "#ff6b00"
				},
				aurora: {
					teal: "#14b8a6",
					indigo: "#6366f1",
					violet: "#8b5cf6",
					fuchsia: "#d946ef",
					rose: "#f43f5e"
				},
				void: {
					DEFAULT: "#030712",
					light: "#111827",
					lighter: "#1f2937",
					dark: "#010409"
				}
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'slow-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)' },
					'50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0, 243, 255, 0.8)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'aurora': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.2), 0 0 20px rgba(0, 243, 255, 0.1)' },
					'50%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.4), 0 0 40px rgba(0, 243, 255, 0.2)' }
				},
				'border-glow': {
					'0%, 100%': { borderColor: 'rgba(0, 243, 255, 0.3)' },
					'50%': { borderColor: 'rgba(0, 243, 255, 0.8)' }
				},
				'twinkle': {
					'0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.2)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'counter': {
					'0%': { '--num': '0' },
					'100%': { '--num': 'var(--target)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slow-spin': 'slow-spin 20s linear infinite',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'aurora': 'aurora 15s ease infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'border-glow': 'border-glow 2s ease-in-out infinite',
				'twinkle': 'twinkle 3s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out'
			},
			boxShadow: {
				'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.3), 0 0 40px rgba(0, 243, 255, 0.1)',
				'neon-purple': '0 0 20px rgba(188, 19, 254, 0.3), 0 0 40px rgba(188, 19, 254, 0.1)',
				'neon-green': '0 0 20px rgba(10, 255, 104, 0.3), 0 0 40px rgba(10, 255, 104, 0.1)',
				'aurora': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 243, 255, 0.1)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
				'aurora-gradient': 'linear-gradient(-45deg, #00f3ff, #0066ff, #bc13fe, #ff00aa, #00f3ff)',
				'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(190,100%,50%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,100%,60%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(280,100%,50%,0.1) 0px, transparent 50%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
