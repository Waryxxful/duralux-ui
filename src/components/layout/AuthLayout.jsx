import { useEffect } from 'react'

export function AuthLayout({ children }) {
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-pc-preset', 'preset-1')
    el.setAttribute('data-pc-direction', 'ltr')
    el.setAttribute('data-pc-theme', 'light')
  }, [])

  return <>{children}</>
}
