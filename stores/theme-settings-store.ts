import { create } from 'zustand'

interface ThemeSettings {
  language: string
  theme: string
}

interface ThemeSettingsState {
  settings: ThemeSettings
}

export const useThemeSettingsStore = create<ThemeSettingsState>((set) => ({
    settings: {
        language: 'en',
        theme: 'dark'
    },

}))