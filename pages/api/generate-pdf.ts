import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
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

    // Configure browser launch options
    // const options = process.env.AWS_LAMBDA_FUNCTION_VERSION
    //   ? {
    //       args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
    //       defaultViewport: chrome.defaultViewport,
    //       executablePath: await chrome.executablePath,
    //       headless: true,
    //       ignoreHTTPSErrors: true,
    //     }
    //   : {
    //       args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //       executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    //       headless: true,
    //     };

    const options =  {
      args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    }
      

    // Launch browser
    const browser = await puppeteer.launch(options);

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

const safeFormat = (date: any) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : format(d, "MM/dd/yyyy");
};