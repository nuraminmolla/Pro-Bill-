
export interface Customer {
  id: string;
  name: string;
  gstin: string;
  address: string;
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
  paymentMode: 'RTGS' | 'Cash';
  items: BillItem[];
  totalAmount: number;
  totalQuantity: number;
  createdAt: number;
}

export type ViewState = 'DASHBOARD' | 'NEW_BILL' | 'CUSTOMERS' | 'HISTORY';
