// Rotating decoration + category label per card, purely visual - the notes
// table has no category column yet, so this is cosmetic variety, not real data.
const DECORATIONS = ['pin-red', 'tape-check', 'pin-green', 'clip'];
const CATEGORY_LABELS = ['Projects', 'Grocery', 'Personal', 'Projects', 'Personal', 'Projects'];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NoteCard({ note, index = 0 }) {
  const deco = DECORATIONS[index % DECORATIONS.length];
  const label = CATEGORY_LABELS[index % CATEGORY_LABELS.length];

  return (
    <div className="note-card">
      <div className={`note-deco note-deco-${deco}`} aria-hidden="true">
        {deco === 'pin-red' && <span className="pin pin-red" />}
        {deco === 'pin-green' && <span className="pin pin-green" />}
        {deco === 'tape-check' && <span className="tape" />}
        {deco === 'clip' && <img src="/icons/clip.png" className="clip pixel-icon" width="20" height="20" alt="" />}
      </div>

      <div className="note-card-title">{note.title}</div>
      <div className="note-card-preview">{note.content || 'No content yet.'}</div>

      <div className="note-card-footer">
        <span className="note-card-date">{formatDate(note.updated_at || note.created_at)}</span>
        <span className="note-card-badge">{label}</span>
      </div>
    </div>
  );
}