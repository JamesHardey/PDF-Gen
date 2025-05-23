import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import { invoiceTemplate } from '../../utils/invoiceTemplate';

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

    // Generate HTML content using the template
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

    // Launch browser
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: true,
    });

    // Create new page
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });

    // Close browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNum}.pdf`);

    // Send PDF
    res.send(pdf);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
} 