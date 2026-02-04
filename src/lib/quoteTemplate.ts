// src/lib/quoteTemplate.ts - Professional quotation PDF template matching live preview

import { companyDetails as defaultCompanyDetails } from './companyDetails';

export const generateQuoteHtml = (data: any): string => {
  const { customerInfo, selectedProduct, calculations, components = [], terms = [], logoUrl } = data;
  const company = defaultCompanyDetails;

  // Safe number extraction
  const n = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);
  const basePrice = n(calculations?.basePrice) || n(calculations?.subtotal);
  const extraCosts = n(calculations?.extraCosts);
  const gstAmount = n(calculations?.gstAmount);
  const total = n(calculations?.total) || n(calculations?.grandTotal);
  const centralSubsidy = n(calculations?.centralSubsidy);
  const stateSubsidy = n(calculations?.stateSubsidy);
  const effectiveCost = n(calculations?.effectiveCost);
  const gstRate = n(data?.taxRate) * 100 || 8.9;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN').format(Math.round(val));
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const quoteNumber = `ASS-${(customerInfo?.name || 'X').charAt(0).toUpperCase()}${Date.now().toString().slice(-6)}`;

  // System info
  const systemSize = selectedProduct?.capacity || 0;
  const phase = selectedProduct?.phase === 1 ? 'Single Phase' : 'Three Phase';
  const panelBrand = selectedProduct?.panelBrand || '';
  const panelWattage = selectedProduct?.panelWattage || '';
  const panelType = selectedProduct?.panelType || '';
  const inverterBrand = selectedProduct?.inverterBrand || '';
  const systemType = selectedProduct?.systemType || 'On-grid';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #333; background: white; }
    .page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #1e3a5f; }
    .logo-section { display: flex; align-items: center; gap: 12px; }
    .logo { width: 60px; height: 60px; object-fit: contain; }
    .company-name { font-size: 24px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.5px; }
    .company-tagline { font-size: 9px; font-weight: 600; color: #64748b; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
    .company-info { font-size: 9px; color: #64748b; margin-top: 8px; line-height: 1.6; }
    .gstin { color: #1d4ed8; font-weight: 700; }
    
    .quote-badge { background: #eab308; color: white; padding: 8px 20px; font-size: 16px; font-weight: 900; border-radius: 4px; text-transform: uppercase; letter-spacing: 2px; }
    .quote-info { text-align: right; margin-top: 8px; font-size: 11px; color: #64748b; }
    .quote-number { font-size: 9px; color: #94a3b8; }
    
    /* Grid Layouts */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    
    /* Info Boxes */
    .info-box { background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .info-title { font-weight: 700; color: #1e3a5f; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
    .customer-name { font-weight: 900; color: #1e40af; font-size: 15px; margin-bottom: 4px; }
    .customer-detail { color: #475569; font-size: 10px; margin-bottom: 2px; }
    .system-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
    .system-row strong { color: #1e293b; }
    
    /* Components Table */
    .table-container { border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #f1f5f9; color: #1e3a5f; font-weight: 700; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th:first-child { width: 40px; text-align: center; }
    th:last-child { text-align: right; width: 70px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    tr:last-child td { border-bottom: none; }
    .td-center { text-align: center; }
    .td-right { text-align: right; font-weight: 700; }
    .highlight-row td { font-weight: 700; color: #1e293b; }
    .highlight-row td:nth-child(3) { color: #1e40af; font-style: italic; }
    .highlight-row td:last-child { color: #1e40af; }
    
    /* Subsidy Box */
    .subsidy-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-bottom: 12px; }
    .subsidy-title { font-weight: 900; color: #166534; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .subsidy-row { display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px solid #bbf7d0; }
    .subsidy-total { display: flex; justify-content: space-between; font-size: 13px; font-weight: 900; color: #166534; padding-top: 10px; text-transform: uppercase; }
    .subsidy-total span:last-child { font-size: 17px; }
    
    /* Bank Details */
    .bank-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; font-size: 9px; }
    .bank-title { font-weight: 900; color: #1e3a5f; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 6px; margin-bottom: 8px; }
    .bank-row { margin: 3px 0; }
    
    /* Investment Summary */
    .investment-box { background: #f8fafc; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; }
    .investment-title { font-weight: 700; color: #1e3a5f; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #bfdbfe; padding-bottom: 6px; margin-bottom: 12px; }
    .price-row { display: flex; justify-content: space-between; font-size: 10px; padding: 3px 0; color: #64748b; }
    .price-row.extra { color: #d97706; }
    .price-row.border { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 6px; }
    .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: #1e3a5f; padding-top: 8px; }
    .total-row span:last-child { color: #1e40af; }
    
    .effective-box { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 14px; text-align: center; margin-top: 14px; }
    .effective-label { font-size: 8px; color: #1e40af; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
    .effective-value { font-size: 22px; font-weight: 900; color: #16a34a; letter-spacing: -1px; }
    
    /* Terms */
    .terms-section { border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 16px; }
    .terms-title { font-weight: 900; color: #1e293b; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 10px; }
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 24px; }
    .term-item { font-size: 9px; color: #64748b; padding-left: 12px; position: relative; line-height: 1.5; }
    .term-item::before { content: "•"; position: absolute; left: 0; color: #94a3b8; }
    
    /* Signature */
    .signature-section { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 20px; }
    .sig-box { text-align: center; }
    .sig-box.right { text-align: right; }
    .sig-line { width: 150px; height: 1px; background: #cbd5e1; margin: 0 auto 6px; }
    .sig-box.right .sig-line { margin: 0 0 6px auto; }
    .sig-label { font-size: 8px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .for-company { font-size: 13px; font-weight: 900; color: #1e3a5f; margin-bottom: 40px; text-decoration: underline; text-decoration-color: #eab308; text-underline-offset: 4px; }
    
    @page { size: A4; margin: 0; }
    @media print { .page { padding: 10mm; } }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : ''}
        <div>
          <div class="company-name">ARPIT SOLAR SHOP</div>
          <div class="company-tagline">${company.tagline}</div>
          <div class="company-info">
            <div class="gstin">GSTIN: ${company.gstin}</div>
            <div><strong>HO:</strong> ${company.headOffice}</div>
            <div><strong>Contact:</strong> ${company.phone} | <strong>Email:</strong> ${company.email}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="quote-badge">Quotation</div>
        <div class="quote-info">
          <strong>Date:</strong> ${currentDate}
          <div class="quote-number">Quote No: ${quoteNumber}</div>
        </div>
      </div>
    </div>
    
    <!-- Customer & System Overview -->
    <div class="grid-2">
      <div class="info-box">
        <div class="info-title">Customer Details</div>
        <div class="customer-name">${customerInfo?.name || '________________'}</div>
        ${customerInfo?.address ? `<div class="customer-detail" style="font-style: italic;">${customerInfo.address}</div>` : ''}
        ${customerInfo?.phone ? `<div class="customer-detail">Mo No: ${customerInfo.phone}</div>` : ''}
      </div>
      <div class="info-box">
        <div class="info-title">System Overview</div>
        <div class="system-row"><span>System Size:</span> <strong>${systemSize} KW (${phase})</strong></div>
        <div class="system-row"><span>Modules:</span> <strong>${panelBrand} ${panelWattage}Wp (${panelType})</strong></div>
        <div class="system-row"><span>Inverter:</span> <strong>${inverterBrand}</strong></div>
        <div class="system-row"><span>Type:</span> <strong>${systemType}</strong></div>
      </div>
    </div>
    
    <!-- Components Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>S.N</th>
            <th>Components Description</th>
            <th style="text-align: center;">Specifications / Make</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          ${components.map((comp: any, i: number) => `
            <tr class="${i < 2 ? 'highlight-row' : ''}">
              <td class="td-center">${i + 1}</td>
              <td>${comp.name || ''}</td>
              <td class="td-center">${comp.description || ''} ${comp.make && comp.make !== 'Standard' ? `(${comp.make})` : ''}</td>
              <td class="td-right">${comp.quantity || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Pricing & Subsidy -->
    <div class="grid-2">
      <div>
        <div class="subsidy-box">
          <div class="subsidy-title">PM Surya Ghar Subsidy</div>
          <div class="subsidy-row"><span>Central Subsidy:</span> <strong>₹ ${formatCurrency(centralSubsidy)}/-</strong></div>
          <div class="subsidy-row"><span>State Subsidy:</span> <strong>₹ ${formatCurrency(stateSubsidy)}/-</strong></div>
          <div class="subsidy-total"><span>Total Benefit:</span> <span>₹ ${formatCurrency(centralSubsidy + stateSubsidy)}/-</span></div>
        </div>
        <div class="bank-box">
          <div class="bank-title">Bank Details</div>
          <div class="bank-row"><strong>A/c Name:</strong> ${company.bank.accountName}</div>
          <div class="bank-row"><strong>A/c No:</strong> ${company.bank.accountNumber} | <strong>IFSC:</strong> ${company.bank.ifsc}</div>
          <div class="bank-row"><strong>Bank:</strong> ${company.bank.name}, ${company.bank.branch}</div>
        </div>
      </div>
      <div class="investment-box">
        <div class="investment-title">Investment Summary</div>
        <div class="price-row"><span>Base Price:</span> <span>₹ ${formatCurrency(basePrice - extraCosts)}</span></div>
        ${extraCosts > 0 ? `<div class="price-row extra"><span>+ Extra Costs:</span> <span>₹ ${formatCurrency(extraCosts)}</span></div>` : ''}
        <div class="price-row border"><span>GST (@ ${gstRate}%):</span> <span>₹ ${formatCurrency(gstAmount)}</span></div>
        <div class="total-row"><span style="font-size: 10px; text-transform: uppercase;">Total Amount:</span> <span>₹ ${formatCurrency(total)}</span></div>
        <div class="effective-box">
          <div class="effective-label">Effective Cost After Subsidy</div>
          <div class="effective-value">₹ ${formatCurrency(effectiveCost)}*</div>
        </div>
      </div>
    </div>
    
    <!-- Terms -->
    <div class="terms-section">
      <div class="terms-title">Terms and Conditions</div>
      <div class="terms-grid">
        ${(terms.length > 0 ? terms : [
      'Payment: 10% Advance on structure installation.',
      'Delivery: 85% Before delivery of kit. 5% Post installation.',
      'Subsidy directly credited to customer bank account.',
      'Installation completed within 7-10 working days.',
      'Module Warranty: 25 Years. Inverter: 5 Years.',
      'Free Annual Maintenance for 1st year.'
    ]).map((term: string) => `<div class="term-item">${term.replace(/^([^:]+):/, '<strong>$1:</strong>')}</div>`).join('')}
      </div>
    </div>
    
    <!-- Signature -->
    <div class="signature-section">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Customer Signature</div>
      </div>
      <div class="sig-box right">
        <div class="for-company">For Arpit Solar Shop</div>
        ${data.signatureUrl ? `<img src="${data.signatureUrl}" style="height: 60px; object-fit: contain; margin-bottom: -10px; display: block; margin-left: auto;" alt="Signature" />` : '<div style="height: 50px;"></div>'}
        <div class="sig-line"></div>
        <div class="sig-label">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};
