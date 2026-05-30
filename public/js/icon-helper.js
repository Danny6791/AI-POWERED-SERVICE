/* ===== SERVICECRAFT SVG Icon Helper ===== */
/* Usage: icon('ic-web') or icon('ic-star', 'lg brand') */

function icon(id, cls = '') {
  return `<svg class="icon ${cls}"><use href="/icons/icons.svg#${id}"/></svg>`;
}

function iconBox(id) {
  return `<span class="icon-box">${icon(id)}</span>`;
}
