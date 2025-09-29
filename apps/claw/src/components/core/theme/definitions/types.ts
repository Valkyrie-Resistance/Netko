export const ThemeEnum = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
} as const

export type Theme = (typeof ThemeEnum)[keyof typeof ThemeEnum]

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}
