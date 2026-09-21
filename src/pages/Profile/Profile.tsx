import React, { useEffect, useState } from 'react';
import { getMyProfile, getMyActiveTickets, getMyOrders, type UserProfileResponse } from '../../api/user';
import { logoutUser } from '../../api/auth';

interface ProfileProps {
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyActiveTickets(), getMyOrders()])
      .then(([profileData, ticketsData, ordersData]) => {
        setProfile(profileData);
        setTickets(ticketsData);
        setOrders(ordersData);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Ошибка загрузки данных профиля');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <p>Загрузка личного кабинета...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button className="primary-button" onClick={handleLogout}>
          Выйти и войти заново
        </button>
      </div>
    );
  }

  return (
    <div className="profile-shell">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="brand-row">
            <div className="brand-mark">TC</div>
            <span>TicketCraft</span>
          </div>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {(profile?.firstName?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
            </div>
          </div>

          <div className="profile-greeting">
            <p className="small-label">Личный кабинет</p>
            <h1>
              Привет, {profile?.firstName || profile?.username || 'пользователь'}!
            </h1>
          </div>

          <div className="profile-meta-list">
            <div>
              <span>Email</span>
              <strong>{profile?.email || '—'}</strong>
            </div>
            <div>
              <span>Роль</span>
              <strong>{profile?.roles?.join(', ') || '—'}</strong>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </aside>

        <main className="profile-main">
          <div className="profile-header-card">
            <div>
              <p className="small-label">Аккаунт</p>
              <h2>Общая информация</h2>
            </div>
            <span className="status-badge">Online</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span>Имя пользователя</span>
              <strong>{profile?.username || '—'}</strong>
            </div>
            <div className="info-item">
              <span>Имя и фамилия</span>
              <strong>{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || '—'}</strong>
            </div>
            <div className="info-item">
              <span>Телефон</span>
              <strong>{profile?.phoneNumber || '—'}</strong>
            </div>
            <div className="info-item">
              <span>Дата регистрации</span>
              <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</strong>
            </div>
          </div>

          <div className="tabs-shell">
            <button
              className={activeTab === 'tickets' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('tickets')}
            >
              Активные билеты ({tickets.length})
            </button>
            <button
              className={activeTab === 'orders' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('orders')}
            >
              Мои заказы ({orders.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'tickets' && (
              <div className="content-card">
                {tickets.length === 0 ? (
                  <p className="empty-state">У вас пока нет активных билетов.</p>
                ) : (
                  <pre>{JSON.stringify(tickets, null, 2)}</pre>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="content-card">
                {orders.length === 0 ? (
                  <p className="empty-state">У вас пока нет оформленных заказов.</p>
                ) : (
                  <pre>{JSON.stringify(orders, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};