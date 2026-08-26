/**
 * Direct Bulletproof PDF File Downloader
 * Converts Cloudinary media URLs into direct attachment download streams (fl_attachment)
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
  let finalDownloadUrl = pdfUrl;

  // Convert Cloudinary URL to force direct binary file attachment download header
  if (pdfUrl.includes('cloudinary.com')) {
    if (pdfUrl.includes('/image/upload/') && !pdfUrl.includes('fl_attachment')) {
      finalDownloadUrl = pdfUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
    } else if (pdfUrl.includes('/raw/upload/') && !pdfUrl.includes('fl_attachment')) {
      finalDownloadUrl = pdfUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    }
  }

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
    console.warn("Direct blob fetch notice, triggering native attachment link download:", err);

    // 2. Direct browser link trigger with fl_attachment URL
    const link = document.createElement('a');
    link.href = finalDownloadUrl;
    link.download = safeFilename;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }
};
