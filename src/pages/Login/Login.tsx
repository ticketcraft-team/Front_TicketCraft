import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusTone = status?.startsWith('Ошибка') ? 'error' : status ? 'success' : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await loginUser(formData);
      navigate('/profile');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Неверный email или пароль';
      setStatus(`Ошибка: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-hero">
        <div className="brand-row">
          <div className="brand-mark">TC</div>
          <span>TicketCraft</span>
        </div>

        <p className="eyebrow">Добро пожаловать</p>
        <h1>Войдите в свой аккаунт и продолжайте работу.</h1>

        <ul className="feature-list">
          <li>Следите за продажами в реальном времени</li>
          <li>Управляйте событиями и гостями</li>
          <li>Доступ к билетам в одном месте</li>
        </ul>
      </div>

      <div className="auth-card">
        <div className="card-header">
          <p className="small-label">Личный кабинет</p>
          <h2>Вход</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
            />
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="divider">
          <span>или</span>
        </div>

        <Link to="/register" className="secondary-button auth-link-button">
          Создать аккаунт
        </Link>

        {status && (
          <p className={`form-status ${statusTone}`} aria-live="polite">
            {status}
          </p>
        )}
      </div>
    </section>
  );
};