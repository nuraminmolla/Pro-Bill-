
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '../types';
import { BUSINESS_PROFILE } from '../constants';
import { formatCurrency } from '../utils/helpers';

export const generateDailyReportPDF = (bills: Bill[], reportDate?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const targetDate = reportDate || new Date().toISOString().split('T')[0];

  // Filter bills for the specific date
  const filteredBills = bills.filter(bill => bill.date === targetDate);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(11, 21, 125); // Primary Theme Color
  doc.text(BUSINESS_PROFILE.name, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('SALES REPORT', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Date: ${targetDate}`, margin, 40);
  doc.text(`Generated at: ${new Date().toLocaleTimeString()}`, pageWidth - margin, 40, { align: 'right' });

  // Summary Cards Data
  const totalSales = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalQty = filteredBills.reduce((sum, b) => sum + b.totalQuantity, 0);
  const totalBills = filteredBills.length;

  // Draw Summary Box
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(245, 247, 255);
  doc.rect(margin, 45, pageWidth - (margin * 2), 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL BILLS', margin + 10, 55);
  doc.text('TOTAL QUANTITY', pageWidth / 2, 55, { align: 'center' });
  doc.text('TOTAL REVENUE', pageWidth - margin - 10, 55, { align: 'right' });

  doc.setFontSize(12);
  doc.setTextColor(11, 21, 125);
  doc.text(totalBills.toString(), margin + 10, 63);
  doc.text(`${totalQty.toFixed(2)} QTL`, pageWidth / 2, 63, { align: 'center' });
  doc.text(formatCurrency(totalSales), pageWidth - margin - 10, 63, { align: 'right' });

  if (filteredBills.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('No transactions recorded on this date.', pageWidth / 2, 85, { align: 'center' });
  } else {
    // Table of transactions
    const tableData = filteredBills.map(bill => [
      bill.billNo,
      bill.customerName,
      bill.vehicleNo || '-',
      bill.paymentMode,
      bill.totalQuantity.toFixed(2),
      bill.totalAmount.toFixed(2)
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Bill No', 'Customer Name', 'Vehicle', 'Mode', 'Qty (QTL)', 'Amount (INR)']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [11, 21, 125],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      foot: [[
        'TOTAL', 
        '', 
        '', 
        '', 
        totalQty.toFixed(2), 
        totalSales.toFixed(2)
      ]],
      footStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'right'
      }
    });
  }

  doc.save(`Sales_Report_${targetDate}.pdf`);
};
