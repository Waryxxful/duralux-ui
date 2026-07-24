import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// jsdom no implementa ResizeObserver; Radix (Popover y primitivos futuros
// sobre el mismo positioning engine) lo requiere para medir el trigger.
globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom tampoco implementa scrollIntoView (cmdk lo llama al mover la
// selección con teclado/mouse en Combobox).
Element.prototype.scrollIntoView ??= () => {}
