/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // CIT Brand Colors - Enhanced
        'cit-navy': '#002B5C',
        'cit-navy-light': '#003D7A',
        'cit-navy-dark': '#001F42',
        'cit-gold': '#F4B41A',
        'cit-gold-light': '#FFD54F',
        'cit-gold-dark': '#D99E0B',
        'cit-light': '#F5F5F5',
        'cit-text': '#333333',
        // New vibrant colors
        'electric-blue': '#00D4FF',
        'neon-cyan': '#00F5D4',
        'pulse-green': '#00E676',
        'hot-pink': '#FF4081',
        'sunset-orange': '#FF6B35',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Category colors - CIT themed
        help: {
          DEFAULT: "hsl(var(--help))",
          bg: "hsl(var(--help-bg))",
          border: "hsl(var(--help-border))",
          50: "#E8F0F8",
          100: "#D1E1F1",
          500: "#002B5C",
          600: "#001F42",
        },
        life: {
          DEFAULT: "hsl(var(--life))",
          bg: "hsl(var(--life-bg))",
          border: "hsl(var(--life-border))",
          50: "#FEF9E7",
          100: "#FDF3CF",
          500: "#F4B41A",
          600: "#D99E0B",
        },
        opportunity: {
          DEFAULT: "hsl(var(--opportunity))",
          bg: "hsl(var(--opportunity-bg))",
          border: "hsl(var(--opportunity-border))",
          50: "#E8F0F8",
          100: "#D1E1F1",
          500: "#003D7A",
          600: "#002B5C",
        },
        issue: {
          DEFAULT: "hsl(var(--issue))",
          bg: "hsl(var(--issue-bg))",
          border: "hsl(var(--issue-border))",
          50: "#FEF9E7",
          100: "#FDF3CF",
          500: "#F4B41A",
          600: "#D99E0B",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      fontSize: {
        // CIT Typography system
        'heading-1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-regular': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-tiny': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(244, 180, 26, 0.5), 0 0 10px rgba(244, 180, 26, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(244, 180, 26, 0.8), 0 0 20px rgba(244, 180, 26, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 43, 92, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 43, 92, 0.15)',
        'button': '0 2px 4px rgba(0, 43, 92, 0.15)',
        'nav': '0 2px 8px rgba(0, 43, 92, 0.1)',
        'glow-gold': '0 0 20px rgba(244, 180, 26, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-navy': '0 0 30px rgba(0, 43, 92, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(244, 180, 26, 0.1)',
        'glass': '0 8px 32px rgba(0, 43, 92, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #002B5C 0%, #003D7A 50%, #001F42 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
