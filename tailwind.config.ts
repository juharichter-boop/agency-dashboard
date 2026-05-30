import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds - Ultra Dark
        'bg-canvas': '#050505',     // Primary page background
        'bg-sidebar': '#101010',    // Sidebar background
        'bg-surface': '#151515',    // Card and container fill
        'bg-elevated': '#1A1A1A',   // Elevated cards, hover states

        // Neon Accents - Full Saturation (for alerts, critical UI, data viz)
        'neon-green': '#9BE000',    // Positive, active, primary actions
        'neon-blue': '#00B8FF',     // Information, secondary actions, trends
        'neon-amber': '#FFC62A',    // Warnings, medium priority, utilization
        'neon-red': '#FF7A7A',      // Negative, critical, errors, overdue

        // Desaturated Accents (for routine UI, buttons, secondary actions)
        'accent-green': '#6B9B00',  // Desaturated green
        'accent-blue': '#0085B8',   // Desaturated blue
        'accent-amber': '#C49A00',  // Desaturated amber
        'accent-red': '#CC3333',    // Desaturated red

        // Typography Colors
        'text-primary': '#F5F5F5',  // Primary text
        'text-secondary': '#A5A5A5', // Secondary text, metadata
        'text-muted': '#666666',    // Muted labels, minimal hierarchy

        // Borders & Dividers
        'border-subtle': 'rgba(255,255,255,0.06)', // Subtle structural lines
        'border-light': 'rgba(255,255,255,0.12)',  // Light hover/active state borders
        'border-glow': 'rgba(155,224,0,0.2)',      // Neon green glow on active

        // Semantic Colors
        'status-available': '#9BE000',   // Team member available (neon green)
        'status-busy': '#00B8FF',        // Team member busy (electric blue)
        'status-away': '#A5A5A5',        // Team member away (muted)
        'trend-positive': '#9BE000',     // Revenue up, hours up (green)
        'trend-negative': '#FF7A7A',     // Revenue down, hours down (red)
        'trend-neutral': '#A5A5A5',      // No change, flat (gray)
        'alert-critical': '#FF7A7A',     // Critical alert, overdue (red)
        'alert-warning': '#FFC62A',      // Warning alert, caution (amber)
        'alert-info': '#00B8FF',         // Info badge (blue)
        'alert-success': '#9BE000',      // Success, completed (green)
      },

      spacing: {
        // Custom spacing (additional to standard Tailwind scale)
        // Standard 4px increments: 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, etc.
        // Using standard Tailwind scale which is already 4px-based
      },

      fontSize: {
        // Exact typography scale from DESIGN_REFINEMENTS.md
        // Format: [size, { lineHeight, letterSpacing }]
        'xs': ['11px', { lineHeight: '1.4', letterSpacing: '0' }],
        'sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.05em' }], // Labels with letter-spacing
        'base': ['14px', { lineHeight: '1.6', letterSpacing: '0' }],    // Body text
        'lg': ['16px', { lineHeight: '1.6', letterSpacing: '0' }],      // Larger body
        'xl': ['20px', { lineHeight: '1.2', letterSpacing: '0' }],      // Subsection title
        '2xl': ['28px', { lineHeight: '1.2', letterSpacing: '0' }],     // Section title
        '3xl': ['36px', { lineHeight: '1', letterSpacing: '0' }],       // Large KPI (optional)
        '4xl': ['48px', { lineHeight: '1', letterSpacing: '0' }],       // KPI Metric (hero)
      },

      fontWeight: {
        // Ensuring we have the weights needed
        400: '400', // regular
        500: '500', // medium (for labels)
        600: '600', // semibold (for titles)
        700: '700', // bold (for metrics)
      },

      fontFamily: {
        // Geist family
        'sans': [
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        'mono': [
          'Geist Mono',
          'JetBrains Mono',
          '"Courier New"',
          'monospace',
        ],
      },

      transitionTimingFunction: {
        'ease-out-quart': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      animation: {
        // Standard animations used in dashboard
        'fade-in': 'fadeIn 300ms ease-out-quart forwards',
        'scale-up': 'scaleUp 300ms ease-out-quart forwards',
        'slide-in': 'slideIn 300ms ease-out-quart forwards',
        'lift': 'lift 200ms ease-out-quart forwards',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleUp: {
          from: {
            opacity: '0',
            transform: 'scale(0.98)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        lift: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-2px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      boxShadow: {
        // Minimal shadows (rarely used, mostly thin borders instead)
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'glow-green': '0 0 0 3px rgba(155,224,0,0.2)',
        'glow-red': '0 0 0 3px rgba(255,122,122,0.1)',
      },

      borderRadius: {
        // Exact radius values from spec
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '9999px',
      },

      maxWidth: {
        // Max container width from spec
        'screen-2xl': '1400px',
      },

      zIndex: {
        // Standard z-index scale
        'hide': '-1',
        'base': '0',
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'tooltip': '60',
        'notification': '70',
      },
    },
  },

  plugins: [],
} satisfies Config;

export default config;
