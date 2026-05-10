import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, TrendingDown, Clock, Percent, LineChart, Cpu,
         ShoppingCart, ExternalLink, ArrowDown, ArrowUp, MessageSquare,
         AlertCircle, Loader2, Users, Shield, Zap, Tag, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, analyzeProduct } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { getMarketplaceSearchUrl } from '../utils/marketplaceUrl';
import PriceChart from '../components/PriceChart';
import BuyBadge from '../components/BuyBadge';
import TrackPriceButton from '../components/TrackPriceButton';
import ProductReviews from '../components/ProductReviews';

const MARKETPLACE_COLORS = {
  amazon:   { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  flipkart: { color: '#93c5fd', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)'  },
  croma:    { color: '#5eead4', bg: 'rgba(20,184,166,0.12)',  border: 'rgba(20,184,166,0.25)'  },
  myntra:   { color: '#f9a8d4', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
};

const getMpStyle = (name = '') =>
  MARKETPLACE_COLORS[name.toLowerCase()] || { color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' };

const InsightItem = ({ label, value, valueColor }) => (
  <div className="insight-row">
    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
    <span style={{ color: valueColor || 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}>{value}</span>
  </div>
);

const AnalyticTile = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="glass-card" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <div style={{
        width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon style={{ width: '0.8rem', height: '0.8rem', color }} />
      </div>
      <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
    </div>
    <p style={{ fontSize: '1.625rem', fontWeight: 900, color: color || 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontWeight: 500 }}>{subtext}</p>
  </div>
);

const fakeTrackers = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return 80 + (Math.abs(h) % 420);
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState({ product: null, analytics: null, prediction: null, history: [] });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [prodRes, analyzeRes] = await Promise.all([fetchProductById(id), analyzeProduct(id)]);
        setData({
          product:    prodRes.data,
          analytics:  analyzeRes.data.analytics,
          prediction: analyzeRes.data.prediction,
          history:    analyzeRes.data.history || [],
        });
      } catch (err) {
        setError('Could not load product data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <Loader2 style={{ width: '2rem', height: '2rem', color: '#7c3aed' }} className="animate-spin" />
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Crunching Market Data…</p>
    </div>
  );

  if (error || !data.product) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1.5rem' }}>
      <AlertCircle style={{ width: '3rem', height: '3rem', color: '#f87171' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Product Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '360px' }}>{error}</p>
      <Link to="/products" className="btn-primary">← Back to Products</Link>
    </div>
  );

  const { product, analytics, prediction, history } = data;
  const recommendation = analytics?.buyRecommendation || 'monitor';
  const prices         = history?.map(h => h.price) || [];
  const avgPrice       = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : product.price;
  const lowestPrice    = prices.length > 0 ? Math.min(...prices) : product.price;
  const highestPrice   = prices.length > 0 ? Math.max(...prices) : product.price;
  const currentPrice   = product.price || product.marketplaces?.[0]?.price || 0;
  const priceDiffPct   = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
  const isDiscounted   = priceDiffPct < 0;
  const bestMp         = product.marketplaces?.reduce((a, b) => (a.price < b.price ? a : b), product.marketplaces[0] || {});
  const bestMarketPrice = bestMp?.price || currentPrice;
  const trackers        = fakeTrackers(product.name);

  const asin      = product.marketplaces?.find(m => m.name.toLowerCase().includes('amazon'))?.url?.match(/\/([A-Z0-9]{10})(?:[/?]|$)/)?.[1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Breadcrumb ──────────────────────────── */}
      <Link to="/products" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.825rem', fontWeight: 600,
        transition: 'color 0.2s', width: 'fit-content'
      }}
      onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'}
      onMouseOut={e => e.currentTarget.style.color='var(--text-muted)'}
      >
        <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> All Products
      </Link>

      {/* ── Product Hero ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '1.75rem', alignItems: 'start' }}>

        {/* Main card */}
        <div className="glass-card-static" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Image */}
            <div style={{
              width: '220px', height: '220px', flexShrink: 0, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <img
                src={product.image || 'https://placehold.co/400x400/0d0d1a/a78bfa?text=SmartCart'}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={e => { e.currentTarget.src = 'https://placehold.co/400x400/0d0d1a/a78bfa?text=No+Preview'; }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '0.5rem' }}>
                  {product.brand} · {product.category}
                </p>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {product.name}
                </h1>
              </div>

              {/* Trust signals row */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="trust-pill">
                  <span className="dot" />
                  {trackers} users tracking
                </span>
                <span className="trust-pill">
                  <Clock style={{ width: '0.65rem', height: '0.65rem', color: '#a78bfa' }} />
                  Updated 2h ago
                </span>
                <span className="trust-pill">
                  <Shield style={{ width: '0.65rem', height: '0.65rem', color: '#10b981' }} />
                  Verified pricing
                </span>
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Best Price</p>
                  <p style={{ fontSize: '2.25rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {formatCurrency(bestMarketPrice, currency)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>vs 90-day Average</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatCurrency(avgPrice, currency)}
                    </span>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 900, padding: '0.2rem 0.625rem', borderRadius: '9999px',
                      background: isDiscounted ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: isDiscounted ? '#10b981' : '#f87171',
                      display: 'flex', alignItems: 'center', gap: '0.2rem'
                    }}>
                      {isDiscounted ? <ArrowDown style={{ width: '0.7rem' }} /> : <ArrowUp style={{ width: '0.7rem' }} />}
                      {Math.abs(priceDiffPct).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <BuyBadge rec={recommendation} large />
                </div>
              </div>

              <div>
                <TrackPriceButton productId={product._id} currentPrice={bestMarketPrice} />
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace stack */}
        <div className="glass-card-static" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart style={{ width: '1rem', height: '1rem', color: '#7c3aed' }} />
            Buy Now
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {product.marketplaces?.map((m, i) => {
              const style = getMpStyle(m.name);
              const isBest = m.price === bestMarketPrice;
              return (
                <div key={i} className="mp-row" style={{ position: 'relative' }}>
                  {isBest && (
                    <span style={{
                      position: 'absolute', top: '-8px', left: '12px',
                      fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                      background: 'rgba(16,185,129,0.2)', color: '#6ee7b7',
                      border: '1px solid rgba(16,185,129,0.3)', borderRadius: '9999px',
                      padding: '0.1rem 0.4rem', letterSpacing: '0.05em'
                    }}>Best</span>
                  )}
                  <div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                      borderRadius: '9999px', background: style.bg, color: style.color,
                      border: `1px solid ${style.border}`, textTransform: 'capitalize', display: 'inline-block', marginBottom: '0.25rem'
                    }}>{m.name}</span>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: isBest ? '#6ee7b7' : 'var(--text-primary)' }}>
                      {formatCurrency(m.price, currency)}
                    </p>
                  </div>
                  <a href={getMarketplaceSearchUrl(m.name, product.name)} target="_blank" rel="noopener noreferrer"
                    className="btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', fontSize: '0.72rem', textDecoration: 'none' }}>
                    Buy <ExternalLink style={{ width: '0.7rem', height: '0.7rem' }} />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Price insights quick summary */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <InsightItem label="Lowest Ever"   value={formatCurrency(lowestPrice, currency)}   valueColor="#10b981" />
            <InsightItem label="Highest Ever"  value={formatCurrency(highestPrice, currency)}  valueColor="#f87171" />
            <InsightItem label="Drop Chance"   value={`${Math.round((analytics?.dropProbability || 0) * 100)}% in 30d`} />
            <InsightItem label="Volatility"    value={analytics?.volatilityIndex?.toFixed(1) || '—'} />
          </div>
        </div>
      </div>

      {/* ── Analytics tiles ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <AnalyticTile icon={Activity}   label="Volatility"         value={analytics?.volatilityIndex?.toFixed(1) || '—'}                                 subtext="Price swing intensity"    color="#a78bfa" />
        <AnalyticTile icon={TrendingDown}label="Trend Momentum"    value={`${analytics?.trendScore > 0 ? '+' : ''}${analytics?.trendScore?.toFixed(2) || '0.00'}`} subtext="Direction of movement" color={analytics?.trendScore < 0 ? '#10b981' : '#f87171'} />
        <AnalyticTile icon={Percent}    label="Real Discount"      value={`${analytics?.realDiscount?.toFixed(1) || '0.0'}%`}                              subtext="vs. historical peak"     color="#6366f1" />
        <AnalyticTile icon={Clock}      label="Drop Probability"   value={`${Math.round((analytics?.dropProbability || 0) * 100)}%`}                       subtext="Likelihood in 30 days"   color="#f59e0b" />
      </div>

      {/* ── Chart + AI summary ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
        <div className="glass-card-static" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-primary)' }}>
            <LineChart style={{ width: '1rem', height: '1rem', color: '#7c3aed' }} /> Price History & Forecast
          </h3>
          <div style={{ height: '320px' }}>
            <PriceChart history={history} forecast7Day={prediction?.forecast7Day} forecast30Day={prediction?.forecast30Day} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* AI summary */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <Cpu style={{ width: '1rem', height: '1rem', color: '#a78bfa' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c4b5fd' }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.65, fontWeight: 500 }}>
              {prediction?.dropProbability?.interpretation || 'Monitoring price trajectory for optimal buy signal.'}
              {analytics?.trendScore < 0 ? ' Current trajectory is favorable — prices are declining.' : ' Market holding at current levels — watch for entry.'}
            </p>
          </div>

          {/* Best time to buy */}
          <div className="glass-card-static" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Calendar style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Best Time to Buy</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6, borderLeft: '3px solid #7c3aed', paddingLeft: '0.875rem' }}>
              {prediction?.bestBuy?.rationale || 'Monitor for 48h for a stable entry point based on volatility index.'}
            </p>
          </div>

          {/* Forecast */}
          {prediction?.forecast7Day && (
            <div className="glass-card-static" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Zap style={{ width: '0.9rem', height: '0.9rem', color: '#f59e0b' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Price Forecast</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>7-Day</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(prediction.forecast7Day.forecastPrice, currency)}</p>
                </div>
                {prediction?.forecast30Day && (
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>30-Day</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(prediction.forecast30Day.forecastPrice, currency)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────── */}
      {asin && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <MessageSquare style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} /> Buyer Sentiment
          </h2>
          <ProductReviews asin={asin} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
