import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong logging you in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <button
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
        <h1 className="auth-title">Welcome to your NotePad!</h1>
        <p className="auth-subtitle">Enter your details to access your notes.</p>

        {error && <div className="error-banner" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}