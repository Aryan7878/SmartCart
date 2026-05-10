import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BarChart2, TrendingUp, ShieldCheck, Search,
         Flame, Activity, Zap, Star, Package, Eye, Sparkles,
         ChevronRight, Bell, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Audio', 'Cameras', 'Tablets', 'Wearables'];

const POPULAR_SEARCHES = ['iPhone 15 Pro', 'MacBook Pro', 'Sony WH-1000XM5', 'iPad Pro', 'Samsung Galaxy S24'];

const StatCard = ({ icon: Icon, label, value, color, glow, suffix = '' }) => (
  <div className="stat-card" style={{ overflow: 'hidden', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.07, background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)` }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.625rem', marginBottom: '1rem',
        background: `${glow}30`, border: `1px solid ${glow}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color
      }}>
        <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
      </div>
      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}<span style={{ fontSize: '1rem', color }}>{suffix}</span></p>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.375rem' }}>{label}</p>
    </div>
  </div>
);

const SectionHeader = ({ title, icon, subtitle, linkTo }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="icon-wrap">{icon}</div>
      <div>
        <h2 className="section-title" style={{ fontSize: '1rem' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontWeight: 500 }}>{subtitle}</p>}
      </div>
    </div>
    {linkTo && (
      <Link to={linkTo} style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700,
        color: '#a78bfa', textDecoration: 'none', transition: 'color 0.2s'
      }}>
        View all <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
      </Link>
    )}
  </div>
);

const ProductSkeleton = () => (
  <div style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: '168px' }} />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '10px', width: '40%' }} />
      <div className="skeleton" style={{ height: '14px', width: '75%' }} />
      <div className="skeleton" style={{ height: '20px', width: '55%' }} />
      <div className="skeleton" style={{ height: '38px', borderRadius: '0.625rem', marginTop: '0.5rem' }} />
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, text, color, glow }) => (
  <div className="glass-card" style={{ padding: '1.5rem' }}>
    <div style={{
      width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', marginBottom: '1rem',
      background: `${glow}25`, border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color,
    }}>
      <Icon style={{ width: '1.125rem', height: '1.125rem' }} />
    </div>
    <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h4>
    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{text}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery]             = useState('');
  const [activeCategory, setCategory] = useState('All');
  const [trending, setTrending]       = useState([]);
  const [priceDrops, setPriceDrops]   = useState([]);
  const [topPicks, setTopPicks]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalProducts, setTotal]     = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res   = await fetchProducts({ limit: 60 });
        const items = res.data || [];
        setTotal(items.length);

        // Sort by different criteria for each section
        const byDrop     = [...items].filter(p => (p.analytics?.trendScore || 0) < 0).slice(0, 4);
        const byDeal     = [...items].filter(p => (p.analytics?.realDiscount || 0) > 5).slice(0, 4);
        const byCategory = activeCategory === 'All'
          ? items.slice(0, 4)
          : items.filter(p => p.category?.toLowerCase().includes(activeCategory.toLowerCase())).slice(0, 4);

        setTrending(byCategory.length ? byCategory : items.slice(0, 4));
        setPriceDrops(byDrop.length    ? byDrop     : items.slice(4, 8));
        setTopPicks(byDeal.length      ? byDeal     : items.slice(8, 12));
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero-gradient animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem 2rem', position: 'relative' }}>
        {/* Floating orbs */}
        <div className="orb orb-purple" style={{ top: '-80px', left: '50%', transform: 'translateX(-60%)', opacity: 0.5 }} />
        <div className="orb orb-indigo" style={{ top: '20px', right: '5%', opacity: 0.35 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {/* Pill badge */}
          <div className="trust-pill" style={{ marginBottom: '0.5rem' }}>
            <Sparkles style={{ width: '0.7rem', height: '0.7rem', color: '#a78bfa' }} />
            AI-Powered Price Intelligence Platform
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)' }}>
            Stop Overpaying.<br />
            <span className="gradient-text">Buy Smarter.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '480px', lineHeight: 1.6 }}>
            Track prices across Amazon, Flipkart, Croma & more. Get AI-driven buy signals before every purchase.
          </p>

          {/* Hero search */}
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '580px' }}>
            <div className="hero-search" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <Search style={{ width: '1.1rem', height: '1.1rem', color: '#a78bfa', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search phones, laptops, headphones..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.85rem', flexShrink: 0 }}>
                Search
              </button>
            </div>
          </form>

          {/* Popular searches */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)} style={{
                padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor='var(--accent-purple)'; e.currentTarget.style.color='var(--accent-purple)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-muted)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="animate-fade-up">
        <StatCard icon={Package}    label="Products Tracked"   value={totalProducts || '50'}  suffix="+" color="#a78bfa" glow="#7c3aed" />
        <StatCard icon={Flame}      label="Price Drops Today"  value="12"                     color="#f59e0b" glow="#d97706" />
        <StatCard icon={TrendingUp} label="Avg Savings Found"  value="₹3,240"                 color="#10b981" glow="#059669" />
        <StatCard icon={Star}       label="AI Recommendations" value="98"                     suffix="%" color="#6366f1" glow="#4f46e5" />
      </div>

      <div className="divider" />

      {/* ── CATEGORY FILTER ───────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`category-pill${activeCategory === cat ? ' active' : ''}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── TRENDING ──────────────────────────────── */}
      <section className="animate-fade-up">
        <SectionHeader
          title="🔥 Trending Now"
          icon={<Flame style={{ width: '0.9rem', height: '0.9rem', color: '#f59e0b' }} />}
          subtitle={`Most tracked products ${activeCategory !== 'All' ? `in ${activeCategory}` : 'right now'}`}
          linkTo="/products"
        />
        <div style={grid4}>
          {loading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : trending.map(p => <ProductCard key={p._id || p.name} product={p} />)}
        </div>
      </section>

      {/* ── PRICE DROPS ───────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <SectionHeader
          title="📉 Biggest Price Drops"
          icon={<TrendingDown style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} />}
          subtitle="Prices falling right now — AI verified drops"
          linkTo="/products"
        />
        <div style={grid4}>
          {loading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : priceDrops.map(p => <ProductCard key={p._id || p.name} product={p} />)}
        </div>
      </section>

      {/* ── AI PICKS ──────────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <SectionHeader
          title="⭐ AI Recommended Deals"
          icon={<Activity style={{ width: '0.9rem', height: '0.9rem', color: '#6366f1' }} />}
          subtitle="Best buy signals from the intelligence engine"
          linkTo="/products"
        />
        <div style={grid4}>
          {loading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : topPicks.map(p => <ProductCard key={p._id || p.name} product={p} />)}
        </div>
      </section>

      <div className="divider" />

      {/* ── WATCHLIST CTA BANNER ──────────────────── */}
      <section style={{
        borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.15) 50%, rgba(236,72,153,0.1) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        padding: '2.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap'
      }}>
        <div className="orb orb-purple" style={{ top: '-60px', right: '-60px', opacity: 0.4, width: '250px', height: '250px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <Bell style={{ width: '1.125rem', height: '1.125rem', color: '#a78bfa' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>Price Alerts</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Never miss a deal again.
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, maxWidth: '380px', lineHeight: 1.6 }}>
            Set a target price and walk away. We monitor prices 24/7 and alert you the moment it drops.
          </p>
        </div>
        <Link to="/watchlist" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '0.9rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          Set Price Alert <ArrowRight style={{ width: '1rem', height: '1rem' }} />
        </Link>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section>
        <SectionHeader
          title="Why SmartCart?"
          icon={<Zap style={{ width: '0.9rem', height: '0.9rem', color: '#a78bfa' }} />}
          subtitle="Built for smarter, data-driven shopping decisions"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          <FeatureCard icon={BarChart2}  title="Price History & Trends" text="Track every price movement with 6-hour precision. Never get fooled by fake discounts again." color="#7c3aed" glow="#7c3aed" />
          <FeatureCard icon={TrendingUp} title="30-Day Forecasts"        text="Linear regression models predict where the price is headed — buy at the right moment." color="#6366f1" glow="#6366f1" />
          <FeatureCard icon={ShieldCheck}title="Real Discount Score"     text="We calculate actual savings vs. 90-day average — not the inflated MRP the sellers show." color="#10b981" glow="#10b981" />
          <FeatureCard icon={Eye}        title="Smart Watchlist"         text="Set a target price on any product. Get an instant email when the price drops." color="#f59e0b" glow="#d97706" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
