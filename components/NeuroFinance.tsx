import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import {
  Scale, ArrowUpRight, ArrowDownLeft, ShieldCheck, FileText, Lock, RefreshCw, Check, ArrowRight,
  Wallet, Receipt, DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar,
  Filter, Search, Download, Send, Plus, Edit3, Trash2, X, CheckCircle, Clock,
  AlertTriangle, CreditCard, Building, Globe, Zap, Copy, ExternalLink, Settings
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type ViewMode = 'dashboard' | 'ledger' | 'payments' | 'invoices' | 'reports' | 'escrow';
type TransactionType = 'IN' | 'OUT';
type TransactionStatus = 'VERIFIED' | 'PROCESSING' | 'FLAGGED' | 'PENDING';
type PaymentNetwork = 'SWIFT' | 'SEPA' | 'POLYGON' | 'ETHEREUM' | 'WIRE';
type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE';
type EscrowStatus = 'ACTIVE' | 'RELEASED' | 'DISPUTED' | 'CANCELLED';

interface Transaction {
  id: string;
  concept: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  date: Date;
  category: string;
  taxRule: string;
  account: string;
  confidence?: number;
  receipt?: string;
  aiAnalysis?: {
    category: string;
    confidence: number;
    taxDeductible: boolean;
    flags: string[];
  };
}

interface PaymentRequest {
  recipient: string;
  amount: number;
  currency: string;
  network: PaymentNetwork;
  memo: string;
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  issueDate: Date;
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
  paidDate?: Date;
}

interface Escrow {
  id: string;
  project: string;
  vendor: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  condition: string;
  conditionMet: boolean;
  createdDate: Date;
  releaseDate?: Date;
}

interface FinancialMetrics {
  totalBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  taxLiability: number;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: 'TX-8842', concept: 'AWS Infrastructure', amount: 430.00, currency: 'USD', type: 'OUT', status: 'VERIFIED', date: new Date(Date.now() - 2 * 3600000), category: 'Software Expense', taxRule: 'Rule 179-B', account: 'Business Checking', confidence: 98.2, aiAnalysis: { category: 'Cloud Services', confidence: 98.2, taxDeductible: true, flags: [] } },
  { id: 'TX-8843', concept: 'Client Payment #402 - Acme Corp', amount: 12500.00, currency: 'USD', type: 'IN', status: 'VERIFIED', date: new Date(Date.now() - 5 * 3600000), category: 'Revenue', taxRule: 'Income Class A', account: 'Business Checking', confidence: 100, aiAnalysis: { category: 'Consulting Revenue', confidence: 100, taxDeductible: false, flags: [] } },
  { id: 'TX-8844', concept: 'Team Offsite Lunch', amount: 245.50, currency: 'USD', type: 'OUT', status: 'PROCESSING', date: new Date(Date.now() - 6 * 3600000), category: 'Meals & Entertainment', taxRule: 'Pending...', account: 'Business Credit Card', confidence: 87.5, aiAnalysis: { category: 'Meals & Entertainment', confidence: 87.5, taxDeductible: true, flags: ['50% deductible'] } },
  { id: 'TX-8841', concept: 'Unknown Vendor', amount: 99.00, currency: 'USD', type: 'OUT', status: 'FLAGGED', date: new Date(Date.now() - 86400000), category: 'Uncategorized', taxRule: 'Review Required', account: 'Business Checking', confidence: 45.3, aiAnalysis: { category: 'Uncategorized', confidence: 45.3, taxDeductible: false, flags: ['Unknown vendor', 'Manual review required'] } },
  { id: 'TX-8840', concept: 'Office Supplies - Staples', amount: 156.78, currency: 'USD', type: 'OUT', status: 'VERIFIED', date: new Date(Date.now() - 2 * 86400000), category: 'Office Supplies', taxRule: 'Rule 162', account: 'Business Credit Card', confidence: 99.1, aiAnalysis: { category: 'Office Supplies', confidence: 99.1, taxDeductible: true, flags: [] } },
  { id: 'TX-8839', concept: 'USDC Transfer - 2000', amount: 2000.00, currency: 'USDC', type: 'OUT', status: 'VERIFIED', date: new Date(Date.now() - 3 * 86400000), category: 'Escrow Deposit', taxRule: 'Crypto Transaction', account: 'Polygon Wallet', confidence: 100, aiAnalysis: { category: 'Escrow', confidence: 100, taxDeductible: false, flags: [] } },
  { id: 'TX-8838', concept: 'Subscription - SaaS Tool', amount: 89.00, currency: 'USD', type: 'OUT', status: 'VERIFIED', date: new Date(Date.now() - 4 * 86400000), category: 'Software Expense', taxRule: 'Rule 179-B', account: 'Business Credit Card', confidence: 99.8, aiAnalysis: { category: 'SaaS Subscription', confidence: 99.8, taxDeductible: true, flags: [] } },
];

const SAMPLE_INVOICES: Invoice[] = [
  { id: 'INV-2024-001', client: 'Acme Corp', amount: 12500.00, currency: 'USD', status: 'PAID', dueDate: new Date(Date.now() - 5 * 86400000), issueDate: new Date(Date.now() - 35 * 86400000), items: [{ description: 'Strategic Consulting - Dec 2024', quantity: 1, rate: 12500 }], paidDate: new Date(Date.now() - 5 * 3600000) },
  { id: 'INV-2024-002', client: 'Globex Industries', amount: 8750.00, currency: 'USD', status: 'SENT', dueDate: new Date(Date.now() + 10 * 86400000), issueDate: new Date(Date.now() - 5 * 86400000), items: [{ description: 'System Integration', quantity: 1, rate: 8750 }] },
  { id: 'INV-2024-003', client: 'Initech LLC', amount: 5200.00, currency: 'USD', status: 'VIEWED', dueDate: new Date(Date.now() + 15 * 86400000), issueDate: new Date(Date.now() - 3 * 86400000), items: [{ description: 'API Development', quantity: 26, rate: 200 }] },
  { id: 'INV-2024-004', client: 'Wayne Enterprises', amount: 15000.00, currency: 'USD', status: 'OVERDUE', dueDate: new Date(Date.now() - 2 * 86400000), issueDate: new Date(Date.now() - 32 * 86400000), items: [{ description: 'Security Audit', quantity: 1, rate: 15000 }] },
  { id: 'INV-2024-005', client: 'Stark Industries', amount: 3500.00, currency: 'USD', status: 'DRAFT', dueDate: new Date(Date.now() + 30 * 86400000), issueDate: new Date(), items: [{ description: 'Training Session', quantity: 7, rate: 500 }] },
];

const SAMPLE_ESCROWS: Escrow[] = [
  { id: 'ESC-001', project: 'Web Development', vendor: 'Pixel Studio', amount: 2000, currency: 'USDC', status: 'ACTIVE', condition: 'Git commit to main branch', conditionMet: false, createdDate: new Date(Date.now() - 3 * 86400000) },
  { id: 'ESC-002', project: 'Legal Retainer', vendor: 'LawFirm DAO', amount: 5.5, currency: 'ETH', status: 'ACTIVE', condition: 'Monthly milestone', conditionMet: false, createdDate: new Date(Date.now() - 10 * 86400000) },
  { id: 'ESC-003', project: 'Marketing Campaign', vendor: 'Creative Agency', amount: 3500, currency: 'USDC', status: 'RELEASED', condition: 'Delivery of assets', conditionMet: true, createdDate: new Date(Date.now() - 15 * 86400000), releaseDate: new Date(Date.now() - 2 * 86400000) },
];

const SAMPLE_METRICS: FinancialMetrics = {
  totalBalance: 142850.00,
  monthlyRevenue: 26250.00,
  monthlyExpenses: 8945.28,
  netProfit: 17304.72,
  cashFlow: 15200.00,
  accountsReceivable: 28950.00,
  accountsPayable: 4200.00,
  taxLiability: 5191.42,
};

// ==================== MAIN COMPONENT ====================

const NeuroFinance: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txSearchTerm, setTxSearchTerm] = useState('');
  const [txFilterCategory, setTxFilterCategory] = useState('all');
  const [scanning, setScanning] = useState(false);

  // State for payments
  const [paymentRequest, setPaymentRequest] = useState<Partial<PaymentRequest>>({
    network: 'POLYGON',
    currency: 'USDC',
  });
  const [recommendedNetwork, setRecommendedNetwork] = useState<PaymentNetwork>('POLYGON');

  // State for invoices
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // State for escrow
  const [escrows, setEscrows] = useState<Escrow[]>(SAMPLE_ESCROWS);
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);

  // State for metrics
  const [metrics] = useState<FinancialMetrics>(SAMPLE_METRICS);

  // Scanning effect
  useEffect(() => {
    if (selectedTx) {
      setScanning(true);
      const timer = setTimeout(() => setScanning(false), 800);
      return () => clearTimeout(timer);
    }
  }, [selectedTx]);

  // Calculate network recommendation
  useEffect(() => {
    if (paymentRequest.amount) {
      const amount = paymentRequest.amount;
      if (amount < 1000) {
        setRecommendedNetwork('POLYGON');
      } else if (amount < 10000) {
        setRecommendedNetwork('SEPA');
      } else {
        setRecommendedNetwork('SWIFT');
      }
    }
  }, [paymentRequest.amount]);

  // ==================== RENDER FUNCTIONS ====================

  const renderDashboard = () => (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Top KPIs Row */}
      <div className="grid grid-cols-4 gap-4">
        <ObsidianCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-obsidian-accent/5 rounded-full -mr-10 -mt-10" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider">Balance Total</p>
            <DollarSign size={16} className="text-obsidian-accent" />
          </div>
          <p className="text-3xl font-light text-white tabular-nums">${metrics.totalBalance.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-green-500">+12.5% este mes</span>
          </div>
        </ObsidianCard>

        <ObsidianCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider">Ingresos del Mes</p>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-3xl font-light text-white tabular-nums">${metrics.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-obsidian-text-muted mt-2">3 facturas cobradas</p>
        </ObsidianCard>

        <ObsidianCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-10 -mt-10" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider">Gastos del Mes</p>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-3xl font-light text-white tabular-nums">${metrics.monthlyExpenses.toLocaleString()}</p>
          <p className="text-xs text-obsidian-text-muted mt-2">24 transacciones</p>
        </ObsidianCard>

        <ObsidianCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider">Beneficio Neto</p>
            <BarChart3 size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-light text-white tabular-nums">${metrics.netProfit.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-green-500">Margen: 65.9%</span>
          </div>
        </ObsidianCard>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Recent Transactions */}
        <ObsidianCard className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Transacciones Recientes</h3>
            <button
              onClick={() => setViewMode('ledger')}
              className="text-xs text-obsidian-accent hover:text-white transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 5).map(tx => (
              <div
                key={tx.id}
                onClick={() => {
                  setSelectedTx(tx);
                  setViewMode('ledger');
                }}
                className="flex items-center justify-between p-3 rounded bg-[#16161A] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div>
                    <p className="text-xs text-white font-medium">{tx.concept}</p>
                    <p className="text-[10px] text-obsidian-text-muted">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-light tabular-nums ${tx.type === 'IN' ? 'text-green-500' : 'text-red-400'}`}>
                    {tx.type === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {tx.status === 'VERIFIED' && <ShieldCheck size={10} className="text-green-500" />}
                    {tx.status === 'FLAGGED' && <AlertTriangle size={10} className="text-yellow-500" />}
                    <span className="text-[9px] text-obsidian-text-muted">{tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ObsidianCard>

        {/* Quick Actions */}
        <ObsidianCard>
          <h3 className="text-sm font-medium text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <ObsidianButton
              fullWidth
              onClick={() => setViewMode('payments')}
            >
              <Send size={14} />
              Realizar Pago
            </ObsidianButton>
            <ObsidianButton
              fullWidth
              variant="outline"
              onClick={() => {
                setIsCreatingInvoice(true);
                setViewMode('invoices');
              }}
            >
              <Plus size={14} />
              Nueva Factura
            </ObsidianButton>
            <ObsidianButton
              fullWidth
              variant="outline"
              onClick={() => setViewMode('reports')}
            >
              <Download size={14} />
              Descargar Informes
            </ObsidianButton>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-3">Cuentas</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-[#16161A]">
                <div className="flex items-center gap-2">
                  <Building size={12} className="text-obsidian-text-muted" />
                  <span className="text-xs text-white">FIAT</span>
                </div>
                <span className="text-xs text-white font-mono">60%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#16161A]">
                <div className="flex items-center gap-2">
                  <Wallet size={12} className="text-cyan-500" />
                  <span className="text-xs text-white">USDC</span>
                </div>
                <span className="text-xs text-white font-mono">30%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#16161A]">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-purple-500" />
                  <span className="text-xs text-white">ETH</span>
                </div>
                <span className="text-xs text-white font-mono">10%</span>
              </div>
            </div>
          </div>
        </ObsidianCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending Invoices */}
        <ObsidianCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Facturas Pendientes</h3>
            <button
              onClick={() => setViewMode('invoices')}
              className="text-xs text-obsidian-accent hover:text-white transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-2">
            {invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'DRAFT').map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded bg-[#16161A] border border-white/5">
                <div>
                  <p className="text-xs text-white font-medium">{invoice.client}</p>
                  <p className="text-[10px] text-obsidian-text-muted">{invoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-mono">${invoice.amount.toLocaleString()}</p>
                  <span className={`text-[9px] px-2 py-0.5 rounded ${
                    invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-500' :
                    invoice.status === 'VIEWED' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ObsidianCard>

        {/* Active Escrows */}
        <ObsidianCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Escrows Activos</h3>
            <button
              onClick={() => setViewMode('escrow')}
              className="text-xs text-obsidian-accent hover:text-white transition-colors"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-2">
            {escrows.filter(esc => esc.status === 'ACTIVE').map(escrow => (
              <div key={escrow.id} className="p-3 rounded bg-[#16161A] border border-white/5 relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_cyan] animate-pulse" />
                <p className="text-xs text-white font-medium mb-1">{escrow.project}</p>
                <p className="text-[10px] text-obsidian-text-muted mb-2">{escrow.vendor}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={10} className="text-obsidian-text-muted" />
                    <span className="text-xs text-white font-mono">{escrow.amount} {escrow.currency}</span>
                  </div>
                  <span className="text-[9px] text-obsidian-text-muted">{escrow.condition}</span>
                </div>
              </div>
            ))}
          </div>
        </ObsidianCard>
      </div>

      {/* Compliance Badge */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 bg-[#0F0F12]/80 backdrop-blur border border-green-500/20 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(69,255,154,0.05)]">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#45FF9A] animate-pulse" />
          <span className="text-sm font-medium text-green-500 tracking-wider">100% COMPLIANT</span>
          <ShieldCheck size={16} className="text-green-500" />
        </div>
      </div>
    </div>
  );

  const renderLedger = () => {
    const filteredTxs = transactions.filter(tx => {
      const matchesSearch = tx.concept.toLowerCase().includes(txSearchTerm.toLowerCase()) ||
                           tx.category.toLowerCase().includes(txSearchTerm.toLowerCase());
      const matchesCategory = txFilterCategory === 'all' || tx.category === txFilterCategory;
      return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(transactions.map(tx => tx.category)));

    return (
      <div className="w-full h-full flex gap-6">
        {/* Left - Transaction List */}
        <div className="w-2/3 flex flex-col gap-4">
          {/* Filters */}
          <ObsidianCard>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={txSearchTerm}
                  onChange={(e) => setTxSearchTerm(e.target.value)}
                  className="w-full bg-[#16161A] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <select
                value={txFilterCategory}
                onChange={(e) => setTxFilterCategory(e.target.value)}
                className="bg-[#16161A] border border-white/10 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ObsidianButton size="sm" variant="outline">
                <Download size={14} />
                Exportar
              </ObsidianButton>
            </div>
          </ObsidianCard>

          {/* Transaction Table */}
          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#0F0F12] border-b border-white/10">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Concepto</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider text-right">Monto</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.map(tx => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${
                        selectedTx?.id === tx.id ? 'bg-obsidian-accent/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-obsidian-text-secondary">
                        {tx.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${tx.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {tx.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          </div>
                          <span className="text-sm text-white">{tx.concept}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-obsidian-text-secondary">{tx.category}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={tx.type === 'IN' ? 'text-green-500' : 'text-red-400'}>
                          {tx.type === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.status === 'VERIFIED' && <ShieldCheck size={16} className="inline text-green-500" />}
                        {tx.status === 'PROCESSING' && <RefreshCw size={16} className="inline text-yellow-500 animate-spin" />}
                        {tx.status === 'FLAGGED' && <AlertTriangle size={16} className="inline text-red-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ObsidianCard>
        </div>

        {/* Right - Transaction Analysis */}
        <div className="w-1/3 flex flex-col">
          {selectedTx ? (
            <ObsidianCard className="flex-1 relative overflow-hidden flex flex-col">
              {/* Scanning effect */}
              {scanning && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full animate-[scan_0.8s_ease-in-out] pointer-events-none z-20" />
              )}

              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Análisis de IA</h3>
                <button onClick={() => setSelectedTx(null)} className="text-obsidian-text-muted hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {/* Transaction Info */}
                <div className="p-4 bg-[#16161A] border border-white/10 rounded">
                  <p className="text-xs text-obsidian-text-muted mb-2">TRANSACCIÓN</p>
                  <p className="text-sm text-white font-medium mb-1">{selectedTx.concept}</p>
                  <p className="text-lg text-white font-mono">${selectedTx.amount.toLocaleString()}</p>
                </div>

                {/* AI Analysis */}
                {selectedTx.aiAnalysis && (
                  <>
                    <div className="p-4 bg-obsidian-accent/5 border border-obsidian-accent/30 rounded">
                      <p className="text-xs text-obsidian-accent uppercase tracking-wider mb-3 font-medium">Interpretación Semántica</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-obsidian-text-muted">Categoría:</span>
                          <span className="text-white font-medium">{selectedTx.aiAnalysis.category}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-obsidian-text-muted">Confianza:</span>
                          <span className="text-green-500 font-mono">{selectedTx.aiAnalysis.confidence.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#16161A] border border-white/10 rounded">
                      <div className="flex items-start gap-3">
                        <Scale size={16} className="text-obsidian-text-muted mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Regulación Fiscal</p>
                          <p className="text-xs text-obsidian-text-secondary italic leading-relaxed">
                            "{selectedTx.taxRule}: {selectedTx.aiAnalysis.taxDeductible ? 'Deducible si el gasto es ordinario y necesario para las operaciones del negocio.' : 'No deducible fiscalmente.'}"
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          selectedTx.aiAnalysis.taxDeductible ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          {selectedTx.aiAnalysis.taxDeductible ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedTx.aiAnalysis.flags.length > 0 && (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/30 rounded">
                        <p className="text-xs text-yellow-500 uppercase tracking-wider mb-2">Alertas</p>
                        <ul className="space-y-1">
                          {selectedTx.aiAnalysis.flags.map((flag, idx) => (
                            <li key={idx} className="text-xs text-obsidian-text-secondary flex items-start gap-2">
                              <AlertTriangle size={12} className="text-yellow-500 mt-0.5" />
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Verdict */}
                <div className="flex justify-center pt-4">
                  {selectedTx.status === 'VERIFIED' ? (
                    <div className="border-2 border-green-500 text-green-500 px-6 py-2 rounded uppercase tracking-wider text-sm font-bold shadow-[0_0_20px_rgba(69,255,154,0.3)] bg-green-500/5">
                      AUDIT PASSED
                    </div>
                  ) : selectedTx.status === 'FLAGGED' ? (
                    <div className="border-2 border-red-500 text-red-500 px-6 py-2 rounded uppercase tracking-wider text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-500/5">
                      RISK DETECTED
                    </div>
                  ) : (
                    <div className="border-2 border-yellow-500 text-yellow-500 px-6 py-2 rounded uppercase tracking-wider text-sm font-bold bg-yellow-500/5">
                      PROCESSING
                    </div>
                  )}
                </div>
              </div>
            </ObsidianCard>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">Selecciona una transacción para ver su análisis</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <ObsidianCard>
          <h2 className="text-lg font-light text-white mb-6">Centro de Pagos</h2>

          <div className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Destinatario</label>
              <ObsidianInput
                placeholder="Dirección o IBAN (0x... o ES12...)"
                value={paymentRequest.recipient || ''}
                onChange={(e) => setPaymentRequest({ ...paymentRequest, recipient: e.target.value })}
              />
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Cantidad</label>
                <ObsidianInput
                  type="number"
                  placeholder="0.00"
                  value={paymentRequest.amount || ''}
                  onChange={(e) => setPaymentRequest({ ...paymentRequest, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Moneda</label>
                <select
                  value={paymentRequest.currency}
                  onChange={(e) => setPaymentRequest({ ...paymentRequest, currency: e.target.value })}
                  className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            {/* Network Selection */}
            <div>
              <label className="block text-xs text-obsidian-text-muted uppercase tracking-wider mb-3">Red de Pago</label>
              <div className="grid grid-cols-3 gap-3">
                {(['SWIFT', 'SEPA', 'POLYGON'] as PaymentNetwork[]).map(network => (
                  <button
                    key={network}
                    onClick={() => setPaymentRequest({ ...paymentRequest, network })}
                    className={`p-4 rounded border transition-all relative ${
                      paymentRequest.network === network
                        ? 'bg-obsidian-accent/10 border-obsidian-accent'
                        : 'bg-[#16161A] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {network === 'SWIFT' && <Building size={20} className="text-white" />}
                      {network === 'SEPA' && <Globe size={20} className="text-blue-500" />}
                      {network === 'POLYGON' && <Zap size={20} className="text-purple-500" />}
                      <span className="text-xs text-white font-medium">{network}</span>
                      {network === recommendedNetwork && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0B0D]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            {paymentRequest.amount && paymentRequest.amount > 0 && (
              <div className="p-4 bg-green-500/5 border border-green-500/30 rounded flex items-start gap-3">
                <ArrowRight size={16} className="text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-green-500 font-medium mb-1">Recomendación de IA</p>
                  <p className="text-xs text-obsidian-text-secondary">
                    {recommendedNetwork === 'POLYGON' && `Usa Polygon para ahorrar ~$12.50 en comisiones. Liquidación instantánea.`}
                    {recommendedNetwork === 'SEPA' && `SEPA es óptimo para transferencias en Europa. Comisión baja, 1-2 días.`}
                    {recommendedNetwork === 'SWIFT' && `SWIFT recomendado para transferencias internacionales grandes. 3-5 días.`}
                  </p>
                </div>
              </div>
            )}

            {/* Memo */}
            <div>
              <label className="block text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Nota (Opcional)</label>
              <textarea
                placeholder="Concepto del pago..."
                value={paymentRequest.memo || ''}
                onChange={(e) => setPaymentRequest({ ...paymentRequest, memo: e.target.value })}
                rows={2}
                className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <ObsidianButton
                fullWidth
                disabled={!paymentRequest.recipient || !paymentRequest.amount}
              >
                <Send size={14} />
                Ejecutar Transferencia
              </ObsidianButton>
              <button
                onClick={() => setViewMode('dashboard')}
                className="px-6 py-3 border border-white/20 rounded text-sm text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>

            {/* 2FA Notice */}
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/30 rounded flex items-center gap-2">
              <Lock size={14} className="text-yellow-500" />
              <p className="text-xs text-obsidian-text-secondary">Se requerirá autenticación de dos factores (2FA) para confirmar</p>
            </div>
          </div>
        </ObsidianCard>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-white mb-1">Gestión de Facturas</h2>
          <p className="text-sm text-obsidian-text-muted">Crea, envía y gestiona tus facturas</p>
        </div>
        <ObsidianButton onClick={() => setIsCreatingInvoice(true)}>
          <Plus size={14} />
          Nueva Factura
        </ObsidianButton>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-4 gap-4">
        <ObsidianCard>
          <p className="text-xs text-obsidian-text-muted mb-2">Total Pendiente</p>
          <p className="text-2xl font-light text-white">
            ${invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
          </p>
        </ObsidianCard>
        <ObsidianCard>
          <p className="text-xs text-obsidian-text-muted mb-2">Enviadas</p>
          <p className="text-2xl font-light text-blue-500">{invoices.filter(i => i.status === 'SENT').length}</p>
        </ObsidianCard>
        <ObsidianCard>
          <p className="text-xs text-obsidian-text-muted mb-2">Vencidas</p>
          <p className="text-2xl font-light text-red-500">{invoices.filter(i => i.status === 'OVERDUE').length}</p>
        </ObsidianCard>
        <ObsidianCard>
          <p className="text-xs text-obsidian-text-muted mb-2">Pagadas este mes</p>
          <p className="text-2xl font-light text-green-500">{invoices.filter(i => i.status === 'PAID').length}</p>
        </ObsidianCard>
      </div>

      {/* Invoice List */}
      <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0F0F12] border-b border-white/10">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Número</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Vencimiento</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider text-right">Monto</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider text-center">Estado</th>
                <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-xs text-white font-mono">{invoice.id}</td>
                  <td className="px-4 py-3 text-sm text-white">{invoice.client}</td>
                  <td className="px-4 py-3 text-xs text-obsidian-text-secondary">
                    {invoice.issueDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-obsidian-text-secondary">
                    {invoice.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-white">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded text-[10px] font-medium uppercase ${
                      invoice.status === 'PAID' ? 'bg-green-500/20 text-green-500' :
                      invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-500' :
                      invoice.status === 'VIEWED' ? 'bg-yellow-500/20 text-yellow-500' :
                      invoice.status === 'SENT' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <Edit3 size={14} className="text-obsidian-text-muted hover:text-white" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <Send size={14} className="text-obsidian-text-muted hover:text-white" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <Download size={14} className="text-obsidian-text-muted hover:text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ObsidianCard>
    </div>
  );

  const renderReports = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <ObsidianCard>
          <h2 className="text-lg font-light text-white mb-6">Generador de Informes Financieros</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Standard Reports */}
            <div>
              <h3 className="text-sm text-obsidian-text-muted uppercase tracking-wider mb-4">Informes Estándar</h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 size={20} className="text-obsidian-accent" />
                      <div>
                        <p className="text-sm text-white font-medium">Balance General</p>
                        <p className="text-xs text-obsidian-text-muted">Activos, Pasivos y Patrimonio</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>

                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-green-500" />
                      <div>
                        <p className="text-sm text-white font-medium">Estado de Resultados (P&L)</p>
                        <p className="text-xs text-obsidian-text-muted">Ingresos, Gastos y Beneficios</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>

                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <ArrowRight size={20} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-white font-medium">Flujo de Caja</p>
                        <p className="text-xs text-obsidian-text-muted">Entradas y Salidas de Efectivo</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Reports */}
            <div>
              <h3 className="text-sm text-obsidian-text-muted uppercase tracking-wider mb-4">Informes Fiscales</h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Scale size={20} className="text-yellow-500" />
                      <div>
                        <p className="text-sm text-white font-medium">Paquete Fiscal Anual</p>
                        <p className="text-xs text-obsidian-text-muted">Documentación completa para contable</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>

                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-purple-500" />
                      <div>
                        <p className="text-sm text-white font-medium">Deducciones Fiscales</p>
                        <p className="text-xs text-obsidian-text-muted">Gastos deducibles identificados</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>

                <div className="p-4 bg-[#16161A] border border-white/10 rounded hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Wallet size={20} className="text-cyan-500" />
                      <div>
                        <p className="text-sm text-white font-medium">Transacciones Crypto</p>
                        <p className="text-xs text-obsidian-text-muted">Informe de ganancias/pérdidas</p>
                      </div>
                    </div>
                    <Download size={16} className="text-obsidian-text-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Report Builder */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm text-obsidian-text-muted uppercase tracking-wider mb-4">Informe Personalizado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-obsidian-text-muted mb-2">Período</label>
                <select className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-2 text-sm text-white">
                  <option>Este mes</option>
                  <option>Último mes</option>
                  <option>Este trimestre</option>
                  <option>Este año</option>
                  <option>Personalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-obsidian-text-muted mb-2">Formato</label>
                <select className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-2 text-sm text-white">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>
            <ObsidianButton className="mt-4" fullWidth>
              <Download size={14} />
              Generar Informe Personalizado
            </ObsidianButton>
          </div>
        </ObsidianCard>
      </div>
    </div>
  );

  const renderEscrow = () => (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-white mb-1">Gestión de Escrows</h2>
          <p className="text-sm text-obsidian-text-muted">Pagos condicionados con contratos inteligentes</p>
        </div>
        <ObsidianButton>
          <Plus size={14} />
          Nuevo Escrow
        </ObsidianButton>
      </div>

      {/* Escrow List */}
      <div className="grid grid-cols-3 gap-6">
        {escrows.map(escrow => (
          <ObsidianCard
            key={escrow.id}
            className={`relative overflow-hidden cursor-pointer transition-all ${
              escrow.status === 'ACTIVE' ? 'border-cyan-500/30' :
              escrow.status === 'RELEASED' ? 'border-green-500/30 opacity-60' :
              'border-red-500/30 opacity-60'
            }`}
            onClick={() => setSelectedEscrow(escrow)}
          >
            {/* Status Indicator */}
            <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
              escrow.status === 'ACTIVE' ? 'bg-cyan-500 shadow-[0_0_10px_cyan] animate-pulse' :
              escrow.status === 'RELEASED' ? 'bg-green-500' :
              'bg-red-500'
            }`} />

            <div className="mb-4">
              <h3 className="text-sm text-white font-medium mb-1">{escrow.project}</h3>
              <p className="text-xs text-obsidian-text-muted">{escrow.vendor}</p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-obsidian-text-muted" />
              <span className="text-lg text-white font-mono">{escrow.amount} {escrow.currency}</span>
            </div>

            <div className="p-3 bg-black/30 rounded border border-white/5 mb-4">
              <p className="text-xs text-obsidian-text-muted mb-1">CONDICIÓN</p>
              <p className="text-xs text-white">{escrow.condition}</p>
              {escrow.conditionMet && (
                <div className="flex items-center gap-1 mt-2 text-green-500">
                  <CheckCircle size={12} />
                  <span className="text-xs">Condición cumplida</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-obsidian-text-muted">
              <span>Creado: {escrow.createdDate.toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded font-medium ${
                escrow.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-500' :
                escrow.status === 'RELEASED' ? 'bg-green-500/20 text-green-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {escrow.status}
              </span>
            </div>

            {escrow.status === 'ACTIVE' && (
              <ObsidianButton
                size="sm"
                fullWidth
                className="mt-4"
                disabled={!escrow.conditionMet}
              >
                {escrow.conditionMet ? 'Liberar Fondos' : 'Esperando Condición'}
              </ObsidianButton>
            )}
          </ObsidianCard>
        ))}
      </div>

      {/* Escrow Detail Modal (if selected) */}
      {selectedEscrow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <ObsidianCard>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{selectedEscrow.project}</h3>
                  <p className="text-sm text-obsidian-text-muted">{selectedEscrow.id}</p>
                </div>
                <button
                  onClick={() => setSelectedEscrow(null)}
                  className="text-obsidian-text-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#16161A] rounded">
                    <p className="text-xs text-obsidian-text-muted mb-2">Proveedor</p>
                    <p className="text-sm text-white">{selectedEscrow.vendor}</p>
                  </div>
                  <div className="p-4 bg-[#16161A] rounded">
                    <p className="text-xs text-obsidian-text-muted mb-2">Cantidad Bloqueada</p>
                    <p className="text-lg text-white font-mono">{selectedEscrow.amount} {selectedEscrow.currency}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#16161A] border border-white/10 rounded">
                  <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-3">Condición de Liberación</p>
                  <p className="text-sm text-white mb-3">{selectedEscrow.condition}</p>
                  {selectedEscrow.conditionMet ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Condición verificada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Clock size={16} />
                      <span className="text-sm font-medium">Esperando verificación...</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black/30 rounded border border-white/5">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-obsidian-text-muted mb-1">Fecha de Creación</p>
                      <p className="text-white">{selectedEscrow.createdDate.toLocaleString()}</p>
                    </div>
                    {selectedEscrow.releaseDate && (
                      <div>
                        <p className="text-obsidian-text-muted mb-1">Fecha de Liberación</p>
                        <p className="text-white">{selectedEscrow.releaseDate.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEscrow.status === 'ACTIVE' && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <ObsidianButton
                      fullWidth
                      disabled={!selectedEscrow.conditionMet}
                    >
                      <CheckCircle size={14} />
                      Liberar Fondos
                    </ObsidianButton>
                    <button className="px-6 py-3 border border-red-500/30 rounded text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                      Cancelar Escrow
                    </button>
                  </div>
                )}
              </div>
            </ObsidianCard>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-6">
          <h1 className="text-4xl font-thin text-white tracking-tight tabular-nums">
            ${metrics.totalBalance.toLocaleString()}
          </h1>
          <div className="flex gap-2">
            <div className="px-2 py-1 bg-[#16161A] border border-white/10 rounded flex items-center gap-2">
              <div className="w-1 h-3 bg-gray-500 rounded-full" />
              <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">FIAT 60%</span>
            </div>
            <div className="px-2 py-1 bg-[#16161A] border border-white/10 rounded flex items-center gap-2">
              <div className="w-1 h-3 bg-cyan-500 rounded-full" />
              <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">USDC 30%</span>
            </div>
            <div className="px-2 py-1 bg-[#16161A] border border-white/10 rounded flex items-center gap-2">
              <div className="w-1 h-3 bg-purple-500 rounded-full" />
              <span className="text-[10px] text-obsidian-text-secondary uppercase tracking-widest">ETH 10%</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['dashboard', 'ledger', 'payments', 'invoices', 'reports', 'escrow'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-obsidian-accent text-white'
                  : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10'
              }`}
            >
              {mode === 'dashboard' && <PieChart size={14} className="inline mr-2" />}
              {mode === 'ledger' && <Receipt size={14} className="inline mr-2" />}
              {mode === 'payments' && <Send size={14} className="inline mr-2" />}
              {mode === 'invoices' && <FileText size={14} className="inline mr-2" />}
              {mode === 'reports' && <BarChart3 size={14} className="inline mr-2" />}
              {mode === 'escrow' && <Lock size={14} className="inline mr-2" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'ledger' && renderLedger()}
        {viewMode === 'payments' && renderPayments()}
        {viewMode === 'invoices' && renderInvoices()}
        {viewMode === 'reports' && renderReports()}
        {viewMode === 'escrow' && renderEscrow()}
      </div>
    </div>
  );
};

export default NeuroFinance;
