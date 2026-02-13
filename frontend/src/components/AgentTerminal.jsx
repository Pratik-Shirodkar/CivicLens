import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Shield, Activity, Wifi, Lock, Zap, DollarSign, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AgentTerminal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'receipts'
    const [systemStatus, setSystemStatus] = useState('IDLE');
    const [spendData, setSpendData] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState(null);
    const logsEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                // Fetch logs
                const logRes = await fetch(`${API_URL}/api/agent/logs`);
                if (logRes.ok) {
                    const data = await logRes.json();
                    if (data.logs && data.logs.length > 0) {
                        setLogs(prev => {
                            const newLogs = data.logs.filter(l => !prev.some(p => p.id === l.id));
                            return [...prev, ...newLogs].slice(-80);
                        });

                        const lastLog = data.logs[data.logs.length - 1];
                        if (lastLog.message.includes('402')) setSystemStatus('PAYING');
                        else if (lastLog.message.includes('Signing')) setSystemStatus('SIGNING');
                        else if (lastLog.message.includes('verify')) setSystemStatus('VERIFYING');
                        else if (lastLog.message.includes('enrich')) setSystemStatus('ENRICHING');
                        else if (lastLog.message.includes('BOUNTY')) setSystemStatus('DISTRIBUTING');
                        else if (lastLog.message.includes('Escrow')) setSystemStatus('ESCROW');
                        else if (lastLog.type === 'ERROR') setSystemStatus('ERROR');
                        else if (lastLog.message.includes('COMPLETE')) setSystemStatus('COMPLETE');
                        else setSystemStatus('ACTIVE');
                    }
                }

                // Fetch receipts
                const receiptRes = await fetch(`${API_URL}/api/agent/receipts`);
                if (receiptRes.ok) {
                    const data = await receiptRes.json();
                    setReceipts(data.receipts || []);
                }

                // Fetch spend data
                const spendRes = await fetch(`${API_URL}/api/agent/spend`);
                if (spendRes.ok) {
                    setSpendData(await spendRes.json());
                }

                // Fetch budget status
                const budgetRes = await fetch(`${API_URL}/api/agent/budget`);
                if (budgetRes.ok) {
                    setBudgetStatus(await budgetRes.json());
                }
            } catch (e) {
                // Silent retry
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1500);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Auto-scroll logs
    useEffect(() => {
        if (activeTab === 'logs') {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, activeTab]);

    if (!isOpen) return null;

    const getStatusColor = (status) => {
        const colors = {
            IDLE: 'text-gray-400',
            ACTIVE: 'text-green-400',
            PAYING: 'text-yellow-400',
            SIGNING: 'text-yellow-300',
            VERIFYING: 'text-blue-400',
            ENRICHING: 'text-cyan-400',
            DISTRIBUTING: 'text-purple-400',
            ESCROW: 'text-orange-400',
            COMPLETE: 'text-green-300',
            ERROR: 'text-red-400',
        };
        return colors[status] || 'text-green-400';
    };

    const getLogColor = (log) => {
        if (log.type === 'ERROR') return 'text-red-400';
        if (log.message.includes('402')) return 'text-yellow-400';
        if (log.message.includes('✅')) return 'text-green-400';
        if (log.message.includes('[BITE v2]')) return 'text-orange-400';
        if (log.message.includes('💰') || log.message.includes('BOUNTY')) return 'text-purple-400';
        if (log.message.includes('Signing') || log.message.includes('Retrying')) return 'text-yellow-300';
        if (log.message.includes('═') || log.message.includes('──')) return 'text-cyan-600';
        if (log.message.includes('📋') || log.message.includes('📊') || log.message.includes('📄')) return 'text-cyan-400';
        return 'text-green-400/80';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-gray-950 border-2 border-green-500/40 rounded-xl shadow-[0_0_60px_rgba(34,197,94,0.15)] overflow-hidden font-mono text-sm relative">

                {/* Header */}
                <div className="bg-green-900/20 border-b border-green-500/30 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-green-400 animate-pulse" />
                        <div>
                            <h3 className="text-green-400 font-bold tracking-wider text-base">CIVIC_AGENT_X402</h3>
                            <div className="flex items-center gap-2 text-[10px] text-green-600/80 uppercase">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                x402 + AP2 + BITE v2 Enabled
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-3 py-1 rounded text-xs transition-colors border ${activeTab === 'logs' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'text-green-700 border-transparent hover:text-green-500'}`}
                        >
                            [LOGS]
                        </button>
                        <button
                            onClick={() => setActiveTab('receipts')}
                            className={`px-3 py-1 rounded text-xs transition-colors border ${activeTab === 'receipts' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'text-green-700 border-transparent hover:text-green-500'}`}
                        >
                            [RECEIPTS]
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-1 hover:bg-green-500/20 rounded text-green-500/70 hover:text-green-400 transition-colors text-xs border border-green-500/20 ml-2"
                        >
                            [ESC]
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-5 gap-px bg-green-500/20 border-b border-green-500/30">
                    <StatusItem icon={Cpu} label="AGENT" value="CDP_MPC" />
                    <StatusItem icon={Wifi} label="ORACLE" value="CONNECTED" />
                    <StatusItem icon={Lock} label="ESCROW" value={receipts.some(r => r.settlement?.status === 'LOCKED') ? 'ACTIVE' : 'READY'} />
                    <StatusItem icon={Activity} label="STATUS" value={systemStatus} active={systemStatus !== 'IDLE'} statusColor={getStatusColor(systemStatus)} />
                    <StatusItem
                        icon={DollarSign}
                        label="SPENT"
                        value={budgetStatus?.sessionSpendUSD || '$0.00'}
                        active={budgetStatus?.toolCalls > 0}
                    />
                </div>

                {/* Content Area */}
                <div className="h-[350px] overflow-y-auto p-4 space-y-1 bg-black/90 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)' }}
                    />

                    {activeTab === 'logs' ? (
                        <>
                            {logs.length === 0 && (
                                <div className="text-green-800 text-center mt-20">
                                    <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                    <p className="italic">Waiting for agent activity...</p>
                                    <p className="text-[10px] mt-2 opacity-50">Submit a report to see the x402 flow in action</p>
                                </div>
                            )}

                            {logs.map((log, i) => (
                                <div key={log.id || i} className={`flex gap-3 leading-relaxed ${getLogColor(log)}`}>
                                    <span className="text-green-700/50 shrink-0 text-[11px]">
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </span>
                                    <span className="opacity-90 whitespace-pre-wrap">{log.message}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </>
                    ) : (
                        <div className="space-y-4">
                            {receipts.length === 0 && (
                                <div className="text-green-800 text-center mt-20">
                                    <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                    <p className="italic">No receipts available.</p>
                                </div>
                            )}
                            {receipts.map((receipt, i) => (
                                <div key={receipt.id} className="border border-green-500/20 rounded p-3 bg-green-900/5 animate-slide-up">
                                    <div className="flex justify-between items-start mb-2 border-b border-green-500/10 pb-2">
                                        <span className="text-green-400 font-bold">{receipt.id}</span>
                                        <span className="text-green-700 text-[10px]">{new Date(receipt.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                                        <div>
                                            <p className="text-green-700 uppercase mb-1 font-bold">Intent</p>
                                            <p className="text-green-500/80 truncate">{receipt.intent.description}</p>
                                            <p className="text-green-600 mt-1">Reporter: {receipt.intent.reporter?.substring(0, 10)}...</p>
                                        </div>
                                        <div>
                                            <p className="text-green-700 uppercase mb-1 font-bold">Settlement</p>
                                            <p className="text-purple-400">${receipt.settlement?.amount} USDC</p>
                                            <p className={`text-[10px] ${receipt.settlement?.status === 'SETTLED' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                                                Status: {receipt.settlement?.status || 'PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-green-700 uppercase mb-1 font-bold text-[10px]">Authorizations (x402)</p>
                                        <div className="flex gap-2">
                                            {receipt.authorizations.map((auth, idx) => (
                                                <div key={idx} className="bg-green-500/10 border border-green-500/20 px-2 py-1 rounded text-[9px] text-green-300">
                                                    {auth.tool.split('/').pop()}: {auth.amount / 1000000}$
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-green-900/10 border-t border-green-500/30 flex items-center justify-between text-green-500 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-green-700">{'>'}</span>
                        <span className="animate-pulse">_</span>
                        <span className="text-green-700 ml-4">x402 Protocol • HTTP 402 → Pay → Retry</span>
                    </div>
                    <div className="text-green-700">
                        Reports: {spendData?.reportsProcessed || 0} |
                        Tool Calls: {spendData?.totalToolCalls || 0} |
                        Budget: {budgetStatus?.remainingBudgetUSD || '$0.50'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusItem = ({ icon: Icon, label, value, active, statusColor }) => (
    <div className={`p-2 flex flex-col items-center justify-center bg-black/40 ${active ? 'bg-green-900/15' : ''}`}>
        <div className="flex items-center gap-1 mb-1">
            <Icon className={`w-3 h-3 ${active ? 'text-green-400' : 'text-green-700'}`} />
            <span className="text-[9px] font-bold text-green-700">{label}</span>
        </div>
        <span className={`text-[11px] tracking-wider font-semibold ${statusColor || (active ? 'text-green-300' : 'text-green-700')}`}>
            {value}
        </span>
    </div>
);

export default AgentTerminal;
