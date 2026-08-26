import { htmlToPreviewText } from '../utils/html';

const DECORATIONS = ['pin-red', 'tape-check', 'pin-green', 'clip'];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NoteCard({ note, category, index = 0, onClick }) {
  const deco = DECORATIONS[index % DECORATIONS.length];
  const preview = htmlToPreviewText(note.content,220);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className="note-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={`note-deco note-deco-${deco}`} aria-hidden="true">
        {deco === 'pin-red' && <span className="pin pin-red" />}
        {deco === 'pin-green' && <span className="pin pin-green" />}
        {deco === 'tape-check' && <span className="tape" />}
        {deco === 'clip' && <span className="clip pixel-icon">🖇️</span>}
      </div>

      <div className="note-card-title">{note.title}</div>
      <div className="note-card-preview">{preview || 'No content yet.'}</div>

      <div className="note-card-footer">
        <span className="note-card-date">{formatDate(note.updated_at || note.created_at)}</span>
        {category && <span className="note-card-badge">{category.name}</span>}
      </div>
    </div>
  );
}