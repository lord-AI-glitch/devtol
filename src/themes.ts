import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: '"JetBrains Mono", monospace',
    primaryColor: '#312E81',
    primaryColorHover: '#3730A3',
    primaryColorPressed: '#1E1B4B',
    primaryColorSuppl: '#4338CA',
    warningColor: '#F97316',
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: { color: '#f8fafc' },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: '"JetBrains Mono", monospace',
    primaryColor: '#312E81',
    primaryColorHover: '#3730A3',
    primaryColorPressed: '#1E1B4B',
    primaryColorSuppl: '#4338CA',
    warningColor: '#F97316',
    textColorBase: '#F8FAFC',
    baseColor: '#0F0F23',
    bodyColor: '#0F0F23',
    cardColor: '#1B1B30',
    modalColor: '#1B1B30',
    popoverColor: '#1B1B30',
    borderColor: '#282845',
  },

  Notification: {
    color: '#1B1B30',
    textColor: '#F8FAFC',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1B1B30' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#0F0F23',
    siderColor: '#14142B',
    siderBorderColor: '#282845',
  },

  Card: {
    color: '#1B1B30',
    borderColor: '#282845',
    textColor: '#F8FAFC',
  },

  Table: {
    tdColor: '#1B1B30',
    thColor: '#15152A',
    borderColor: '#282845',
  },
};
