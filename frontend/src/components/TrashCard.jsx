import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { htmlToPreviewText } from '../utils/html';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export default function TrashCard({ note, index = 0, onRestore, onPermanentDelete }) {
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const preview = htmlToPreviewText(note.content);

  const handleRestore = async () => {
    setBusy(true);
    try {
      await onRestore(note.id);
    } finally {
      setBusy(false);
    }
  };

  const handlePermanentDelete = async () => {
    setBusy(true);
    try {
      await onPermanentDelete(note.id);
    } finally {
      setBusy(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <article className={`trash-card trash-card-${(index % 4) + 1}`}>
      <div className="trash-card-title">{note.title}</div>
      <div className="trash-card-preview">{preview || 'No content.'}</div>
      <div className="trash-card-date">Moved to trash {formatDate(note.deleted_at)}</div>
      <div className="trash-card-actions">
        <button type="button" className="btn btn-primary" onClick={handleRestore} disabled={busy}>
          Restore
        </button>
        <button type="button" className="btn btn-ghost trash-card-delete" onClick={() => setConfirmingDelete(true)} disabled={busy}>
          Delete forever
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete forever?"
          message={`"${note.title}" will be permanently deleted.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handlePermanentDelete}
          busy={busy}
        />
      )}
    </article>
  );
}
