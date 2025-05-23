import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { invoiceTemplate } from '../../utils/invoiceTemplate';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let browser = null;

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

    // Configure browser launch options for Vercel production
    const isDev = process.env.NODE_ENV === 'development';
    
    const options = {
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isDev 
        ? undefined // Use local Chrome in development
        : await chromium.executablePath(), // Use chromium in production
      headless: true, // Use boolean instead of 'shell'
      ignoreHTTPSErrors: true,
    };

    // Launch browser
    browser = await puppeteer.launch(options);

    // Create new page
    const page = await browser.newPage();

    // Set content with longer timeout for complex templates
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generate PDF with optimized settings
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
      timeout: 30000,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNum}.pdf`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Send PDF
    res.send(pdf);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Ensure browser is closed even if there's an error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

const safeFormat = (date: any) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : format(d, "MM/dd/yyyy");
};