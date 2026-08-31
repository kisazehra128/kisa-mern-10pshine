import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

export default function Signup() {
  const { register, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password needs to be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong creating your account.');
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
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Every note brings you one step closer.</p>

        {error && <div className="error-banner" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}