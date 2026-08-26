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
    // 1. Fetch PDF ArrayBuffer with CORS
    const response = await fetch(pdfUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const existingPdfBytes = await response.arrayBuffer();

    // 2. Load Document with pdf-lib (ignoring any existing encryption flags)
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    // 3. Draw clean MH VISION brand watermark on every page
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(14, Math.round(width / 26));

      // Watermark 1 (Upper Center)
      page.drawText('MH VISION OFFICIAL • MALAYALAM KNOWLEDGE HUB', {
        x: Math.max(20, width / 8),
        y: Math.min(height - 50, (height / 3) * 2),
        size: fontSize,
        font: font,
        color: rgb(0.05, 0.65, 0.91),
        opacity: 0.22,
        rotate: degrees(-30)
      });

      // Watermark 2 (Lower Center)
      page.drawText('MH VISION LICENSED COPY • DO NOT DISTRIBUTE', {
        x: Math.max(20, width / 8),
        y: Math.max(50, height / 3),
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
    console.warn("Client pdf-lib watermarking notice, triggering clean Blob fallback:", err);

    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
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
    } catch (fallbackErr) {
      console.error("Download fallback error:", fallbackErr);
      // Final safe download trigger without opening new tab
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return false;
    }
  }
};
