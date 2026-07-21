export interface DismissableLayer {
  element: Element | null;
  onEscape?: (event: KeyboardEvent) => void;
}

interface RegisteredLayer extends DismissableLayer {
  order: number;
}

interface DocumentLayerState {
  layers: RegisteredLayer[];
  handleKeyDown: (event: KeyboardEvent) => void;
}

interface DismissableLayerState {
  documents: Map<Document, DocumentLayerState>;
  nextOrder: number;
}

const STATE_KEY = Symbol.for('@duralux/ui/dismissable-layer-state');

function getState(): DismissableLayerState {
  const scope = globalThis as typeof globalThis & Record<PropertyKey, unknown>;
  const existing = scope[STATE_KEY] as DismissableLayerState | undefined;
  if (existing) return existing;

  const state: DismissableLayerState = {
    documents: new Map(),
    nextOrder: 0,
  };
  scope[STATE_KEY] = state;
  return state;
}

const state = getState();

function topmostLayer(layers: RegisteredLayer[]) {
  let topmost = layers.reduce<RegisteredLayer | undefined>((latest, layer) => (
    !latest || layer.order > latest.order ? layer : latest
  ), undefined);

  while (topmost?.element) {
    const nested = layers.reduce<RegisteredLayer | undefined>((latest, layer) => {
      if (
        layer === topmost
        || !layer.element
        || !topmost?.element?.contains(layer.element)
      ) {
        return latest;
      }
      return !latest || layer.order > latest.order ? layer : latest;
    }, undefined);
    if (!nested) break;
    topmost = nested;
  }

  return topmost;
}

export function registerDismissableLayer(layer: DismissableLayer) {
  const ownerDocument = layer.element?.ownerDocument
    ?? (typeof document === 'undefined' ? null : document);
  if (!ownerDocument) return () => {};

  let documentState = state.documents.get(ownerDocument);
  if (!documentState) {
    const layers: RegisteredLayer[] = [];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const topmost = topmostLayer(layers);
      if (!topmost) return;

      event.preventDefault();
      topmost.onEscape?.(event);
    };
    documentState = { layers, handleKeyDown };
    state.documents.set(ownerDocument, documentState);
    ownerDocument.addEventListener('keydown', handleKeyDown);
  }

  const entry: RegisteredLayer = {
    ...layer,
    order: state.nextOrder++,
  };
  documentState.layers.push(entry);

  let registered = true;
  return () => {
    if (!registered) return;
    registered = false;

    const index = documentState.layers.indexOf(entry);
    if (index !== -1) documentState.layers.splice(index, 1);
    if (documentState.layers.length > 0) return;

    ownerDocument.removeEventListener('keydown', documentState.handleKeyDown);
    if (state.documents.get(ownerDocument) === documentState) {
      state.documents.delete(ownerDocument);
    }
  };
}
