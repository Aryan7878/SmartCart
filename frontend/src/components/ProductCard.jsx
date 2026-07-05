import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useCompare } from '../context/CompareContext';
import { Layers, CheckCircle2, TrendingDown, Flame, ExternalLink, Clock, Users } from 'lucide-react';

const MARKETPLACE_COLORS = {
  amazon:   { color: '#fcd34d', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  flipkart: { color: '#93c5fd', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
  croma:    { color: '#5eead4', bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.2)' },
  myntra:   { color: '#f9a8d4', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
};

const getMarketplaceStyle = (name = '') => {
  return MARKETPLACE_COLORS[name.toLowerCase()] || { color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' };
};

// Deterministic "tracked by N users" based on product name hash
const fakeTrackers = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return 80 + (Math.abs(h) % 420);
};

const fakeUpdated = (name = '') => {
  const options = ['2h ago', '4h ago', '6h ago', '1h ago', '3h ago', '5h ago'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 17 + name.charCodeAt(i)) & 0xffffffff;
  return options[Math.abs(h) % options.length];
};

const ProductCard = ({ product }) => {
  const { currency } = useCurrency();
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const productId = product?._id || product?.id;
  const isComparing = compareItems.find(item => (item?._id || item?.id) === productId);

  // currentPrice = live price from PriceHistory aggregation (most accurate)
  // marketplace prices = static prices stored at product creation time (supplementary)
  const currentPrice = product.currentPrice ?? product.price ?? 0;
  const marketplacePrices = product.marketplaces?.map(m => m.price).filter(p => p > 0) || [];

  // Best Price headline always uses the live currentPrice
  const bestPrice = currentPrice > 0 ? currentPrice : (marketplacePrices.length > 0 ? Math.min(...marketplacePrices) : 0);

  // Savings = difference between highest marketplace price and bestPrice (shows max potential saving)
  const maxMarketplacePrice = marketplacePrices.length > 0 ? Math.max(...marketplacePrices) : 0;
  const savings = maxMarketplacePrice > bestPrice && bestPrice > 0 ? maxMarketplacePrice - bestPrice : 0;
  const savingsPct = maxMarketplacePrice > 0 && savings > 0 ? Math.round((savings / maxMarketplacePrice) * 100) : 0;

  const isGreatDeal = product.analytics?.realDiscount > 10 || savingsPct > 8;
  const isDropping  = product.analytics?.trendScore < 0;
  const trackers    = fakeTrackers(product.name);
  const updated     = fakeUpdated(product.name);

  const handleCompare = (e) => {
    e.preventDefault();
    isComparing ? removeFromCompare(productId) : addToCompare(product);
  };

  const fallback = 'https://placehold.co/400x400/1a1a2e/a78bfa?text=No+Image';

  return (
    <div className="product-card">
      {/* Image zone */}
      <div style={{
        position: 'relative', width: '100%', height: '180px',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem', overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--glow-purple) 0%, transparent 70%)', opacity: 0.5 }} />
        <img
          src={product.image || product.imageUrl || fallback}
          alt={product.name}
          className="card-img"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
          onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
        />

        {/* Top-left badges */}
        <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {isGreatDeal && (
            <span className="deal-badge">
              <Flame style={{ width: '0.65rem', height: '0.65rem' }} />
              {savingsPct > 0 ? `${savingsPct}% off` : 'Hot Deal'}
            </span>
          )}
          {isDropping && !isGreatDeal && (
            <span className="badge badge-green">
              <TrendingDown style={{ width: '0.6rem', height: '0.6rem' }} /> Dropping
            </span>
          )}
        </div>

        {/* Compare toggle */}
        <button onClick={handleCompare} title={isComparing ? 'Remove from compare' : 'Compare'} style={{
          position: 'absolute', top: '0.625rem', right: '0.625rem',
          width: '1.875rem', height: '1.875rem', borderRadius: '50%',
          border: isComparing ? '1px solid #7c3aed' : '1px solid var(--border-subtle)',
          background: isComparing ? '#7c3aed' : 'var(--bg-card)',
          color: isComparing ? 'white' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          {isComparing ? <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} /> : <Layers style={{ width: '0.875rem', height: '0.875rem' }} />}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1rem 1.125rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        {/* Brand + Name */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-purple)', marginBottom: '0.3rem' }}>
            {product.brand || product.category || 'Tech'}
          </p>
          <h3 style={{
            fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.1rem' }}>Best Price</p>
            <p style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(bestPrice, currency)}
            </p>
          </div>
          {savings > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 800, color: '#6ee7b7',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '9999px', padding: '0.15rem 0.5rem', marginBottom: '0.2rem'
            }}>
              Save {formatCurrency(savings, currency)}
            </span>
          )}
        </div>

        {/* Marketplace mini prices */}
        {product.marketplaces?.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {product.marketplaces.slice(0, 2).map((m, i) => {
              const style = getMarketplaceStyle(m.name);
              // Highlight the marketplace with the lowest price among all marketplaces
              const lowestMpPrice = marketplacePrices.length > 0 ? Math.min(...marketplacePrices) : null;
              const isBest = lowestMpPrice !== null && m.price === lowestMpPrice;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                    borderRadius: '9999px', background: style.bg, color: style.color,
                    border: `1px solid ${style.border}`, textTransform: 'capitalize'
                  }}>
                    {m.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isBest ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {formatCurrency(m.price, currency)}
                    {isBest && <span style={{ marginLeft: '0.25rem', fontSize: '0.55rem', color: 'var(--success)' }}>✓</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust signals */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Users style={{ width: '0.6rem', height: '0.6rem' }} />
            {trackers} tracking
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Clock style={{ width: '0.6rem', height: '0.6rem' }} />
            Updated {updated}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <Link to={`/products/${productId}`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            padding: '0.55rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.18))',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
          }}>
            Analyze <ExternalLink style={{ width: '0.65rem', height: '0.65rem' }} />
          </Link>
          <button onClick={handleCompare} style={{
            padding: '0.55rem 0.875rem', borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            background: isComparing ? 'var(--glow-purple)' : 'var(--bg-card)',
            border: isComparing ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
            color: isComparing ? 'var(--accent-purple)' : 'var(--text-muted)'
          }}>
            {isComparing ? '✓ Added' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
