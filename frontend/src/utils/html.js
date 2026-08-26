 export function htmlToPreviewText(html, maxChars = 220) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();

  if (!maxChars || text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim() + '…';
}