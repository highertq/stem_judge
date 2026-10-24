import { useEffect, useState } from 'react'

/**
 * The theme actually applied to <html>. The SSR loader value is wrong for one
 * case — a cookie-less visitor whose OS prefers light (the pre-paint script in
 * __root flips the class before React hydrates) — so consumers that render
 * theme-dependent UI (toggle icon, toast palette) re-read the DOM after mount.
 */
export function useResolvedTheme(ssrTheme: 'light' | 'dark'): 'light' | 'dark' {
  const [theme, setTheme] = useState(ssrTheme)
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
  }, [ssrTheme])
  return theme
}
