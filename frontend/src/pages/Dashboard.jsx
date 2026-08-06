import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const fetchNotes = useCallback(async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.get('/api/notes', {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setNotes(data.notes || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError('Could not load your notes. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotes('');
  }, [fetchNotes]);

  // debounce search so we're not hitting the API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => fetchNotes(search), 350);
    return () => clearTimeout(id);
  }, [search, fetchNotes]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dash">
      <header className="dash-topbar">
        <div className="dash-logo">
          <span>📝</span>
          <strong>NotePad</strong>
        </div>
        <div className="dash-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search notes, ideas & dreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="dash-user">
          <span className="dash-user-name">{user?.name || 'there'}</span>
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
            <button
              className="btn btn-primary"
              onClick={() => setToast('Creating notes is coming in PR7 ✍️')}
            >
              + New Note
            </button>
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
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}