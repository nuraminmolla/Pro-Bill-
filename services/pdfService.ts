
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
  // Logo (Circle with "MRT") - Using robust standard circle drawing
  const logoX = margin + 15;
  const logoY = margin + 15;
  const logoRadius = 14;

  // Background circle (New Theme Color: #0B157D -> RGB 11, 21, 125)
  doc.setFillColor(11, 21, 125); 
  doc.circle(logoX, logoY, logoRadius, 'F');
  
  // Add a white ring for design
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(logoX, logoY, logoRadius - 2, 'S');

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MRT', logoX, logoY + 1.5, { align: 'center' });

  // Business Name and Details (Centered)
  doc.setTextColor(11, 21, 125); // Theme Royal Blue
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_PROFILE.name, pageWidth / 2 + 10, margin + 12, { align: 'center' });
  
  doc.setTextColor(100, 100, 100); // Neutral gray for address
  doc.setFontSize(10);
  doc.text(BUSINESS_PROFILE.address, pageWidth / 2 + 10, margin + 18, { align: 'center' });
  doc.text(`City: ${BUSINESS_PROFILE.city}`, pageWidth / 2 + 10, margin + 23, { align: 'center' });
  doc.text(`State: ${BUSINESS_PROFILE.state}`, pageWidth / 2 + 10, margin + 28, { align: 'center' });
  
  doc.setTextColor(11, 21, 125); 
  doc.text(`Email: ${BUSINESS_PROFILE.email}`, pageWidth / 2 + 10, margin + 33, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${BUSINESS_PROFILE.gstin}`, pageWidth / 2 + 10, margin + 38, { align: 'center' });
  doc.text(`Mobile: ${BUSINESS_PROFILE.mobile}`, pageWidth / 2 + 10, margin + 43, { align: 'center' });

  // Divider line
  doc.setDrawColor(11, 21, 125);
  doc.setLineWidth(0.6);
  doc.line(margin, margin + 48, pageWidth - margin, margin + 48);

  // 3. Document Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL OF SUPPLY', pageWidth / 2, margin + 56, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Composition Taxable Person, Not Eligible to Collect Tax)', pageWidth / 2, margin + 61, { align: 'center' });

  // 4. Metadata Box (Boxed and Split)
  const metaY = margin + 65;
  const metaHeight = 45;
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
    `: ${bill.vehicleNo || 'WB'}`,
    `: ${bill.paymentMode}`,
    `: ${bill.destination || ''}`,
    ': not Delay'
  ];

  labels.forEach((label, i) => {
    doc.text(label, margin + 5, metaY + 7 + (i * 6.5));
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], margin + 35, metaY + 7 + (i * 6.5));
    doc.setFont('helvetica', 'normal');
  });

  // Right Section: Receiver Info
  const rightColX = pageWidth / 2 + 5;
  doc.text('Details of Receiver (Billed to):', rightColX, metaY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(bill.customerName, rightColX, metaY + 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.customerAddress, rightColX, metaY + 20, { maxWidth: contentWidth / 2 - 10 });
  doc.text(`GSTIN: ${bill.customerGstin}`, rightColX, metaY + 40);

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
    margin: { left: margin + 10, right: margin + 10 },
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
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    didDrawPage: (data) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // 6. Summary Section (Total, Round Off, Grand Total)
  const sumLabelWidth = 60;
  const sumValWidth = 30;
  const sumStartX = pageWidth - margin - 10 - sumLabelWidth - sumValWidth;
  
  const summaryItems = [
    ['Total', Number(bill.totalAmount).toFixed(2)],
    ['Round Off', '0.00'],
    ['Grand Total', Number(bill.totalAmount).toFixed(2)]
  ];

  summaryItems.forEach((item, i) => {
    const yPos = finalY + (i * 8);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.1);
    doc.rect(sumStartX, yPos, sumLabelWidth, 8);
    doc.setFont('helvetica', 'bold');
    doc.text(item[0], sumStartX + sumLabelWidth - 5, yPos + 6, { align: 'right' });
    doc.rect(sumStartX + sumLabelWidth, yPos, sumValWidth, 8);
    doc.text(item[1], sumStartX + sumLabelWidth + sumValWidth - 3, yPos + 6, { align: 'right' });
  });

  const footerNeededHeight = 70;
  if (finalY + 24 + footerNeededHeight > pageHeight - margin) {
    doc.addPage();
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    finalY = margin + 10;
  } else {
    finalY = finalY + 24;
  }

  // 7. Footer Chargeable Amount
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Chargeable (in words):', margin + 5, finalY + 10);
  doc.setFont('helvetica', 'bolditalic');
  doc.text(numberToWords(bill.totalAmount), margin + 5, finalY + 16, { maxWidth: contentWidth - 10 });

  // 8. Declaration and Bank Details
  const footerBaseY = finalY + 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Declaration:', margin + 5, footerBaseY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(BUSINESS_PROFILE.declaration, margin + 5, footerBaseY + 5, { maxWidth: contentWidth * 0.55 });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Bank Details:', margin + 5, footerBaseY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Bank: ${BUSINESS_PROFILE.bank.name}`, margin + 5, footerBaseY + 25);
  doc.text(`A/c No: ${BUSINESS_PROFILE.bank.accountNo}`, margin + 5, footerBaseY + 30);
  doc.text(`IFSC: ${BUSINESS_PROFILE.bank.ifsc}`, margin + 5, footerBaseY + 35);

  // Signatory
  const sigX = pageWidth - margin - 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`For ${BUSINESS_PROFILE.name}`, sigX, footerBaseY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', sigX, footerBaseY + 35);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This is computer generated Bill Of Supply', pageWidth / 2, pageHeight - margin - 5, { align: 'center' });

  doc.save(`${bill.billNo}_${bill.customerName.replace(/\s+/g, '_')}.pdf`);
};
