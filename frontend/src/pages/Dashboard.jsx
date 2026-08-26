import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import TrashCard from '../components/TrashCard';
import NoteEditor from '../components/NoteEditor';
import Profile from '../components/Profile';
import ImportExport from '../components/ImportExport';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trashLoading, setTrashLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [view, setView] = useState('notes');
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [toast, setToast] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasMounted = useRef(false);

  const activeCategoryLabel = category
    ? categories.find((c) => c.slug === category)?.name || 'All Notes'
    : 'All Notes';

  const fetchNotes = useCallback(async (searchTerm, activeCategory, signal) => {
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeCategory) params.category = activeCategory;

      const { data } = await client.get('/api/notes', { params, signal });
      setNotes(data.notes || []);
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return;
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError('Could not load your notes. Try refreshing.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [navigate]);

  const fetchTrash = useCallback(async () => {
    setTrashLoading(true);
    try {
      const { data } = await client.get('/api/notes/trash');
      setTrash(data.notes || []);
      setTrashCount((data.notes || []).length);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setToast('Could not load your trash. Try refreshing.');
    } finally {
      setTrashLoading(false);
    }
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await client.get('/api/categories');
      setTotalCount(data.total || 0);
      setCategories(data.categories || []);
    } catch {
      setToast('Could not load categories. Try refreshing.');
    }
  }, []);

  const createCategory = async (name, icon) => {
    await client.post('/api/categories', { name, icon });
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    const deletedSlug = categories.find((c) => c.id === id)?.slug;
    await client.delete(`/api/categories/${id}`);
    await fetchCategories();
    if (category && category === deletedSlug) {
      setCategory(null);
    } else if (view === 'notes') {
      fetchNotes(search, category, undefined);
    }
  };

  useEffect(() => {
    if (view !== 'notes') return;

    const controller = new AbortController();
    const delay = hasMounted.current ? 350 : 0;
    hasMounted.current = true;

    setLoading(true);
    const id = setTimeout(() => fetchNotes(search, category, controller.signal), delay);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [search, category, view, fetchNotes]);

  useEffect(() => {
    fetchCategories();
    fetchTrash();
  }, [fetchCategories, fetchTrash]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleLogout = async () => {
    const email = user?.email;
    navigate('/logged-out', { replace: true, state: { email } });
    try {
      await logout();
    } catch {
    }
  };

  const openNewNote = () => {
    setActiveNote(null);
    setEditorOpen(true);
  };

  const selectCategory = (slug) => {
    setView('notes');
    setCategory(slug);
    setSidebarOpen(false);
  };

  const selectTrash = () => {
    setView('trash');
    setCategory(null);
    setSidebarOpen(false);
    fetchTrash();
  };

  const openNote = (note) => {
    setActiveNote(note);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setActiveNote(null);
  };

  const handleSaved = () => {
    closeEditor();
    setToast(activeNote ? 'Note updated ✏️' : 'Note created ✍️');
    fetchNotes(search, category, undefined);
    fetchCategories();
  };

  const handleDeleted = () => {
    closeEditor();
    setToast('Note moved to trash 🗑️');
    fetchNotes(search, category, undefined);
    fetchCategories();
    fetchTrash();
  };

  const handleRestore = async (id) => {
    try {
      await client.patch(`/api/notes/${id}/restore`);
      setToast('Note restored ♻️');
      await fetchTrash();
      await fetchNotes(search, category, undefined);
      await fetchCategories();
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not restore the note.');
    }
  };

  const handleImportFinished = async () => {
    await fetchCategories();
    await fetchTrash();
    await fetchNotes(search, category, undefined);
  };

  const handlePermanentDelete = async (id) => {
    try {
      await client.delete(`/api/notes/${id}/permanent`);
      setToast('Note permanently deleted 🗑️');
      await fetchTrash();
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not permanently delete the note.');
    }
  };

  const title = view === 'trash' ? 'Trash' : activeCategoryLabel;
  const emptyMessage = view === 'trash'
    ? 'Your trash is empty.'
    : search
      ? `No notes match "${search}".`
      : category
        ? `No notes in ${activeCategoryLabel} yet.`
        : "You haven't created any notes yet.";

  return (
    <div className="dash">
      <header className="dash-topbar">
        <button
          type="button"
          className="dash-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          ☰
        </button>
        <div className="dash-logo">
          <img src="/icons/book.png" className="dash-logo-icon pixel-icon" width="24" height="24" alt="" />
          <strong>Note<span className="dash-logo-accent">Pad</span></strong>
        </div>
        <div className="dash-search">
          <img src="/icons/search.png" className="pixel-icon" width="18" height="18" alt="" />
          <input
            type="text"
            placeholder="Search notes, ideas & dreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={view === 'trash'}
          />
        </div>
        <div className="dash-user">
          <button
            className="dash-user-name dash-user-name-btn"
            onClick={() => setProfileOpen(true)}
            title="View profile"
          >
            {user?.name || 'there'}
          </button>
          <button
            className="btn btn-ghost theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === 'light'
              ? <img src="/icons/moon.png" className="pixel-icon" width="18" height="18" alt="" />
              : <img src="/icons/sun.png" className="pixel-icon" width="18" height="18" alt="" />}
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="dash-body">
        {sidebarOpen && (
          <div className="dash-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalCount={totalCount}
          trashCount={trashCount}
          categories={categories}
          activeCategory={category}
          view={view}
          onSelect={selectCategory}
          onSelectTrash={selectTrash}
          onCreateCategory={createCategory}
          onDeleteCategory={deleteCategory}
        />

        <main className="dash-main">
          <div className="dash-main-header">
            <div>
              <h1 className="dash-main-title">{title}</h1>
              <p className="dash-main-sub">
                {view === 'trash'
                  ? trashLoading
                    ? 'Loading…'
                    : `${trash.length} note${trash.length === 1 ? '' : 's'} in trash`
                  : loading
                    ? 'Loading…'
                    : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {view === 'notes' && (
              <div className="dash-main-actions">
                <ImportExport
                  categories={categories}
                  onImported={handleImportFinished}
                  onMessage={setToast}
                />
                <button className="btn btn-primary" onClick={openNewNote}>
                  + New Note
                </button>
              </div>
            )}
          </div>

          {error && view === 'notes' && <div className="error-banner">{error}</div>}

          {view === 'notes' && !loading && !error && notes.length === 0 && (
            <div className="dash-state">
              <h3>Nothing here yet</h3>
              <p>{emptyMessage}</p>
            </div>
          )}

          {view === 'trash' && !trashLoading && trash.length === 0 && (
            <div className="dash-state">
              <h3>Trash is empty</h3>
              <p>Deleted notes will stay here until you restore or permanently delete them.</p>
            </div>
          )}

          {view === 'notes' && !loading && notes.length > 0 && (
            <div className="note-grid">
              {notes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  category={categories.find((c) => c.slug === note.category)}
                  index={i}
                  onClick={() => openNote(note)}
                />
              ))}
            </div>
          )}

          {view === 'trash' && !trashLoading && trash.length > 0 && (
            <div className="trash-grid">
              {trash.map((note, i) => (
                <TrashCard
                  key={note.id}
                  note={note}
                  index={i}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {editorOpen && (
        <NoteEditor
          note={activeNote}
          defaultCategory={category}
          categories={categories}
          onClose={closeEditor}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
