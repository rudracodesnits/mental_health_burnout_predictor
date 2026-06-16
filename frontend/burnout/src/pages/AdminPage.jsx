// src/pages/AdminPage.jsx
// Full admin analytics dashboard.
// Access is protected by a PIN gate (VITE_ADMIN_PIN env var, default: "admin1234").
// All data is sourced from localStorage 'wc-admin-log' — zero backend changes.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAdminLog, clearAdminLog, checkBackendHealth } from '../lib/api';
import './AdminPage.css';

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'admin1234';

const LEVEL_COLORS = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
};

const FIELD_LABELS = {
  Family_History: 'Family History', Social_Support: 'Social Support',
  Counseling_Service_Use: 'Counseling Use', Extracurricular_Involvement: 'Extracurricular',
  Semester_Credit_Load: 'Credit Load', Sleep_Quality: 'Sleep Quality',
  Physical_Activity: 'Physical Activity', Stress_Level: 'Stress Level',
  Financial_Stress: 'Financial Stress', Substance_Use: 'Substance Use',
  Diet_Quality: 'Diet Quality', Depression_Score: 'Depression', Anxiety_Score: 'Anxiety',
  Chronic_Illness: 'Chronic Illness',
};

// ─────────────────────────────────────────────
// PIN Gate
// ─────────────────────────────────────────────
const PinGate = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('wc-admin-auth', 'true');
      onSuccess();
    } else {
      setError('Incorrect PIN');
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="admin-gate">
      <div className={`admin-gate__card glass ${shake ? 'admin-gate__card--shake' : ''}`}>
        <div className="admin-gate__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1 className="admin-gate__title">Admin Access</h1>
        <p className="admin-gate__subtitle">Enter your admin PIN to continue</p>
        <form onSubmit={handleSubmit} className="admin-gate__form">
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(''); }}
            placeholder="••••••••"
            className="admin-gate__input"
            aria-label="Admin PIN"
            autoComplete="current-password"
            inputMode="numeric"
          />
          {error && <p className="admin-gate__error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary btn--md admin-gate__btn">
            Unlock Dashboard
          </button>
        </form>
        <p className="admin-gate__hint">
          Default PIN: <code>admin1234</code> — set <code>VITE_ADMIN_PIN</code> to change
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <div className="admin-stat-card glass">
    <div className="admin-stat-card__header">
      <span className="admin-stat-card__title">{title}</span>
      <div className="admin-stat-card__icon" style={{ color }} aria-hidden="true">{icon}</div>
    </div>
    <div className="admin-stat-card__value" style={{ color }}>{value}</div>
    <div className="admin-stat-card__footer">
      {trend !== undefined && (
        <span className={`admin-stat-card__trend ${trend >= 0 ? 'admin-stat-card__trend--up' : 'admin-stat-card__trend--down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
      {subtitle && <span className="admin-stat-card__subtitle">{subtitle}</span>}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Bar Chart (pure CSS + SVG)
// ─────────────────────────────────────────────
const BarChart = ({ data, title }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="admin-chart">
      <h3 className="admin-chart__title">{title}</h3>
      <div className="admin-chart__bars" role="img" aria-label={title}>
        {data.map(({ label, value, color }) => (
          <div key={label} className="admin-chart__bar-group">
            <div className="admin-chart__bar-track">
              <div
                className="admin-chart__bar-fill"
                style={{
                  height: `${(value / max) * 100}%`,
                  background: color,
                  boxShadow: `0 0 8px ${color}50`,
                }}
                title={`${label}: ${value}`}
              />
            </div>
            <span className="admin-chart__bar-value">{value}</span>
            <span className="admin-chart__bar-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Donut Chart (SVG)
// ─────────────────────────────────────────────
const DonutChart = ({ segments, title, centerText, centerSub }) => {
  const R = 56, CX = 70, CY = 70;
  const circumference = 2 * Math.PI * R;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let cumulativeOffset = 0;

  return (
    <div className="admin-donut">
      <h3 className="admin-chart__title">{title}</h3>
      <div className="admin-donut__inner">
        <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={title}>
          {/* Background ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-border)" strokeWidth="14"/>
          {segments.map((seg, i) => {
            const pct   = seg.value / total;
            const dash  = pct * circumference;
            const gap   = circumference - dash;
            const offset = circumference - cumulativeOffset * circumference / total;
            cumulativeOffset += seg.value;
            return (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'stroke-dasharray 1s ease' }}
              />
            );
          })}
          {/* Center text */}
          <text x={CX} y={CY - 5} textAnchor="middle" fill="var(--color-text-primary)" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
            {centerText}
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="Inter, sans-serif">
            {centerSub}
          </text>
        </svg>

        <div className="admin-donut__legend">
          {segments.map(seg => (
            <div key={seg.label} className="admin-donut__legend-item">
              <span className="admin-donut__legend-dot" style={{ background: seg.color }} aria-hidden="true"/>
              <span className="admin-donut__legend-label">{seg.label}</span>
              <span className="admin-donut__legend-value" style={{ color: seg.color }}>
                {seg.value} ({total > 0 ? Math.round(seg.value / total * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Timeline Sparkline
// ─────────────────────────────────────────────
const Sparkline = ({ points, color = 'var(--color-primary)', height = 50 }) => {
  if (points.length < 2) return null;
  const W = 200;
  const max = Math.max(...points, 0.001);
  const min = Math.min(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map(p => height - ((p - min) / range) * (height - 4) - 2);
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  const area = `${d} L ${W} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Backend Health Badge
// ─────────────────────────────────────────────
const HealthBadge = ({ health }) => {
  if (!health) return (
    <div className="health-badge health-badge--checking">
      <div className="health-badge__pulse" aria-hidden="true"/>
      Checking…
    </div>
  );
  return (
    <div className={`health-badge health-badge--${health.online ? 'online' : 'offline'}`}>
      <div className="health-badge__pulse" aria-hidden="true"/>
      {health.online ? `Online · ${health.latencyMs}ms` : `Offline`}
    </div>
  );
};

// ─────────────────────────────────────────────
// Activity Log Table
// ─────────────────────────────────────────────
const ActivityTable = ({ log, onClear }) => {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    if (filter === 'all') return log;
    return log.filter(e => {
      if (filter === 'error')  return e.status === 'error';
      if (filter === 'auth')   return e.mode === 'authenticated';
      if (filter === 'guest')  return e.mode === 'guest';
      if (filter === 'Low' || filter === 'Medium' || filter === 'High')
        return e.result?.level === filter;
      return true;
    });
  }, [log, filter]);

  const pages    = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="admin-table-wrapper glass">
      <div className="admin-table-header">
        <h3 className="admin-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Activity Log
          <span className="admin-section-title__count">{log.length}</span>
        </h3>
        <div className="admin-table-controls">
          <select
            className="admin-filter-select"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0); }}
            aria-label="Filter log entries"
          >
            <option value="all">All entries</option>
            <option value="auth">Authenticated</option>
            <option value="guest">Guest</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="error">Errors</option>
          </select>
          <button
            className="btn btn--ghost btn--sm admin-clear-btn"
            onClick={onClear}
            disabled={log.length === 0}
            aria-label="Clear all log entries"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Clear Log
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="admin-table-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No entries match the current filter</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table" role="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Timestamp</th>
                <th scope="col">User</th>
                <th scope="col">Mode</th>
                <th scope="col">Level</th>
                <th scope="col">Score</th>
                <th scope="col">Latency</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((entry, idx) => {
                const lc = LEVEL_COLORS[entry.result?.level] || {};
                return (
                  <tr key={entry.id} className={`admin-table__row ${entry.status === 'error' ? 'admin-table__row--error' : ''}`}>
                    <td className="admin-table__num">{page * PAGE_SIZE + idx + 1}</td>
                    <td className="admin-table__time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="admin-table__user">
                      {entry.userEmail
                        ? <span title={entry.userEmail}>{entry.userName || entry.userEmail.split('@')[0]}</span>
                        : <span className="admin-table__anon">Anonymous</span>
                      }
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--mode admin-badge--${entry.mode}`}>
                        {entry.mode === 'authenticated' ? '🔐 Auth' : '👤 Guest'}
                      </span>
                    </td>
                    <td>
                      {entry.result?.level ? (
                        <span
                          className="admin-badge"
                          style={{ color: lc.color, background: lc.bg, borderColor: lc.border }}
                        >
                          {entry.result.level}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="admin-table__score" style={{ color: lc.color }}>
                      {entry.result?.score?.toFixed(4) ?? '—'}
                    </td>
                    <td className="admin-table__latency">
                      {entry.durationMs ? `${entry.durationMs}ms` : '—'}
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--status admin-badge--${entry.status}`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="admin-pagination" role="navigation" aria-label="Table pagination">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span className="admin-pagination__info">
            Page {page + 1} of {pages}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
            disabled={page === pages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Feature Averages Heatmap
// ─────────────────────────────────────────────
const FeatureAverages = ({ log }) => {
  const successful = log.filter(e => e.status === 'success' && e.inputs);
  if (successful.length === 0) return null;

  const fields = Object.keys(successful[0]?.inputs || {});
  const avgs = fields.map(field => {
    const sum = successful.reduce((s, e) => s + (e.inputs[field] || 0), 0);
    const avg = sum / successful.length;
    const max = field === 'Semester_Credit_Load' ? 28 : 1;
    return { field, label: FIELD_LABELS[field] || field, avg, pct: avg / max };
  });

  // Sort by avg descending
  avgs.sort((a, b) => b.pct - a.pct);

  const getColor = (pct) => {
    if (pct > 0.66) return '#ef4444';
    if (pct > 0.33) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="admin-heatmap glass">
      <h3 className="admin-section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Average Inputs Across All Sessions
        <span className="admin-section-title__count">{successful.length} records</span>
      </h3>
      <div className="admin-heatmap__grid">
        {avgs.map(({ field, label, avg, pct }) => {
          const color = getColor(pct);
          return (
            <div key={field} className="admin-heatmap__item">
              <div className="admin-heatmap__item-header">
                <span className="admin-heatmap__item-label">{label}</span>
                <span className="admin-heatmap__item-value" style={{ color }}>
                  {field === 'Semester_Credit_Load' ? avg.toFixed(1) : avg.toFixed(2)}
                </span>
              </div>
              <div className="admin-heatmap__bar-track">
                <div
                  className="admin-heatmap__bar-fill"
                  style={{ width: `${pct * 100}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Session Explorer
// ─────────────────────────────────────────────
const SessionList = ({ log }) => {
  const sessions = useMemo(() => {
    const map = {};
    log.forEach(e => {
      if (!map[e.sessionId]) {
        map[e.sessionId] = {
          id: e.sessionId, count: 0, lastSeen: e.timestamp,
          user: e.userEmail || 'Guest', mode: e.mode,
          levels: { Low: 0, Medium: 0, High: 0 },
        };
      }
      map[e.sessionId].count++;
      if (e.result?.level) map[e.sessionId].levels[e.result.level]++;
      if (e.timestamp > map[e.sessionId].lastSeen) map[e.sessionId].lastSeen = e.timestamp;
    });
    return Object.values(map).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
  }, [log]);

  return (
    <div className="admin-sessions glass">
      <h3 className="admin-section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        Sessions
        <span className="admin-section-title__count">{sessions.length}</span>
      </h3>
      {sessions.length === 0 ? (
        <p className="admin-empty-text">No sessions recorded yet.</p>
      ) : (
        <div className="admin-sessions__list">
          {sessions.map(sess => (
            <div key={sess.id} className="admin-session-item">
              <div className="admin-session-item__avatar" aria-hidden="true">
                {sess.mode === 'authenticated' ? '🔐' : '👤'}
              </div>
              <div className="admin-session-item__info">
                <div className="admin-session-item__user">
                  {sess.user !== 'Guest' ? sess.user.split('@')[0] : 'Guest'}
                </div>
                <div className="admin-session-item__id">{sess.id}</div>
              </div>
              <div className="admin-session-item__stats">
                <span className="admin-session-item__count">{sess.count} runs</span>
                <div className="admin-session-item__levels">
                  {sess.levels.Low > 0 && <span style={{ color: '#10b981' }}>L:{sess.levels.Low}</span>}
                  {sess.levels.Medium > 0 && <span style={{ color: '#f59e0b' }}>M:{sess.levels.Medium}</span>}
                  {sess.levels.High > 0 && <span style={{ color: '#ef4444' }}>H:{sess.levels.High}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
const ExportButton = ({ log }) => {
  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Session', 'User', 'Mode', 'Level', 'Score', 'Latency(ms)', 'Status',
       ...Object.keys(FIELD_LABELS)].join(','),
      ...log.map(e => [
        e.timestamp, e.sessionId, e.userEmail || 'Guest', e.mode,
        e.result?.level || '', e.result?.score || '', e.durationMs || '', e.status,
        ...Object.keys(FIELD_LABELS).map(f => e.inputs?.[f] ?? ''),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `wellcheck-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="btn btn--outline btn--sm"
      onClick={handleExport}
      disabled={log.length === 0}
      aria-label="Export all log data as CSV"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export CSV
    </button>
  );
};

// ─────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────
const AdminDashboard = () => {
  const [log,          setLog]    = useState([]);
  const [health,       setHealth] = useState(null);
  const [lastRefresh,  setLast]   = useState(null);
  const [refreshing,   setRef]    = useState(false);
  const [activeTab,    setTab]    = useState('overview');

  const refresh = useCallback(async () => {
    setRef(true);
    setLog(getAdminLog());
    const h = await checkBackendHealth();
    setHealth(h);
    setLast(new Date());
    setRef(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleClear = () => {
    if (window.confirm('Clear the entire activity log? This cannot be undone.')) {
      clearAdminLog();
      setLog([]);
    }
  };

  // ─── Computed stats ───
  const successful   = log.filter(e => e.status === 'success');
  const errors       = log.filter(e => e.status === 'error');
  const authCount    = log.filter(e => e.mode === 'authenticated').length;
  const guestCount   = log.filter(e => e.mode === 'guest').length;
  const levelCounts  = { Low: 0, Medium: 0, High: 0 };
  successful.forEach(e => { if (e.result?.level) levelCounts[e.result.level]++; });
  const avgScore = successful.length
    ? (successful.reduce((s, e) => s + (e.result?.score || 0), 0) / successful.length).toFixed(4)
    : '—';
  const avgLatency = successful.length
    ? Math.round(successful.reduce((s, e) => s + (e.durationMs || 0), 0) / successful.length)
    : '—';

  // Score timeline (last 20 successful)
  const scoreLine = successful.slice(0, 20).reverse().map(e => e.result?.score || 0);

  // Hourly distribution
  const hourBuckets = Array(24).fill(0);
  log.forEach(e => {
    const h = new Date(e.timestamp).getHours();
    hourBuckets[h]++;
  });
  const hourData = hourBuckets.map((v, i) => ({
    label: `${String(i).padStart(2, '0')}h`,
    value: v,
    color: 'var(--color-primary)',
  })).filter((_, i) => i % 3 === 0);  // every 3 hours for readability

  const handleSignOut = () => {
    sessionStorage.removeItem('wc-admin-auth');
    window.location.reload();
  };

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'log',       label: `Log (${log.length})` },
    { id: 'sessions',  label: 'Sessions' },
    { id: 'inputs',    label: 'Input Averages' },
  ];

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <header className="admin-header glass">
        <div className="admin-header__inner container">
          <div className="admin-header__left">
            <div className="admin-header__logo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h1 className="admin-header__title">Admin Console</h1>
              <p className="admin-header__subtitle">WellCheck · Internal Dashboard</p>
            </div>
          </div>
          <div className="admin-header__right">
            <HealthBadge health={health} />
            <span className="admin-refresh-time">
              {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : ''}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={refresh}
              disabled={refreshing}
              aria-label="Refresh data"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
                aria-hidden="true">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <ExportButton log={log} />
            <button className="btn btn--ghost btn--sm" onClick={handleSignOut}>
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body container">
        {/* ── Tabs ── */}
        <div className="admin-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──────────────────── OVERVIEW ──────────────────── */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Stat cards */}
            <div className="admin-stats-grid">
              <StatCard
                title="Total Predictions"
                value={log.length}
                subtitle={`${errors.length} error${errors.length !== 1 ? 's' : ''}`}
                color="var(--color-primary-light)"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              />
              <StatCard
                title="Avg Risk Score"
                value={avgScore}
                subtitle="Across successful runs"
                color="var(--color-secondary-light)"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
              />
              <StatCard
                title="Avg Latency"
                value={avgLatency !== '—' ? `${avgLatency}ms` : '—'}
                subtitle="Backend response time"
                color={health?.latencyMs < 500 ? 'var(--color-success)' : 'var(--color-warning)'}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
              <StatCard
                title="Authenticated"
                value={authCount}
                subtitle={`${guestCount} guest session${guestCount !== 1 ? 's' : ''}`}
                color="var(--color-info)"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
              <StatCard
                title="High Risk"
                value={levelCounts.High}
                subtitle={`${successful.length > 0 ? Math.round(levelCounts.High / successful.length * 100) : 0}% of all`}
                color="var(--color-danger)"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              />
              <StatCard
                title="Backend"
                value={health ? (health.online ? 'Online' : 'Offline') : '—'}
                subtitle={health?.online ? `Port 5000 · ${health.latencyMs}ms` : 'Not reachable'}
                color={health?.online ? 'var(--color-success)' : 'var(--color-danger)'}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>}
              />
            </div>

            {/* Charts row */}
            <div className="admin-charts-row">
              <DonutChart
                title="Risk Level Distribution"
                centerText={successful.length}
                centerSub="predictions"
                segments={[
                  { label: 'Low',    value: levelCounts.Low,    color: '#10b981' },
                  { label: 'Medium', value: levelCounts.Medium, color: '#f59e0b' },
                  { label: 'High',   value: levelCounts.High,   color: '#ef4444' },
                ]}
              />

              <DonutChart
                title="Auth vs Guest"
                centerText={log.length}
                centerSub="total"
                segments={[
                  { label: 'Authenticated', value: authCount,  color: '#6366f1' },
                  { label: 'Guest',         value: guestCount, color: '#8b5cf6' },
                ]}
              />

              <div className="admin-sparkline-card glass">
                <h3 className="admin-chart__title">Score Trend (last 20)</h3>
                {scoreLine.length < 2 ? (
                  <p className="admin-empty-text">Need at least 2 predictions to plot</p>
                ) : (
                  <>
                    <Sparkline points={scoreLine} color="var(--color-primary)" height={60} />
                    <div className="admin-sparkline__labels">
                      <span>Oldest</span><span>Latest</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hourly bar chart */}
            {log.length > 0 && (
              <div className="admin-hourly-card glass">
                <BarChart title="Activity by Hour of Day" data={hourData} />
              </div>
            )}

            {log.length === 0 && (
              <div className="admin-no-data glass">
                <div className="admin-no-data__icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <h2>No data yet</h2>
                <p>Run a burnout prediction on the <a href="/predictor">Predictor</a> or <a href="/userhome">User Home</a> page to start collecting analytics.</p>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── LOG TAB ──────────────────── */}
        {activeTab === 'log' && (
          <div className="animate-fade-in">
            <ActivityTable log={log} onClear={handleClear} />
          </div>
        )}

        {/* ──────────────────── SESSIONS TAB ──────────────────── */}
        {activeTab === 'sessions' && (
          <div className="animate-fade-in">
            <SessionList log={log} />
          </div>
        )}

        {/* ──────────────────── INPUTS TAB ──────────────────── */}
        {activeTab === 'inputs' && (
          <div className="animate-fade-in">
            {successful.length === 0 ? (
              <div className="admin-no-data glass">
                <p>No successful predictions recorded yet.</p>
              </div>
            ) : (
              <FeatureAverages log={log} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Root export with PIN gate
// ─────────────────────────────────────────────
const AdminPage = () => {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('wc-admin-auth') === 'true'
  );

  if (!authed) return <PinGate onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard />;
};

export default AdminPage;
