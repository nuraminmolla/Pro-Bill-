
import React, { useState, useEffect } from 'react';
import { 
  Home,
  ReceiptText, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Download,
  Tractor,
  TrendingUp,
  Wallet,
  Bell,
  PlusCircle,
  PlusSquare,
  FileText,
  X,
  ChevronRight,
  Scale,
  History,
  Moon,
  Sun
} from 'lucide-react';
import { Customer, Bill, BillItem, ViewState } from './types';
import { BUSINESS_PROFILE, DEFAULT_PRODUCT } from './constants';
import { formatCurrency } from './utils/helpers';
import { generateInvoicePDF } from './services/pdfService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedBills = localStorage.getItem('bills');
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedBills) setBills(JSON.parse(savedBills));
  }, []);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const addBill = (bill: Bill) => {
    setBills(prev => [bill, ...prev]);
    setActiveView('HISTORY');
  };

  const deleteBill = (id: string) => {
    if (confirm('Delete this record permanently?')) {
      setBills(prev => prev.filter(b => b.id !== id));
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD': return <Dashboard bills={bills} setActiveView={setActiveView} />;
      case 'NEW_BILL': return <NewBillForm customers={customers} onSave={addBill} />;
      case 'CUSTOMERS': return <CustomerManager customers={customers} onAdd={addCustomer} />;
      case 'HISTORY': return <BillHistory bills={bills} onDelete={deleteBill} />;
      default: return <Dashboard bills={bills} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-24 md:pb-0 bg-background-light dark:bg-rice-dark transition-colors duration-300">
      {/* Desktop Sidebar */}
      <nav className="hidden md:block w-72 bg-white dark:bg-rice-surface border-r border-gray-100 dark:border-gray-800 flex-shrink-0 sticky top-0 h-screen transition-colors">
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="size-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <Tractor className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-primary dark:text-blue-400">{BUSINESS_PROFILE.name}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trade & Logistics</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            {[
              { id: 'DASHBOARD', icon: Home, label: 'Home' },
              { id: 'NEW_BILL', icon: ReceiptText, label: 'Create Bill' },
              { id: 'CUSTOMERS', icon: Users, label: 'Customers' },
              { id: 'HISTORY', icon: History, label: 'Sales History' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewState)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeView === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-rice-dark'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          <button 
            onClick={toggleTheme}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-rice-dark transition-all mt-auto"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-rice-surface/80 ios-blur border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-full flex items-center justify-center">
            <Tractor className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-primary dark:text-blue-400">{BUSINESS_PROFILE.name}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Rice Trading & Logistics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="size-10 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-rice-dark transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-400" />}
          </button>
          <button className="size-10 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-rice-dark">
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-rice-surface border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-4 pt-3 pb-8 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] transition-colors">
        {[
          { id: 'DASHBOARD', icon: Home, label: 'HOME' },
          { id: 'NEW_BILL', icon: PlusSquare, label: 'BILL' },
          { id: 'CUSTOMERS', icon: Users, label: 'PEOPLE' },
          { id: 'HISTORY', icon: History, label: 'SALES' },
        ].map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id + item.label}
              onClick={() => setActiveView(item.id as ViewState)}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-300 ${
                isActive 
                  ? 'text-primary dark:text-blue-400 scale-110' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-all ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className={`text-[9px] font-black tracking-widest uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const Dashboard: React.FC<{ bills: Bill[], setActiveView: (v: ViewState) => void }> = ({ bills, setActiveView }) => {
  const totalSales = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const mockRevenue = totalSales * 0.28;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards - Small Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-rice-surface p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-1.5 transition-all hover:border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Sales</p>
            <TrendingUp className="text-primary dark:text-blue-400 w-4 h-4" />
          </div>
          <p className="text-xl font-black text-primary dark:text-blue-200">{formatCurrency(totalSales)}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-primary dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 bg-primary/5 dark:bg-blue-900/20 rounded-md">+12.5%</span>
            <span className="text-gray-400 text-[9px] font-bold">vs last month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-rice-surface p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-1.5 transition-all hover:border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Est. Revenue</p>
            <Wallet className="text-primary dark:text-blue-400 w-4 h-4" />
          </div>
          <p className="text-xl font-black text-primary dark:text-blue-200">{formatCurrency(mockRevenue)}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-primary dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 bg-primary/5 dark:bg-blue-900/20 rounded-md">+5.2%</span>
            <span className="text-gray-400 text-[9px] font-bold">this week</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-black tracking-tight ml-1 dark:text-gray-300">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveView('NEW_BILL')}
            className="bg-primary p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2.5 text-white font-black shadow-lg shadow-primary/10 active:scale-95 transition-all hover:bg-primary/95"
          >
            <ReceiptText className="w-7 h-7" />
            <span className="text-xs">Create Bill</span>
          </button>
          <button 
            onClick={() => setActiveView('CUSTOMERS')}
            className="bg-white dark:bg-rice-surface p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2.5 border border-gray-100 dark:border-gray-800 font-black shadow-sm active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-rice-dark/50"
          >
            <PlusCircle className="w-7 h-7 text-primary dark:text-blue-400" />
            <span className="text-xs text-primary dark:text-blue-400">Add Customer</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black tracking-tight dark:text-gray-300">Activity Trend</h3>
          <span className="text-[9px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">Last 7 Days</span>
        </div>
        <div className="bg-white dark:bg-rice-surface p-4 rounded-3xl h-32 flex items-end justify-between gap-2 border border-gray-100 dark:border-gray-800 shadow-sm">
          {[40, 60, 35, 75, 95, 50, 65].map((h, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-t-md transition-all duration-1000 ${i === 4 ? 'bg-primary dark:bg-blue-500 shadow-sm' : 'bg-primary/10 dark:bg-blue-900/20'}`} 
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black tracking-tight dark:text-gray-300">Recent Activity</h3>
          <button onClick={() => setActiveView('HISTORY')} className="text-[9px] font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="space-y-2">
          {bills.length === 0 ? (
            <div className="bg-white dark:bg-rice-surface p-8 rounded-3xl text-center text-gray-400 dark:text-gray-500 font-bold border border-dashed border-gray-200 dark:border-gray-800">
              No recent activity
            </div>
          ) : (
            bills.slice(0, 3).map(bill => (
              <div key={bill.id} className="bg-white dark:bg-rice-surface p-4 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-50 dark:bg-rice-dark flex items-center justify-center group-hover:bg-primary/5 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Users className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-none mb-1 dark:text-gray-200">{bill.customerName}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">#{bill.billNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary dark:text-blue-400 text-sm">{formatCurrency(bill.totalAmount)}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Paid • Today</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const NewBillForm: React.FC<{ customers: Customer[], onSave: (b: Bill) => void }> = ({ customers, onSave }) => {
  const [formData, setFormData] = useState({
    billNo: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    vehicleNo: '',
    destination: '',
    paymentMode: 'RTGS' as 'RTGS' | 'Cash',
  });

  const [items, setItems] = useState<BillItem[]>([{
    id: '1',
    description: DEFAULT_PRODUCT.description,
    hsn: DEFAULT_PRODUCT.hsn,
    quantity: 0,
    unit: 'QTL',
    rate: 0,
    amount: 0
  }]);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const addItem = () => {
    setItems([...items, {
      id: Math.random().toString(),
      description: DEFAULT_PRODUCT.description,
      hsn: DEFAULT_PRODUCT.hsn,
      quantity: 0,
      unit: 'QTL',
      rate: 0,
      amount: 0
    }]);
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        let finalValue = value;
        if (field === 'quantity' || field === 'rate' || field === 'amount') {
          finalValue = value === '' ? 0 : Number(value);
        }
        const updated = { ...item, [field]: finalValue };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleSave = () => {
    if (!formData.customerId) {
      alert('Please select a customer first');
      return;
    }
    if (totalAmount <= 0) {
      alert('Total amount must be greater than zero');
      return;
    }
    const bill: Bill = {
      ...formData,
      id: Math.random().toString(),
      customerName: selectedCustomer?.name || '',
      customerGstin: selectedCustomer?.gstin || '',
      customerAddress: selectedCustomer?.address || '',
      items,
      totalAmount,
      totalQuantity,
      createdAt: Date.now(),
    };
    onSave(bill);
    generateInvoicePDF(bill);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-72 md:pb-32">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-primary dark:text-blue-400">New Invoice</h2>
        <p className="text-gray-400 text-sm font-medium">Standard GST Bill of Supply</p>
      </header>

      <div className="space-y-4">
        {/* Header Metadata */}
        <section className="bg-white dark:bg-rice-surface p-5 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-5 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2 block">Invoice No</label>
              <input type="text" value={formData.billNo} onChange={e => setFormData({ ...formData, billNo: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2 block">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm outline-none transition-all" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2 block">Party / Customer</label>
            <div className="relative">
              <select value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm outline-none appearance-none transition-all">
                <option value="">-- Choose Party --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none rotate-90" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Vehicle No (WB15B...)" value={formData.vehicleNo} onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-bold text-sm outline-none transition-all" />
            <input type="text" placeholder="Destination" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="w-full p-3.5 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-bold text-sm outline-none transition-all" />
          </div>
        </section>

        {/* Item Rows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Items List</h3>
            <button onClick={addItem} className="flex items-center gap-2 bg-primary/10 dark:bg-blue-900/20 text-primary dark:text-blue-400 py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              <PlusSquare className="w-4 h-4" /> Add Line
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-rice-surface p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative group transition-colors">
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-white dark:bg-rice-dark text-red-500 p-2 rounded-full border border-red-50 dark:border-red-900/20 shadow-sm active:bg-red-500 active:text-white z-10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <label className="text-[9px] font-black text-gray-300 dark:text-gray-500 uppercase mb-1 block">Description</label>
                    <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full bg-gray-50 dark:bg-rice-dark dark:text-gray-200 p-3 rounded-xl font-bold text-sm outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-gray-300 dark:text-gray-500 uppercase mb-1 block">HSN</label>
                    <input type="text" value={item.hsn} onChange={e => updateItem(item.id, 'hsn', e.target.value)} className="w-full bg-gray-50 dark:bg-rice-dark dark:text-gray-200 p-3 rounded-xl font-bold text-sm text-center outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-3 md:col-span-5 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-gray-300 dark:text-gray-500 uppercase mb-1 block">Qty</label>
                      <input type="number" step="0.01" value={item.quantity || ''} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="w-full bg-gray-50 dark:bg-rice-dark dark:text-gray-200 p-3 rounded-xl font-black text-sm text-center outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-300 dark:text-gray-500 uppercase mb-1 block">Rate</label>
                      <input type="number" step="0.01" value={item.rate || ''} onChange={e => updateItem(item.id, 'rate', e.target.value)} className="w-full bg-gray-50 dark:bg-rice-dark dark:text-gray-200 p-3 rounded-xl font-black text-sm text-right outline-none transition-all" />
                    </div>
                    <div className="text-right flex flex-col justify-end">
                      <p className="text-[8px] font-black text-primary dark:text-blue-400 uppercase mb-1">Total</p>
                      <div className="font-black text-sm text-primary dark:text-blue-200 py-3">{Number(item.amount).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="h-44 md:hidden" /> {/* Spacer for overlap */}
          </div>
        </div>

        {/* Footer Bar */}
        <section className="bg-primary dark:bg-rice-surface text-white p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl fixed bottom-24 left-4 right-4 md:static z-40 border border-white/10 dark:border-gray-800 backdrop-blur-md transition-colors">
          <div className="flex items-center gap-10 w-full md:w-auto justify-around md:justify-start">
            <div>
              <p className="text-[10px] font-black text-white/50 dark:text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Scale className="w-3 h-3" /> Total Qty</p>
              <p className="text-xl font-black dark:text-blue-200">{totalQuantity.toFixed(2)} <span className="text-[10px] opacity-60">QTL</span></p>
            </div>
            <div className="w-px h-8 bg-white/10 dark:bg-gray-800 hidden md:block"></div>
            <div>
              <p className="text-[10px] font-black text-white/50 dark:text-gray-500 uppercase tracking-widest mb-1">Grand Total</p>
              <p className="text-2xl font-black dark:text-blue-200">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <button onClick={handleSave} className="w-full md:w-auto bg-white dark:bg-primary text-primary dark:text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Generate Bill
          </button>
        </section>
      </div>
    </div>
  );
};

const CustomerManager: React.FC<{ customers: Customer[], onAdd: (c: Customer) => void }> = ({ customers, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', gstin: '', address: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name) return;
    onAdd({ ...newCust, id: Date.now().toString() });
    setNewCust({ name: '', gstin: '', address: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-primary dark:text-blue-400">Parties</h2>
          <p className="text-gray-400 text-sm font-medium">Business Partners Ledger</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-4 rounded-2xl font-black shadow-lg transition-all ${showAdd ? 'bg-gray-100 dark:bg-rice-surface text-gray-500 dark:text-gray-400' : 'bg-primary text-white'}`}>
          {showAdd ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-rice-surface p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-5 animate-in slide-in-from-top-4 transition-colors">
          <input type="text" placeholder="Full Business Name" required value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm outline-none transition-all" />
          <input type="text" placeholder="GSTIN Number" value={newCust.gstin} onChange={e => setNewCust({...newCust, gstin: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm uppercase outline-none transition-all" />
          <textarea placeholder="Complete Address" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-rice-dark dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-rice-dark/50 focus:border-primary/20 rounded-2xl font-black text-sm h-28 outline-none resize-none transition-all" />
          <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">Register Party</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg- rice-surface dark:bg-rice-surface p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-all group cursor-pointer bg-white">
            <div className="size-12 bg-primary/5 dark:bg-blue-900/20 text-primary dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-primary group-hover:text-white transition-all">
              {c.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-lg truncate text-primary dark:text-blue-400">{c.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.gstin || 'NO GSTIN'}</p>
              <p className="text-xs text-gray-400 mt-3 italic line-clamp-2 leading-relaxed">{c.address}</p>
            </div>
          </div>
        ))}
        {customers.length === 0 && !showAdd && (
          <div className="col-span-full bg-white dark:bg-rice-surface p-16 rounded-[2.5rem] text-center border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
             <Users className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
             <p className="font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest text-xs">No trade partners found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BillHistory: React.FC<{ bills: Bill[], onDelete: (id: string) => void }> = ({ bills, onDelete }) => {
  const [search, setSearch] = useState('');
  const filtered = bills.filter(b => b.customerName.toLowerCase().includes(search.toLowerCase()) || b.billNo.includes(search));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-black text-primary dark:text-blue-400">Sales Ledger</h2>
        <p className="text-gray-400 text-sm font-medium">Complete record of past transactions</p>
      </header>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 w-5 h-5 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
        <input type="text" placeholder="Search by name or bill no..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-14 pr-8 py-4 bg-white dark:bg-rice-surface dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm font-black text-sm outline-none transition-all" />
      </div>

      <div className="space-y-3">
        {filtered.map(bill => (
          <div key={bill.id} className="bg-white dark:bg-rice-surface p-5 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/5 dark:bg-blue-900/20 flex items-center justify-center text-primary dark:text-blue-400 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-primary dark:text-blue-400">{bill.customerName}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">#{bill.billNo} • {bill.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="font-black text-primary dark:text-blue-400 text-lg">{formatCurrency(bill.totalAmount)}</p>
                <p className="text-[8px] font-black text-blue-500 dark:text-blue-300 uppercase tracking-widest">{bill.paymentMode}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => generateInvoicePDF(bill)} className="p-3 bg-gray-50 dark:bg-rice-dark text-gray-400 hover:bg-primary hover:text-white rounded-xl transition-all"><Download className="w-4 h-4" /></button>
                <button onClick={() => onDelete(bill.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-300 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-rice-surface p-20 rounded-[3rem] text-center border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
             <FileText className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
             <p className="font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest text-xs">No matching records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
