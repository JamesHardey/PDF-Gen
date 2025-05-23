import { formatValue } from "./formatValue";
import { format } from "date-fns";

export const invoiceTemplate = (
  invoiceNum: string,
  customer: any,
  currency: string,
  pdfTitle: string,
  color: string,
  business: any,
  invoiceForm: any,
  signature: string,
  totalAmt: number,
  grandTotal: number,
  discountAmt: number,
  taxAmount: number,
  selectedTemplate: any,
  displayPaymentInstruction: boolean
) => {
  // ... existing code ...
  const {
    businessName = '', 
    logo = '', 
    phone = '', 
    email = '', 
    address1 = '',
    paymentInstructions = {}
  } = business || {};

  // Utility function to check if a number is even
  const isEven = (n: number) => {
    return /^-?\d*[02468]$/.test(n.toString());
  };

  // Discount section generation
  const discount =
    invoiceForm.discount.type !== "On item" &&
    invoiceForm.discount.type !== "None" &&
    invoiceForm.discount.value !== ""
      ? `<div class="summary-row">
           <div class="summary-label">Discount</div>
           <div class="summary-value">${currency}${formatValue(Number(discountAmt))}</div>
         </div>`
      : ``;

  // Delivery fee section generation
  const deliveryFee =
    Number(invoiceForm.deliveryFee) > 0 && invoiceForm.deliveryFee !== ""
      ? `<div class="summary-row">
           <div class="summary-label">Shipping</div>
           <div class="summary-value">${currency}${formatValue(
          Number(invoiceForm.deliveryFee)
        )}</div>
         </div>`
      : ``;

  // Invoice table generation
  const invoiceTable = `
    <div class="invoice-table-container">
      <div class="invoice-table-header">
        <div class="table-header-item item-desc">ITEM</div>
        <div class="table-header-item item-qty">QUANTITY</div>
        <div class="table-header-item item-price">PRICE</div>
        <div class="table-header-item item-total">TOTAL</div>
      </div>
      
      <div class="invoice-table-body">
        ${invoiceForm.items.map((item: any, index: number) => `
            <div 
              class="table-row"
              style="
                background-color: ${
                  isEven(index + 1) && selectedTemplate.name === "antiqua" 
                    ? '#2B007117' 
                    : 'transparent'
                };
                border-bottom: ${
                  Number(index) + 1 === invoiceForm.items.length 
                    ? '0' 
                    : '1px solid #EEEEEE'
                };
              "
            >
            <div class="table-cell item-desc">${item?.name || ''}</div>
            <div class="table-cell item-qty">${item?.quantity || ''}</div>
            <div class="table-cell item-price">${formatValue(item?.sellingPrice) || ''}</div>
            <div class="table-cell item-total">${currency}${formatValue(
              Number(item?.sellingPrice) * Number(item?.quantity)
            )}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="invoice-summary-section">
        <div class="payment-instructions">
          ${displayPaymentInstruction ? `
            <div class="payment-title">Payment Instructions</div>
            <div class="payment-details">
              ${paymentInstructions?.paymentInstruction1 ? `<div class="payment-detail">${paymentInstructions.paymentInstruction1}</div>` : ''}
              ${paymentInstructions?.paymentInstruction2 ? `<div class="payment-detail">${paymentInstructions.paymentInstruction2}</div>` : ''}
              ${paymentInstructions?.paymentInstruction3 ? `<div class="payment-detail">${paymentInstructions.paymentInstruction3}</div>` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="invoice-totals">
          <div class="summary-row">
            <div class="summary-label">SUBTOTAL</div>
            <div class="summary-value">${currency}${formatValue(totalAmt)}</div>
          </div>

          ${discount}
          ${deliveryFee}
          
          <div class="summary-row">
            <div class="summary-label">TAX (${invoiceForm?.tax}%)</div>
            <div class="summary-value">${currency}${formatValue(taxAmount)}</div>
          </div>
          
          <div class="summary-row total-row">
            <div class="summary-label">TOTAL</div>
            <div class="summary-value">${currency}${formatValue(grandTotal)}</div>
          </div>
          
          <div class="amount-due">
            <div class="due-label">AMOUNT DUE</div>
            <div class="due-value">${currency}${formatValue(grandTotal - invoiceForm?.amountPaid)}</div>
          </div>
        </div>
      </div>
    </div>`;

  // Invoice Details section generation
  const invoiceDetails = `
    <div class="invoice-details-section">
      <div class="bill-to-section">
        <div class="section-label">BILL TO</div>
        ${customer ? `<div class="customer-name">${customer.name}</div>` : ''}
        ${customer?.email ? `<div class="customer-info">${customer.email}</div>` : ''}
        ${customer?.phone ? `<div class="customer-info">${customer.phone}</div>` : ''}
        ${customer?.address1 || customer?.address2 ? 
          `<div class="customer-info">${customer?.address1 || customer?.address2}</div>` : ''}
      </div>
      
      <div class="invoice-info-section">
        <div class="invoice-info-row">
          <div class="info-label">Invoice No.</div>
          <div class="info-value">#${invoiceNum}</div>
        </div>
        
        ${invoiceForm?.createdDate ? `
          <div class="invoice-info-row">
            <div class="info-label">Issued Date</div>
            <div class="info-value">${format(invoiceForm?.createdDate, "MM/dd/yyyy")}</div>
          </div>
        ` : ''}
        
        ${invoiceForm?.dueDate && pdfTitle !== "Estimate" ? `
          <div class="invoice-info-row">
            <div class="info-label">Due Date</div>
            <div class="info-value">${format(invoiceForm?.dueDate, "MM/dd/yyyy")}</div>
          </div>
        ` : ''}
      </div>
    </div>`;

  // Full HTML template with better structure and styling
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice PDF</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Roboto', sans-serif;
        background-color: white;
        color: #333;
        line-height: 1.5;
        font-size: 12pt;
      }

      /* Page layout styles */
      @page {
        size: Letter;
        margin: 0.5in;
      }

      /* Main container */
      .invoice-container {
        width: 100%;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 10px 0;
      }

      /* Company header section */
      .company-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      .logo-container {
        width: 100px;
        height: 100px;
      }

      .logo-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .company-info {
      }

      .invoice-title {
        font-size: 20pt;
        font-weight: 700;
        margin-bottom: 5px;
        color: #000;
      }

      .company-name {
        font-size: 13pt;
        font-weight: 700;
        margin-bottom: 2px;
      }

      .company-details {
        font-size: 11pt;
        color: #555;
      }

      /* Invoice details section with gold border */
      .invoice-details-section {
        display: flex;
        justify-content: space-between;
        background-color: #FBFBFB;
        border-top: 2px solid ${color};
        padding: 15px;
        margin-bottom: 20px;
      }

      .section-label {
        font-weight: 700;
        font-size: 11pt;
        color: #555;
        margin-bottom: 5px;
      }

      .customer-name {
        font-weight: 700;
        font-size: 12pt;
        margin-bottom: 2px;
      }

      .customer-info {
        font-size: 11pt;
        margin-bottom: 2px;
      }

      .invoice-info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }

      .info-label {
        font-weight: 500;
        color: #555;
        margin-right: 20px;
      }

      .info-value {
        font-weight: 700;
        text-align: right;
      }

      /* Invoice table styles */
      .invoice-table-container {
        margin-bottom: 30px;
      }

      .invoice-table-header {
        display: flex;
        background-color: ${color};
        color: #333;
        font-weight: 700;
        padding: 8px 10px;
      }

      .table-header-item {
        font-size: 11pt;
        letter-spacing: 0.5px;
      }

      .invoice-table-body {
        background-color: #FBFBFB;
        border-bottom: 2px solid ${color}
        border-left: 1px solid ${color}
        border-right: 1px solid ${color}
      }

      .table-row {
        display: flex;
        border-bottom: 1px solid #EEEEEE;
        padding: 8px 10px;
      }

      .even-row {
        background-color: #F5F5F5;
      }

      .table-cell {
        font-size: 11pt;
        padding: 4px 0;
      }

      /* Table column widths */
      .item-desc {
        flex: 3;
        text-align: left;
      }

      .item-qty {
        flex: 1;
        text-align: center;
      }

      .item-price {
        flex: 1;
        text-align: right;
      }

      .item-total {
        flex: 1;
        text-align: right;
      }

      /* Invoice summary section */
      .invoice-summary-section {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }

      .payment-instructions {
        flex: 1;
        padding-right: 20px;
      }

      .payment-title {
        font-weight: 700;
        margin-bottom: 5px;
        font-size: 12pt;
      }

      .payment-detail {
        font-size: 11pt;
        margin-bottom: 3px;
      }

      .invoice-totals {
        width: 250px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
      }

      .summary-label {
        font-weight: 600;
        color: #555;
      }

      .summary-value {
        font-weight: 700;
        text-align: right;
      }

      .total-row {
        border-top: 1px solid #EEEEEE;
        border-bottom: 1px solid #EEEEEE;
        padding: 8px 0;
      }

      .amount-due {
        background-color: ${color};
        display: flex;
        justify-content: space-between;
        padding: 10px;
        margin-top: 10px;
        font-weight: 700;
      }

      .due-label {
        font-size: 12pt;
      }

      .due-value {
        font-size: 12pt;
      }

      /* Note section */
      .note-section {
        margin-top: 30px;
        border-top: 2px solid ${color};
        padding-top: 10px;
      }

      .note-title {
        font-weight: 700;
        margin-bottom: 5px;
      }

      .note-content {
        font-size: 11pt;
        color: #555;
      }

      /* Signature section */
      .signature-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 30px;
      }

      .signature-container {
        width: 200px;
        text-align: center;
      }

      .signature-image {
        height: 60px;
        margin-bottom: 5px;
      }

      .signature-line {
        border-bottom: 1px solid #000;
        margin-bottom: 5px;
      }

      .signature-date {
        font-size: 11pt;
        color: #555;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <!-- Company Header -->
      <div class="company-header" style="flex-direction: ${
          selectedTemplate.flexDirection || "row"
        }">
        <div class="logo-container">
          ${logo ? `<img src="${logo}" alt="${businessName} logo" />` : ''}
        </div>
        
        <div class="company-info" style="align-items: ${
            selectedTemplate.name === "antiqua" ? "flex-start" : "flex-end"
          };">
          <div class="invoice-title">${pdfTitle.toUpperCase()}</div>
          ${businessName ? `<div class="company-name">${businessName}</div>` : ''}
          ${email ? `<div class="company-details">${email}</div>` : ''}
          ${phone ? `<div class="company-details">${phone}</div>` : ''}
        </div>
      </div>
      
      <!-- Invoice Details -->
      ${invoiceDetails}
      
      <!-- Invoice Table -->
      ${invoiceTable}
      
      <!-- Signature Section -->
      ${signature ? `
        <div class="signature-section">
          <div class="signature-container">
            <img class="signature-image" src="${signature}" alt="Signature" style="height: 75px; width: 93px; object-fit: contain;" />
            <div class="signature-line"></div>
            <div class="signature-date">${format(new Date(), "MM/dd/yyyy")}</div>
          </div>
        </div>
      ` : ''}
      
      <!-- Note Section -->
      <div class="note-section">
      </div>
    </div>
  </body>
  </html>
  `;
}; 