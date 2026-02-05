
export interface Customer {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phone?: string;
}

export interface BillItem {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export type PaymentMethod = 'CASH' | 'BANK' | 'UPI';

export interface Bill {
  id: string;
  billNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  vehicleNo: string;
  destination: string;
  paymentMode: PaymentMethod;
  paymentTerms?: string;
  additionalCharges?: number;
  items: BillItem[];
  totalAmount: number;
  totalQuantity: number;
  createdAt: number;
  type?: 'SALE' | 'PURCHASE';
}

export type ViewState = 'DASHBOARD' | 'NEW_BILL' | 'NEW_PURCHASE' | 'CUSTOMERS' | 'HISTORY';
