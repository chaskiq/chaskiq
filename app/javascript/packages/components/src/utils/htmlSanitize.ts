export default function extractContent(html) {
  return new DOMParser().parseFromString(html, 'text/html').documentElement
    .textContent;
}
