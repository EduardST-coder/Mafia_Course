import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../context/AuthContext';
import '../styles/game.css';

interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  favoriteRole: string;
  totalFouls: number;
  bestMoveCount: number;
  rating: number;
  ratingChange: number;
}

interface GameHistoryItem {
  id: string;
  date: string;
  role: string;
  result: 'Win' | 'Loss';
  roomId: string;
  playersCount: number;
  duration: string;
}

export default function PlayerPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading, updateUser } = useContext(AuthContext);
  
  const [player, setPlayer] = useState<User | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'stats'>('overview');
  
  // ===== РЕДАГУВАННЯ =====
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPreview, setEditPreview] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    const targetId = userId || currentUser?.id || currentUser?.nickname;
    
    if (!targetId || targetId === '') {
      navigate('/login');
      return;
    }

    const loadPlayer = async () => {
      try {
        setLoading(true);
        
        const loadedPlayer: User = {
          id: targetId,
          nickname: currentUser?.nickname || 'Гравець',
          email: currentUser?.email || '',
          rating: currentUser?.rating || 0,
          role: currentUser?.role || 'User',
          avatarUrl: currentUser?.avatarUrl,
        };

        const loadedStats: PlayerStats = {
          totalGames: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          favoriteRole: '-',
          totalFouls: 0,
          bestMoveCount: 0,
          rating: currentUser?.rating || 0,
          ratingChange: 0,
        };

        const loadedHistory: GameHistoryItem[] = [];

        setPlayer(loadedPlayer);
        setStats(loadedStats);
        setHistory(loadedHistory);
        
        // Ініціалізуємо поля редагування
        setEditNickname(loadedPlayer.nickname || '');
        setEditAvatar(loadedPlayer.avatarUrl || '');
      } catch (err) {
        console.error('Failed to load player:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [userId, currentUser, authLoading, navigate]);

  // ===== ЗБЕРЕГТИ ПРОФІЛЬ =====
  const handleSave = async () => {
    if (!player) return;
    
    try {
      // TODO: замінити на реальний API-запит
      // await apiClient.put('/users/me', {
      //   nickname: editNickname,
      //   avatarUrl: editAvatar
      // });
      
      const updatedPlayer = {
        ...player,
        nickname: editNickname.trim() || player.nickname,
        avatarUrl: editAvatar.trim() || undefined,
      };
      
      setPlayer(updatedPlayer);
      
      // Оновлюємо глобальний контекст + localStorage через updateUser
      if (isMyProfile && updateUser) {
        updateUser({
          nickname: updatedPlayer.nickname,
          avatarUrl: updatedPlayer.avatarUrl,
        });
      }
      
      setIsEditing(false);
      setEditPreview(null);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Помилка збереження. Спробуйте ще раз.');
    }
  };

  // ===== СКАСУВАТИ РЕДАГУВАННЯ =====
  const handleCancel = () => {
    if (!player) return;
    setEditNickname(player.nickname || '');
    setEditAvatar(player.avatarUrl || '');
    setEditPreview(null);
    setIsEditing(false);
  };

  // ===== ЗАВАНТАЖИТИ ФОТО =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Файл занадто великий. Максимум 2MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEditPreview(result);
      setEditAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Перевірка авторизації...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження профілю...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-error">
        <p>❌ Гравця не знайдено</p>
        <button onClick={() => navigate('/')} className="primary-button">
          ← На головну
        </button>
      </div>
    );
  }

  const isMyProfile = !userId || userId === currentUser?.id;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Civilian': return '👍';
      case 'Sheriff': return '🛡️';
      case 'Mafia': return '👎';
      case 'Don': return '💍';
      default: return '❓';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Civilian': return '#e53e3e';
      case 'Sheriff': return '#38a169';
      case 'Mafia': return '#1a202c';
      case 'Don': return '#1a202c';
      default: return '#718096';
    }
  };

  const getResultColor = (result: string) => {
    return result === 'Win' ? '#38a169' : '#e53e3e';
  };

  const winRate = stats && stats.totalGames > 0 
    ? Math.round((stats.wins / stats.totalGames) * 100) 
    : 0;
  const lossRate = stats && stats.totalGames > 0 
    ? Math.round((stats.losses / stats.totalGames) * 100) 
    : 0;

  return (
    <div className="player-page">
      <div className="page-container">
        {/* ===== HEADER ===== */}
        <div className="player-header card">
          <div className="player-header-main">
            {/* Аватар */}
            <div className="player-avatar-large">
              {isEditing && editPreview ? (
                <img src={editPreview} alt="Preview" />
              ) : player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.nickname} />
              ) : (
                <span className="avatar-letter">
                  {player.nickname?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            
            <div className="player-header-info">
              {/* Нік — режим редагування / перегляду */}
              {isEditing ? (
                <input
                  className="text-input edit-nickname"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="Ваш нікнейм"
                  maxLength={20}
                />
              ) : (
                <h1 className="player-name">{player.nickname}</h1>
              )}
              
              <div className="player-rating-row">
                <span className="badge badge-rating">⭐ {stats?.rating || 0}</span>
                {stats && stats.ratingChange !== 0 && (
                  <span className={`rating-change ${stats.ratingChange > 0 ? 'positive' : 'negative'}`}>
                    {stats.ratingChange > 0 ? '+' : ''}{stats.ratingChange}
                  </span>
                )}
              </div>
              
              <div className="player-badges">
                <span className="badge badge-games">🎮 {stats?.totalGames || 0} ігор</span>
                <span className="badge badge-wins">🏆 {stats?.wins || 0} перемог</span>
              </div>
            </div>
          </div>
          
          {/* Дії */}
          <div className="player-actions">
            {isMyProfile && (
              <>
                {isEditing ? (
                  <>
                    <label className="primary-button photo-btn">
                      <span>📷</span> Фото
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>
                    <button className="primary-button" onClick={handleSave}>
                      <span>💾</span> Зберегти
                    </button>
                    <button className="secondary-button" onClick={handleCancel}>
                      <span>✕</span> Скасувати
                    </button>
                  </>
                ) : (
                  <button className="primary-button" onClick={() => setIsEditing(true)}>
                    <span>✏️</span> Редагувати
                  </button>
                )}
              </>
            )}
            <button className="secondary-button" onClick={() => navigate(-1)}>
              <span>←</span> Назад
            </button>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="player-tabs">
          <button 
            className={`player-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span> Огляд
          </button>
          <button 
            className={`player-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📜</span> Історія
          </button>
          <button 
            className={`player-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="tab-icon">📈</span> Статистика
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="player-content">
          {activeTab === 'overview' && (
            <div className="tab-overview animate-fade-in">
              <div className="stats-grid">
                <div className="stat-card card">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-value">{stats?.totalGames || 0}</div>
                  <div className="stat-label">Всього ігор</div>
                </div>
                <div className="stat-card card win">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{stats?.wins || 0}</div>
                  <div className="stat-label">Перемог</div>
                </div>
                <div className="stat-card card loss">
                  <div className="stat-icon">💀</div>
                  <div className="stat-value">{stats?.losses || 0}</div>
                  <div className="stat-label">Поразок</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{stats?.winRate || 0}%</div>
                  <div className="stat-label">Вінрейт</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{stats?.bestMoveCount || 0}</div>
                  <div className="stat-label">Best Move</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-value">{stats?.totalFouls || 0}</div>
                  <div className="stat-label">Фолів</div>
                </div>
              </div>

              {stats?.favoriteRole && stats.favoriteRole !== '-' && (
                <div className="favorite-role card">
                  <h3>Улюблена роль</h3>
                  <div className="role-big" style={{ color: getRoleColor(stats.favoriteRole) }}>
                    <span className="role-icon-big">{getRoleIcon(stats.favoriteRole)}</span>
                    <span className="role-name-big">{stats.favoriteRole}</span>
                  </div>
                </div>
              )}

              <div className="recent-games-preview card">
                <h3>Останні ігри</h3>
                {history.length > 0 ? (
                  <>
                    <div className="history-list">
                      {history.slice(0, 3).map(game => (
                        <div key={game.id} className="history-row" onClick={() => navigate(`/game/${game.roomId}`)}>
                          <span className="history-date">{game.date}</span>
                          <span className="history-role" style={{ color: getRoleColor(game.role) }}>
                            {getRoleIcon(game.role)} {game.role}
                          </span>
                          <span className="history-result" style={{ color: getResultColor(game.result) }}>
                            {game.result === 'Win' ? '✅ Перемога' : '❌ Поразка'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {history.length > 3 && (
                      <button className="btn-show-more" onClick={() => setActiveTab('history')}>
                        Показати всі →
                      </button>
                    )}
                  </>
                ) : (
                  <p className="history-empty">Ігор поки немає</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-history animate-fade-in">
              <div className="history-table-wrapper card">
                {history.length > 0 ? (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Роль</th>
                        <th>Результат</th>
                        <th>Гравці</th>
                        <th>Тривалість</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(game => (
                        <tr key={game.id} onClick={() => navigate(`/game/${game.roomId}`)}>
                          <td>{game.date}</td>
                          <td>
                            <span className="role-tag" style={{ color: getRoleColor(game.role) }}>
                              {getRoleIcon(game.role)} {game.role}
                            </span>
                          </td>
                          <td>
                            <span className="result-tag" style={{ color: getResultColor(game.result) }}>
                              {game.result === 'Win' ? '✅ Перемога' : '❌ Поразка'}
                            </span>
                          </td>
                          <td>{game.playersCount}/10</td>
                          <td>{game.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="history-empty">Ігор поки немає</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="tab-stats animate-fade-in">
              <div className="stats-card card">
                <h3 className="stats-title">Загальна статистика</h3>
                <div className="progress-list">
                  <div className="progress-item">
                    <div className="progress-header">
                      <span className="progress-label">Перемоги</span>
                      <span className="progress-value win">{stats?.wins || 0}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill win" style={{ width: `${winRate}%` }}></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-header">
                      <span className="progress-label">Поразки</span>
                      <span className="progress-value loss">{stats?.losses || 0}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill loss" style={{ width: `${lossRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-card card">
                <h3 className="stats-title">Статистика по ролях</h3>
                <div className="role-stats-grid">
                  {[
                    { role: 'Civilian', label: '👍 Мирний', winRate: 0, games: 0, color: '#e53e3e' },
                    { role: 'Sheriff', label: '🛡️ Шериф', winRate: 0, games: 0, color: '#38a169' },
                    { role: 'Mafia', label: '👎 Мафія', winRate: 0, games: 0, color: '#1a202c' },
                    { role: 'Don', label: '💍 Дон', winRate: 0, games: 0, color: '#1a202c' },
                  ].map((rs) => (
                    <div key={rs.role} className="role-stat-item">
                      <div className="role-stat-header">
                        <span className="role-dot" style={{ background: rs.color }} />
                        <span className="role-name">{rs.label}</span>
                        <span className="role-winrate">{rs.winRate}%</span>
                      </div>
                      <div className="role-stat-bar-bg">
                        <div className="role-stat-bar-fill" style={{ width: `${rs.winRate}%`, background: rs.color }}></div>
                      </div>
                      <div className="role-stat-meta">0W / 0L · 0 ігор</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}