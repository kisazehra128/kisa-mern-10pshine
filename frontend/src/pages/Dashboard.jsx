import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);

  const hasMounted = useRef(false);

  const fetchNotes = useCallback(async (searchTerm, signal) => {
    setError('');
    try {
      const { data } = await client.get('/api/notes', {
        params: searchTerm ? { search: searchTerm } : {},
        signal,
      });
      setNotes(data.notes || []);
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return; // superseded by a newer request, ignore
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError('Could not load your notes. Try refreshing.');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [navigate]);

  // debounce search so we're not hitting the api on every keystroke,
  // but load right away on first mount
  useEffect(() => {
    const controller = new AbortController();
    const delay = hasMounted.current ? 350 : 0;
    hasMounted.current = true;

    setLoading(true);
    const id = setTimeout(() => fetchNotes(search, controller.signal), delay);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [search, fetchNotes]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setToast('Could not log out. Try again.');
    }
  };

  const openNewNote = () => {
    setActiveNote(null);
    setEditorOpen(true);
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
    fetchNotes(search, undefined);
  };

  const handleDeleted = () => {
    closeEditor();
    setToast('Note deleted 🗑️');
    fetchNotes(search, undefined);
  };

  return (
    <div className="dash">
      <header className="dash-topbar">
        <div className="dash-logo">
<img src="/icons/book.png" className="dash-logo-icon pixel-icon" width="24" height="24" alt="" />          <strong>Note<span className="dash-logo-accent">Pad</span></strong>
        </div>
        <div className="dash-search">
<img src="/icons/search.png" className="pixel-icon" width="18" height="18" alt="" />          <input
            type="text"
            placeholder="Search notes, ideas & dreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="dash-user">
          <span className="dash-user-name">{user?.name || 'there'}</span>
          <button
            className="btn btn-ghost theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === 'light' ? <img src="/icons/moon.png" className="pixel-icon" width="18" height="18" alt="" /> : <img src="/icons/sun.png" className="pixel-icon" width="18" height="18" alt="" />}
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="dash-body">
        <Sidebar noteCount={notes.length} />

        <main className="dash-main">
          <div className="dash-main-header">
            <div>
              <h1 className="dash-main-title">All Notes</h1>
              <p className="dash-main-sub">
                {loading ? 'Loading…' : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="dash-main-actions">
              <button
                className="btn btn-primary"
                onClick={openNewNote}
              >
                + New Note
              </button>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!loading && !error && notes.length === 0 && (
            <div className="dash-state">
              <h3>Nothing here yet</h3>
              <p>
                {search
                  ? `No notes match "${search}".`
                  : "You haven't created any notes yet."}
              </p>
            </div>
          )}

          {!loading && notes.length > 0 && (
            <div className="note-grid">
              {notes.map((note, i) => (
                <NoteCard key={note.id} note={note} index={i} onClick={() => openNote(note)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {editorOpen && (
        <NoteEditor
          note={activeNote}
          onClose={closeEditor}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}