
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '../types';
import { BUSINESS_PROFILE } from '../constants';
import { numberToWords } from '../utils/helpers';

export const generateInvoicePDF = (bill: Bill) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);

  // 1. Full Page Border (Black)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

  // 2. Header Section
  const logoX = margin + 15;
  const logoY = margin + 15;
  const logoRadius = 14;

  // Background circle (Theme Royal Blue)
  doc.setFillColor(11, 21, 125); 
  doc.circle(logoX, logoY, logoRadius, 'F');
  
  // Design ring
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(logoX, logoY, logoRadius - 2, 'S');

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MRT', logoX, logoY + 1.5, { align: 'center' });

  // Business Name and Details
  doc.setTextColor(11, 21, 125);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_PROFILE.name, pageWidth / 2 + 10, margin + 12, { align: 'center' });
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${BUSINESS_PROFILE.address} ${BUSINESS_PROFILE.city}`, pageWidth / 2 + 10, margin + 18, { align: 'center' });
  doc.text(`${BUSINESS_PROFILE.state} | GSTIN: ${BUSINESS_PROFILE.gstin}`, pageWidth / 2 + 10, margin + 24, { align: 'center' });
  
  doc.setTextColor(11, 21, 125); 
  doc.text(`Email: ${BUSINESS_PROFILE.email} | Mobile: ${BUSINESS_PROFILE.mobile}`, pageWidth / 2 + 10, margin + 30, { align: 'center' });

  // Divider line
  doc.setDrawColor(11, 21, 125);
  doc.setLineWidth(0.6);
  doc.line(margin, margin + 38, pageWidth - margin, margin + 38);

  // 3. Document Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL OF SUPPLY', pageWidth / 2, margin + 48, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Composition Taxable Person, Not Eligible to Collect Tax)', pageWidth / 2, margin + 53, { align: 'center' });

  // 4. Metadata Box
  const metaY = margin + 58;
  const metaHeight = 50; // Increased height for safety
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.rect(margin, metaY, contentWidth, metaHeight);
  doc.line(pageWidth / 2, metaY, pageWidth / 2, metaY + metaHeight);

  // Left Section: Bill Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const labels = ['Bill No', 'Date', 'Vehicle No', 'Pay Mode', 'Destination', 'Terms'];
  const values = [
    `: ${bill.billNo}`,
    `: ${bill.date}`,
    `: ${bill.vehicleNo || 'N/A'}`,
    `: ${bill.paymentMode}`,
    `: ${bill.destination || 'N/A'}`,
    ': Immediately'
  ];

  labels.forEach((label, i) => {
    const y = metaY + 8 + (i * 7.5);
    doc.text(label, margin + 5, y);
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], margin + 35, y);
    doc.setFont('helvetica', 'normal');
  });

  // Right Section: Receiver Info (Dynamic Height for Long Addresses)
  const rightColX = pageWidth / 2 + 5;
  const rightColWidth = contentWidth / 2 - 10;
  
  doc.setFontSize(9);
  doc.text('Details of Receiver (Billed to):', rightColX, metaY + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  // Support wrapping for long business names if necessary
  const nameLines = doc.splitTextToSize(bill.customerName, rightColWidth);
  doc.text(nameLines, rightColX, metaY + 16);
  const nameHeight = nameLines.length * 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const addrLines = doc.splitTextToSize(bill.customerAddress, rightColWidth);
  doc.text(addrLines, rightColX, metaY + 17 + nameHeight);
  
  const addrHeight = addrLines.length * 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${bill.customerGstin}`, rightColX, metaY + 22 + nameHeight + addrHeight);

  // 5. Items Table
  const tableData = bill.items.map((item) => [
    item.description,
    item.hsn,
    item.quantity.toString(),
    item.unit,
    Number(item.rate).toFixed(2),
    Number(item.amount).toFixed(2),
  ]);

  autoTable(doc, {
    startY: metaY + metaHeight + 10,
    margin: { left: margin + 5, right: margin + 5 },
    head: [['Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.1,
      lineColor: [100, 100, 100]
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [100, 100, 100],
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    didDrawPage: () => {
      // Redraw borders on new pages
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // 6. Summary Section
  const sumLabelWidth = 50;
  const sumValWidth = 35;
  const sumStartX = pageWidth - margin - 5 - sumLabelWidth - sumValWidth;
  
  const summaryItems = [
    ['Total Amount', Number(bill.totalAmount).toFixed(2)],
    ['Round Off', '0.00'],
    ['Net Payable', Number(bill.totalAmount).toFixed(2)]
  ];

  summaryItems.forEach((item, i) => {
    const yPos = finalY + (i * 8);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.1);
    doc.rect(sumStartX, yPos, sumLabelWidth, 8);
    doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
    doc.text(item[0], sumStartX + sumLabelWidth - 3, yPos + 6, { align: 'right' });
    doc.rect(sumStartX + sumLabelWidth, yPos, sumValWidth, 8);
    doc.setFont('helvetica', 'bold');
    doc.text(item[1], sumStartX + sumLabelWidth + sumValWidth - 3, yPos + 6, { align: 'right' });
  });

  finalY += 30;

  // 7. Footer - Amount in Words
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Chargeable (in words):', margin + 5, finalY);
  
  doc.setFont('helvetica', 'bolditalic');
  const words = numberToWords(bill.totalAmount);
  const wordsLines = doc.splitTextToSize(words, contentWidth - 10);
  doc.text(wordsLines, margin + 5, finalY + 6);
  
  const wordsHeight = wordsLines.length * 5;
  const footerBaseY = finalY + wordsHeight + 10;

  // Check if footer fits, otherwise add page
  if (footerBaseY + 60 > pageHeight - margin) {
    doc.addPage();
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
  }

  // 8. Declaration and Bank Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Declaration:', margin + 5, footerBaseY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(BUSINESS_PROFILE.declaration, margin + 5, footerBaseY + 5, { maxWidth: contentWidth * 0.6 });
  
  // Dedicated Bank Details Box at bottom
  const bankBoxY = footerBaseY + 22;
  const bankBoxWidth = contentWidth * 0.45;
  const bankBoxHeight = 22;
  const bankBoxX = margin + 5;

  doc.setFillColor(245, 247, 255); // Very light theme blue
  doc.rect(bankBoxX, bankBoxY, bankBoxWidth, bankBoxHeight, 'F');
  doc.setDrawColor(11, 21, 125); // Theme Primary
  doc.setLineWidth(0.2);
  doc.rect(bankBoxX, bankBoxY, bankBoxWidth, bankBoxHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 21, 125);
  doc.text('BANK DETAILS (FOR PAYMENT)', bankBoxX + 3, bankBoxY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Bank: ${BUSINESS_PROFILE.bank.name}`, bankBoxX + 3, bankBoxY + 11);
  doc.setFont('helvetica', 'bold');
  doc.text(`A/c No: ${BUSINESS_PROFILE.bank.accountNo}`, bankBoxX + 3, bankBoxY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`IFSC: ${BUSINESS_PROFILE.bank.ifsc}`, bankBoxX + 3, bankBoxY + 20);

  // Signatory
  const sigX = pageWidth - margin - 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`For ${BUSINESS_PROFILE.name}`, sigX, footerBaseY);
  
  // Signature Space
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', sigX + 32.5, footerBaseY + 35, { align: 'center' });

  // Page Footer Note
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated document and requires no physical signature.', pageWidth / 2, pageHeight - margin - 5, { align: 'center' });

  doc.save(`${bill.billNo.replace(/\//g, '-')}_${bill.customerName.replace(/\s+/g, '_')}.pdf`);
};
