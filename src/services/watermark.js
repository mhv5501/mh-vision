import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Watermarks a PDF document with clean MH VISION brand text and triggers direct device download.
 * @param {string} pdfUrl - The original PDF URL
 * @param {string} pdfTitle - Title of the PDF document for naming the download file
 */
export const watermarkAndDownloadPdf = async (pdfUrl, pdfTitle) => {
  if (!pdfUrl) {
    throw new Error("Invalid PDF URL provided for download.");
  }

  const safeFilename = `${(pdfTitle || 'MH_VISION_Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  try {
    // 1. Fetch PDF ArrayBuffer
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const existingPdfBytes = await response.arrayBuffer();

    // 2. Load Document with pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    // 3. Draw clean MH VISION brand watermark on every page
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(16, Math.round(width / 24));

      // Watermark 1 (Upper Center)
      page.drawText('MH VISION OFFICIAL • MALAYALAM KNOWLEDGE HUB', {
        x: width / 6,
        y: (height / 3) * 2,
        size: fontSize,
        font: font,
        color: rgb(0.05, 0.65, 0.91),
        opacity: 0.22,
        rotate: degrees(-30)
      });

      // Watermark 2 (Lower Center)
      page.drawText('MH VISION LICENSED COPY • DO NOT DISTRIBUTE', {
        x: width / 6,
        y: height / 3,
        size: fontSize,
        font: font,
        color: rgb(0.05, 0.65, 0.91),
        opacity: 0.22,
        rotate: degrees(-30)
      });
    });

    // 4. Save modified PDF bytes
    const pdfBytes = await pdfDoc.save();

    // 5. Trigger instant direct device download
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 5000);

    return true;
  } catch (err) {
    console.warn("Client pdf-lib watermarking notice, falling back to direct download:", err);
    // Fallback: direct download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
};
