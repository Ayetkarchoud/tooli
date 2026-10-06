// Tells the Radix/shadcn components (menus, selects, tabs…) the reading direction, so arrow keys,
// submenus and alignment follow Arabic's right-to-left. <html dir> itself is set by src/lib/i18n.js.

import { Direction } from 'radix-ui'
import { useTranslation } from 'react-i18next'

export default function DirectionProvider({ children }) {
  const { i18n } = useTranslation()
  return <Direction.Provider dir={i18n.dir(i18n.resolvedLanguage)}>{children}</Direction.Provider>
}
