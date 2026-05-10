import React, { useState } from 'react';
import { Bell, BellRing, Loader2, Target, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { addToWatchlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const TrackPriceButton = ({ productId, currentPrice }) => {
    const { isLoggedIn } = useAuth();
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [targetPrice, setTargetPrice]       = useState(Math.round(currentPrice * 0.9));
    const [loading, setLoading]               = useState(false);
    const [success, setSuccess]               = useState(false);
    const [error, setError]                   = useState(null);

    const handleOpenModal = () => {
        if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
        }
        setIsModalOpen(true);
    };

    const handleTrack = async () => {
        try {
            setLoading(true);
            setError(null);
            
            await addToWatchlist({
                productId,
                targetPrice: Number(targetPrice),
                initialPrice: currentPrice
            });

            setSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
            }, 2500);
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.response?.data?.message || "Failed to start tracking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            
            <button
                onClick={handleOpenModal}
                className="btn-primary"
                style={{ padding: '0.875rem 1.75rem', borderRadius: '1rem', fontSize: '0.9rem' }}
            >
                <Bell className="w-5 h-5" />
                Track Price Drops
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-fade-up"
                        style={{
                            background: 'rgba(18,18,42,0.98)', border: '1px solid var(--border-subtle)',
                            borderRadius: '1.5rem', width: '100%', maxWidth: '400px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', padding: '1.5rem', position: 'relative' }}>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                                    background: 'rgba(255,255,255,0.15)', border: 'none',
                                    borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', color: 'white'
                                }}
                            >
                                <X style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <BellRing style={{ width: '2rem', height: '2rem', color: 'white', marginBottom: '0.75rem', opacity: 0.9 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Set Price Alert</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '0.25rem' }}>We'll notify you the moment it hits your goal.</p>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.75rem' }}>
                            {success ? (
                                <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '4rem', height: '4rem', borderRadius: '50%',
                                        background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <CheckCircle2 style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Alert Set!</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Tracking at ₹{Number(targetPrice).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Target style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa' }} /> Target Price (₹)
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '1rem 3.5rem 1rem 1.25rem',
                                                    background: 'rgba(12,12,26,0.8)', border: '1px solid var(--border-subtle)',
                                                    borderRadius: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem',
                                                    fontWeight: 900, outline: 'none', transition: 'border-color 0.2s',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}
                                                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                                            />
                                            <div style={{ position: 'absolute', right: '1.25rem', fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.75rem', pointerEvents: 'none' }}>
                                                INR
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                                            Current best is ₹{currentPrice.toLocaleString()}. We suggest {Math.round(currentPrice * 0.9).toLocaleString()}.
                                        </p>
                                    </div>

                                    {error && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem', background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem',
                                            color: '#f87171', fontSize: '0.75rem', fontWeight: 500
                                        }}>
                                            <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleTrack}
                                        disabled={loading}
                                        className="btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate Tracker"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TrackPriceButton;
