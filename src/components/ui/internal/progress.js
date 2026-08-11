const DEFAULT_PROGRESS_MAX = 100

function toFiniteNumber(value, fallback) {
  try {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
  } catch {
    return fallback
  }
}

/**
 * Normalizes progress values once for every progress primitive.
 * Invalid maxima use the public default, and values are clamped before they
 * are used for either pixels/percentages or ARIA values.
 */
export function normalizeProgress(value, max = DEFAULT_PROGRESS_MAX) {
  const candidateMax = toFiniteNumber(max, DEFAULT_PROGRESS_MAX)
  const normalizedMax = candidateMax > 0 ? candidateMax : DEFAULT_PROGRESS_MAX
  const candidateValue = toFiniteNumber(value, 0)
  const normalizedValue = Math.min(normalizedMax, Math.max(0, candidateValue))
  const percentage = (normalizedValue / normalizedMax) * 100

  return {
    value: normalizedValue,
    max: normalizedMax,
    percentage,
  }
}
