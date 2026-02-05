
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
  const isPurchase = bill.type === 'PURCHASE';

  // 1. Full Page Border (Black)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

  // 2. Header Section
  // Reduced top spacing
  const logoX = margin + 12;
  const logoY = margin + 12;
  const logoRadius = 10; // Reduced radius slightly

  // Background circle
  if (isPurchase) {
      doc.setFillColor(249, 115, 22); // Orange-500
  } else {
      doc.setFillColor(11, 21, 125); // Primary Blue
  }
  doc.circle(logoX, logoY, logoRadius, 'F');
  
  // Design ring
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(logoX, logoY, logoRadius - 2, 'S');

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MRT', logoX, logoY + 1, { align: 'center' });

  // Business Name and Details
  if (isPurchase) {
     doc.setTextColor(249, 115, 22);
  } else {
     doc.setTextColor(11, 21, 125);
  }
  doc.setFontSize(22); // Reduced from 26
  doc.setFont('helvetica', 'bold');
  // Moved up
  doc.text(BUSINESS_PROFILE.name, pageWidth / 2 + 5, margin + 8, { align: 'center' });
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9); // Reduced from 10
  doc.setFont('helvetica', 'normal');
  // Reduced line spacing
  doc.text(`${BUSINESS_PROFILE.address} ${BUSINESS_PROFILE.city}`, pageWidth / 2 + 5, margin + 13, { align: 'center' });
  doc.text(`${BUSINESS_PROFILE.state} | GSTIN: ${BUSINESS_PROFILE.gstin}`, pageWidth / 2 + 5, margin + 17, { align: 'center' });
  
  if (isPurchase) {
     doc.setTextColor(249, 115, 22);
  } else {
     doc.setTextColor(11, 21, 125); 
  }
  doc.text(`Email: ${BUSINESS_PROFILE.email} | Mobile: ${BUSINESS_PROFILE.mobile}`, pageWidth / 2 + 5, margin + 21, { align: 'center' });

  // Divider line
  if (isPurchase) {
      doc.setDrawColor(249, 115, 22);
  } else {
      doc.setDrawColor(11, 21, 125);
  }
  doc.setLineWidth(0.5);
  // Moved up
  doc.line(margin, margin + 26, pageWidth - margin, margin + 26);

  // 3. Document Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12); // Reduced from 14
  doc.setFont('helvetica', 'bold');
  const title = isPurchase ? 'PURCHASE ORDER' : 'BILL OF SUPPLY';
  doc.text(title, pageWidth / 2, margin + 32, { align: 'center' });
  doc.setFontSize(7); // Reduced from 8
  doc.setFont('helvetica', 'normal');
  doc.text('(Composition Taxable Person, Not Eligible to Collect Tax)', pageWidth / 2, margin + 36, { align: 'center' });

  // 4. Metadata Box
  const metaY = margin + 40; // Moved up from 58
  const metaHeight = 45; // Reduced from 60
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.rect(margin, metaY, contentWidth, metaHeight);
  doc.line(pageWidth / 2, metaY, pageWidth / 2, metaY + metaHeight);

  // Left Section: Bill Info
  doc.setFontSize(9); // Reduced from 10
  doc.setFont('helvetica', 'normal');
  const labels = ['Bill No', 'Date', 'Vehicle No', 'Pay Mode', 'Destination', 'Terms'];
  const values = [
    `: ${bill.billNo}`,
    `: ${bill.date}`,
    `: ${bill.vehicleNo || 'N/A'}`,
    `: ${bill.paymentMode}`,
    `: ${bill.destination || 'N/A'}`,
    `: ${bill.paymentTerms || 'Immediately'}`
  ];

  labels.forEach((label, i) => {
    // Reduced spacing from 8.5 to 6
    const y = metaY + 7 + (i * 6); 
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], margin + 28, y);
    doc.setFont('helvetica', 'normal');
  });

  // Right Section: Receiver Info
  const rightColX = pageWidth / 2 + 4;
  const rightColWidth = contentWidth / 2 - 8;
  
  doc.setFontSize(9);
  doc.text(isPurchase ? 'Details of Vendor:' : 'Details of Receiver (Billed to):', rightColX, metaY + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const nameLines = doc.splitTextToSize(bill.customerName, rightColWidth);
  doc.text(nameLines, rightColX, metaY + 13);
  const nameHeight = nameLines.length * 5; // Reduced line height factor

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const addrLines = doc.splitTextToSize(bill.customerAddress, rightColWidth);
  doc.text(addrLines, rightColX, metaY + 14 + nameHeight);
  
  const addrHeight = addrLines.length * 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${bill.customerGstin}`, rightColX, metaY + 18 + nameHeight + addrHeight);

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
    startY: metaY + metaHeight + 5, // Reduced spacing
    margin: { left: margin, right: margin },
    head: [['Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.1,
      lineColor: [100, 100, 100],
      minCellHeight: 8, // Reduced from 10
      valign: 'middle',
      fontSize: 9 // Reduced header font
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [100, 100, 100],
      fontSize: 9, // Reduced body font
      textColor: [0, 0, 0],
      cellPadding: 3, // Reduced padding
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    didDrawPage: () => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // 6. Summary Section
  const sumLabelWidth = 40;
  const sumValWidth = 35;
  const sumStartX = pageWidth - margin - 5 - sumLabelWidth - sumValWidth;
  
  const subTotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
  const additional = bill.additionalCharges || 0;
  const total = subTotal + additional;

  const summaryItems = [
    ['Sub Total', subTotal.toFixed(2)],
  ];
  
  if (additional !== 0) {
     summaryItems.push(['Add. Charges', additional.toFixed(2)]);
  }

  summaryItems.push(['Total Amount', total.toFixed(2)]);

  // Check for page break before summary
  if (finalY + (summaryItems.length * 8) + 40 > pageHeight - margin) {
       doc.addPage();
       doc.setDrawColor(0, 0, 0);
       doc.setLineWidth(0.5);
       doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
       finalY = margin + 10;
  }

  doc.setFontSize(9);
  summaryItems.forEach((item, i) => {
    const rowHeight = 7;
    const yPos = finalY + 2 + (i * rowHeight); // Reduced spacing
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.1);
    doc.rect(sumStartX, yPos, sumLabelWidth, rowHeight);
    doc.setFont('helvetica', i === summaryItems.length - 1 ? 'bold' : 'normal');
    doc.text(item[0], sumStartX + sumLabelWidth - 2, yPos + 5, { align: 'right' });
    doc.rect(sumStartX + sumLabelWidth, yPos, sumValWidth, rowHeight);
    doc.setFont('helvetica', 'bold');
    doc.text(item[1], sumStartX + sumLabelWidth + sumValWidth - 2, yPos + 5, { align: 'right' });
  });

  finalY += 2 + (summaryItems.length * 7) + 5;

  // 7. Footer - Amount in Words
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Chargeable (in words):', margin + 4, finalY);
  
  doc.setFont('helvetica', 'bolditalic');
  const words = numberToWords(bill.totalAmount);
  const wordsLines = doc.splitTextToSize(words, contentWidth - 10);
  doc.text(wordsLines, margin + 4, finalY + 5);
  
  const wordsHeight = wordsLines.length * 5;
  const footerBaseY = finalY + wordsHeight + 8;

  // 8. Declaration and Bank Details
  
  // Dedicated Bank Details Box at bottom
  const bankBoxY = footerBaseY + 15; // Move up bank details
  // Check fit
  if (bankBoxY + 30 > pageHeight - margin) {
      // If it doesn't fit, check if we need new page (though optimization attempts to avoid this)
      // Since we want to fit more, we rely on previous reductions. 
  }

  const bankBoxWidth = contentWidth * 0.5;
  const bankBoxHeight = 22; // Reduced height
  const bankBoxX = margin + 4;

  doc.setFillColor(245, 247, 255);
  doc.rect(bankBoxX, bankBoxY, bankBoxWidth, bankBoxHeight, 'F');
  
  if (isPurchase) {
      doc.setDrawColor(249, 115, 22);
  } else {
      doc.setDrawColor(11, 21, 125);
  }
  doc.setLineWidth(0.2);
  doc.rect(bankBoxX, bankBoxY, bankBoxWidth, bankBoxHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  if (isPurchase) {
     doc.setTextColor(249, 115, 22);
  } else {
     doc.setTextColor(11, 21, 125);
  }
  doc.text('BANK DETAILS', bankBoxX + 3, bankBoxY + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`Bank: ${BUSINESS_PROFILE.bank.name}`, bankBoxX + 3, bankBoxY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`A/c No: ${BUSINESS_PROFILE.bank.accountNo}`, bankBoxX + 3, bankBoxY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`IFSC: ${BUSINESS_PROFILE.bank.ifsc}`, bankBoxX + 3, bankBoxY + 19);

  // Declaration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Declaration:', margin + 4, footerBaseY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(BUSINESS_PROFILE.declaration, margin + 4, footerBaseY + 4, { maxWidth: contentWidth * 0.6 });

  // Signatory
  const sigX = pageWidth - margin - 50;
  const sigY = bankBoxY + 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`For ${BUSINESS_PROFILE.name}`, sigX, sigY, {align: 'center'});
  
  // Signature Space
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Authorized Signatory', sigX, sigY + 15, { align: 'center' });

  // Page Footer Note
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('Computer Generated Invoice.', pageWidth / 2, pageHeight - margin - 2, { align: 'center' });

  doc.save(`${bill.billNo.replace(/\//g, '-')}_${bill.customerName.replace(/\s+/g, '_')}.pdf`);
};
