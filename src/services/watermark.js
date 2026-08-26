import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Normalizes Cloudinary PDF URLs so that both raw and image resource types download cleanly
 */
export const getCleanCloudinaryUrl = (url) => {
  if (!url) return '';
  
  // For RAW resources: DO NOT add fl_attachment (causes HTTP 400 ERR_INVALID_RESPONSE on Cloudinary raw endpoints)
  if (url.includes('/raw/upload/')) {
    return url.replace('/fl_attachment/', '/');
  }

  // For IMAGE resources: Inject fl_attachment so Cloudinary forces file download headers
  if (url.includes('/image/upload/') && !url.includes('fl_attachment')) {
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  return url;
};

/**
 * Watermarks a single PDF document with clean MH VISION brand text and triggers direct device download.
 * @param {string} pdfUrl - The original PDF URL
 * @param {string} pdfTitle - Title of the PDF document for naming the download file
 */
export const watermarkAndDownloadPdf = async (pdfUrl, pdfTitle) => {
  if (!pdfUrl) {
    alert("Invalid PDF link. Please contact support.");
    return false;
  }

  const safeFilename = `${(pdfTitle || 'MH_VISION_Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const finalDownloadUrl = getCleanCloudinaryUrl(pdfUrl);

  try {
    // 1. Fetch PDF ArrayBuffer
    const response = await fetch(finalDownloadUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const existingPdfBytes = await response.arrayBuffer();

    // Ensure valid non-zero PDF bytes
    if (!existingPdfBytes || existingPdfBytes.byteLength < 100) {
      throw new Error("Received empty or invalid PDF bytes from source.");
    }

    // 2. Load Document with pdf-lib
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
    }, 6000);

    return true;
  } catch (err) {
    console.warn("Direct blob fetch notice, triggering native link download:", err);

    // 2. Direct browser link trigger with clean URL
    const link = document.createElement('a');
    link.href = finalDownloadUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }
};

/**
 * Watermarks and downloads a Multi-PDF Bundle Package directly to the customer's device.
 * @param {Array<{name: string, url: string}>} bundleFiles - Array of PDF objects in the bundle
 * @param {string} bundleTitle - Main Title of the PDF Bundle
 */
export const watermarkAndDownloadBundle = async (bundleFiles, bundleTitle) => {
  if (!bundleFiles || !Array.isArray(bundleFiles) || bundleFiles.length === 0) {
    alert("Bundle files list is empty. Contact support.");
    return false;
  }

  for (let i = 0; i < bundleFiles.length; i++) {
    const file = bundleFiles[i];
    const fileTitle = `${bundleTitle || 'Bundle'}_Part_${i + 1}_${file.name || 'Document'}`;
    
    // Watermark and download file
    await watermarkAndDownloadPdf(file.url, fileTitle);

    // Short 800ms pause between multiple file downloads to let the browser trigger device downloads cleanly
    if (i < bundleFiles.length - 1) {
      await new Promise((res) => setTimeout(res, 800));
    }
  }

  return true;
};
