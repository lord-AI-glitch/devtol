import { darken } from '../color/color.models';
import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';

import WarningIcon from '~icons/mdi/alert-circle-outline';
import ErrorIcon from '~icons/mdi/close-circle-outline';
import InfoIcon from '~icons/mdi/information-outline';
import SuccessIcon from '~icons/mdi/check-circle-outline';

export const { useTheme } = defineThemes({
  dark: {
    warning: {
      backgroundColor: appThemes.dark.warning.colorFaded,
      borderColor: appThemes.dark.warning.color,
      textColor: appThemes.dark.warning.color,
      icon: WarningIcon,
    },
    error: {
      backgroundColor: appThemes.dark.error.colorFaded,
      borderColor: appThemes.dark.error.color,
      textColor: appThemes.dark.error.color,
      icon: ErrorIcon,
    },
    info: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
      textColor: '#60a5fa',
      icon: InfoIcon,
    },
    success: {
      backgroundColor: appThemes.dark.success.colorFaded,
      borderColor: appThemes.dark.success.color,
      textColor: appThemes.dark.success.color,
      icon: SuccessIcon,
    },
  },
  light: {
    warning: {
      backgroundColor: appThemes.light.warning.colorFaded,
      borderColor: appThemes.light.warning.color,
      textColor: darken(appThemes.light.warning.color, 40),
      icon: WarningIcon,
    },
    error: {
      backgroundColor: appThemes.light.error.colorFaded,
      borderColor: appThemes.light.error.color,
      textColor: darken(appThemes.light.error.color, 40),
      icon: ErrorIcon,
    },
    info: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      textColor: '#1d4ed8',
      icon: InfoIcon,
    },
    success: {
      backgroundColor: appThemes.light.success.colorFaded,
      borderColor: appThemes.light.success.color,
      textColor: darken(appThemes.light.success.color, 40),
      icon: SuccessIcon,
    },
  },
});
