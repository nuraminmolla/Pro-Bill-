
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
  ChevronDown,
  ShoppingBag,
  ArrowDownCircle,
  Minus,
  LogOut,
  Lock,
  User
} from 'lucide-react';
import { Customer, Bill, BillItem, ViewState, PaymentMethod } from './types';
import { BUSINESS_PROFILE, DEFAULT_PRODUCT } from './constants';
import { formatCurrency } from './utils/helpers';
import { generateInvoicePDF } from './services/pdfService';
import { generateDailyReportPDF } from './services/reportService';

const DRAFT_STORAGE_KEY = 'mrt_bill_draft';

// --- Login Component ---
const Login: React.FC<{ onLogin: (status: boolean) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demonstration
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      onLogin(true);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-rice-dark flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-rice-surface rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Tractor className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary dark:text-blue-400">{BUSINESS_PROFILE.name}</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-rice-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200"
                placeholder="Enter username"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-rice-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-200"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] text-gray-400">Restricted Access • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

const NewBillForm: React.FC<{
  customers: Customer[];
  onSave: (bill: Bill) => void;
  onAddCustomer: (customer: Customer) => Customer;
  type: 'SALE' | 'PURCHASE';
}> = ({ customers, onSave, onAddCustomer, type }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('CASH');
  const [items, setItems] = useState<BillItem[]>([{ id: '1', ...DEFAULT_PRODUCT, quantity: 0, unit: 'QTL', rate: 0, amount: 0 }]);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), ...DEFAULT_PRODUCT, quantity: 0, unit: 'QTL', rate: 0, amount: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calc amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveCustomer = () => {
    if (!newCustName) return alert('Name is required');
    const newCust: Customer = {
      id: Date.now().toString(),
      name: newCustName,
      gstin: newCustGstin,
      address: newCustAddress,
      phone: newCustPhone
    };
    onAddCustomer(newCust);
    setCustomerId(newCust.id);
    setShowNewCustomerForm(false);
    // Reset form
    setNewCustName(''); setNewCustGstin(''); setNewCustAddress(''); setNewCustPhone('');
  };

  const handleSubmit = () => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) {
        alert('Please select a customer');
        return;
    }
    if (items.length === 0 || items.some(i => i.amount === 0)) {
        alert('Please add valid items');
        return;
    }

    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = itemsTotal + (Number(additionalCharges) || 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const newBill: Bill = {
      id: Date.now().toString(),
      billNo: `MRT/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`, // Simple logic
      date,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerGstin: selectedCustomer.gstin,
      customerAddress: selectedCustomer.address,
      vehicleNo,
      destination,
      paymentMode,
      additionalCharges: Number(additionalCharges) || 0,
      items,
      totalAmount,
      totalQuantity,
      createdAt: Date.now(),
      type
    };

    onSave(newBill);
    generateInvoicePDF(newBill);
  };

  const calculateSubTotal = () => items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary dark:text-blue-400 uppercase tracking-widest">
                {type === 'SALE' ? 'New Sale Invoice' : 'New Purchase Entry'}
            </h2>
            <button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Save & Generate
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Selection */}
            <div className="md:col-span-2 bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bill To</label>
                     <button onClick={() => setShowNewCustomerForm(!showNewCustomerForm)} className="text-primary dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                        <PlusCircle className="w-3 h-3" /> New Partner
                     </button>
                </div>
                
                {showNewCustomerForm ? (
                    <div className="space-y-3 bg-gray-50 dark:bg-rice-dark p-4 rounded-xl">
                        <input placeholder="Partner Name" value={newCustName} onChange={e => setNewCustName(e.target.value)} className="w-full bg-white dark:bg-rice-surface p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700" />
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="GSTIN" value={newCustGstin} onChange={e => setNewCustGstin(e.target.value)} className="w-full bg-white dark:bg-rice-surface p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700" />
                            <input placeholder="Phone" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} className="w-full bg-white dark:bg-rice-surface p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700" />
                        </div>
                        <input placeholder="Address" value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)} className="w-full bg-white dark:bg-rice-surface p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowNewCustomerForm(false)} className="text-gray-500 text-xs font-bold px-3 py-1">Cancel</button>
                            <button onClick={handleSaveCustomer} className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-lg">Save Partner</button>
                        </div>
                    </div>
                ) : (
                    <select 
                        value={customerId} 
                        onChange={e => setCustomerId(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-rice-dark border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">Select Partner...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}
            </div>

            {/* Meta Details */}
            <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Vehicle No</label>
                    <input type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700" placeholder="WB-..." />
                </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Payment</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value as PaymentMethod)} className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700">
                        <option value="CASH">CASH</option>
                        <option value="BANK">BANK TRANSFER</option>
                        <option value="UPI">UPI</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Items Table */}
        <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="text-left">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Item Description</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">HSN/SAC</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Unit</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Qty</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Rate</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32 text-right pr-2">Amount</th>
                        <th className="pb-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="space-y-2">
                    {items.map((item, index) => (
                        <tr key={item.id} className="group">
                            <td className="pr-2 py-2">
                                <input 
                                    value={item.description} 
                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                    className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-transparent focus:border-primary/20 outline-none transition-all placeholder-gray-300"
                                    placeholder="Item Name"
                                />
                            </td>
                            <td className="pr-2 py-2">
                                <input 
                                    value={item.hsn} 
                                    onChange={e => handleItemChange(index, 'hsn', e.target.value)}
                                    className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-transparent focus:border-primary/20 outline-none transition-all placeholder-gray-300"
                                    placeholder="HSN"
                                />
                            </td>
                            <td className="pr-2 py-2">
                                <select 
                                    value={item.unit}
                                    onChange={e => handleItemChange(index, 'unit', e.target.value)}
                                    className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-transparent focus:border-primary/20 outline-none transition-all"
                                >
                                    <option value="QTL">QTL</option>
                                    <option value="KG">KG</option>
                                    <option value="BAGS">BAGS</option>
                                    <option value="Litre">Litre</option>
                                    <option value="PCS">PCS</option>
                                    <option value="MT">MT</option>
                                </select>
                            </td>
                            <td className="pr-2 py-2">
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={item.quantity || ''} 
                                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-transparent focus:border-primary/20 outline-none transition-all placeholder-gray-300"
                                    placeholder="0"
                                />
                            </td>
                            <td className="pr-2 py-2">
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={item.rate || ''} 
                                    onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 bg-gray-50 dark:bg-rice-dark rounded-lg text-sm font-bold border border-transparent focus:border-primary/20 outline-none transition-all placeholder-gray-300"
                                    placeholder="0"
                                />
                            </td>
                            <td className="py-2 text-right font-black text-gray-700 dark:text-gray-300 pr-2">
                                {item.amount.toFixed(2)}
                            </td>
                            <td className="py-2 text-center">
                                <button onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <button onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-400 hover:opacity-80">
                <Plus className="w-4 h-4" /> Add Item
            </button>

            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                <div className="flex flex-col md:flex-row justify-end items-end gap-6">
                    <div className="w-full md:w-64">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Additional Charges</label>
                         <input 
                            type="number" 
                            step="0.01"
                            value={additionalCharges || ''}
                            onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                            className="w-full p-3 bg-gray-50 dark:bg-rice-dark rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="0.00"
                         />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                        <p className="text-3xl font-black text-primary dark:text-blue-400">
                             {formatCurrency(calculateSubTotal() + (additionalCharges || 0))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const CustomerManager: React.FC<{
  customers: Customer[];
  onAdd: (c: Customer) => void;
  onUpdate: (c: Customer) => void;
}> = ({ customers, onAdd, onUpdate }) => {
   const [isAdding, setIsAdding] = useState(false);
   const [formData, setFormData] = useState<Partial<Customer>>({});

   const handleSave = () => {
       if(!formData.name) return;
       if (formData.id) {
           onUpdate(formData as Customer);
       } else {
           onAdd({ id: Date.now().toString(), ...formData } as Customer);
       }
       setIsAdding(false);
       setFormData({});
   };

   return (
       <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-primary dark:text-blue-400 uppercase tracking-widest">Partners</h2>
               <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Add Partner
               </button>
           </div>
           
           {isAdding && (
               <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                   <h3 className="text-sm font-bold">New Partner Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="p-3 bg-gray-50 dark:bg-rice-dark rounded-xl text-sm border border-gray-200 dark:border-gray-700" />
                       <input placeholder="GSTIN" value={formData.gstin || ''} onChange={e => setFormData({...formData, gstin: e.target.value})} className="p-3 bg-gray-50 dark:bg-rice-dark rounded-xl text-sm border border-gray-200 dark:border-gray-700" />
                       <input placeholder="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="p-3 bg-gray-50 dark:bg-rice-dark rounded-xl text-sm border border-gray-200 dark:border-gray-700" />
                       <input placeholder="Address" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="p-3 bg-gray-50 dark:bg-rice-dark rounded-xl text-sm border border-gray-200 dark:border-gray-700" />
                   </div>
                   <div className="flex justify-end gap-3">
                       <button onClick={() => setIsAdding(false)} className="text-gray-500 font-bold text-xs">Cancel</button>
                       <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs">Save</button>
                   </div>
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {customers.map(c => (
                   <div key={c.id} className="bg-white dark:bg-rice-surface p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                       <div>
                           <p className="font-black text-gray-800 dark:text-gray-200">{c.name}</p>
                           <p className="text-xs text-gray-400">{c.address}</p>
                           <p className="text-[10px] font-bold text-gray-400 mt-1">GST: {c.gstin}</p>
                       </div>
                       <button onClick={() => { setFormData(c); setIsAdding(true); }} className="p-2 bg-gray-50 dark:bg-rice-dark rounded-full hover:bg-gray-100">
                           <Edit2 className="w-4 h-4 text-gray-500" />
                       </button>
                   </div>
               ))}
           </div>
       </div>
   );
};

const BillHistory: React.FC<{
  bills: Bill[];
  onDelete: (id: string) => void;
}> = ({ bills, onDelete }) => {
   const [searchTerm, setSearchTerm] = useState('');

   const filteredBills = bills.filter(bill => {
       const search = searchTerm.toLowerCase();
       return (
           bill.customerName.toLowerCase().includes(search) ||
           bill.billNo.toLowerCase().includes(search) ||
           (bill.vehicleNo && bill.vehicleNo.toLowerCase().includes(search))
       );
   });

   const handleExportCSV = () => {
       const headers = ['Bill No', 'Date', 'Type', 'Customer Name', 'GSTIN', 'Vehicle No', 'Total Qty', 'Total Amount'];
       const csvRows = [headers.join(',')];

       filteredBills.forEach(bill => {
           const row = [
               bill.billNo,
               bill.date,
               bill.type || 'SALE',
               `"${bill.customerName.replace(/"/g, '""')}"`,
               bill.customerGstin,
               bill.vehicleNo || '',
               bill.totalQuantity.toFixed(2),
               bill.totalAmount.toFixed(2)
           ];
           csvRows.push(row.join(','));
       });

       const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.setAttribute('href', url);
       a.setAttribute('download', `history_export_${new Date().toISOString().split('T')[0]}.csv`);
       a.click();
   };

   return (
       <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
               <div>
                   <h2 className="text-xl font-black text-primary dark:text-blue-400 uppercase tracking-widest">Transaction History</h2>
                   <p className="text-xs text-gray-400 font-bold mt-1">{filteredBills.length} records found</p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                   <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                       <input 
                           type="text" 
                           placeholder="Search bill, partner, vehicle..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 pr-4 py-2.5 bg-white dark:bg-rice-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                       />
                   </div>
                   <button 
                       onClick={handleExportCSV}
                       className="bg-white dark:bg-rice-surface hover:bg-gray-50 dark:hover:bg-rice-dark text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                   >
                       <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export CSV
                   </button>
               </div>
           </div>

           <div className="space-y-3">
               {filteredBills.map(bill => (
                   <div key={bill.id} className="bg-white dark:bg-rice-surface p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                       <div className="flex items-center gap-4">
                           <div className={`size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bill.type === 'PURCHASE' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                               {bill.type === 'PURCHASE' ? <ShoppingBag className="w-5 h-5 text-orange-500" /> : <ReceiptText className="w-5 h-5 text-primary dark:text-blue-400" />}
                           </div>
                           <div>
                               <p className="font-black text-sm text-gray-800 dark:text-gray-200">{bill.customerName}</p>
                               <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-rice-dark px-2 py-0.5 rounded text-gray-500">#{bill.billNo}</span>
                                    <span className="text-[10px] text-gray-400">{bill.date}</span>
                                    {bill.vehicleNo && <span className="text-[10px] text-gray-400 border-l pl-2 border-gray-300 dark:border-gray-700 flex items-center gap-1"><Truck className="w-3 h-3" /> {bill.vehicleNo}</span>}
                               </div>
                           </div>
                       </div>
                       
                       <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                           <div className="text-right">
                               <p className={`font-black ${bill.type === 'PURCHASE' ? 'text-orange-500' : 'text-primary dark:text-blue-400'}`}>
                                    {formatCurrency(bill.totalAmount)}
                               </p>
                               <p className="text-[10px] text-gray-400 font-bold">{bill.totalQuantity.toFixed(2)} QTL</p>
                           </div>
                           <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                               <button onClick={() => generateInvoicePDF(bill)} className="p-2 hover:bg-gray-50 dark:hover:bg-rice-dark rounded-xl text-gray-500 transition-colors" title="Download PDF">
                                   <Download className="w-5 h-5" />
                               </button>
                               <button onClick={() => onDelete(bill.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-400 transition-colors" title="Delete">
                                   <Trash2 className="w-5 h-5" />
                               </button>
                           </div>
                       </div>
                   </div>
               ))}
               {filteredBills.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-16 text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                       <Search className="w-8 h-8 mb-2 opacity-50" />
                       <p className="font-bold text-sm">No transactions found</p>
                       <p className="text-xs opacity-70">Try adjusting your search terms</p>
                   </div>
               )}
           </div>
       </div>
   );
};

const Dashboard: React.FC<{
  bills: Bill[];
  setActiveView: (view: ViewState) => void;
}> = ({ bills, setActiveView }) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysBills = bills.filter(b => b.date === today);
  const totalSalesToday = todaysBills.filter(b => b.type === 'SALE' || !b.type).reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPurchasesToday = todaysBills.filter(b => b.type === 'PURCHASE').reduce((sum, b) => sum + b.totalAmount, 0);
  
  const netProfit = totalSalesToday - totalPurchasesToday;
  const isProfit = netProfit >= 0;

  const recentBills = [...bills].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
            <div>
                <h2 className="text-xl font-black text-primary dark:text-blue-400 uppercase tracking-widest">Dashboard</h2>
                <p className="text-xs text-gray-400 font-bold">{new Date().toDateString()}</p>
            </div>
            <button 
                onClick={() => generateDailyReportPDF(bills)}
                className="w-fit bg-gray-100 dark:bg-rice-surface hover:bg-gray-200 dark:hover:bg-rice-dark text-gray-700 dark:text-gray-200 border border-transparent dark:border-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            >
                <Download className="w-3 h-3" /> Daily Report
            </button>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
            <div className="bg-primary text-white p-6 rounded-3xl shadow-lg shadow-primary/20">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Today's Sales</p>
                <h3 className="text-3xl font-black">{formatCurrency(totalSalesToday)}</h3>
            </div>
             <div className="bg-orange-500 text-white p-6 rounded-3xl shadow-lg shadow-orange-500/20">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Today's Purchase</p>
                <h3 className="text-3xl font-black">{formatCurrency(totalPurchasesToday)}</h3>
            </div>
            
            {/* Profit/Loss Bar */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-colors ${
                isProfit 
                    ? 'border-green-500/20 bg-green-50 dark:bg-green-900/10' 
                    : 'border-red-500/20 bg-red-50 dark:bg-red-900/10'
            }`}>
                 <span className={`text-xs font-black uppercase tracking-widest ${
                     isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                 }`}>
                     {isProfit ? 'Net Profit' : 'Net Loss'}
                 </span>
                 <div className={`flex items-center gap-2 font-black text-xl ${
                     isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                 }`}>
                      {isProfit ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                      {formatCurrency(Math.abs(netProfit))}
                 </div>
            </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveView('NEW_BILL')} className="bg-white dark:bg-rice-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-primary dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">New Sale</span>
            </button>
            <button onClick={() => setActiveView('NEW_PURCHASE')} className="bg-white dark:bg-rice-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownCircle className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">New Purchase</span>
            </button>
             <button onClick={() => setActiveView('CUSTOMERS')} className="bg-white dark:bg-rice-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Add Partner</span>
            </button>
             <button onClick={() => setActiveView('HISTORY')} className="bg-white dark:bg-rice-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">History</span>
            </button>
        </div>

        <div className="bg-white dark:bg-rice-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">Recent Activity</h3>
                 <button onClick={() => setActiveView('HISTORY')} className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ChevronRight className="w-3 h-3" />
                 </button>
             </div>
             
             <div className="space-y-4">
                 {recentBills.map(bill => (
                     <div key={bill.id} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                             <div className={`size-10 rounded-xl flex items-center justify-center ${bill.type === 'PURCHASE' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                {bill.type === 'PURCHASE' ? <ShoppingBag className="w-4 h-4 text-orange-500" /> : <ReceiptText className="w-4 h-4 text-primary dark:text-blue-400" />}
                             </div>
                             <div>
                                 <p className="text-sm font-black text-gray-800 dark:text-gray-200">{bill.customerName}</p>
                                 <p className="text-[10px] text-gray-400 font-bold">{bill.date} • {bill.billNo}</p>
                             </div>
                        </div>
                        <div className="text-right">
                             <p className={`text-sm font-black ${bill.type === 'PURCHASE' ? 'text-orange-500' : 'text-primary dark:text-blue-400'}`}>
                                {formatCurrency(bill.totalAmount)}
                             </p>
                        </div>
                     </div>
                 ))}
                 {recentBills.length === 0 && (
                     <div className="text-center py-8 text-gray-400 text-xs">No recent transactions</div>
                 )}
             </div>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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

  const handleLogin = (status: boolean) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setActiveView('DASHBOARD');
  };

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
      case 'NEW_BILL': return <NewBillForm customers={customers} onSave={addBill} onAddCustomer={addCustomer} type="SALE" />;
      case 'NEW_PURCHASE': return <NewBillForm customers={customers} onSave={addBill} onAddCustomer={addCustomer} type="PURCHASE" />;
      case 'CUSTOMERS': return <CustomerManager customers={customers} onAdd={addCustomer} onUpdate={updateCustomer} />;
      case 'HISTORY': return <BillHistory bills={bills} onDelete={deleteBill} />;
      default: return <Dashboard bills={bills} setActiveView={setActiveView} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
              { id: 'NEW_PURCHASE', icon: ShoppingBag, label: 'Record Purchase' },
              { id: 'CUSTOMERS', icon: Users, label: 'Partners' },
              { id: 'HISTORY', icon: History, label: 'Transactions' },
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
          
          <div className="mt-auto space-y-3">
             <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-rice-dark transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
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
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleLogout}
            className="size-10 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
          >
            <LogOut className="w-5 h-5" />
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
          { id: 'NEW_PURCHASE', icon: ShoppingBag, label: 'BUY' },
          { id: 'HISTORY', icon: History, label: 'HIST' },
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

export default App;
