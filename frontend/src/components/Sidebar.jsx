import { useState } from 'react';
import { ICON_OPTIONS, DEFAULT_ICON } from '../constants/categories';
import ConfirmDialog from './ConfirmDialog';

export default function Sidebar({ open, onClose, totalCount, categories, activeCategory, onSelect, onCreateCategory, onDeleteCategory }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // the category object, or null
  const [deleting, setDeleting] = useState(false);

  const openForm = () => {
    setName('');
    setIcon(DEFAULT_ICON);
    setError('');
    setAdding(true);
  };

  const closeForm = () => {
    setAdding(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give it a name first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onCreateCategory(name.trim(), icon);
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create that category.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await onDeleteCategory(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // leave the dialog open so they can see something went wrong and retry/cancel
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className={`dash-sidebar ${open ? 'open' : ''}`}>
      <button type="button" className="dash-sidebar-close" onClick={onClose} aria-label="Close categories">
        ✕
      </button>
      <button
        type="button"
        className={`dash-sidebar-item dash-sidebar-btn ${!activeCategory ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span><img src="/icons/notes.png" className="pixel-icon" width="18" height="15" alt="" />  All Notes</span>
        <span className="count">{totalCount}</span>
      </button>

      <div className="dash-sidebar-section">
        <div className="dash-sidebar-heading">
          <span>Categories</span>
          <button type="button" className="dash-sidebar-add" title="Add category" onClick={openForm}>+</button>
        </div>
        {categories.map((cat) => (
          <div className="dash-sidebar-row" key={cat.slug}>
            <button
              type="button"
              className={`dash-sidebar-item dash-sidebar-btn ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => onSelect(cat.slug)}
            >
              <span><img src={`/icons/${cat.icon}`} className="pixel-icon" width="28" height="28" alt="" /> {cat.name}</span>
              <span className="count">{cat.count}</span>
            </button>
            <button
              type="button"
              className="dash-sidebar-delete"
              title={`Delete ${cat.name}`}
              onClick={() => setPendingDelete(cat)}
            >
              🗑️
            </button>
          </div>
        ))}

        {adding ? (
          <form className="dash-add-category" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              autoFocus
            />
            <div className="dash-icon-picker">
              {ICON_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`dash-icon-swatch ${icon === opt ? 'selected' : ''}`}
                  onClick={() => setIcon(opt)}
                  aria-label={opt}
                >
                  <img src={`/icons/${opt}`} className="pixel-icon" width="20" height="20" alt="" />
                </button>
              ))}
            </div>
            {error && <div className="dash-add-category-error">{error}</div>}
            <div className="dash-add-category-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Adding…' : 'Add'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="dash-sidebar-add-btn" type="button" onClick={openForm}>
            + Add Category
          </button>
        )}
      </div>

      <div className="dash-sidebar-note">
      Your future self will thank you.
        <br />
<img src="/icons/heart.png" className="pixel-icon" width="26" height="26" alt="" />      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this category?"
          message={`Notes in "${pendingDelete.name}" will become uncategorized, not deleted.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
        />
      )}
    </aside>
  );
}
