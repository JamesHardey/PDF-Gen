import { NextApiRequest, NextApiResponse } from 'next';
import htmlPdf from 'html-pdf-node';
import { invoiceTemplate } from '../../utils/invoiceTemplate';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      invoiceNum,
      customer,
      currency,
      pdfTitle,
      color,
      business,
      invoiceForm,
      signature,
      totalAmt,
      grandTotal,
      discountAmt,
      taxAmount,
      selectedTemplate,
      displayPaymentInstruction
    } = req.body;

    // Generate HTML content using the existing template
    const htmlContent = invoiceTemplate(
      invoiceNum,
      customer,
      currency,
      pdfTitle,
      color,
      business,
      invoiceForm,
      signature,
      totalAmt,
      grandTotal,
      discountAmt,
      taxAmount,
      selectedTemplate,
      displayPaymentInstruction
    );

    // PDF options
    const options = {
      format: 'Letter',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true
    };

    // Generate PDF
    const file = await htmlPdf.generatePdf({ content: htmlContent }, options);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNum}.pdf`);

    // Send PDF
    res.send(file);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
}

const safeFormat = (date: any) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : format(d, "MM/dd/yyyy");
};