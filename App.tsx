
import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  LayoutGrid,
  FileSpreadsheet,
  UserPlus,
  Share2,
  Edit2,
  Calendar,
  Truck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Customer, Bill, BillItem, ViewState, PaymentMethod } from './types';
import { BUSINESS_PROFILE, DEFAULT_PRODUCT } from './constants';
import { formatCurrency } from './utils/helpers';
import { generateInvoicePDF } from './services/pdfService';
import { generateDailyReportPDF } from './services/reportService';

const DRAFT_STORAGE_KEY = 'mrt_bill_draft';

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
    return customer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setBills(prev => prev.map(b => b.customerId === updatedCustomer.id ? {
      ...b,
      customerName: updatedCustomer.name,
      customerGstin: updatedCustomer.gstin,
      customerAddress: updatedCustomer.address
    } : b));
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
      case 'NEW_BILL': return <NewBillForm customers={customers} onSave={addBill} onAddCustomer={addCustomer} />;
      case 'CUSTOMERS': return <CustomerManager customers={customers} onAdd={addCustomer} onUpdate={updateCustomer} />;
      case 'HISTORY': return <BillHistory bills={bills} onDelete={deleteBill} />;
      default: return <Dashboard bills={bills} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-24 md:pb-0 bg-background-light dark:bg-rice-dark transition-colors duration-300">
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
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

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

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          {renderView()}
        </div>
      </main>

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
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const totalSales = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const mockRevenue = totalSales * 0.28;

  const handleDownloadReport = () => {
    generateDailyReportPDF(bills, reportDate);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-all hover:border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Sales</p>
            <TrendingUp className="text-primary dark:text-blue-400 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-primary dark:text-blue-200">{formatCurrency(totalSales)}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-primary dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 bg-primary/5 dark:bg-blue-900/20 rounded-md">+12.5%</span>
            <span className="text-gray-400 text-[9px] font-bold">vs last month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-all hover:border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Est. Revenue</p>
            <Wallet className="text-primary dark:text-blue-400 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-primary dark:text-blue-200">{formatCurrency(mockRevenue)}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-primary dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 bg-primary/5 dark:bg-blue-900/20 rounded-md">+5.2%</span>
            <span className="text-gray-400 text-[9px] font-bold">this week</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Quick Actions</h3>
        
        <button 
          onClick={() => setActiveView('NEW_BILL')}
          className="w-full bg-primary p-10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white font-black shadow-xl shadow-primary/20 active:scale-95 transition-all hover:bg-primary/95"
        >
          <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center">
            <ReceiptText className="w-8 h-8" />
          </div>
          <span className="text-sm tracking-widest uppercase">Create Bill</span>
        </button>
        
        <div className="bg-white dark:bg-rice-surface p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center gap-6 transition-all hover:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <p className="text-xs font-black text-primary dark:text-blue-400 uppercase tracking-widest">Sales Report</p>
          </div>
          
          <div className="w-full max-w-sm flex items-center gap-3">
            <div className="flex-1 relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="date" 
                value={reportDate} 
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-rice-dark border-none rounded-2xl text-sm font-bold dark:text-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button 
              onClick={handleDownloadReport}
              className="size-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center active:scale-90 transition-all hover:bg-primary/95"
              title="Download Report"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Activity Trend</h3>
          <span className="text-[9px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">Last 7 Days</span>
        </div>
        <div className="bg-white dark:bg-rice-surface p-6 rounded-[2.5rem] h-40 flex items-end justify-between gap-3 border border-gray-100 dark:border-gray-800 shadow-sm">
          {[40, 60, 35, 75, 95, 50, 65].map((h, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-t-xl transition-all duration-1000 ${i === 4 ? 'bg-primary dark:bg-blue-500 shadow-sm shadow-primary/20' : 'bg-primary/10 dark:bg-blue-900/20'}`} 
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Recent Activity</h3>
          <button onClick={() => setActiveView('HISTORY')} className="text-[9px] font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="space-y-2">
          {bills.length === 0 ? (
            <div className="bg-white dark:bg-rice-surface p-12 rounded-[2.5rem] text-center text-gray-400 dark:text-gray-500 font-bold border border-dashed border-gray-200 dark:border-gray-800">
              No recent activity
            </div>
          ) : (
            bills.slice(0, 3).map(bill => (
              <div key={bill.id} className="bg-white dark:bg-rice-surface p-5 rounded-3xl border border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-gray-50 dark:bg-rice-dark flex items-center justify-center group-hover:bg-primary/5 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Users className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-black text-sm leading-none mb-1.5 dark:text-gray-200">{bill.customerName}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{bill.billNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary dark:text-blue-400 text-base">{formatCurrency(bill.totalAmount)}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Paid • Today</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const NewBillForm: React.FC<{ 
  customers: Customer[], 
  onSave: (bill: Bill) => void,
  onAddCustomer: (customer: Customer) => Customer
}> = ({ customers, onSave, onAddCustomer }) => {
  const getDraft = () => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  };

  const draft = getDraft();

  const [selectedCustomerId, setSelectedCustomerId] = useState(draft?.selectedCustomerId || '');
  const [customerSearchTerm, setCustomerSearchTerm] = useState(draft?.customerSearchTerm || '');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [vehicleNo, setVehicleNo] = useState(draft?.vehicleNo || '');
  const [destination, setDestination] = useState(draft?.destination || '');
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>(draft?.paymentMode || 'CASH');
  const [items, setItems] = useState<BillItem[]>(draft?.items || []);
  
  const [newItem, setNewItem] = useState<Partial<BillItem>>(draft?.newItem || {
    description: DEFAULT_PRODUCT.description,
    hsn: DEFAULT_PRODUCT.hsn,
    quantity: 0,
    unit: 'BAGS',
    rate: 0
  });

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', gstin: '', address: '', phone: '' });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Periodic Auto-save effect
  useEffect(() => {
    const billDraft = {
      selectedCustomerId,
      customerSearchTerm,
      vehicleNo,
      destination,
      paymentMode,
      items,
      newItem
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(billDraft));
  }, [selectedCustomerId, customerSearchTerm, vehicleNo, destination, paymentMode, items, newItem]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.gstin.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleQuickAdd = () => {
    if (!newCust.name || !newCust.address) return alert('Name and Address are required');
    const added = onAddCustomer({
      id: Math.random().toString(36).substr(2, 9),
      ...newCust,
      gstin: newCust.gstin || 'UNREGISTERED'
    });
    setSelectedCustomerId(added.id);
    setCustomerSearchTerm(added.name);
    setShowQuickAdd(false);
    setNewCust({ name: '', gstin: '', address: '', phone: '' });
  };

  const addItemToBill = () => {
    if (newItem.description && newItem.quantity && newItem.rate) {
      const addedItem: BillItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: newItem.description || '',
        hsn: newItem.hsn || '',
        quantity: Number(newItem.quantity),
        unit: newItem.unit || 'BAGS',
        rate: Number(newItem.rate),
        amount: Number(newItem.quantity) * Number(newItem.rate)
      };
      setItems([...items, addedItem]);
      setNewItem({
        description: DEFAULT_PRODUCT.description,
        hsn: DEFAULT_PRODUCT.hsn,
        quantity: 0,
        unit: 'BAGS',
        rate: 0
      });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateAddedItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSave = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return alert('Please select a customer');
    if (items.length === 0) return alert('Please add at least one item');

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const bill: Bill = {
      id: Math.random().toString(36).substr(2, 9),
      billNo: `MRT/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      customerGstin: customer.gstin,
      customerAddress: customer.address,
      vehicleNo,
      destination,
      paymentMode,
      items,
      totalAmount,
      totalQuantity,
      createdAt: Date.now()
    };
    onSave(bill);
    generateInvoicePDF(bill);
    // Clear draft after successful save
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="size-12 bg-primary/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <ReceiptText className="w-6 h-6 text-primary dark:text-blue-400" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-tight dark:text-gray-100">Create New Bill</h2>
          {draft && <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Draft restored from last session</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-rice-surface p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Customer</label>
              <button 
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="text-[10px] font-black text-primary dark:text-blue-400 flex items-center gap-1 hover:underline active:scale-95 transition-all"
              >
                <UserPlus className="w-3 h-3" /> ADD NEW
              </button>
            </div>
            
            {showQuickAdd ? (
              <div className="bg-gray-50 dark:bg-rice-dark p-6 rounded-3xl space-y-4 border border-primary/10 animate-in slide-in-from-top-2">
                <input 
                  className="w-full bg-white dark:bg-rice-surface border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-gray-200 shadow-sm"
                  placeholder="Business Name"
                  value={newCust.name}
                  onChange={e => setNewCust({...newCust, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    className="w-full bg-white dark:bg-rice-surface border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-gray-200 shadow-sm"
                    placeholder="GSTIN"
                    value={newCust.gstin}
                    onChange={e => setNewCust({...newCust, gstin: e.target.value})}
                  />
                  <input 
                    className="w-full bg-white dark:bg-rice-surface border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-gray-200 shadow-sm"
                    placeholder="Phone No"
                    maxLength={10}
                    value={newCust.phone}
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setNewCust({...newCust, phone: val});
                    }}
                  />
                </div>
                <textarea 
                  className="w-full bg-white dark:bg-rice-surface border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-gray-200 shadow-sm"
                  placeholder="Address"
                  rows={2}
                  value={newCust.address}
                  onChange={e => setNewCust({...newCust, address: e.target.value})}
                />
                <div className="flex gap-3">
                  <button onClick={handleQuickAdd} className="flex-1 bg-primary text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-primary/20">SAVE & SELECT</button>
                  <button onClick={() => setShowQuickAdd(false)} className="px-5 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-2xl text-xs font-black">CANCEL</button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl pl-12 pr-10 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
                      placeholder="Search name or GSTIN..."
                      value={customerSearchTerm}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        if (!selectedCustomerId || e.target.value !== customers.find(c => c.id === selectedCustomerId)?.name) {
                            setSelectedCustomerId('');
                        }
                        setIsCustomerDropdownOpen(true);
                      }}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {customerSearchTerm && (
                      <button 
                        onClick={() => { setCustomerSearchTerm(''); setSelectedCustomerId(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button 
                    className={`size-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${selectedCustomerId ? 'bg-green-500 text-white' : 'bg-white dark:bg-rice-dark border border-primary/20 text-primary'}`}
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  >
                    {selectedCustomerId ? <CheckCircle2 className="w-6 h-6" /> : <ChevronDown className={`w-6 h-6 transform transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />}
                  </button>
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-rice-surface border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl z-[100] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300 ios-blur">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          className={`w-full text-left px-6 py-4 hover:bg-primary/5 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-none flex flex-col gap-1 transition-colors ${selectedCustomerId === c.id ? 'bg-primary/5 dark:bg-blue-900/30' : ''}`}
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setCustomerSearchTerm(c.name);
                            setIsCustomerDropdownOpen(false);
                          }}
                        >
                          <span className="font-black text-sm dark:text-gray-100">{c.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.gstin}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-xs font-bold text-gray-400 mb-3">No customer found</p>
                        <button onClick={() => setShowQuickAdd(true)} className="text-xs font-black text-primary dark:text-blue-400 underline uppercase tracking-widest">Create New Partner</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Mode</label>
            <select 
              className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 appearance-none shadow-sm"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMethod)}
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle No</label>
            <div className="relative group">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
                placeholder="e.g. WB 41D 1234"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Destination</label>
            <input 
              className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
              placeholder="Destination Address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-50 dark:border-gray-800 pt-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 ml-1">Line Items</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="group bg-gray-50 dark:bg-rice-dark rounded-[2rem] border border-gray-100 dark:border-gray-800 transition-all shadow-sm hover:border-primary/10 p-6 flex flex-col gap-4">
                <div className="flex flex-col text-center">
                   <input 
                      className="w-full bg-transparent border-none p-0 font-black text-sm dark:text-gray-200 focus:ring-0 text-center uppercase"
                      value={item.description}
                      onChange={(e) => updateAddedItem(item.id, 'description', e.target.value)}
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Product Description</p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <input 
                      className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                      value={item.hsn}
                      onChange={(e) => updateAddedItem(item.id, 'hsn', e.target.value)}
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">HSN/SAC</p>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                        value={item.quantity}
                        onChange={(e) => updateAddedItem(item.id, 'quantity', Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-[7px] text-[10px] font-black text-gray-400">{item.unit}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">Quantity</p>
                  </div>

                  <div>
                    <input 
                      type="number"
                      className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                      value={item.rate}
                      onChange={(e) => updateAddedItem(item.id, 'rate', Number(e.target.value))}
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">Rate</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="text-center">
                    <p className="font-black text-primary dark:text-blue-400 text-xl leading-none">{formatCurrency(item.amount)}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">Amount</p>
                  </div>
                  <div className="w-full flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="p-2.5 text-gray-300 hover:text-red-500 transition-colors active:scale-90 bg-white dark:bg-rice-surface rounded-xl shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="group bg-primary/5 dark:bg-blue-900/10 rounded-[2rem] border border-dashed border-primary/20 transition-all p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-col text-center">
                 <input 
                    className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-sm font-black dark:text-gray-200 focus:ring-2 focus:ring-primary/20 text-center uppercase shadow-sm"
                    placeholder="ENTER DESCRIPTION"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                  <p className="text-[9px] text-primary/60 dark:text-blue-400 font-black uppercase tracking-tight mt-1">New Item Description</p>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <input 
                    className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                    placeholder="HSN CODE"
                    value={newItem.hsn}
                    onChange={(e) => setNewItem({...newItem, hsn: e.target.value})}
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">HSN/SAC</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      type="number"
                      className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                      placeholder="QTY"
                      value={newItem.quantity || ''}
                      onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">Qty</p>
                  </div>
                  <div>
                    <select 
                      className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm appearance-none"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    >
                      <option value="BAGS">BAGS</option>
                      <option value="QTL">QTL</option>
                      <option value="MT">MT</option>
                      <option value="KG">KG</option>
                    </select>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">Unit</p>
                  </div>
                </div>

                <div>
                  <input 
                    type="number"
                    className="w-full bg-white dark:bg-rice-surface border-none rounded-xl px-3 py-2 text-xs font-black dark:text-gray-200 text-center shadow-sm"
                    placeholder="RATE"
                    value={newItem.rate || ''}
                    onChange={(e) => setNewItem({...newItem, rate: Number(e.target.value)})}
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1 text-center">Rate / {newItem.unit}</p>
                </div>
              </div>

              <button 
                onClick={addItemToBill}
                disabled={!newItem.description || !newItem.quantity || !newItem.rate}
                className="w-full bg-primary text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                <Plus className="w-5 h-5" />
                ADD ITEM
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 dark:border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Net Payable Amount</p>
            <p className="text-4xl font-black text-primary dark:text-blue-400">
              {formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/95 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <ReceiptText className="w-6 h-6" />
            Generate Bill & PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerManager: React.FC<{ 
  customers: Customer[], 
  onAdd: (c: Customer) => void,
  onUpdate: (c: Customer) => void
}> = ({ customers, onAdd, onUpdate }) => {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setGstin(editingCustomer.gstin);
      setAddress(editingCustomer.address);
      setPhone(editingCustomer.phone || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setName('');
      setGstin('');
      setAddress('');
      setPhone('');
    }
  }, [editingCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return alert('Name and Address are required');
    if (phone && phone.length !== 10) return alert('Please enter a valid 10-digit phone number');
    
    if (editingCustomer) {
      onUpdate({
        ...editingCustomer,
        name,
        gstin: gstin || 'UNREGISTERED',
        address,
        phone
      });
      setEditingCustomer(null);
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name,
        gstin: gstin || 'UNREGISTERED',
        address,
        phone
      });
    }
    setName('');
    setGstin('');
    setAddress('');
    setPhone('');
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric characters and max length of 10
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="size-12 bg-primary/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <Users className="w-6 h-6 text-primary dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-black tracking-tight dark:text-gray-100">
          {editingCustomer ? 'Update Partner' : 'Customer Directory'}
        </h2>
      </div>

      <div className="bg-white dark:bg-rice-surface p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">
            {editingCustomer ? 'Modify Details' : 'Register New Customer'}
          </h3>
          {editingCustomer && (
            <button 
              onClick={() => setEditingCustomer(null)}
              className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input 
              className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
              placeholder="Business/Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
              placeholder="GSTIN (Optional)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-5">
            <input 
              type="tel"
              className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
              placeholder="Phone Number (10 Digits)"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
            />
          </div>
          <textarea 
            className="w-full bg-gray-50 dark:bg-rice-dark border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200 shadow-sm"
            placeholder="Full Address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button 
            type="submit"
            className={`w-full ${editingCustomer ? 'bg-blue-600' : 'bg-primary'} text-white py-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95`}
          >
            {editingCustomer ? 'Update Record' : 'Add to Database'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Existing Customers</h3>
        <div className="grid grid-cols-1 gap-3">
          {customers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold bg-white dark:bg-rice-surface rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
              No customers registered yet
            </div>
          ) : (
            customers.map(c => (
              <div key={c.id} className="bg-white dark:bg-rice-surface p-6 rounded-3xl border border-gray-50 dark:border-gray-800 flex items-center justify-between group transition-all hover:border-primary/20 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-gray-100 truncate">{c.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.gstin}</p>
                    {c.phone && <span className="text-[10px] text-primary dark:text-blue-400 font-black">| {c.phone}</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 dark:text-gray-400 line-clamp-1">{c.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(c)}
                    className="size-11 bg-gray-50 dark:bg-rice-dark rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-95"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <div className="size-11 bg-gray-50 dark:bg-rice-dark rounded-full flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BillHistory: React.FC<{ bills: Bill[], onDelete: (id: string) => void }> = ({ bills, onDelete }) => {
  const handleShare = async (bill: Bill) => {
    if (navigator.share) {
      const shareData: ShareData = {
        title: `Invoice ${bill.billNo}`,
        text: `Invoice from ${BUSINESS_PROFILE.name} to ${bill.customerName} for ${formatCurrency(bill.totalAmount)}`,
      };

      // Safely check and add URL to avoid Invalid URL errors in restricted environments
      try {
        if (window.location.href && window.location.href.startsWith('http')) {
          new URL(window.location.href); // Verify validity
          shareData.url = window.location.href;
        }
      } catch (e) {
        console.warn('Current URL is invalid for sharing, skipping url property.');
      }

      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      alert('Sharing is not supported on this browser. Try downloading the PDF instead.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="size-12 bg-primary/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <History className="w-6 h-6 text-primary dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-black tracking-tight dark:text-gray-100">Sales History</h2>
      </div>

      <div className="space-y-4">
        {bills.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold bg-white dark:bg-rice-surface rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
            No bills found in history
          </div>
        ) : (
          bills.map(bill => (
            <div key={bill.id} className="bg-white dark:bg-rice-surface p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-6 transition-all hover:border-primary/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className="size-14 bg-gray-50 dark:bg-rice-dark rounded-[1.25rem] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black px-2.5 py-1 bg-primary/10 dark:bg-blue-900/40 text-primary dark:text-blue-400 rounded-lg uppercase">#{bill.billNo}</span>
                      <span className="text-[10px] font-bold text-gray-400">{bill.date}</span>
                    </div>
                    <h4 className="font-black text-gray-800 dark:text-gray-100 text-xl leading-tight truncate">{bill.customerName}</h4>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight truncate mt-1">
                      {bill.vehicleNo || 'wb'} • {bill.paymentMode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount Paid</p>
                  <p className="text-2xl font-black text-primary dark:text-blue-400">{formatCurrency(bill.totalAmount)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleShare(bill)}
                    className="size-12 rounded-2xl bg-gray-50 dark:bg-rice-dark flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-95 shadow-sm"
                    title="Share Invoice"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => generateInvoicePDF(bill)}
                    className="size-12 rounded-2xl bg-gray-50 dark:bg-rice-dark flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-95 shadow-sm"
                    title="Download PDF"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => onDelete(bill.id)}
                    className="size-12 rounded-2xl bg-gray-50 dark:bg-rice-dark flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-95 shadow-sm"
                    title="Delete Record"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
