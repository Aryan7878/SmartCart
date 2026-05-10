import React, { useState, useEffect } from 'react';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { 
    X, ArrowLeft, ExternalLink, 
    ShoppingCart, Activity, TrendingDown,
    TrendingUp, Package, Trash2, Cpu
} from 'lucide-react';
import { analyzeProduct } from '../services/api';
import BuyBadge from '../components/BuyBadge';
import { getMarketplaceSearchUrl } from '../utils/marketplaceUrl';

const ComparisonPage = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { currency } = useCurrency();
    const [intelligence, setIntelligence] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllIntelligence = async () => {
            if (compareItems.length === 0) return;
            setLoading(true);
            try {
                const results = await Promise.all(
                    compareItems.map(item => analyzeProduct(item._id || item.id))
                );
                const intelMap = {};
                results.forEach((res, index) => {
                    const id = compareItems[index]._id || compareItems[index].id;
                    intelMap[id] = res.data;
                });
                setIntelligence(intelMap);
            } catch (err) {
                console.error("Failed to fetch intelligence for comparison", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllIntelligence();
    }, [compareItems]);

    if (compareItems.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '70vh', textAlign: 'center', gap: '1.5rem'
            }} className="animate-fade-up">
                <div style={{
                    width: '6rem', height: '6rem', borderRadius: '1.5rem',
                    background: 'rgba(12,12,26,0.5)', border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Package style={{ width: '2.5rem', height: '2.5rem', color: 'var(--text-muted)' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>No comparisons queued</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                        Add products from the catalog to see side-by-side technical intelligence and price trajectories.
                    </p>
                </div>
                <Link to="/products" className="btn-primary" style={{ padding: '0.875rem 2rem', borderRadius: '1rem' }}>
                    Browse Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        Side-by-side <span className="gradient-text">Intelligence</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        Cross-referencing {compareItems.length} intelligence models.
                    </p>
                </div>
                <button 
                    onClick={clearCompare}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1rem', borderRadius: '0.75rem',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                    }}
                >
                    <Trash2 style={{ width: '1rem', height: '1rem' }} /> Clear Stack
                </button>
            </div>

            {/* Comparison Grid */}
            <div style={{ overflowX: 'auto', paddingBottom: '2rem' }} className="custom-scrollbar">
                <div style={{ display: 'flex', gap: '1.5rem', minWidth: 'max-content' }}>
                    {compareItems.map((item) => {
                        const id = item._id || item.id;
                        const intel = intelligence[id];
                        const bestPrice = item.marketplaces?.length > 0 
                            ? Math.min(...item.marketplaces.map(m => m.price)) 
                            : (item.price || 0);

                        return (
                            <div key={id} style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Product Card */}
                                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                                    <button 
                                        onClick={() => removeFromCompare(id)}
                                        style={{
                                            position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                                            background: 'rgba(12,12,26,0.8)', border: 'none',
                                            borderRadius: '50%', padding: '0.375rem', cursor: 'pointer', color: 'var(--text-muted)'
                                        }}
                                    >
                                        <X style={{ width: '0.875rem', height: '0.875rem' }} />
                                    </button>

                                    {/* Image Section */}
                                    <div style={{ height: '200px', padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <img 
                                            src={item.image || item.imageUrl || `https://via.placeholder.com/300?text=P`} 
                                            alt={item.name}
                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                            onError={e => { e.currentTarget.src = 'https://placehold.co/400x400/0d0d1a/a78bfa?text=No+Preview'; }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
                                            <BuyBadge rec={intel?.analytics?.buyRecommendation || 'monitor'} />
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ minHeight: '3.5rem' }}>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{item.brand || 'Premium'}</p>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                                {item.name}
                                            </h3>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>
                                                {formatCurrency(bestPrice, currency)}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Now</span>
                                        </div>

                                        {/* Marketplace Grid */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {item.marketplaces?.map((m, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(12,12,26,0.4)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.name}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(m.price, currency)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Buy Button */}
                                        <a 
                                            href={getMarketplaceSearchUrl(item.marketplaces?.[0]?.name || '', item.name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                                        >
                                            <ShoppingCart style={{ width: '1rem', height: '1rem' }} /> Storefront
                                        </a>
                                        <Link 
                                            to={`/products/${id}`}
                                            style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none' }}
                                            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                        >
                                            View Full Analysis
                                        </Link>
                                    </div>
                                </div>

                                {/* Intelligence */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1))',
                                        border: '1px solid rgba(139,92,246,0.2)',
                                        padding: '1.25rem', borderRadius: '1.25rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                               <Cpu style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa' }} />
                                               <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: '#c4b5fd' }}>Recommendation</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5, color: '#e2e8f0' }}>
                                            {intel?.prediction?.bestBuy?.rationale || (loading ? "Crunching..." : "Data stream inactive.")}
                                        </p>
                                    </div>

                                    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Volatility</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>{intel?.analytics?.volatilityIndex?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trend Slope</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {intel?.analytics?.trendScore < 0 ? <TrendingDown style={{ width: '0.75rem', height: '0.75rem', color: '#10b981' }} /> : <TrendingUp style={{ width: '0.75rem', height: '0.75rem', color: '#f87171' }} />}
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: intel?.analytics?.trendScore < 0 ? '#10b981' : '#f87171' }}>{intel?.analytics?.trendScore?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Real Savings</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#7c3aed' }}>{intel?.analytics?.realDiscount?.toFixed(1) || '0.0'}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
