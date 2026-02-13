import React, { useState, useEffect } from 'react';
import {
    Camera, ShieldCheck, Zap, Lock, FileCheck,
    ChevronRight, ArrowRight, Play, MapPin,
    Award, Layers, Activity, Users, Globe, Clock
} from 'lucide-react';

const LandingPage = ({ onStart }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: Camera,
            title: "Snap & Submit",
            description: "Capture civic issues with your smartphone. Our AI automatically tags location and infrastructure type.",
            color: "emerald"
        },
        {
            icon: ShieldCheck,
            title: "AI Verification",
            description: "Autonomous agents use the x402 protocol to pay for multi-stage verification, ensuring report authenticity.",
            color: "blue"
        },
        {
            icon: Zap,
            title: "Instant Bounties",
            description: "Receive USDC rewards directly to your CDP Wallet the moment your report is verified by the network.",
            color: "purple"
        }
    ];

    const stats = [
        { label: "Bounties Paid", value: "$32,450", icon: Award },
        { label: "Issues Resolved", value: "1,240+", icon: FileCheck },
        { label: "Active Nodes", value: "85", icon: Activity },
        { label: "Verification Time", value: "< 2 min", icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-dark py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tighter text-white">
                        <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-900/20">
                            <MapPin className="w-5 h-5" />
                        </div>
                        CivicLens
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
                        <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
                        <a href="#bounties" className="hover:text-emerald-400 transition-colors">Bounties</a>
                        <a href="#technology" className="hover:text-emerald-400 transition-colors">Technology</a>
                    </div>

                    <button
                        onClick={onStart}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-mesh">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-8 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            x402 PROTOCOL LIVE ON SKALE
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-[1.1] animate-fade-in-up delay-100">
                            The World's First <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                                Autonomous Civic Agent
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                            Empowering citizens to maintain their cities through decentralized verification and instant bounty payouts. Experience the future of civic intelligence.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                            <button onClick={onStart} className="btn-primary w-full sm:w-auto">
                                Launch Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                            </button>
                            <button className="btn-secondary w-full sm:w-auto">
                                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Asset Preview */}
                <div className="container mx-auto px-6 mt-16 md:mt-24 relative z-10 group animate-fade-in-up delay-500">
                    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1920"
                            alt="Modern Urban Infrastructure"
                            className="w-full h-auto object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-wrap justify-between items-end gap-6">
                            <div className="flex items-center gap-6">
                                {stats.map((stat, i) => (
                                    <div key={i} className="hidden lg:block">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{stat.label}</p>
                                        <div className="flex items-center gap-2">
                                            <stat.icon className="w-4 h-4 text-emerald-500" />
                                            <p className="text-2xl font-black text-white">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card rounded-2xl p-4 border-emerald-500/20 max-w-xs">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Agent Logic</span>
                                </div>
                                <code className="text-[11px] font-mono text-emerald-400/80">
                                    if (verify(report) && severity &gt; 7) {"{"} <br />
                                    &nbsp;&nbsp;await x402.payout(reporter, 10); <br />
                                    {"}"}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cyber Grid Background */}
                <div className="absolute inset-0 z-0 cyber-grid opacity-30" />
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">How it Works</h2>
                        <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="glass-card p-10 rounded-3xl group hover:border-emerald-500/30 transition-all duration-300">
                                <div className={`w-16 h-16 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-${feature.color}-500/20 transition-all duration-300`}>
                                    <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                                <div className="mt-8 flex items-center gap-2 text-emerald-400 font-bold text-sm cursor-pointer group/link">
                                    Learn More
                                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bounty Tiers */}
            <section id="bounties" className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="bg-slate-900/50 rounded-[3rem] p-12 border border-slate-800">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Incentivized <br />Civic Action</h2>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    We believe citizens should be rewarded for helping maintain their communities. Our automated bounty system ensures fair, instant payouts based on the severity of the issue reported.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        { level: "Critical", amount: "$10.00", desc: "Hazardous infrastructure, main road flooding" },
                                        { level: "High", amount: "$5.00", desc: "Significant damage, non-functional signals" },
                                        { level: "Medium", amount: "$3.00", desc: "Minor potholes, graffiti on public assets" },
                                        { level: "Low", amount: "$1.00", desc: "Small debris, non-hazardous issues" },
                                    ].map((tier, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                                            <div>
                                                <p className="text-white font-bold">{tier.level}</p>
                                                <p className="text-xs text-slate-500">{tier.desc}</p>
                                            </div>
                                            <p className="text-xl font-black text-emerald-400">{tier.amount} <span className="text-[10px] text-slate-500">USDC</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full" />
                                <div className="relative glass-card rounded-3xl p-8 border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                <Award className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="font-bold text-white">Network Live Stats</span>
                                        </div>
                                        <span className="text-xs text-emerald-400 font-mono">0x402...f00d</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-slate-400">Total Bounties Distributed</span>
                                                <span className="text-emerald-400 font-bold">$32,450.00 USDC</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[75%]" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Reports Verified</p>
                                                <p className="text-xl font-black text-white">4,281</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Avg Resolution</p>
                                                <p className="text-xl font-black text-white">14.2h</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={onStart} className="w-full mt-8 py-4 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                        See Real-time Network Feed
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hackathon Tracks */}
            <section id="tracks" className="py-24 bg-slate-900/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Target Innovation</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Hackathon Tracks</h2>
                        <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Best Agentic App", desc: "Overall best autonomous agent solving real-world civic problems.", icon: Award },
                            { title: "Agentic Tool Usage", desc: "Advanced utilization of x402 for autonomous payments and verification.", icon: Zap },
                            { title: "AP2 Integration", desc: "Native support for the AP2 standard for auditable agentic commerce.", icon: FileCheck },
                            { title: "Encrypted Agents", desc: "Leveraging BITE v2 for secure, privacy-preserving agent interactions.", icon: Lock },
                        ].map((track, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                                    <track.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{track.title}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{track.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section id="technology" className="py-24 border-t border-slate-900">
                <div className="container mx-auto px-6">
                    <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-12">Powered by Industry Leaders</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <img src="https://cryptologos.cc/logos/skale-network-skl-logo.svg?v=040" alt="SKALE" className="w-8 h-8" />
                            <span className="text-xl font-black tracking-tighter uppercase">SKALE</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_light_color_92x30dp.svg" alt="Google" className="w-16 h-auto" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">AP2</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <Zap className="w-6 h-6 text-emerald-400" />
                            <span className="text-xl font-black tracking-tighter uppercase">x402</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <img src="https://avatars.githubusercontent.com/u/18804155?s=200&v=4" alt="Coinbase" className="w-7 h-7 rounded-sm" />
                            <span className="text-xl font-black tracking-tighter uppercase text-[10px]">CDP WALLET</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <img src="https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/base-logo-symbol-blue.svg" alt="Base" className="w-7 h-7" />
                            <span className="text-xl font-black tracking-tighter uppercase">BASE</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale brightness-200 hover:grayscale-0 transition-all">
                            <img src="https://dorahacks.io/static/images/logo-white.svg" alt="DoraHacks" className="w-6 h-6" onError={(e) => e.target.style.display = 'none'} />
                            <span className="text-xl font-black tracking-tighter uppercase">DoraHacks</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-900">
                <div className="container mx-auto px-6 flex flex-col md:row justify-between items-center gap-8">
                    <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tighter text-white">
                        <div className="bg-emerald-600 p-1 rounded-lg">
                            <MapPin className="w-4 h-4" />
                        </div>
                        CivicLens
                    </div>

                    <div className="text-sm text-slate-500">
                        &copy; 2026 CivicLens. Built for the SKALE x402 Hackathon.
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-bold">Twitter</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-bold">GitHub</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-bold">Docs</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
