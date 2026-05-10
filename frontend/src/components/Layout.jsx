import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar — hidden on mobile, shown via state */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main className="main-content">
        {/* Decorative background orbs */}
        <div className="orb orb-purple" style={{ top: '-120px', right: '8%', opacity: 0.5, zIndex: 0 }} />
        <div className="orb orb-indigo" style={{ bottom: '15%', left: '3%', opacity: 0.35, zIndex: 0 }} />
        <div className="orb orb-pink"   style={{ top: '40%', right: '2%', opacity: 0.2, zIndex: 0 }} />

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'none', position: 'fixed', top: '1rem', left: '1rem', zIndex: 48,
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '0.625rem', padding: '0.5rem', cursor: 'pointer',
            color: 'var(--text-primary)', backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          className="mobile-menu-btn"
        >
          <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>

      {/* Mobile hamburger visibility */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
