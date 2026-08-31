import { useState } from 'react';
import { ICON_OPTIONS, DEFAULT_ICON } from '../constants/categories';
import ConfirmDialog from './ConfirmDialog';

export default function Sidebar({
  open,
  onClose,
  totalCount,
  trashCount,
  categories,
  activeCategory,
  view,
  onSelect,
  onSelectTrash,
  onCreateCategory,
  onDeleteCategory
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const openForm = () => {
    setName('');
    setIcon(DEFAULT_ICON);
    setError('');
    setAdding(true);

    setCategoriesOpen(true);
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
      setError(
        err.response?.data?.message ||
          'Could not create that category.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await onDeleteCategory(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          'Could not delete that category.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className={`dash-sidebar ${open ? 'open' : ''}`}>

      {/* Mobile close button */}
      <button
        type="button"
        className="dash-sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        ✕
      </button>

      {/* ALL NOTES */}
      <button
        type="button"
        className={`dash-sidebar-item dash-sidebar-btn ${
          view === 'notes' && !activeCategory ? 'active' : ''
        }`}
        onClick={() => onSelect(null)}
      >
        <span>
          <img
            src="/icons/notes.png"
            className="pixel-icon"
            width="18"
            height="15"
            alt=""
          />{' '}
          All Notes
        </span>

        <span className="count">
          {totalCount}
        </span>
      </button>

      {/* TRASH */}
      <button
        type="button"
        className={`dash-sidebar-item dash-sidebar-btn ${
          view === 'trash' ? 'active' : ''
        }`}
        onClick={onSelectTrash}
      >
        <span>🗑️ Trash</span>

        <span className="count">
          {trashCount}
        </span>
      </button>

      {/* ================================
          CATEGORIES
          ================================ */}
      <div className="dash-sidebar-section">

        {/* Categories heading */}
        <div
          className={`dash-sidebar-heading ${
            categoriesOpen ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className="dash-sidebar-category-toggle"
            onClick={() =>
              setCategoriesOpen((prev) => !prev)
            }
            aria-expanded={categoriesOpen}
          >
            <span>Categories</span>

            <span className="dash-sidebar-chevron">
              {categoriesOpen ? '▾' : '▸'}
            </span>
          </button>
        </div>

        {/* Category dropdown */}
        {categoriesOpen && (
          <div className="dash-sidebar-category-list">

            {/* EXISTING CATEGORIES */}
            {categories.map((cat) => (
              <div
                className="dash-sidebar-row"
                key={cat.slug}
              >
                {/* Category */}
                <button
                  type="button"
                  className={`dash-sidebar-item dash-sidebar-btn ${
                    view === 'notes' &&
                    activeCategory === cat.slug
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => onSelect(cat.slug)}
                >
                  <span>
                    <img
                      src={`/icons/${cat.icon}`}
                      className="pixel-icon"
                      width="28"
                      height="28"
                      alt=""
                    />

                    {cat.name}
                  </span>

                  <span className="count">
                    {cat.count}
                  </span>
                </button>

                {/* Delete category */}
                <button
                  type="button"
                  className="dash-sidebar-delete"
                  title={`Delete ${cat.name}`}
                  aria-label={`Delete ${cat.name}`}
                  onClick={() => {
                    setDeleteError('');
                    setPendingDelete(cat);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}

            {/* ADD CATEGORY FORM */}
            {adding ? (
              <form
                className="dash-add-category"
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  placeholder="Category name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  maxLength={30}
                  autoFocus
                />

                {/* Icon picker */}
                <div className="dash-icon-picker">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      className={`dash-icon-swatch ${
                        icon === opt ? 'selected' : ''
                      }`}
                      onClick={() => setIcon(opt)}
                      aria-label={opt}
                    >
                      <img
                        src={`/icons/${opt}`}
                        className="pixel-icon"
                        width="20"
                        height="20"
                        alt=""
                      />
                    </button>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="dash-add-category-error">
                    {error}
                  </div>
                )}

                {/* Form buttons */}
                <div className="dash-add-category-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Adding…' : 'Add'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* ADD CATEGORY BUTTON */
              <button
                className="dash-sidebar-add-btn"
                type="button"
                onClick={openForm}
              >
                + Add Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar note */}
      <div className="dash-sidebar-note">
        Your future self will thank you.
        <br />

        <img
          src="/icons/heart.png"
          className="pixel-icon"
          width="26"
          height="26"
          alt=""
        />
      </div>

      {/* DELETE CONFIRMATION */}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete this category?"
          message={`Notes in "${pendingDelete.name}" will become uncategorized, not deleted.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
          error={deleteError}
        />
      )}

    </aside>
  );
}