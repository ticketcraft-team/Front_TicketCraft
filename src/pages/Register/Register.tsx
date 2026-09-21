import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser, resendVerificationEmail } from '../../api/auth';

const RESEND_DELAY_SECONDS = 60;

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const statusTone = status?.startsWith('Ошибка') ? 'error' : status ? 'success' : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const startResendCooldown = () => {
    setResendCooldown(RESEND_DELAY_SECONDS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await registerUser(formData);
      localStorage.setItem('pendingRegistration', JSON.stringify(formData));
      setStatus('Письмо для подтверждения отправлено. Перейдите по ссылке в письме.');
      setIsVerificationStep(true);
      startResendCooldown();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Произошла ошибка при регистрации';
      setStatus(`Ошибка: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await resendVerificationEmail(formData.email);
      startResendCooldown();
      setStatus('Письмо для подтверждения отправлено повторно.');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Не удалось отправить письмо повторно';
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

        <p className="eyebrow">Платформа для событий</p>
        <h1>Создайте аккаунт и управляйте билетами без лишних усилий.</h1>

        <ul className="feature-list">
          <li>Быстрая регистрация за 1 минуту</li>
          <li>Умный контроль продаж и доступа</li>
          <li>Поддержка командной работы</li>
        </ul>
      </div>

      <div className="auth-card">
        <div className="card-header">
          <p className="small-label">{isVerificationStep ? 'Почти готово' : 'Начать работу'}</p>
          <h2>{isVerificationStep ? 'Проверьте почту' : 'Регистрация'}</h2>
        </div>

        {isVerificationStep ? (
          <div className="verification-panel">
            <p className="verification-note">
              Мы отправили письмо со ссылкой для подтверждения на <strong>{formData.email}</strong>.
            </p>

            <button
              type="button"
              className="secondary-button auth-link-button"
              onClick={handleResendEmail}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0
                ? `Отправить письмо повторно через ${resendCooldown}с`
                : 'Отправить письмо повторно'}
            </button>
          </div>
        ) : (
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
                placeholder="Минимум 8 символов"
              />
            </label>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {!isVerificationStep && (
          <>
            <div className="divider">
              <span>или</span>
            </div>

            <Link to="/login" className="secondary-button auth-link-button">
              Войти в аккаунт
            </Link>
          </>
        )}

        {status && (
          <p className={`form-status ${statusTone}`} aria-live="polite">
            {status}
          </p>
        )}
      </div>
    </section>
  );
};