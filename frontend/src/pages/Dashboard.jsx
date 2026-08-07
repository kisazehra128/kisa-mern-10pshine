import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
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

  // fetch immediately on first mount, debounce on every search change after
  // that; cancels the previous in-flight request so a slow older response
  // can't overwrite a newer one (e.g. typing fast). loading is set the
  // moment a search is scheduled, not just once the request starts, so the
  // UI doesn't briefly flash "0 notes" during the debounce wait
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

  return (
    <div className="dash">
      <header className="dash-topbar">
        <div className="dash-logo">
          <span className="dash-logo-icon pixel-icon">📝</span>
          <strong>Note<span className="dash-logo-accent">Pad</span></strong>
        </div>
        <div className="dash-search">
          <span className="pixel-icon">🔍</span>
          <input
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
            {theme === 'light' ? '🌙' : '☀️'}
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
              <div className="dash-view-toggle" role="group" aria-label="View options">
                <button className="view-btn active" type="button" aria-label="Grid view" aria-pressed="true" disabled title="List view coming in PR7">▦</button>
                <button className="view-btn" type="button" aria-label="List view" aria-pressed="false" disabled title="List view coming in PR7">☰</button>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setToast('Creating notes is coming in PR7 ✍️')}
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
                <NoteCard key={note.id} note={note} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}