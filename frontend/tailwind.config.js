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
        // CIT Brand Colors
        'cit-navy': '#002B5C',
        'cit-gold': '#F4B41A',
        'cit-light': '#F5F5F5',
        'cit-text': '#333333',
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
        xl: "8px",
        "2xl": "8px",
        "3xl": "8px",
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
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 43, 92, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 43, 92, 0.12)',
        'button': '0 2px 4px rgba(0, 43, 92, 0.15)',
        'nav': '0 2px 8px rgba(0, 43, 92, 0.1)',
      },
    },
  },
  plugins: [],
}