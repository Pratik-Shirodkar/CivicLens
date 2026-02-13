import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Coins, ArrowRight, MapPin, Users, Zap, Lock, FileCheck, Cpu } from 'lucide-react';

const WelcomePage = ({ onStart }) => {
    const [typedText, setTypedText] = useState('');
    const [statsVisible, setStatsVisible] = useState(false);
    const fullText = 'Earn Rewards.';

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(timer);
        }, 100);
        setTimeout(() => setStatsVisible(true), 1200);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden relative">

            {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden cyber-grid">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
                <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
            </div>

            <div className="relative z-10 container mx-auto px-6 pt-16 pb-12 flex flex-col items-center min-h-screen">

                {/* Navbar */}
                <nav className="w-full flex justify-between items-center mb-16 animate-fade-in-down">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                            <MapPin className="w-5 h-5" />
                        </div>
                        CivicLens
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Network Active
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-sm text-slate-400 text-sm font-medium mb-8 animate-fade-in-up">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        AI-Powered Civic Intelligence Platform
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white animate-fade-in-up delay-100">
                        See It. Report It. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">
                            {typedText}
                            {typedText.length < fullText.length && <span className="typing-cursor" />}
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        An autonomous AI agent that <span className="font-semibold text-white">discovers, verifies, and rewards</span> civic
                        infrastructure reports using <span className="text-emerald-400 font-medium">x402 protocol</span> for payment and
                        <span className="text-blue-400 font-medium"> CDP wallets</span> for settlement.
                    </p>

                    {/* Protocol Chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up delay-300">
                        {[
                            { label: 'x402 Protocol', icon: Zap, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
                            { label: 'CDP Wallet', icon: ShieldCheck, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' },
                            { label: 'AP2 Receipts', icon: FileCheck, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                            { label: 'BITE v2', icon: Lock, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                        ].map(chip => (
                            <span key={chip.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${chip.color}`}>
                                <chip.icon className="w-3 h-3" /> {chip.label}
                            </span>
                        ))}
                    </div>

                    {/* Live Stats Counter */}
                    {statsVisible && (
                        <div className="flex justify-center gap-6 mb-10 animate-fade-in-up">
                            {[
                                { value: '$30', label: 'USDC Distributed' },
                                { value: '5', label: 'Reports Verified' },
                                { value: '3', label: 'x402 Tools Active' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-2xl font-bold text-white animate-counter-roll">{stat.value}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/40 hover:-translate-y-1 flex items-center gap-3 mx-auto animate-fade-in-up delay-400">
                        Launch Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Feature Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up delay-500">
                    {[
                        {
                            icon: Camera, color: 'emerald', title: '1. Snap & Submit',
                            desc: 'Photograph civic issues. The agent ingests the report and begins autonomous verification.'
                        },
                        {
                            icon: ShieldCheck, color: 'blue', title: '2. AI Agent Verifies',
                            desc: 'The x402 agent pays for 3 verification services (verify → enrich → prioritize) using signed payments.'
                        },
                        {
                            icon: Coins, color: 'purple', title: '3. Instant Bounty',
                            desc: 'Verified reports earn USDC bounties via CDP wallet. Critical reports use BITE v2 conditional escrow.'
                        }
                    ].map((step, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                            <div className={`w-14 h-14 bg-${step.color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-${step.color}-400`}>
                                <step.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-white">{step.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Trust Footer */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 w-full max-w-4xl flex justify-center gap-8 text-slate-500 text-xs animate-fade-in-up delay-600">
                    <div className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4" /> Built on Cronos
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <Zap className="w-4 h-4" /> Powered by x402
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4" /> Coinbase CDP
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
