import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/admin.css';

interface UserItem {
  id: string;
  nickname: string;
  email: string;
  rating: number;
  role: 'Player' | 'Moderator' | 'Admin';
  isBanned: boolean;
  gamesPlayed: number;
  createdAt: string;
  lastActive: string;
}

interface RoomItem {
  id: string;
  name: string;
  owner: string;
  playersCount: number;
  maxPlayers: number;
  status: 'Waiting' | 'InProgress' | 'Finished';
  createdAt: string;
}

interface ReportItem {
  id: string;
  reporter: string;
  target: string;
  reason: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  createdAt: string;
}

interface PlatformStats {
  totalUsers: number;
  onlineNow: number;
  activeGames: number;
  totalGames: number;
  newToday: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'reports' | 'stats'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Перевірка прав доступу
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // TODO: замінити на реальні API-запити
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Mock users
        setUsers([
          { id: '1', nickname: 'Player1', email: 'p1@test.com', rating: 1200, role: 'Player', isBanned: false, gamesPlayed: 45, createdAt: '2025-01-15', lastActive: '2025-06-07' },
          { id: '2', nickname: 'Player2', email: 'p2@test.com', rating: 980, role: 'Player', isBanned: true, gamesPlayed: 12, createdAt: '2025-03-20', lastActive: '2025-05-30' },
          { id: '3', nickname: 'Mod1', email: 'mod@test.com', rating: 1500, role: 'Moderator', isBanned: false, gamesPlayed: 120, createdAt: '2024-12-01', lastActive: '2025-06-07' },
          { id: '4', nickname: 'Admin', email: 'admin@test.com', rating: 2000, role: 'Admin', isBanned: false, gamesPlayed: 200, createdAt: '2024-11-01', lastActive: '2025-06-07' },
        ]);

        // Mock rooms
        setRooms([
          { id: 'r1', name: 'Mafia Room #1', owner: 'Player1', playersCount: 8, maxPlayers: 10, status: 'InProgress', createdAt: '2025-06-07 10:00' },
          { id: 'r2', name: 'Pro Game', owner: 'Mod1', playersCount: 3, maxPlayers: 10, status: 'Waiting', createdAt: '2025-06-07 11:30' },
          { id: 'r3', name: 'Beginners', owner: 'Player2', playersCount: 10, maxPlayers: 10, status: 'Finished', createdAt: '2025-06-06 20:00' },
        ]);

        // Mock reports
        setReports([
          { id: 'rep1', reporter: 'Player1', target: 'Player2', reason: 'Образи в чаті', status: 'Pending', createdAt: '2025-06-07 09:00' },
          { id: 'rep2', reporter: 'Player3', target: 'Player1', reason: 'Чітерство', status: 'Resolved', createdAt: '2025-06-06 15:00' },
        ]);

        // Mock stats
        setStats({
          totalUsers: 1247,
          onlineNow: 89,
          activeGames: 12,
          totalGames: 15420,
          newToday: 15,
        });
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isBanned: !u.isBanned } : u
    ));
  };

  const handleChangeRole = (userId: string, newRole: 'Player' | 'Moderator' | 'Admin') => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const handleCloseRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const handleResolveReport = (reportId: string, status: 'Resolved' | 'Rejected') => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status } : r
    ));
  };

  const filteredUsers = users.filter(u => 
    u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin': return 'role-admin';
      case 'Moderator': return 'role-moderator';
      default: return 'role-player';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Resolved': return 'status-resolved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження панелі адміністратора...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-container">
        {/* ===== HEADER ===== */}
        <div className="admin-header card">
          <div className="admin-header-main">
            <h1 className="admin-title">🛡️ Панель адміністратора</h1>
            <p className="admin-subtitle">Управління платформою Mafia Online</p>
          </div>
          <div className="admin-actions">
            <button className="secondary-button" onClick={() => navigate('/')}>
              <span>←</span> На головну
            </button>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card card">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-value">{stats.totalUsers}</div>
              <div className="admin-stat-label">Всього користувачів</div>
            </div>
            <div className="admin-stat-card card">
              <div className="admin-stat-icon">🟢</div>
              <div className="admin-stat-value">{stats.onlineNow}</div>
              <div className="admin-stat-label">Онлайн зараз</div>
            </div>
            <div className="admin-stat-card card">
              <div className="admin-stat-icon">🎮</div>
              <div className="admin-stat-value">{stats.activeGames}</div>
              <div className="admin-stat-label">Активних ігор</div>
            </div>
            <div className="admin-stat-card card">
              <div className="admin-stat-icon">📈</div>
              <div className="admin-stat-value">{stats.newToday}</div>
              <div className="admin-stat-label">Нових сьогодні</div>
            </div>
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👥</span> Користувачі
            <span className="tab-count">{users.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <span className="tab-icon">🎮</span> Кімнати
            <span className="tab-count">{rooms.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="tab-icon">⚠️</span> Скарги
            <span className="tab-count">{reports.filter(r => r.status === 'Pending').length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="tab-icon">📊</span> Статистика
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="admin-content">
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="tab-users animate-fade-in">
              <div className="users-toolbar">
                <input
                  type="text"
                  className="text-input search-input"
                  placeholder="🔍 Пошук за ніком або email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="users-table-wrapper card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Нік</th>
                      <th>Email</th>
                      <th>Рейтинг</th>
                      <th>Роль</th>
                      <th>Ігор</th>
                      <th>Статус</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={user.isBanned ? 'banned' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              {user.nickname.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-nickname">{user.nickname}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.rating}</td>
                        <td>
                          <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.gamesPlayed}</td>
                        <td>
                          {user.isBanned ? (
                            <span className="status-badge banned">🚫 Забанений</span>
                          ) : (
                            <span className="status-badge active">✅ Активний</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view"
                              onClick={() => navigate(`/player/${user.id}`)}
                              title="Переглянути профіль"
                            >
                              👁️
                            </button>
                            <button 
                              className={`btn-action ${user.isBanned ? 'btn-unban' : 'btn-ban'}`}
                              onClick={() => handleBanUser(user.id)}
                              title={user.isBanned ? 'Розбанити' : 'Забанити'}
                            >
                              {user.isBanned ? '🔓' : '🚫'}
                            </button>
                            <select 
                              className="role-select"
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value as 'Player' | 'Moderator' | 'Admin')}
                              title="Змінити роль"
                            >
                              <option value="Player">Player</option>
                              <option value="Moderator">Moderator</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="table-empty">Користувачів не знайдено</div>
                )}
              </div>
            </div>
          )}

          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <div className="tab-rooms animate-fade-in">
              <div className="rooms-table-wrapper card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Назва</th>
                      <th>Власник</th>
                      <th>Гравці</th>
                      <th>Статус</th>
                      <th>Створена</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room.id}>
                        <td className="room-name">{room.name}</td>
                        <td>{room.owner}</td>
                        <td>{room.playersCount}/{room.maxPlayers}</td>
                        <td>
                          <span className={`room-status ${room.status.toLowerCase()}`}>
                            {room.status === 'Waiting' && '⏳ Очікування'}
                            {room.status === 'InProgress' && '🔥 В грі'}
                            {room.status === 'Finished' && '✅ Завершена'}
                          </span>
                        </td>
                        <td>{room.createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view"
                              onClick={() => navigate(`/game/${room.id}`)}
                              title="Спостерігати"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-action btn-ban"
                              onClick={() => handleCloseRoom(room.id)}
                              title="Закрити кімнату"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rooms.length === 0 && (
                  <div className="table-empty">Активних кімнат немає</div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="tab-reports animate-fade-in">
              <div className="reports-table-wrapper card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Хто скаржиться</th>
                      <th>На кого</th>
                      <th>Причина</th>
                      <th>Статус</th>
                      <th>Дата</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className={report.status === 'Pending' ? 'pending' : ''}>
                        <td>#{report.id}</td>
                        <td>{report.reporter}</td>
                        <td>{report.target}</td>
                        <td>{report.reason}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                            {report.status === 'Pending' && '⏳ Очікує'}
                            {report.status === 'Resolved' && '✅ Розглянуто'}
                            {report.status === 'Rejected' && '❌ Відхилено'}
                          </span>
                        </td>
                        <td>{report.createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            {report.status === 'Pending' && (
                              <>
                                <button 
                                  className="btn-action btn-unban"
                                  onClick={() => handleResolveReport(report.id, 'Resolved')}
                                  title="Розглянути"
                                >
                                  ✓
                                </button>
                                <button 
                                  className="btn-action btn-ban"
                                  onClick={() => handleResolveReport(report.id, 'Rejected')}
                                  title="Відхилити"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reports.length === 0 && (
                  <div className="table-empty">Скарг немає</div>
                )}
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="tab-stats animate-fade-in">
              <div className="stats-cards">
                <div className="stats-card card">
                  <h3>📊 Загальна статистика</h3>
                  <div className="stats-rows">
                    <div className="stats-row">
                      <span className="stats-label">Всього користувачів</span>
                      <span className="stats-value">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Онлайн зараз</span>
                      <span className="stats-value">{stats?.onlineNow || 0}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Активних ігор</span>
                      <span className="stats-value">{stats?.activeGames || 0}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Всього ігор зіграно</span>
                      <span className="stats-value">{stats?.totalGames || 0}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Нових сьогодні</span>
                      <span className="stats-value">{stats?.newToday || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="stats-card card">
                  <h3>👥 Розподіл ролей</h3>
                  <div className="stats-rows">
                    <div className="stats-row">
                      <span className="stats-label">Гравці</span>
                      <span className="stats-value">{users.filter(u => u.role === 'Player').length}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Модератори</span>
                      <span className="stats-value">{users.filter(u => u.role === 'Moderator').length}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Адміністратори</span>
                      <span className="stats-value">{users.filter(u => u.role === 'Admin').length}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Забанені</span>
                      <span className="stats-value banned">{users.filter(u => u.isBanned).length}</span>
                    </div>
                  </div>
                </div>

                <div className="stats-card card">
                  <h3>🎮 Статус кімнат</h3>
                  <div className="stats-rows">
                    <div className="stats-row">
                      <span className="stats-label">Очікування</span>
                      <span className="stats-value">{rooms.filter(r => r.status === 'Waiting').length}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">В грі</span>
                      <span className="stats-value">{rooms.filter(r => r.status === 'InProgress').length}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Завершені</span>
                      <span className="stats-value">{rooms.filter(r => r.status === 'Finished').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}