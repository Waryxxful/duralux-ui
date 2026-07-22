// ponytail: inline SVG data URIs so there's always something real to render —
// no binary asset pipeline, no dist/ copy config, no 404s on unbranded consumers.
// Real brand/avatar consumers should always pass their own `logo`/`avatar` prop.
function svgDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const PLACEHOLDER_LOGO = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32">' +
  '<rect width="32" height="32" rx="8" fill="#3454d1"/>' +
  '<text x="16" y="22" font-family="sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">D</text>' +
  '<text x="40" y="21" font-family="sans-serif" font-size="14" font-weight="700" fill="#283c50">uralux</text>' +
  '</svg>'
)

export const PLACEHOLDER_LOGO_ABBR = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
  '<rect width="32" height="32" rx="8" fill="#3454d1"/>' +
  '<text x="16" y="22" font-family="sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">D</text>' +
  '</svg>'
)

export const PLACEHOLDER_AVATAR = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
  '<circle cx="20" cy="20" r="20" fill="#dcdee4"/>' +
  '<circle cx="20" cy="16" r="7" fill="#9aa4b2"/>' +
  '<path d="M6 38c0-9 6-14 14-14s14 5 14 14" fill="#9aa4b2"/>' +
  '</svg>'
)
