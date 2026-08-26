/**
 * Normalizes Cloudinary PDF URLs so that both raw and image resource types download cleanly
 * @param {string} url - Original URL stored in Firestore
 * @returns {string} - Clean valid Cloudinary URL
 */
export const getCleanCloudinaryUrl = (url) => {
  if (!url) return '';
  
  // For RAW resources: DO NOT add fl_attachment (it causes HTTP 400 ERR_INVALID_RESPONSE on Cloudinary raw endpoints)
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
 * Direct Bulletproof PDF File Downloader
 * Converts Cloudinary media URLs into direct attachment download streams
 * so that the browser downloads the original complete PDF file directly to the customer's device.
 * 
 * @param {string} pdfUrl - The PDF URL stored in Firestore
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
    // 1. Fetch PDF as Blob
    const response = await fetch(finalDownloadUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    
    // Ensure Blob has explicit application/pdf MIME type
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
    }, 6000);

    return true;
  } catch (err) {
    console.warn("Direct blob fetch notice, triggering native link download:", err);

    // 2. Direct browser link trigger with clean URL (no new tab popups)
    const link = document.createElement('a');
    link.href = finalDownloadUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }
};
