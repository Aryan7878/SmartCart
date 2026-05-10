import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import {
  LayoutDashboard, Search, BookMarked, Layers, ShoppingCart,
  IndianRupee, DollarSign, ChevronRight, Sparkles,
  LogIn, LogOut, User, ChevronDown, ShieldAlert, Sun, Moon, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/products',  icon: ShoppingCart,    label: 'Products'    },
  { to: '/search',    icon: Search,          label: 'Search'      },
  { to: '/watchlist', icon: BookMarked,      label: 'Watchlist'   },
  { to: '/compare',   icon: Layers,          label: 'Compare'     },
  { to: '/admin',     icon: ShieldAlert,     label: 'Admin',      adminOnly: true },
];

const NavLabel = ({ children }) => (
  <p style={{ padding: '0 0.75rem', marginBottom: '0.375rem', marginTop: '0.25rem',
    fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
    {children}
  </p>
);

const Sidebar = ({ mobileOpen, onClose }) => {
  const { compareItems }             = useCompare();
  const { currency, toggleCurrency } = useCurrency();
  const { isDarkMode, toggleTheme }  = useTheme();
  const { user, logout, isLoggedIn } = useAuth();
  const navigate                     = useNavigate();
  const [query, setQuery]            = useState('');
  const [showAuth, setShowAuth]      = useState(false);
  const [showUserMenu, setUserMenu]  = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); onClose?.(); }
  };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 49, backdropFilter: 'blur(4px)'
        }} />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '1.75rem' }}>
          <NavLink to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.75rem', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles style={{ width: '0.9rem', height: '0.9rem', color: 'white' }} />
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>SmartCart</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PRICE INTELLIGENCE</span>
            </div>
          </NavLink>
          {/* Mobile close button */}
          {mobileOpen && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X style={{ width: '1.125rem', height: '1.125rem' }} />
            </button>
          )}
        </div>

        {/* User section */}
        {isLoggedIn ? (
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <button onClick={() => setUserMenu(!showUserMenu)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: '0.75rem',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <div style={{
                width: '1.875rem', height: '1.875rem', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <User style={{ width: '0.8rem', height: '0.8rem' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <p style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
              </div>
              <ChevronDown style={{ width: '0.8rem', color: 'var(--text-muted)', transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem', zIndex: 100, overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }}>
                <button onClick={() => { logout(); setUserMenu(false); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.75rem 1rem', background: 'none', border: 'none',
                  color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                onMouseOut={e => e.currentTarget.style.background='none'}>
                  <LogOut style={{ width: '0.8rem', height: '0.8rem' }} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem', borderRadius: '0.75rem', marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.12))',
            border: '1px solid rgba(139,92,246,0.25)', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <LogIn style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd' }}>Sign In / Register</span>
          </button>
        )}

        {/* Quick search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.8rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Quick search…" className="search-input"
            style={{ paddingLeft: '2.25rem', padding: '0.5rem 0.875rem 0.5rem 2.25rem', fontSize: '0.775rem' }}
          />
        </form>

        {/* Navigation */}
        <NavLabel>Navigation</NavLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {NAV_LINKS.filter(l => !l.adminOnly || user?.role === 'admin').map(({ to, icon: Icon, label }) => {
            const isCmp = label === 'Compare';
            return (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <Icon style={{ width: '0.9rem', height: '0.9rem', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isCmp && compareItems.length > 0 && (
                  <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{compareItems.length}</span>
                )}
                {label === 'Watchlist' && !isLoggedIn && (
                  <span className="badge badge-orange" style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}>Auth</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="divider" style={{ margin: '1rem 0' }} />

        {/* Settings */}
        <NavLabel>Settings</NavLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.25rem' }}>
          <button onClick={toggleCurrency} className="sidebar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            {currency === 'INR' ? <IndianRupee style={{ width: '0.9rem', flexShrink: 0 }} /> : <DollarSign style={{ width: '0.9rem', flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>Currency</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-violet)' }}>{currency}</span>
          </button>
          <button onClick={toggleTheme} className="sidebar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            {isDarkMode ? <Sun style={{ width: '0.9rem', flexShrink: 0 }} /> : <Moon style={{ width: '0.9rem', flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>Theme</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-violet)' }}>{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {/* Bottom CTA */}
        <div style={{
          borderRadius: '0.875rem', padding: '1rem', marginTop: 'auto',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))',
          border: '1px solid rgba(139,92,246,0.18)'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>🔥 Set Price Alerts</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.625rem' }}>
            Track any product and get notified instantly when price drops.
          </p>
          <NavLink to="/watchlist" onClick={onClose} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa', textDecoration: 'none'
          }}>
            Set alert <ChevronRight style={{ width: '0.75rem' }} />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
