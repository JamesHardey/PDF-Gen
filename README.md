# PDF Generator API (Next.js Serverless)

This project provides a Next.js serverless API endpoint for generating PDF invoices using a customizable HTML template.

## Features
- Generate professional PDF invoices from JSON data
- Customizable template (colors, logo, layout, etc.)
- Returns PDF as a downloadable file
- Serverless and deployable to Vercel or similar platforms

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Usage

### Endpoint
```
POST /api/generate-pdf
```

### Request Body Example
Send a JSON object with the following structure:

```json
{
  "invoiceNum": "INV-001",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address1": "123 Main St",
    "address2": "Apt 4B"
  },
  "currency": "$",
  "pdfTitle": "INVOICE",
  "color": "#4A90E2",
  "business": {
    "businessName": "My Company",
    "logo": "https://example.com/logo.png",
    "phone": "987-654-3210",
    "email": "contact@mycompany.com",
    "address1": "456 Business Ave",
    "paymentInstructions": {
      "paymentInstruction1": "Bank Transfer",
      "paymentInstruction2": "Account: 1234567890",
      "paymentInstruction3": "Routing: 987654321"
    }
  },
  "invoiceForm": {
    "items": [
      {
        "name": "Product 1",
        "quantity": 2,
        "sellingPrice": 100
      },
      {
        "name": "Product 2",
        "quantity": 1,
        "sellingPrice": 50
      }
    ],
    "discount": {
      "type": "Percentage",
      "value": "10"
    },
    "deliveryFee": "20",
    "tax": "8",
    "createdDate": "2024-03-20",
    "dueDate": "2024-04-20",
    "amountPaid": 0
  },
  "signature": "https://example.com/signature.png",
  "totalAmt": 250,
  "grandTotal": 248,
  "discountAmt": 25,
  "taxAmount": 18,
  "selectedTemplate": {
    "name": "modern",
    "flexDirection": "row"
  },
  "displayPaymentInstruction": true
}
```

### Response
- Returns a PDF file as an attachment.

### Example Frontend Usage
```js
const generatePDF = async (data) => {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to generate PDF');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${data.invoiceNum}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

## Notes
- Make sure to use compatible versions of `puppeteer-core` and `chrome-aws-lambda` (see `package.json`).
- If you encounter permission issues on Windows, run your terminal as Administrator.
- For deployment to Vercel, ensure your dependencies are correctly set and your `.gitignore` excludes build artifacts and sensitive files. 