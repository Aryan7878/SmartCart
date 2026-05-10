import React, { useState, useEffect } from 'react';
import { Bell, Trash2, ExternalLink, Loader2, AlertCircle, ShoppingBag, ArrowRight, Target, TrendingDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import AuthModal from '../components/AuthModal';

const WatchlistPage = () => {
    const { currency } = useCurrency();
    const { isLoggedIn } = useAuth();
    const [items, setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            loadWatchlist();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const loadWatchlist = async () => {
        try {
            setLoading(true);
            const res = await getWatchlist();
            setItems(res.data || []);
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load your watchlist.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await removeFromWatchlist(id);
            setItems(items.filter(item => item._id !== id));
        } catch {
            alert('Failed to remove item.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <Loader2 style={{ width: '2rem', height: '2rem', color: '#7c3aed' }} className="animate-spin" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Synchronizing alerts…</p>
        </div>
    );

    if (!isLoggedIn) {
        return (
            <>
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '70vh', textAlign: 'center', gap: '1.5rem'
                }} className="animate-fade-up">
                    <div style={{
                        width: '5rem', height: '5rem', borderRadius: '50%',
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bell style={{ width: '2rem', height: '2rem', color: '#a78bfa' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Authentication Required</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                            Sign in to sync your price alerts across devices and get real-time drop notifications.
                        </p>
                    </div>
                    <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ padding: '0.875rem 2rem', borderRadius: '0.875rem' }}>
                        Sign In / Register
                    </button>
                </div>
            </>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        Alert <span className="gradient-text">Engine</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        Monitoring {items.length} product{items.length !== 1 ? 's' : ''} for market fluctuations.
                    </p>
                </div>
                {items.length > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '0.75rem',
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                        color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 800
                    }}>
                        <Sparkles style={{ width: '1rem', height: '1rem' }} />
                        Real-time tracking active
                    </div>
                )}
            </div>

            {error ? (
                <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '1.25rem', padding: '2rem', textAlign: 'center'
                }}>
                    <AlertCircle style={{ width: '2rem', height: '2rem', color: '#f87171', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#fca5a5', fontWeight: 500 }}>{error}</p>
                    <button onClick={loadWatchlist} style={{ marginTop: '1rem', color: '#f87171', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                        Try Again
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div style={{
                    background: 'rgba(18,18,42,0.5)', border: '2px dashed var(--border-subtle)',
                    borderRadius: '1.5rem', padding: '6rem 2rem', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem'
                }} className="animate-fade-up">
                    <div style={{
                        width: '4.5rem', height: '4.5rem', borderRadius: '1.25rem',
                        background: 'rgba(12,12,26,0.5)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ShoppingBag style={{ width: '2rem', height: '2rem', color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Engine Standby</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem', maxWidth: '380px' }}>
                            You aren't tracking any items yet. Add products to get notified of the next major price drop.
                        </p>
                    </div>
                    <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
                        Explore Marketplace <ArrowRight style={{ width: '1.1rem', height: '1.1rem' }} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}
                    className="animate-fade-in">
                    {items.map((item) => {
                        const alertSent = !item.isActive;
                        const priceDiff = item.initialPrice - item.targetPrice;
                        const pct = item.initialPrice > 0 ? ((priceDiff / item.initialPrice) * 100).toFixed(0) : 0;

                        return (
                            <div key={item._id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                {/* Image & Info */}
                                <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{
                                        width: '4.5rem', height: '4.5rem', borderRadius: '0.75rem', flexShrink: 0,
                                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem'
                                    }}>
                                        <img
                                            src={item.product?.image || 'https://placehold.co/100x100/0d0d1a/a78bfa?text=SC'}
                                            alt={item.product?.name}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h4 style={{
                                            fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.product?.name}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa' }}>
                                                {item.product?.brand || 'Premium'}
                                            </span>
                                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border-subtle)' }} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                {item.product?.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(12,12,26,0.3)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <Target style={{ width: '0.75rem', height: '0.75rem', color: '#a78bfa' }} />
                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target</span>
                                        </div>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 950, color: '#c4b5fd' }}>
                                            {formatCurrency(item.targetPrice, currency)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <TrendingDown style={{ width: '0.75rem', height: '0.75rem', color: '#10b981' }} />
                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Initial</span>
                                        </div>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-primary)' }}>
                                            {formatCurrency(item.initialPrice, currency)}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer & Actions */}
                                <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
                                    <Link
                                        to={`/products/${item.product?._id}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                            fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Engine View <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                                    </Link>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {pct > 0 && (
                                           <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.625rem', borderRadius: '99px' }}>
                                               -{pct}%
                                           </div>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            style={{
                                                padding: '0.5rem', borderRadius: '0.5rem',
                                                background: 'rgba(239,68,68,0.1)', border: 'none',
                                                color: '#f87171', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                        >
                                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Alert sent overlay */}
                                {alertSent && (
                                    <div style={{
                                        position: 'absolute', inset: 0, 
                                        background: 'rgba(18,18,42,0.6)', backdropFilter: 'blur(2px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 10
                                    }}>
                                        <div style={{
                                            background: '#10b981', color: 'white',
                                            padding: '0.4rem 1rem', borderRadius: '99px',
                                            fontSize: '0.75rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(16,185,129,0.4)'
                                        }}>
                                            THRESHOLD REACHED ✓
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
