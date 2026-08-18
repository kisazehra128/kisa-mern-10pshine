const DECORATIONS = ['pin-red', 'tape-check', 'pin-green', 'clip'];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateHtml(html, maxChars = 220) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  if (text.length <= maxChars) return html;
  return text.slice(0, maxChars).trim() + '…';
}

export default function NoteCard({ note, category, index = 0, onClick }) {
  const deco = DECORATIONS[index % DECORATIONS.length];
  const preview = truncateHtml(note.content);

  return (
    <div className="note-card" onClick={onClick}>
      <div className={`note-deco note-deco-${deco}`} aria-hidden="true">
        {deco === 'pin-red' && <span className="pin pin-red" />}
        {deco === 'pin-green' && <span className="pin pin-green" />}
        {deco === 'tape-check' && <span className="tape" />}
        {deco === 'clip' && <span className="clip pixel-icon">🖇️</span>}
      </div>

      <div className="note-card-title">{note.title}</div>
      {preview ? (
        <div className="note-card-preview" dangerouslySetInnerHTML={{ __html: preview }} />
      ) : (
        <div className="note-card-preview">No content yet.</div>
      )}

      <div className="note-card-footer">
        <span className="note-card-date">{formatDate(note.updated_at || note.created_at)}</span>
        {category && <span className="note-card-badge">{category.name}</span>}
      </div>
    </div>
  );
}