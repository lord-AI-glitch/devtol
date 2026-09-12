import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#1B1B30',
    borderColor: '#282845',
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
});
