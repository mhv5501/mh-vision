import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Normalizes Cloudinary URLs for clean file downloading
 */
export const getCleanCloudinaryUrl = (url) => {
  if (!url) return '';
  
  // For RAW resources (PDFs): DO NOT add fl_attachment
  if (url.includes('/raw/upload/')) {
    return url.replace('/fl_attachment/', '/');
  }

  // For IMAGE resources: Inject fl_attachment so Cloudinary forces file download headers
  if (url.includes('/image/upload/') && !url.includes('fl_attachment')) {
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  // For VIDEO resources: Inject fl_attachment for video downloads
  if (url.includes('/video/upload/') && !url.includes('fl_attachment')) {
    return url.replace('/video/upload/', '/video/upload/fl_attachment/');
  }

  return url;
};

/**
 * Detects file extension / media type from URL or name
 */
export const getMediaTypeFromUrl = (url) => {
  if (!url) return 'image';
  const cleanUrl = url.toLowerCase();

  if (cleanUrl.includes('/raw/upload/') || cleanUrl.endsWith('.pdf')) {
    return 'pdf';
  }
  if (cleanUrl.includes('/video/upload/') || cleanUrl.match(/\.(mp4|mov|avi|mkv|webm|flv|m4v)$/)) {
    return 'video';
  }
  return 'image';
};

/**
 * Watermarks a single PDF document with clean MH VISION brand text and triggers direct device download.
 */
export const watermarkAndDownloadPdf = async (pdfUrl, pdfTitle) => {
  if (!pdfUrl) return false;

  const safeFilename = `${(pdfTitle || 'MH_VISION_Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const finalDownloadUrl = getCleanCloudinaryUrl(pdfUrl);

  try {
    const response = await fetch(finalDownloadUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const existingPdfBytes = await response.arrayBuffer();

    if (!existingPdfBytes || existingPdfBytes.byteLength < 100) {
      throw new Error("Received empty PDF bytes.");
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(14, Math.round(width / 26));

      page.drawText('MH VISION OFFICIAL • MALAYALAM KNOWLEDGE HUB', {
        x: Math.max(20, width / 8),
        y: Math.min(height - 50, (height / 3) * 2),
        size: fontSize,
        font: font,
        color: rgb(0.05, 0.65, 0.91),
        opacity: 0.22,
        rotate: degrees(-30)
      });

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

    const pdfBytes = await pdfDoc.save();
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
    console.warn("PDF watermark fallback to direct attachment download:", err);

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
 * Downloads a Video or Photo file directly to the customer's device.
 */
export const downloadMediaFile = async (fileUrl, fileTitle, mediaType = 'image') => {
  if (!fileUrl) return false;

  const type = mediaType || getMediaTypeFromUrl(fileUrl);
  
  if (type === 'pdf') {
    return watermarkAndDownloadPdf(fileUrl, fileTitle);
  }

  // Set appropriate extension based on media type
  let ext = '.mp4';
  let mimeType = 'video/mp4';

  if (type === 'video') {
    ext = fileUrl.toLowerCase().includes('.mov') ? '.mov' : '.mp4';
    mimeType = ext === '.mov' ? 'video/quicktime' : 'video/mp4';
  } else {
    ext = fileUrl.toLowerCase().includes('.png') ? '.png' : '.jpg';
    mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  }

  const safeFilename = `${(fileTitle || 'MH_VISION_Media').replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
  const finalDownloadUrl = getCleanCloudinaryUrl(fileUrl);

  try {
    const response = await fetch(finalDownloadUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const mediaBlob = new Blob([blob], { type: mimeType });
    const blobUrl = window.URL.createObjectURL(mediaBlob);

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
    console.warn("Direct blob media fetch notice, triggering attachment link download:", err);

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
 * Downloads a Multi-Media Bundle Package (PDFs, Videos, Photos) directly to the customer's device.
 * @param {Array<{name: string, url: string, mediaType?: string}>} bundleFiles - Array of media files in the bundle
 * @param {string} bundleTitle - Title of the Bundle Package
 */
export const watermarkAndDownloadBundle = async (bundleFiles, bundleTitle) => {
  if (!bundleFiles || !Array.isArray(bundleFiles) || bundleFiles.length === 0) {
    alert("Bundle files list is empty. Contact support.");
    return false;
  }

  for (let i = 0; i < bundleFiles.length; i++) {
    const file = bundleFiles[i];
    const fileTitle = `${bundleTitle || 'Bundle'}_Part_${i + 1}_${file.name || 'Media'}`;
    const mediaType = file.mediaType || getMediaTypeFromUrl(file.url);

    // Download item directly to device
    await downloadMediaFile(file.url, fileTitle, mediaType);

    // Short 800ms pause between multiple file downloads so browser saves each file cleanly
    if (i < bundleFiles.length - 1) {
      await new Promise((res) => setTimeout(res, 800));
    }
  }

  return true;
};
