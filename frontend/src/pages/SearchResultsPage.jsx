import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, SlidersHorizontal, ShoppingBag, LayoutGrid, CheckCircle2, Globe } from 'lucide-react';
import { searchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const MARKETPLACES = ['amazon', 'flipkart', 'croma'];

const SkeletonCard = () => (
    <div style={{
        background: 'rgba(18,18,42,0.9)', border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
    }}>
        <div className="skeleton" style={{ height: '140px', borderRadius: '0.75rem' }} />
        <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        <div className="skeleton" style={{ height: '12px', width: '40%' }} />
        <div className="skeleton" style={{ height: '32px', borderRadius: '0.5rem' }} />
    </div>
);

const SearchResultsPage = () => {
    const [searchParams, setSearchParams]          = useSearchParams();
    const queryFromUrl                              = searchParams.get('q') || '';
    const [inputValue, setInputValue]              = useState(queryFromUrl);
    const [results, setResults]                    = useState([]);
    const [loading, setLoading]                    = useState(false);
    const [autoAdded, setAutoAdded]                = useState(false);
    const [error, setError]                        = useState(null);
    const [priceRange, setPriceRange]              = useState({ min: 0, max: 250000 });
    const [selectedMarketplaces, setSelectedMarks] = useState(['amazon', 'flipkart', 'croma']);
    const [sortBy, setSortBy]                      = useState('price_asc');

    const runSearch = useCallback(async (q) => {
        if (!q.trim()) return;
        setLoading(true);
        setError(null);
        setAutoAdded(false);
        try {
            // Backend does: local DB search → external scrape + auto-save if empty
            const res = await searchProducts(q.trim());
            const data = res.data || [];

            // Detect if results came from external sources (has isExternal flag or ext- id prefix)
            const hasExternalResults = data.some(
                p => p.isExternal || (p.id && String(p.id).startsWith('ext-'))
            );
            if (hasExternalResults) setAutoAdded(true);

            setResults(data);

            if (data.length > 0) {
                const allPrices = data
                    .flatMap(r => r.marketplaces?.map(m => m.price) || [r.currentPrice || r.price || 0])
                    .filter(Boolean);
                if (allPrices.length > 0) {
                    setPriceRange(prev => ({ ...prev, max: Math.ceil(Math.max(...allPrices) / 1000) * 1000 }));
                }
            }
        } catch (err) {
            setError(err?.toString() || 'Search failed.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (queryFromUrl) { setInputValue(queryFromUrl); runSearch(queryFromUrl); }
    }, [queryFromUrl, runSearch]);

    const processed = results
        .filter(r => {
            const lowest = r.currentPrice ||
                (r.marketplaces?.length > 0 ? Math.min(...r.marketplaces.map(m => m.price)) : (r.price || 0));
            const hasMk = r.marketplaces?.some(m => selectedMarketplaces.includes(m.name.toLowerCase()))
                || selectedMarketplaces.length === MARKETPLACES.length;
            return lowest >= priceRange.min && lowest <= priceRange.max && hasMk;
        })
        .sort((a, b) => {
            const pA = a.currentPrice || Math.min(...(a.marketplaces?.map(m => m.price) || [a.price || 0]));
            const pB = b.currentPrice || Math.min(...(b.marketplaces?.map(m => m.price) || [b.price || 0]));
            return sortBy === 'price_asc' ? pA - pB : pB - pA;
        });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ─────────────────────────────── */}
            <div className="animate-fade-in">
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    Universal <span className="gradient-text">Search</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    {queryFromUrl
                        ? loading
                            ? 'Scanning local database and live marketplaces…'
                            : `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${queryFromUrl}"`
                        : 'Search across Amazon, Flipkart, Croma and more in real time'}
                </p>
            </div>

            {/* ── Search bar ─────────────────────────── */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearchParams({ q: inputValue }); }}
                className="animate-fade-up"
                style={{ maxWidth: '640px' }}
            >
                <div className="hero-search">
                    <Search style={{ width: '1rem', height: '1rem', color: '#a78bfa', flexShrink: 0 }} />
                    <input
                        type="text" value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search phones, laptops, headphones..."
                    />
                    <button type="submit" className="btn-primary"
                        style={{ padding: '0.55rem 1.5rem', borderRadius: '9999px', fontSize: '0.85rem', flexShrink: 0 }}>
                        {loading
                            ? <Loader2 style={{ width: '1rem', height: '1rem' }} className="animate-spin" />
                            : 'Search'}
                    </button>
                </div>
            </form>

            {/* ── Live search indicator ──────────────── */}
            {loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                }} className="animate-fade-in">
                    <Globe style={{ width: '1.2rem', height: '1.2rem', color: '#a78bfa', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c4b5fd' }}>
                            Searching across all marketplaces…
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontWeight: 500 }}>
                            If not in our database, we'll scan Amazon, Flipkart & more live and auto-add results.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Auto-added success banner ──────────── */}
            {autoAdded && !loading && (
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                }} className="animate-fade-in">
                    <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem', color: '#10b981', flexShrink: 0, marginTop: '0.1rem' }} />
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>
                            {results.length} product{results.length !== 1 ? 's' : ''} found &amp; added to SmartCart!
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontWeight: 500 }}>
                            Sourced from live marketplaces and saved to your database — you can now track their prices.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: queryFromUrl ? '240px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

                {/* ── Filters Sidebar ─────────────────── */}
                {queryFromUrl && (
                    <aside className="glass-card animate-fade-up"
                        style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <SlidersHorizontal style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                                Filters
                            </span>
                        </div>

                        {/* Sort */}
                        <div>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.625rem' }}>
                                Sort order
                            </label>
                            <select
                                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: 'rgba(12,12,26,0.8)', border: '1px solid var(--border-subtle)',
                                    borderRadius: '0.75rem', color: 'var(--text-primary)', fontSize: '0.8rem',
                                    fontWeight: 700, outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                            </select>
                        </div>

                        {/* Platforms */}
                        <div>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.625rem' }}>
                                Platforms
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {MARKETPLACES.map(m => {
                                    const active = selectedMarketplaces.includes(m);
                                    return (
                                        <button key={m}
                                            onClick={() => setSelectedMarks(prev =>
                                                active ? prev.filter(x => x !== m) : [...prev, m]
                                            )}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.6rem 0.875rem', borderRadius: '0.75rem',
                                                border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border-subtle)',
                                                background: active ? 'rgba(124,58,237,0.15)' : 'rgba(12,12,26,0.6)',
                                                color: active ? '#c4b5fd' : 'var(--text-muted)',
                                                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                                                transition: 'all 0.2s', textTransform: 'capitalize'
                                            }}
                                        >
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? '#a78bfa' : 'var(--text-muted)' }} />
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Budget Cap</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#a78bfa' }}>₹{priceRange.max.toLocaleString()}</span>
                            </div>
                            <input
                                type="range" min="0" max="250000" step="5000"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                        </div>
                    </aside>
                )}

                {/* ── Results Grid ─────────────────────── */}
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : processed.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}
                            className="animate-fade-in">
                            {processed.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    ) : queryFromUrl ? (
                        <div style={{
                            textAlign: 'center', padding: '5rem 2rem',
                            background: 'rgba(18,18,42,0.5)', borderRadius: '1.5rem',
                            border: '2px dashed var(--border-subtle)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem'
                        }}>
                            <div style={{
                                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <ShoppingBag style={{ width: '1.5rem', height: '1.5rem', color: '#a78bfa' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                    No results for "{queryFromUrl}"
                                </h3>
                                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    Try a different search term, or reset filters below.
                                </p>
                            </div>
                            <button
                                onClick={() => { setPriceRange({ min: 0, max: 250000 }); setSelectedMarks(MARKETPLACES); }}
                                style={{
                                    padding: '0.6rem 1.5rem', borderRadius: '9999px',
                                    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                                    color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >
                                Reset filters
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                            <LayoutGrid style={{ width: '4rem', height: '4rem', color: 'var(--border-subtle)', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)' }}>What are you looking for?</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                Type a product name above to start searching.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
