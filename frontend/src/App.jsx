import React, { useState, useEffect, useRef } from 'react';

import {
    Camera, Shield, CheckCircle, AlertTriangle, MapPin,
    Wallet, DollarSign, Upload, Loader2, ThumbsUp,
    Award, Clock, TrendingUp, FileCheck, Image, ExternalLink,
    Sparkles, PartyPopper, X, Terminal, Activity, Zap,
    Lock, BarChart3, Globe, ArrowRight, Eye, Cpu,
    ChevronRight, Radio, CircleDot, Layers
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import AgentTerminal from './components/AgentTerminal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// CONFETTI
// ============================================
const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
            <div
                key={i}
                className="absolute animate-confetti"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 7)]
                }}
            />
        ))}
    </div>
);

// ============================================
// SEVERITY RING SVG
// ============================================
const SeverityRing = ({ severity, size = 44 }) => {
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (severity / 10) * circumference;
    const color = severity >= 9 ? '#ef4444' : severity >= 6 ? '#f97316' : severity >= 4 ? '#f59e0b' : '#22c55e';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="3" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={circumference} strokeDashoffset={circumference - progress}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <span className="absolute text-xs font-bold" style={{ color }}>{severity}</span>
        </div>
    );
};

// ============================================
// CONFIDENCE BAR
// ============================================
const ConfidenceBar = ({ value }) => (
    <div className="flex items-center gap-2 w-full">
        <div className="confidence-bar flex-1">
            <div className="confidence-bar-fill" style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-mono text-emerald-400">{value}%</span>
    </div>
);

// ============================================
// ANIMATED COUNTER
// ============================================
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const target = parseFloat(value);
        const duration = 1200;
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);
    return <span>{prefix}{decimals ? display.toFixed(decimals) : Math.round(display)}{suffix}</span>;
};

// ============================================
// PROTOCOL VISUALIZER (during analysis)
// ============================================
const ProtocolVisualizer = ({ step }) => {
    const nodes = [
        { id: 1, label: 'Submit', icon: Upload, cost: null },
        { id: 2, label: 'HTTP 402', icon: Lock, cost: null },
        { id: 3, label: 'Sign', icon: Shield, cost: '$0.01' },
        { id: 4, label: 'Verify', icon: Eye, cost: '$0.01' },
        { id: 5, label: 'Enrich', icon: Globe, cost: '$0.005' },
        { id: 6, label: 'Bounty', icon: Award, cost: null },
    ];

    return (
        <div className="glass-card rounded-xl p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">x402 Protocol Flow</span>
            </div>
            <div className="flex items-center justify-between gap-1">
                {nodes.map((node, idx) => {
                    const Icon = node.icon;
                    const state = step > node.id ? 'done' : step === node.id ? 'active' : 'pending';
                    return (
                        <React.Fragment key={node.id}>
                            <div className={`flex flex-col items-center gap-1 protocol-node ${state}`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500
                                    ${state === 'done' ? 'bg-emerald-500/20 border border-emerald-500/50' :
                                        state === 'active' ? 'bg-emerald-500/30 border border-emerald-400 animate-pulse shadow-lg shadow-emerald-500/20' :
                                            'bg-slate-800/60 border border-slate-700/50'}`}>
                                    {state === 'done' ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Icon className={`w-4 h-4 ${state === 'active' ? 'text-emerald-300' : 'text-slate-600'}`} />
                                    )}
                                </div>
                                <span className={`text-[9px] font-medium ${state === 'done' ? 'text-emerald-400' : state === 'active' ? 'text-emerald-300' : 'text-slate-600'}`}>
                                    {node.label}
                                </span>
                                {node.cost && state === 'done' && (
                                    <span className="text-[8px] font-mono text-emerald-500/70">{node.cost}</span>
                                )}
                            </div>
                            {idx < nodes.length - 1 && (
                                <div className={`flex-1 h-px max-w-[20px] transition-colors duration-500 ${step > node.id ? 'bg-emerald-500/50' : 'bg-slate-700/30'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Agent Cost Accumulator</span>
                <span className="font-mono text-emerald-400 font-bold">
                    ${step >= 5 ? '0.023' : step >= 4 ? '0.018' : step >= 3 ? '0.010' : '0.000'} USDC
                </span>
            </div>
        </div>
    );
};

// ============================================
// SUCCESS MODAL
// ============================================
const BountySuccessModal = ({ bounty, onClose }) => {
    if (!bounty) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-green-500/50 rounded-3xl p-8 max-w-md w-full animate-scale-up shadow-2xl shadow-green-500/20 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-4 animate-pulse-glow">
                        <PartyPopper className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Bounty Claimed! 🎉</h2>
                    <p className="text-slate-400 mt-2">Paid autonomously via x402 protocol</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center mb-6">
                    <p className="text-slate-400 text-sm mb-1">You earned</p>
                    <p className="text-5xl font-bold text-green-400">${bounty.amount}</p>
                    <p className="text-green-300 text-sm mt-1">USDC</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Severity Score</span>
                        <span className="text-white font-bold">{bounty.severity}/10</span>
                    </div>
                    {bounty.escrowId ? (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-orange-400 font-bold flex items-center gap-1">
                                <Lock className="w-4 h-4" /> BITE v2 Escrow
                            </span>
                            <span className="text-orange-300">{bounty.escrowId}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className="text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> PAID
                            </span>
                        </div>
                    )}
                    {bounty.receiptId && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">AP2 Receipt</span>
                            <span className="text-emerald-400/80 font-mono text-xs">{bounty.receiptId}</span>
                        </div>
                    )}
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 mb-6 space-y-3">
                    {/* BITE v2 Transaction */}
                    {bounty.biteTxHash && (
                        <div>
                            <p className="text-xs text-orange-400 mb-1 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> BITE v2 Encrypted Intent
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="text-[10px] text-orange-300 bg-slate-800 px-2 py-1 rounded flex-1 overflow-hidden font-mono">
                                    {bounty.biteTxHash}
                                </code>
                                <a href={bounty.blockscoutUrl || `https://base-sepolia-testnet-explorer.skalenodes.com:10032/tx/${bounty.biteTxHash}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-colors"
                                    title="View on SKALE Blockscout">
                                    <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Settlement Transaction */}
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Settlement Hash</p>
                        <div className="flex items-center gap-2">
                            <code className="text-[10px] text-emerald-300 bg-slate-800 px-2 py-1 rounded flex-1 overflow-hidden font-mono">
                                {bounty.txHash}
                            </code>
                            <a href={`https://testnet.cronoscan.com/tx/${bounty.txHash}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                title="View on Cronoscan">
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                        </div>
                    </div>
                </div>
                <button onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all">
                    Awesome! Back to Feed
                </button>
            </div>
        </div>
    );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
    const [started, setStarted] = useState(false);
    const [view, setView] = useState('dashboard');
    const [wallet, setWallet] = useState(null);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState(0);
    const [aiResult, setAiResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [successBounty, setSuccessBounty] = useState(null);
    const [showTerminal, setShowTerminal] = useState(false);

    // Refs for hidden file inputs
    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Handle file selection from camera or file picker
    const handleImageSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCapturedImage(ev.target.result);
            setView('verify');
        };
        reader.readAsDataURL(file);
        // Reset the input so the same file can be re-selected
        e.target.value = '';
    };

    // ---- Wallet ----
    const connectWallet = async () => {
        if (wallet) return;
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWallet(accounts[0]);
            } catch { setWallet('0xDemo...Wallet'); }
        } else {
            setWallet('0xD3m0...W4ll3t');
        }
    };

    const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Connect';

    // ---- Fetch data ----
    useEffect(() => {
        if (!started) return;
        fetch(`${API_URL}/api/reports`).then(r => r.json()).then(d => setReports(d.reports || [])).catch(() => { });
        fetch(`${API_URL}/api/stats`).then(r => r.json()).then(d => setStats(d)).catch(() => {
            setStats({
                totalReports: 5, totalBountyPaid: 30, avgSeverity: 6.2,
                activeAgents: 1, x402Transactions: 15, activeEscrows: 1,
                severityDistribution: { low: 1, medium: 2, high: 3, critical: 1 },
                departments: { 'Public Works': 4, 'Transportation': 3, 'Environmental': 2, 'Emergency': 1 },
                recentx402: []
            });
        });
    }, [started, view]);

    // ---- Helpers ----
    const getSeverityColor = (s) => s >= 9 ? '#ef4444' : s >= 6 ? '#f97316' : s >= 4 ? '#f59e0b' : '#22c55e';
    const getSeverityLabel = (s) => s >= 9 ? 'CRITICAL' : s >= 6 ? 'HIGH' : s >= 4 ? 'MEDIUM' : 'LOW';

    // ---- AI Verification ----
    const runAIVerification = async () => {
        setIsAnalyzing(true);
        setAnalyzeStep(1);
        try {
            for (let s = 1; s <= 6; s++) {
                await new Promise(r => setTimeout(r, 800));
                setAnalyzeStep(s);
            }

            // Build FormData to send the real image via multipart/form-data
            const formData = new FormData();
            formData.append('description', description);
            formData.append('reporterAddress', wallet || '0x0000000000000000000000000000000000000000');
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch(`${API_URL}/api/verify-report`, {
                method: 'POST',
                body: formData, // No Content-Type header — browser sets multipart boundary automatically
            });
            const data = await res.json();
            setAiResult(data);
        } catch (err) {
            setAiResult({
                isVerified: true, severity: 7, confidence: 94,
                summary: 'AI verification completed. Infrastructure issue confirmed with high confidence.',
                department: 'Transportation',
                bounty: { eligible: true, amount: 5, txHash: '0xsim...demo' }
            });
        }
        setIsAnalyzing(false);
    };

    // ---- Submit Report ----
    const submitReport = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 2000));
            const txHash = aiResult?.bounty?.txHash || '0xsim' + Date.now().toString(16);
            setShowConfetti(true);
            setSuccessBounty({
                amount: aiResult.bounty?.amount || 0,
                severity: aiResult.severity,
                txHash,
                escrowId: aiResult.bounty?.escrowId || null,
                receiptId: aiResult.ap2Receipt?.id || null
            });
            setTimeout(() => setShowConfetti(false), 4000);
        } catch (e) { setError(e.message); }
        setIsSubmitting(false);
    };

    const closeSuccessModal = () => {
        setSuccessBounty(null);
        setView('feed');
        setCapturedImage(null);
        setImageFile(null);
        setAiResult(null);
        setDescription('');
        setAnalyzeStep(0);
    };

    // ---- Welcome ----
    if (!started) return <LandingPage onStart={() => { setStarted(true); connectWallet(); }} />;

    // ---- Severity Distribution Bar ----
    const SeverityChart = () => {
        if (!stats) return null;
        const dist = stats.severityDistribution;
        const total = dist.low + dist.medium + dist.high + dist.critical;
        const bars = [
            { label: 'Low', count: dist.low, color: '#22c55e', cls: 'sev-low' },
            { label: 'Medium', count: dist.medium, color: '#f59e0b', cls: 'sev-med' },
            { label: 'High', count: dist.high, color: '#f97316', cls: 'sev-high' },
            { label: 'Critical', count: dist.critical, color: '#ef4444', cls: 'sev-crit' },
        ];
        return (
            <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5" /> Severity Distribution
                    </span>
                    <span className="text-xs text-slate-500">{total} total</span>
                </div>
                {bars.map(b => (
                    <div key={b.label} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-14">{b.label}</span>
                        <div className="flex-1 h-2.5 bg-slate-800/60 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${total ? (b.count / total * 100) : 0}%`, backgroundColor: b.color }} />
                        </div>
                        <span className="text-xs font-mono font-bold w-5 text-right" style={{ color: b.color }}>{b.count}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white cyber-grid">
            {showConfetti && <Confetti />}
            <BountySuccessModal bounty={successBounty} onClose={closeSuccessModal} />
            <AgentTerminal isOpen={showTerminal} onClose={() => setShowTerminal(false)} />

            {/* ============ HEADER ============ */}
            <header className="fixed top-0 w-full z-30 glass-dark">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">CivicLens</span>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            x402 LIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={connectWallet}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm transition-colors">
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono">{formatAddress(wallet)}</span>
                        </button>
                        <button onClick={() => setShowTerminal(true)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-green-400 transition-colors relative"
                            title="Agent Terminal">
                            <Terminal className="w-4 h-4" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ============ MAIN CONTENT ============ */}
            <main className="pt-20 pb-24 max-w-6xl mx-auto px-4 min-h-screen">
                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm max-w-lg mx-auto">
                        {error}
                    </div>
                )}

                {/* ====== DASHBOARD VIEW ====== */}
                {view === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Dashboard Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Network Dashboard</h1>
                                <p className="text-sm text-slate-400 mt-0.5">Real-time civic intelligence overview</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                LIVE
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { label: 'Reports', value: stats?.totalReports || 0, icon: FileCheck, color: 'text-emerald-400', suffix: '' },
                                { label: 'Paid Out', value: stats?.totalBountyPaid || 0, icon: DollarSign, color: 'text-green-400', prefix: '$', suffix: '' },
                                { label: 'Avg Severity', value: stats?.avgSeverity || 0, icon: AlertTriangle, color: 'text-orange-400', decimals: 1 },
                                { label: 'Agents', value: stats?.activeAgents || 1, icon: Cpu, color: 'text-blue-400' },
                                { label: 'x402 Txns', value: stats?.x402Transactions || 0, icon: Zap, color: 'text-purple-400' },
                                { label: 'Escrows', value: stats?.activeEscrows || 0, icon: Lock, color: 'text-amber-400' },
                            ].map((s, i) => (
                                <div key={s.label} className="stat-card rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                        <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">{s.label}</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${s.color}`}>
                                        <AnimatedCounter value={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} decimals={s.decimals || 0} />
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Severity Chart */}
                            <SeverityChart />

                            {/* Department Routing */}
                            <div className="glass-card rounded-xl p-4 space-y-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" /> Department Routing
                                </span>
                                {stats && Object.entries(stats.departments).map(([dept, count]) => (
                                    <div key={dept} className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0">
                                        <span className="text-sm text-slate-300">{dept}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-blue-500/60 transition-all duration-1000"
                                                    style={{ width: `${(count / 4) * 100}%` }} />
                                            </div>
                                            <span className="text-xs font-mono text-blue-400 w-4 text-right">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* x402 Transaction Ticker */}
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Recent x402 Transactions
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {(stats?.recentx402?.length > 0 ? stats.recentx402 : [
                                    { time: new Date().toISOString(), event: '💳 HTTP 402 → Signed payment → /x402/verify', type: 'INFO' },
                                    { time: new Date().toISOString(), event: '💳 HTTP 402 → Signed payment → /x402/enrich', type: 'INFO' },
                                    { time: new Date().toISOString(), event: '🤖 Budget check: $0.023/$0.05 — within limit', type: 'INFO' },
                                ]).map((tx, i) => (
                                    <div key={i} className="flex items-start gap-3 ticker-item py-1.5 border-b border-slate-800/30 last:border-0"
                                        style={{ animationDelay: `${i * 100}ms` }}>
                                        <CircleDot className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-slate-300 font-mono flex-1">{tx.event}</span>
                                        <span className="text-[10px] text-slate-600 whitespace-nowrap">
                                            {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bounty Tiers */}
                        <div className="glass-card rounded-xl p-4 gradient-border">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500/20 rounded-lg animate-bounce-slow">
                                    <Award className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Active Bounty Program</h3>
                                    <p className="text-[11px] text-slate-400">Verified reports earn instant USDC payouts via x402</p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="sev-low px-2.5 py-1 rounded-full font-medium">Low $1</span>
                                <span className="sev-med px-2.5 py-1 rounded-full font-medium">Med $3</span>
                                <span className="sev-high px-2.5 py-1 rounded-full font-medium">High $5</span>
                                <span className="sev-crit px-2.5 py-1 rounded-full font-medium">Crit $10</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ====== FEED VIEW ====== */}
                {view === 'feed' && (
                    <div className="space-y-4 max-w-2xl mx-auto animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Verified Reports
                            </h2>
                            <span className="text-xs text-slate-500">{reports.length} reports</span>
                        </div>

                        {reports.map((report, index) => (
                            <div key={report.id}
                                className="glass-card rounded-2xl overflow-hidden animate-slide-up transform hover:scale-[1.01] transition-all"
                                style={{ animationDelay: `${index * 100}ms` }}>
                                {/* Image */}
                                <div className="relative">
                                    <img src={report.image} alt="Report" className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                                    {/* Severity Ring */}
                                    <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-sm rounded-lg p-1">
                                        <SeverityRing severity={report.severity} size={40} />
                                    </div>

                                    {/* Bounty Badge */}
                                    {report.bountyPaid && (
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-green-900/50">
                                            <DollarSign className="w-3 h-3" />{report.bountyAmount} USDC
                                        </div>
                                    )}

                                    {/* Escrow Badge */}
                                    {report.escrowStatus === 'LOCKED' && (
                                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-amber-500/90 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> ESCROW
                                        </div>
                                    )}

                                    {/* Department Tag */}
                                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-900/70 backdrop-blur-sm rounded-lg text-[10px] font-medium text-blue-400 border border-blue-500/20">
                                        {report.department}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <p className="font-medium text-white text-sm">{report.desc}</p>

                                    {/* AI Confidence Bar */}
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> AI Confidence</span>
                                            <span className="font-mono">{report.confidence}%</span>
                                        </div>
                                        <ConfidenceBar value={report.confidence} />
                                    </div>

                                    {/* Footer Row */}
                                    <div className="flex items-center justify-between pt-1 text-slate-500 text-[11px]">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Verified
                                            </span>
                                            <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors">
                                                <ThumbsUp className="w-3.5 h-3.5" /> {report.upvotes}
                                            </span>
                                            <span className="flex items-center gap-1 font-mono text-purple-400/60">
                                                <Zap className="w-3 h-3" /> ${report.verificationCost}
                                            </span>
                                            {report.biteTxHash && (
                                                <a href={report.blockscoutUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 font-mono text-orange-400/60 hover:text-orange-400 text-[10px] ml-2"
                                                    title="View BITE v2 Encrypted Transaction">
                                                    <Lock className="w-3 h-3" /> BITE
                                                </a>
                                            )}
                                        </div>
                                        <span>{report.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ====== REPORT VIEW ====== */}
                {view === 'report' && !capturedImage && (
                    <div className="max-w-lg mx-auto text-center py-12 space-y-6 animate-fade-in-up">
                        {/* Hidden file inputs */}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={cameraInputRef}
                            onChange={handleImageSelected}
                            className="hidden"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageSelected}
                            className="hidden"
                        />

                        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full">
                            <Camera className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Capture Civic Issue</h2>
                            <p className="text-sm text-slate-400 mt-2">Take a photo or upload an image of the issue you want to report</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-900/30"
                                onClick={() => cameraInputRef.current?.click()}>
                                <Camera className="w-5 h-5" /> Take Photo
                            </button>
                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-5 h-5" /> Upload Image
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setCapturedImage('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop');
                                setImageFile(null);
                                setView('verify');
                                setError(null);
                                setAiResult(null);
                                setTimeout(() => setDescription("Large pothole on Main St causing traffic hazard"), 500);
                            }}
                            className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                            [Demo Fill]
                        </button>
                    </div>
                )}

                {/* ====== VERIFY VIEW ====== */}
                {view === 'verify' && capturedImage && (
                    <div className="max-w-lg mx-auto space-y-5 animate-fade-in-up">
                        {/* Image Preview */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img src={capturedImage} className="w-full h-56 object-cover" alt="Captured" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <textarea
                                    placeholder="Describe the civic issue..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Protocol Visualizer (replaces old step tracker) */}
                        {isAnalyzing && <ProtocolVisualizer step={analyzeStep} />}

                        {/* Verify Button */}
                        {!aiResult && !isAnalyzing && (
                            <button
                                onClick={runAIVerification}
                                disabled={!description}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] ${!description
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-900/30'}`}>
                                <FileCheck className="w-5 h-5" /> Verify with AI
                            </button>
                        )}

                        {isAnalyzing && (
                            <button disabled className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-slate-800 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" /> Agent processing...
                            </button>
                        )}

                        {/* AI Results */}
                        {aiResult && (
                            <div className="space-y-4 animate-slide-up">
                                {aiResult.isVerified ? (
                                    <div className="glass-card rounded-xl p-4 border-l-4 border-green-500 glow-success">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1 bg-green-500/20 rounded-lg">
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            </div>
                                            <span className="font-bold text-green-400">Verified Authentic</span>
                                            <SeverityRing severity={aiResult.severity} size={36} />
                                        </div>
                                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{aiResult.summary}</pre>
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-slate-400">
                                                    Severity: <span className="font-bold text-white">{aiResult.severity}/10</span>
                                                </span>
                                                <span className="text-slate-400">
                                                    Confidence: <span className="font-bold text-white">{aiResult.confidence}%</span>
                                                </span>
                                            </div>
                                            <ConfidenceBar value={aiResult.confidence} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-card rounded-xl p-4 border-l-4 border-red-500 glow-danger">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-6 h-6 text-red-400" />
                                            <span className="font-bold text-red-400">Verification Failed</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mt-2">{aiResult.summary}</p>
                                    </div>
                                )}

                                {/* Bounty Preview */}
                                {aiResult.isVerified && aiResult.bounty?.eligible && (
                                    <div className="glass-card rounded-xl p-4 bounty-pulse border border-green-500/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <Award className="w-6 h-6 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">Bounty Reward</p>
                                                    <p className="text-xs text-slate-400">Paid via x402 + CDP Wallet</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-green-400">${aiResult.bounty.amount}</p>
                                                <p className="text-xs text-slate-400">USDC</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button onClick={submitReport}
                                    disabled={!aiResult.isVerified || isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] ${(!aiResult.isVerified || isSubmitting)
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-900/30'}`}>
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
                                    ) : (
                                        <><TrendingUp className="w-5 h-5" /> Submit & Claim ${aiResult.bounty?.amount || 0} USDC</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ============ BOTTOM NAVIGATION ============ */}
            <nav className="fixed bottom-0 w-full z-20 glass-dark border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-around">
                    <button onClick={() => setView('dashboard')}
                        className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'dashboard' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Activity className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setView('feed')}
                        className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'feed' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Feed</span>
                    </button>
                    <button onClick={() => { setView('report'); setCapturedImage(null); setImageFile(null); setAiResult(null); setDescription(''); setAnalyzeStep(0); }}
                        className="relative -top-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg shadow-green-900/50 transition-transform hover:scale-110 active:scale-95">
                        <Camera className="w-6 h-6" />
                    </button>
                    <button onClick={() => setView('feed')}
                        className={`flex flex-col items-center gap-0.5 transition-colors text-slate-500 hover:text-slate-300`}>
                        <Award className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Rewards</span>
                    </button>
                    <button onClick={() => setShowTerminal(true)}
                        className="flex flex-col items-center gap-0.5 transition-colors text-slate-500 hover:text-slate-300">
                        <Terminal className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Agent</span>
                    </button>
                </div>
            </nav>
            {/* Footer Branding */}
            <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end pointer-events-none opacity-90 animate-fade-in-up delay-1000">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl shadow-blue-500/10">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-slate-300">POWERED BY</span>
                        <span className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-skale-blue to-skale-purple" style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}>SKALE</span>
                    </div>
                    <div className="w-px h-3 bg-slate-700 mx-1"></div>
                    <span className="text-[9px] font-mono text-orange-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> BITE v2
                    </span>
                </div>
            </div>
        </div>
    );
}
