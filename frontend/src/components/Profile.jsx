import { useEffect, useState } from 'react';
import client from '../api/client';

function formatJoinDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Profile({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const { data } = await client.get('/api/users/me', {
          signal: controller.signal,
        });
        setProfile(data.user);
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return;
        setError('Could not load your profile. Try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, []);

  const initial = profile?.name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div className="editor-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <strong>Your Profile</strong>
          <button className="editor-close" onClick={onClose} aria-label="Close profile">
            ✕
          </button>
        </div>

        <div className="profile-body">
          {loading && <p className="profile-loading">Loading…</p>}

          {!loading && error && <div className="error-banner">{error}</div>}

          {!loading && !error && profile && (
            <>
              <div className="profile-avatar">{initial}</div>

              <div className="profile-field">
                <span className="profile-label">Name</span>
                <span className="profile-value">{profile.name}</span>
              </div>

              <div className="profile-field">
                <span className="profile-label">Email</span>
                <span className="profile-value">{profile.email}</span>
              </div>

              <div className="profile-field">
                <span className="profile-label">Member since</span>
                <span className="profile-value">{formatJoinDate(profile.created_at)}</span>
              </div>
            </>
          )}
        </div>

        <div className="editor-footer">
          <div className="editor-footer-right">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
