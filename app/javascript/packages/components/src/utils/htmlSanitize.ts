export default function extractContent(html) {
  return new DOMParser().parseFromString(html, 'text/html').documentElement
    .textContent;
}

export function escapeHTML(unsafe) {
  return unsafe.replace(
    /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g,
    (c) => '&#' + ('000' + c.charCodeAt(0)).substr(-4, 4) + ';'
  );
}
