function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NoteCard({ note }) {
  return (
    <div className="note-card">
      <div className="note-card-title">{note.title}</div>
      <div className="note-card-preview">{note.content || 'No content yet.'}</div>
      <div className="note-card-date">{formatDate(note.updated_at || note.created_at)}</div>
    </div>
  );
}