import { defineThemes } from './theme.models';

export const { themes: appThemes, useTheme: useAppTheme } = defineThemes({
  light: {
    background: '#ffffff',
    text: {
      baseColor: '#333639',
      mutedColor: '#767c82',
    },
    default: {
      color: 'rgba(46, 51, 56, 0.05)',
      colorHover: 'rgba(46, 51, 56, 0.09)',
      colorPressed: 'rgba(46, 51, 56, 0.22)',
    },
    primary: {
      color: '#312E81',
      colorHover: '#3730A3',
      colorPressed: '#1E1B4B',
      colorFaded: '#312E812f',
    },
    warning: {
      color: '#F97316',
      colorHover: '#EA580C',
      colorPressed: '#C2410C',
      colorFaded: '#F973162f',
    },
    success: {
      color: '#10b981',
      colorHover: '#059669',
      colorPressed: '#047857',
      colorFaded: '#10b9812f',
    },
    error: {
      color: '#ef4444',
      colorHover: '#dc2626',
      colorPressed: '#b91c1c',
      colorFaded: '#ef44442a',
    },
  },
  dark: {
    background: '#0F0F23',
    text: {
      baseColor: '#F8FAFC',
      mutedColor: '#94A3B8',
    },
    default: {
      color: 'rgba(255, 255, 255, 0.08)',
      colorHover: 'rgba(255, 255, 255, 0.12)',
      colorPressed: 'rgba(255, 255, 255, 0.24)',
    },
    primary: {
      color: '#312E81',
      colorHover: '#3730A3',
      colorPressed: '#1E1B4B',
      colorFaded: '#312E812f',
    },
    warning: {
      color: '#f59e0b',
      colorHover: '#f59e0b',
      colorPressed: '#f59e0b',
      colorFaded: '#f59e0b2f',
    },
    success: {
      color: '#18a058',
      colorHover: '#36ad6a',
      colorPressed: '#0c7a43',
      colorFaded: '#18a0582f',
    },
    error: {
      color: '#e88080',
      colorHover: '#e98b8b',
      colorPressed: '#e57272',
      colorFaded: '#e8808029',
    },
  },
});
