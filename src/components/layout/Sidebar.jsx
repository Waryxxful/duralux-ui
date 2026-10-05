import { useLocation } from 'react-router-dom'
import { NavCore } from '../shell/navigationCore'
import { createRouterNav } from './routerNavAdapter'

export function Sidebar({
  navItems = [],
  logo,
  logoAbbr,
  promoCard,
  mobileOpen = false,
  onNavigate,
  navigationId = 'duralux-sidebar',
}) {
  const { pathname } = useLocation()
  const router = createRouterNav({ navItems, pathname, onNavigate })

  return (
    <NavCore
      brand={{
        href: '/',
        logoLg: logo,
        logoSm: logoAbbr,
        alt: 'Logo',
      }}
      sections={router.sections}
      adapter={router.adapter}
      mobileOpen={mobileOpen}
      navigationId={navigationId}
      promoCard={promoCard}
    />
  )
}
