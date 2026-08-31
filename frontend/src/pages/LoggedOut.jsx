import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

export default function LoggedOut() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="auth-page">
      <button
        type="button"
        className="btn btn-ghost theme-toggle-corner"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        {theme === 'light' ? <img src="/icons/moon.png" className="pixel-icon" width="18" height="18" alt="" /> : <img src="/icons/sun.png" className="pixel-icon" width="18" height="18" alt="" />}
      </button>
      <div className="auth-card">
        <div className="auth-brand">
<img src="/icons/notepad.png" className="auth-brand-emoji pixel-icon" width="40" height="40" alt="" />        </div>
        <h1 className="auth-title">You're logged out</h1>
        <p className="auth-subtitle">Your notes are still here whenever you're ready.</p>

        <Link className="btn btn-primary auth-submit" to="/login" state={{ email }}>
          Log back in
        </Link>

        <p className="auth-switch">
          Not you? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}