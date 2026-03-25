import { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText, Plus, Trash2, Send, DollarSign, User, Building2,
    CheckCircle2, Clock, Printer, Download, ChevronDown, X, Edit3
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

/* ── Constants ───────────────────────────────────────── */
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
const STATUS_STYLES = {
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

/* ── Helpers ─────────────────────────────────────────── */
const fmtCurrency = (amount, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount || 0);

const fmtMinToHours = (mins) => (mins / 60).toFixed(2);
const today = () => new Date().toISOString().split('T')[0];

const defaultFreelancer = () => {
    try { return JSON.parse(localStorage.getItem('zт_freelancer') || '{}'); }
    catch { return {}; }
};

/* ── Invoice Preview Component ───────────────────────── */
const InvoicePreview = ({ form, lineItems, currency }) => {
    const subtotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
    const taxAmount = subtotal * (parseFloat(form.taxRate) || 0) / 100;
    const total = subtotal + taxAmount;

    return (
        <div id="invoice-preview" className="bg-white p-8 font-sans text-slate-800 min-h-[700px] invoice-paper">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-black text-blue-600">INVOICE</h1>
                    <p className="text-slate-400 text-sm mt-0.5"># {form.invoiceNumber || 'AUTO'}</p>
                </div>
                <div className="text-right text-sm">
                    <p className="font-black text-slate-800 text-base">{form.freelancerInfo.company || form.freelancerInfo.name || 'Your Company'}</p>
                    <p className="text-slate-500">{form.freelancerInfo.email}</p>
                    <p className="text-slate-500 whitespace-pre-line">{form.freelancerInfo.address}</p>
                </div>
            </div>

            {/* Bill To / Dates */}
            <div className="flex justify-between mb-8">
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
                    <p className="font-bold text-slate-800">{form.clientInfo.name || '—'}</p>
                    {form.clientInfo.company && <p className="text-slate-500 text-sm">{form.clientInfo.company}</p>}
                    <p className="text-slate-500 text-sm">{form.clientInfo.email}</p>
                    <p className="text-slate-500 text-sm whitespace-pre-line">{form.clientInfo.address}</p>
                </div>
                <div className="text-right text-sm space-y-1">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest">Issued</p>
                        <p className="font-bold">{form.issuedAt || today()}</p>
                    </div>
                    {form.dueDate && (
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Due</p>
                            <p className="font-bold text-red-600">{form.dueDate}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-sm mb-6">
                <thead>
                    <tr className="border-b-2 border-blue-600">
                        <th className="text-left pb-2 font-black text-slate-700">Description</th>
                        <th className="text-right pb-2 font-black text-slate-700">Hrs</th>
                        <th className="text-right pb-2 font-black text-slate-700">Rate</th>
                        <th className="text-right pb-2 font-black text-slate-700">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {lineItems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-300">No items added yet</td>
                        </tr>
                    ) : lineItems.map((item, i) => (
                        <tr key={i}>
                            <td className="py-3 text-slate-700">{item.description || '—'}</td>
                            <td className="py-3 text-right text-slate-600">{fmtMinToHours(item.minutes || 0)}</td>
                            <td className="py-3 text-right text-slate-600">{fmtCurrency(item.hourlyRate, currency)}/hr</td>
                            <td className="py-3 text-right font-bold">{fmtCurrency(item.amount, currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-56 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold">{fmtCurrency(subtotal, currency)}</span>
                    </div>
                    {parseFloat(form.taxRate) > 0 && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tax ({form.taxRate}%)</span>
                            <span className="font-bold">{fmtCurrency(taxAmount, currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t-2 border-blue-600 pt-2">
                        <span className="font-black text-blue-600">TOTAL</span>
                        <span className="font-black text-xl text-blue-600">{fmtCurrency(total, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {form.notes && (
                <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-slate-600 text-sm whitespace-pre-line">{form.notes}</p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-10 pt-4 border-t border-slate-100 text-center text-xs text-slate-300">
                Generated by Bit-task • {form.freelancerInfo.email || ''}
            </div>
        </div>
    );
};

/* ── Main InvoiceGenerator Page ──────────────────────── */
const InvoiceGenerator = () => {
    const { user } = useAuth();
    const [timeSummary, setTimeSummary] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'

    const [form, setForm] = useState({
        issuedAt: today(),
        invoiceNumber: '',
        dueDate: '',
        taxRate: '0',
        notes: '',
        currency: 'USD',
        clientInfo: { name: '', email: '', address: '', company: '' },
        freelancerInfo: {
            name: user?.name || '',
            email: user?.email || '',
            address: '',
            company: '',
            ...defaultFreelancer()
        },
    });

    const [lineItems, setLineItems] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState({});
    const [hourlyRate, setHourlyRate] = useState(50);

    /* Fetch time summary and invoices */
    const fetchData = useCallback(async () => {
        try {
            const [sumRes, invRes] = await Promise.all([
                api.get('/billing/time-summary'),
                api.get('/billing/invoices')
            ]);
            setTimeSummary(sumRes.data.summary || []);
            setInvoices(invRes.data || []);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* Sync line items from selected tasks */
    useEffect(() => {
        const items = timeSummary
            .filter(t => selectedTasks[t.taskId])
            .map(t => ({
                taskId: t.taskId,
                description: t.taskTitle,
                minutes: t.totalMinutes,
                hourlyRate: parseFloat(hourlyRate) || 0,
                amount: parseFloat(((t.totalMinutes / 60) * (parseFloat(hourlyRate) || 0)).toFixed(2))
            }));
        setLineItems(items);
    }, [selectedTasks, hourlyRate, timeSummary]);

    const updateForm = (path, value) => {
        setForm(prev => {
            const copy = { ...prev };
            const parts = path.split('.');
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    /* Save freelancer info to localStorage */
    const saveFreelancerDefaults = () => {
        localStorage.setItem('zт_freelancer', JSON.stringify(form.freelancerInfo));
        toast.success('Freelancer info saved!');
    };

    const handleSave = async (status = 'draft') => {
        if (!form.clientInfo.name) { toast.error('Client name is required'); return; }
        if (lineItems.length === 0) { toast.error('Add at least one task to the invoice'); return; }
        setSaving(true);
        try {
            const payload = {
                clientInfo: form.clientInfo,
                freelancerInfo: form.freelancerInfo,
                lineItems,
                taxRate: parseFloat(form.taxRate) || 0,
                currency: form.currency,
                dueDate: form.dueDate || undefined,
                notes: form.notes,
                status,
            };
            if (editingId) {
                await api.put(`/billing/invoices/${editingId}`, payload);
                toast.success('Invoice updated!');
            } else {
                await api.post('/billing/invoices', payload);
                toast.success('Invoice saved!');
            }
            fetchData();
            setEditingId(null);
            setActiveTab('history');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save invoice');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice?')) return;
        try {
            await api.delete(`/billing/invoices/${id}`);
            toast.success('Invoice deleted');
            fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const handleMarkPaid = async (id) => {
        try {
            await api.put(`/billing/invoices/${id}`, { status: 'paid' });
            toast.success('Marked as paid ✅');
            fetchData();
        } catch { toast.error('Failed to update'); }
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            {/* Print styles injected into head */}
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #invoice-print-root { display: block !important; }
                    #invoice-preview { box-shadow: none !important; border: none !important; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto py-8 space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                            Invoice Generator
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">
                            Turn tracked time into professional invoices.
                        </p>
                    </div>
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <FileText size={30} strokeWidth={2.5} />
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                    {[{ key: 'create', label: 'Create Invoice' }, { key: 'history', label: `History (${invoices.length})` }].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 font-black text-sm rounded-t-xl transition-all -mb-px border-b-2 ${activeTab === tab.key
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── CREATE Tab ───────────────────────────────── */}
                {activeTab === 'create' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Left: Form */}
                        <div className="space-y-5">
                            {/* Freelancer Info */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-blue-500" />
                                        <h2 className="font-black text-sm text-slate-800 dark:text-white">Your Info (Freelancer)</h2>
                                    </div>
                                    <button onClick={saveFreelancerDefaults} className="text-xs text-blue-600 font-bold hover:underline">Save as default</button>
                                </div>
                                <div className="p-5 grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'freelancerInfo.name', label: 'Name *', placeholder: 'Your name' },
                                        { key: 'freelancerInfo.company', label: 'Company', placeholder: 'Your company' },
                                        { key: 'freelancerInfo.email', label: 'Email', placeholder: 'your@email.com' },
                                        { key: 'freelancerInfo.address', label: 'Address', placeholder: 'City, Country' },
                                    ].map(f => (
                                        <div key={f.key} className={f.key === 'freelancerInfo.address' ? 'col-span-2' : ''}>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{f.label}</label>
                                            <input
                                                className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={f.placeholder}
                                                value={f.key.split('.').reduce((o, k) => o?.[k], form) || ''}
                                                onChange={e => updateForm(f.key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                    <Building2 size={16} className="text-blue-500" />
                                    <h2 className="font-black text-sm text-slate-800 dark:text-white">Client Info</h2>
                                </div>
                                <div className="p-5 grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'clientInfo.name', label: 'Name *', placeholder: 'Client name' },
                                        { key: 'clientInfo.company', label: 'Company', placeholder: 'Client company' },
                                        { key: 'clientInfo.email', label: 'Email', placeholder: 'client@email.com' },
                                        { key: 'clientInfo.address', label: 'Address', placeholder: 'City, Country' },
                                    ].map(f => (
                                        <div key={f.key} className={f.key === 'clientInfo.address' ? 'col-span-2' : ''}>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{f.label}</label>
                                            <input
                                                className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={f.placeholder}
                                                value={f.key.split('.').reduce((o, k) => o?.[k], form) || ''}
                                                onChange={e => updateForm(f.key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Invoice Settings */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                    <FileText size={16} className="text-emerald-500" />
                                    <h2 className="font-black text-sm text-slate-800 dark:text-white">Invoice Settings</h2>
                                </div>
                                <div className="p-5 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Issue Date</label>
                                        <input type="date" value={form.issuedAt} onChange={e => updateForm('issuedAt', e.target.value)}
                                            className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Due Date</label>
                                        <input type="date" value={form.dueDate} onChange={e => updateForm('dueDate', e.target.value)}
                                            className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Currency</label>
                                        <select value={form.currency} onChange={e => updateForm('currency', e.target.value)}
                                            className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tax Rate (%)</label>
                                        <input type="number" min="0" max="100" value={form.taxRate}
                                            onChange={e => updateForm('taxRate', e.target.value)}
                                            className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Notes</label>
                                        <textarea rows={2} value={form.notes} onChange={e => updateForm('notes', e.target.value)}
                                            placeholder="Payment terms, bank details, thank-you note…"
                                            className="mt-1 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Task Selector */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-violet-500" />
                                        <h2 className="font-black text-sm text-slate-800 dark:text-white">Select Tracked Tasks</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Rate/hr</label>
                                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1">
                                            <DollarSign size={12} className="text-slate-400" />
                                            <input type="number" min="0" value={hourlyRate}
                                                onChange={e => setHourlyRate(e.target.value)}
                                                className="w-14 text-sm font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-50 dark:divide-slate-700/50 max-h-56 overflow-y-auto">
                                    {timeSummary.length === 0 ? (
                                        <p className="p-5 text-center text-slate-400 text-sm font-semibold">No tracked time yet. Start a timer first!</p>
                                    ) : timeSummary.map(task => (
                                        <label key={task.taskId} className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedTasks[task.taskId]}
                                                    onChange={e => setSelectedTasks(p => ({ ...p, [task.taskId]: e.target.checked }))}
                                                    className="w-4 h-4 accent-blue-600 rounded"
                                                />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{task.taskTitle}</span>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <p className="text-xs font-black text-blue-600">{task.totalMinutes}m</p>
                                                <p className="text-xs text-slate-400">{fmtCurrency((task.totalMinutes / 60) * hourlyRate, form.currency)}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSave('draft')}
                                    disabled={saving}
                                    className="flex-1 py-3.5 rounded-xl font-black text-sm border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving…' : '💾 Save Draft'}
                                </button>
                                <button
                                    onClick={() => handleSave('sent')}
                                    disabled={saving}
                                    className="flex-1 py-3.5 rounded-xl font-black text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send size={15} /> {saving ? 'Sending…' : 'Save & Mark Sent'}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-3.5 rounded-xl font-black text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                                >
                                    <Printer size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Invoice Preview */}
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest">Live Preview</h2>
                                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                                    <Printer size={13} /> Print / PDF
                                </button>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
                                <InvoicePreview form={form} lineItems={lineItems} currency={form.currency} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── HISTORY Tab ──────────────────────────────── */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {invoices.length === 0 ? (
                            <div className="py-24 text-center">
                                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="font-black text-slate-400 dark:text-slate-500">No invoices yet.</p>
                                <button onClick={() => setActiveTab('create')}
                                    className="mt-4 text-sm text-blue-600 font-bold hover:underline">
                                    Create your first invoice →
                                </button>
                            </div>
                        ) : invoices.map(inv => {
                            const subtotal = (inv.lineItems || []).reduce((s, i) => s + i.amount, 0);
                            return (
                                <div key={inv.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-slate-800 dark:text-white">{inv.invoiceNumber}</p>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.status]}`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">
                                                {inv.clientInfo?.name} · {inv.lineItems?.length} item(s)
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {inv.dueDate && <span className="ml-2 text-red-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className="font-black text-lg text-emerald-600">
                                            {fmtCurrency(inv.totalAmount, inv.currency)}
                                        </p>
                                        {inv.status !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(inv.id)}
                                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                title="Mark as paid"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(inv.id)}
                                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default InvoiceGenerator;
