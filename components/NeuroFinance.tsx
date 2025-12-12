import React, { useState, useEffect } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import { Scale, ArrowUpRight, ArrowDownLeft, ShieldCheck, FileText, Lock, RefreshCw, Check, ArrowRight, Wallet, Receipt } from 'lucide-react';

interface Transaction {
  id: string;
  concept: string;
  amount: number;
  type: 'IN' | 'OUT';
  status: 'VERIFIED' | 'PROCESSING' | 'FLAGGED';
  date: string;
  category: string;
  taxRule: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'TX-8842', concept: 'AWS Infrastructure', amount: 430.00, type: 'OUT', status: 'VERIFIED', date: 'Today, 10:42', category: 'Software Expense', taxRule: 'Rule 179-B' },
  { id: 'TX-8843', concept: 'Client Payment #402', amount: 12500.00, type: 'IN', status: 'VERIFIED', date: 'Today, 09:15', category: 'Revenue', taxRule: 'Income Class A' },
  { id: 'TX-8844', concept: 'Team Offsite Lunch', amount: 245.50, type: 'OUT', status: 'PROCESSING', date: 'Today, 08:30', category: 'Meals & Ent.', taxRule: 'Pending...' },
  { id: 'TX-8841', concept: 'Unknown Vendor', amount: 99.00, type: 'OUT', status: 'FLAGGED', date: 'Yesterday', category: 'Uncategorized', taxRule: 'Review Req.' },
];

const NeuroFinance: React.FC = () => {
  const [selectedTxId, setSelectedTxId] = useState<string>('TX-8842');
  const [scanning, setScanning] = useState(false);
  const selectedTx = TRANSACTIONS.find(t => t.id === selectedTxId) || TRANSACTIONS[0];

  // Simulación de escaneo al cambiar de transacción
  useEffect(() => {
    setScanning(true);
    const timer = setTimeout(() => setScanning(false), 800);
    return () => clearTimeout(timer);
  }, [selectedTxId]);

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden relative font-sans">
      
      {/* Background "Greenline" (Life Line) */}
      <div className="absolute bottom-20 left-0 w-full h-[1px] bg-[#45FF9A]/20 pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#45FF9A] to-transparent opacity-50 blur-[2px] animate-pulse z-0"></div>

      {/* --- HEADER: GLOBAL LIQUIDITY PULSE --- */}
      <div className="h-[12%] flex items-center justify-between mb-4 animate-[fadeIn_0.5s_ease-out] z-10">
          <div className="flex items-baseline gap-6">
              <h1 className="text-5xl font-thin text-white tracking-tight tabular-nums">$142,850.00</h1>
              <div className="flex gap-2">
                  <div className="px-2 py-1 bg-[#16161A] border border-white/[0.1] rounded flex items-center gap-2">
                      <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">FIAT 60%</span>
                  </div>
                  <div className="px-2 py-1 bg-[#16161A] border border-white/[0.1] rounded flex items-center gap-2">
                      <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">USDC 30%</span>
                  </div>
                  <div className="px-2 py-1 bg-[#16161A] border border-white/[0.1] rounded flex items-center gap-2">
                      <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">ETH 10%</span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#0F0F12]/80 backdrop-blur border border-[#45FF9A]/20 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(69,255,154,0.05)]">
              <div className="w-3 h-3 bg-[#45FF9A] rounded-full shadow-[0_0_10px_#45FF9A] animate-pulse"></div>
              <span className="text-[11px] font-medium text-[#45FF9A] tracking-widest">100% COMPLIANT</span>
          </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 z-10">
          
          {/* --- COLUMNA IZQUIERDA: TRANSACTION STREAM --- */}
          <div className="w-[25%] flex flex-col animate-[fadeIn_0.5s_ease-out_0.2s_both]">
              <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                     <Receipt size={14} className="text-obsidian-text-muted" />
                     <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Live Ledger</span>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {TRANSACTIONS.map((tx) => (
                      <button 
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
                        className={`w-full p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group relative overflow-hidden
                            ${selectedTxId === tx.id 
                                ? 'bg-white/[0.06] border-white/[0.2]' 
                                : 'bg-[#0F0F12]/60 border-white/[0.04] hover:bg-white/[0.02]'}
                        `}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-[#45FF9A]/10 text-[#45FF9A]' : 'bg-white/[0.05] text-white'}`}>
                                  {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </div>
                              <div className="text-left">
                                  <div className="text-[13px] font-medium text-[#F5F5F7]">{tx.concept}</div>
                                  <div className="text-[10px] text-obsidian-text-muted">{tx.date}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-[13px] font-light tabular-nums ${tx.type === 'IN' ? 'text-white' : 'text-red-300/80'}`}>
                                  {tx.type === 'IN' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <div className="mt-1 flex justify-end">
                                  {tx.status === 'VERIFIED' && <ShieldCheck size={12} className="text-[#45FF9A]" />}
                                  {tx.status === 'PROCESSING' && <RefreshCw size={12} className="text-yellow-400 animate-spin" />}
                                  {tx.status === 'FLAGGED' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                              </div>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* --- PANEL CENTRAL: THE LOGIC TRACE --- */}
          <div className="w-[50%] flex flex-col animate-[fadeIn_0.5s_ease-out_0.4s_both]">
              <ObsidianCard className="flex-1 relative overflow-hidden flex flex-col items-center justify-center" noPadding>
                  {/* Scanning Effect Overlay */}
                  {scanning && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full animate-[scan_0.8s_ease-in-out] pointer-events-none z-20"></div>
                  )}
                  
                  {/* Background Grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] z-0"></div>

                  <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 py-10">
                      
                      {/* Node 1: Ingest */}
                      <div className="flex flex-col items-center gap-2 w-full animate-[fadeIn_0.3s_ease-out_0.2s_both]">
                          <div className="bg-[#16161A] border border-white/10 p-3 rounded flex items-center gap-3 w-64 shadow-lg">
                              <FileText size={16} className="text-obsidian-text-muted" />
                              <div className="flex-1">
                                  <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Input Data</div>
                                  <div className="text-xs text-white truncate">{selectedTx.concept}</div>
                              </div>
                              <div className="text-[9px] text-[#45FF9A] font-mono border border-[#45FF9A]/20 px-1 rounded bg-[#45FF9A]/5">OCR 99%</div>
                          </div>
                          {/* Circuit Line */}
                          <div className="h-8 w-[1px] bg-gradient-to-b from-white/20 to-obsidian-accent"></div>
                      </div>

                      {/* Node 2: Interpretation */}
                      <div className="flex flex-col items-center gap-2 w-full animate-[fadeIn_0.3s_ease-out_0.4s_both]">
                          <div className="bg-[#16161A] border border-obsidian-accent/30 p-3 rounded w-72 shadow-[0_0_15px_rgba(106,79,251,0.1)] relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-obsidian-accent"></div>
                              <div className="text-[10px] text-obsidian-accent uppercase tracking-widest mb-1 font-medium">Semantic Interpretation</div>
                              <code className="text-[10px] font-mono text-gray-300 block bg-black/30 p-1.5 rounded border border-white/5">
                                 Category: "{selectedTx.category}"<br/>
                                 Confidence: 0.982
                              </code>
                          </div>
                          {/* Circuit Line */}
                          <div className="h-8 w-[1px] bg-gradient-to-b from-obsidian-accent to-white/20"></div>
                      </div>

                      {/* Node 3: Validation */}
                      <div className="flex flex-col items-center gap-2 w-full animate-[fadeIn_0.3s_ease-out_0.6s_both]">
                          <div className="bg-[#16161A] border border-white/10 p-3 rounded w-72 flex items-start gap-3">
                              <Scale size={16} className="text-obsidian-text-muted mt-1" />
                              <div className="flex-1">
                                  <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">Tax Regulation</div>
                                  <p className="text-[11px] text-obsidian-text-secondary leading-tight italic font-light">
                                      "{selectedTx.taxRule}: Deductible if expense is ordinary and necessary for business Ops."
                                  </p>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-[#45FF9A]/10 flex items-center justify-center border border-[#45FF9A]/30">
                                  <Check size={10} className="text-[#45FF9A]" />
                              </div>
                          </div>
                          {/* Circuit Line */}
                          <div className="h-8 w-[1px] bg-white/10"></div>
                      </div>

                      {/* Node 4: Verdict */}
                      <div className="animate-[scaleIn_0.3s_ease-out_0.8s_both]">
                           {selectedTx.status === 'VERIFIED' ? (
                               <div className="border-2 border-[#45FF9A] text-[#45FF9A] px-6 py-2 rounded uppercase tracking-[0.3em] text-sm font-bold shadow-[0_0_20px_rgba(69,255,154,0.3)] bg-[#45FF9A]/5 transform rotate-[-2deg]">
                                   AUDIT PASSED
                               </div>
                           ) : selectedTx.status === 'FLAGGED' ? (
                                <div className="border-2 border-red-500 text-red-500 px-6 py-2 rounded uppercase tracking-[0.3em] text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-500/5 transform rotate-[-2deg]">
                                    RISK DETECTED
                                </div>
                           ) : (
                                <div className="border-2 border-yellow-500 text-yellow-500 px-6 py-2 rounded uppercase tracking-[0.3em] text-sm font-bold bg-yellow-500/5 transform rotate-[-2deg]">
                                    PROCESSING
                                </div>
                           )}
                      </div>

                  </div>
              </ObsidianCard>
          </div>

          {/* --- COLUMNA DERECHA: DEFI RAILS & ESCROW --- */}
          <div className="w-[25%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.6s_both]">
              
              {/* Escrow Vaults */}
              <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1 px-1">
                      <Lock size={14} className="text-obsidian-text-muted" />
                      <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Active Escrows</span>
                  </div>
                  
                  <div className="bg-[#16161A] border border-white/[0.06] p-4 rounded-lg relative overflow-hidden group">
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan] animate-pulse"></div>
                      <div className="mb-3">
                          <h4 className="text-xs text-white font-medium">Project: Web Dev</h4>
                          <span className="text-[10px] text-obsidian-text-muted">Vendor: Pixel Studio</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 text-obsidian-text-secondary text-[10px] bg-black/30 px-2 py-1 rounded border border-white/5">
                              <Lock size={10} />
                              <span>2,000 USDC</span>
                          </div>
                          <span className="text-[9px] text-obsidian-text-muted">Waiting Git Commit...</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                  </div>

                  <div className="bg-[#16161A] border border-white/[0.06] p-4 rounded-lg relative overflow-hidden opacity-60">
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_purple]"></div>
                      <div className="mb-3">
                          <h4 className="text-xs text-white font-medium">Retainer: Legal</h4>
                          <span className="text-[10px] text-obsidian-text-muted">Vendor: LawFirm DAO</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 text-obsidian-text-secondary text-[10px] bg-black/30 px-2 py-1 rounded border border-white/5">
                              <Lock size={10} />
                              <span>5.5 ETH</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Crypto Rails */}
              <ObsidianCard className="h-auto p-4 flex flex-col gap-4">
                   <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-obsidian-text-muted" />
                      <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Instant Transfer</span>
                  </div>
                  <ObsidianInput placeholder="Recipient Address (0x...)" className="text-[10px]" />
                  
                  <div className="space-y-2">
                      <label className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Route Selection</label>
                      <div className="grid grid-cols-2 gap-2">
                          <button className="text-[10px] bg-white/[0.05] border border-white/[0.1] text-white py-2 rounded hover:bg-white/[0.1] transition-colors">SWIFT</button>
                          <button className="text-[10px] bg-obsidian-accent/10 border border-obsidian-accent/40 text-white py-2 rounded hover:bg-obsidian-accent/20 transition-colors relative">
                              POLYGON
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#45FF9A] rounded-full border border-black"></div>
                          </button>
                      </div>
                  </div>

                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04] text-[10px] text-obsidian-text-muted flex items-start gap-2">
                      <ArrowRight size={12} className="mt-0.5 text-[#45FF9A]" />
                      <span>Recommendation: Use Polygon Rail. Gas savings: ~$12.50. Instant settlement.</span>
                  </div>

                  <ObsidianButton variant="outline">Execute Transfer</ObsidianButton>
              </ObsidianCard>

          </div>

      </div>

    </div>
  );
};

export default NeuroFinance;