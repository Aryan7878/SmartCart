import React, { useState, useEffect, useMemo } from 'react';
import { Search, AlertCircle, Filter, ChevronDown, Package, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Phones', 'Laptops', 'Audio', 'Gaming', 'Wearables'];

const ProductSkeleton = () => (
    <div style={{
        background: 'rgba(18,18,42,0.9)', border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem', overflow: 'hidden', padding: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.875rem'
    }}>
        <div className="skeleton" style={{ height: '155px', borderRadius: '0.75rem' }} />
        <div className="skeleton" style={{ height: '13px', width: '70%' }} />
        <div className="skeleton" style={{ height: '12px', width: '45%' }} />
        <div className="skeleton" style={{ height: '34px', borderRadius: '0.5rem', marginTop: '0.25rem' }} />
    </div>
);

const ProductsPage = () => {
    const [searchParams]     = useSearchParams();
    const navigate            = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy]     = useState('default');
    const [showSort, setShowSort] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const res = await fetchProducts({ limit: 60 });
                setProducts(res.data || []);
            } catch (err) {
                setError(typeof err === 'string' ? err : 'Failed to load products. Is the server running?');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filtered = useMemo(() => {
        let list = [...products];
        if (category !== 'All') {
            list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }
        if (sortBy === 'price_asc') {
            list.sort((a, b) => Math.min(...(a.marketplaces?.map(m => m.price) || [a.price || 0])) - Math.min(...(b.marketplaces?.map(m => m.price) || [b.price || 0])));
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => Math.min(...(b.marketplaces?.map(m => m.price) || [b.price || 0])) - Math.min(...(a.marketplaces?.map(m => m.price) || [a.price || 0])));
        } else if (sortBy === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [products, category, search, sortBy]);

    const SORT_OPTIONS = [
        { value: 'default',    label: 'Default' },
        { value: 'price_asc',  label: 'Price: Low → High' },
        { value: 'price_desc', label: 'Price: High → Low' },
        { value: 'name',       label: 'Name A–Z' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        All <span className="gradient-text">Products</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {loading ? 'Loading…' : `${filtered.length} products${category !== 'All' ? ` in ${category}` : ''}`}
                    </p>
                </div>

                {/* Sort dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSort(!showSort)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1rem', borderRadius: '0.75rem',
                            background: 'rgba(22,22,48,0.8)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Filter style={{ width: '0.875rem', height: '0.875rem' }} />
                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                        <ChevronDown style={{ width: '0.875rem', height: '0.875rem', transform: showSort ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showSort && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 50,
                            background: 'rgba(18,18,42,0.98)', border: '1px solid var(--border-subtle)',
                            borderRadius: '0.875rem', overflow: 'hidden', minWidth: '180px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                        }}>
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.625rem 1rem',
                                        background: sortBy === opt.value ? 'rgba(124,58,237,0.15)' : 'none',
                                        border: 'none', color: sortBy === opt.value ? '#c4b5fd' : 'var(--text-secondary)',
                                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => { if (sortBy !== opt.value) e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                                    onMouseOut={e => { if (sortBy !== opt.value) e.currentTarget.style.background = 'none'; }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search + Category filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
                className="animate-fade-up">
                {/* Search input */}
                <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
                    <Search style={{
                        position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                        width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none'
                    }} />
                    <input
                        type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products, brands…"
                        className="search-input"
                    />
                </div>

                {/* Category chips */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className={`category-pill${category === cat ? ' active' : ''}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '1rem', padding: '1rem 1.25rem'
                }}>
                    <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#f87171', flexShrink: 0 }} />
                    <p style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 500 }}>{error}</p>
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
                    {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}
                    className="animate-fade-in">
                    {filtered.map(p => <ProductCard key={p._id || p.id || p.name} product={p} />)}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center', padding: '5rem 2rem',
                    background: 'rgba(18,18,42,0.5)', borderRadius: '1.25rem',
                    border: '2px dashed var(--border-subtle)'
                }}>
                    <Package style={{ width: '3rem', height: '3rem', color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        No products found
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Try a different category or clear your search.
                    </p>
                    <button onClick={() => { setSearch(''); setCategory('All'); }}
                        style={{ marginTop: '1rem', color: '#a78bfa', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Reset filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
