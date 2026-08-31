import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  busy,
  error,
}) {
  const cancelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel, busy]);

  const dialog = (
    <div className="confirm-overlay">
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h3
          className="confirm-title"
          id={titleId}
        >
          {title}
        </h3>

        <p className="confirm-message">
          {message}
        </p>

        {error && (
          <div className="confirm-error">
            {error}
          </div>
        )}

        <div className="confirm-actions">
          <button
            type="button"
            ref={cancelRef}
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy
              ? 'Deleting…'
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    dialog,
    document.body
  );
}