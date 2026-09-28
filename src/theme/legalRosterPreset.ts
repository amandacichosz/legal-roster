import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

const legalRosterPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#edf7ff',
      100: '#d7ecff',
      200: '#b9ddff',
      300: '#88c8ff',
      400: '#50a9f5',
      500: '#2889dc',
      600: '#176dbb',
      700: '#165795',
      800: '#184b7b',
      900: '#1b4066',
      950: '#132941',
      color: '{primary.600}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.700}',
      activeColor: '{primary.800}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8faf9',
          100: '#eef3f1',
          200: '#dbe5e2',
          300: '#c4d3ce',
          400: '#92a9a2',
          500: '#6f8780',
          600: '#536a64',
          700: '#40524e',
          800: '#2f3d3a',
          900: '#202b29',
          950: '#121917',
        },
        text: {
          color: '#1f2a37',
          hoverColor: '#111827',
          mutedColor: '#64748b',
          hoverMutedColor: '#475569',
        },
        content: {
          background: '#ffffff',
          hoverBackground: '#f2f6f5',
          borderColor: '#dbe5e2',
          color: '#1f2a37',
          hoverColor: '#111827',
        },
        highlight: {
          background: '#e7f3ff',
          focusBackground: '#d7ecff',
          color: '#165795',
          focusColor: '#132941',
        },
        formField: {
          background: '#ffffff',
          borderColor: '#cbd8d4',
          hoverBorderColor: '#8ea5a0',
          focusBorderColor: '{primary.color}',
          color: '#1f2a37',
          placeholderColor: '#718096',
        },
      },
    },
  },
})

export default legalRosterPreset
