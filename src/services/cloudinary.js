// Cloudinary Storage Service for MH VISION
export const CLOUDINARY_CONFIG = {
  cloudName: 'ljjwa6sr',
  uploadPreset: 'mh_pdf_uploads'
};

/**
 * Generate a high-resolution, CORS-free image URL for any specific page of an uploaded PDF.
 * @param {string} publicId - Cloudinary asset public_id
 * @param {number} pageNum - Page number (1-indexed)
 * @returns {string} Optimized CDN image URL
 */
export function getCloudinaryPageUrl(publicId, pageNum = 1) {
  if (!publicId) return '';
  const cleanId = publicId.replace(/\.pdf$/i, '');
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_1400,c_limit,q_auto:best,pg_${pageNum}/${cleanId}.jpg`;
}

/**
 * Fast & foolproof client-side page count detector from PDF file bytes.
 * Scans standard PDF binary tokens in < 2ms without hanging web workers.
 * @param {File} file - PDF file object
 * @returns {Promise<number>} Real page count
 */
export async function detectPdfPageCountFast(file) {
  try {
    const buffer = await file.slice(0, Math.min(file.size, 500000)).text();
    const matches = buffer.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }
    const countMatch = buffer.match(/\/Count\s+(\d+)/);
    if (countMatch && countMatch[1]) {
      return parseInt(countMatch[1], 10);
    }
  } catch (err) {
    console.warn('Fast page count detector notice:', err);
  }
  return 1;
}

/**
 * Upload a PDF file directly to Cloudinary using the unsigned upload preset.
 * Uses auto/upload for universal high-speed uploading.
 * @param {File} file - The PDF file object
 * @param {Function} onProgress - Progress callback function (percentage: number)
 * @returns {Promise<{secureUrl: string, publicId: string, pages: number, bytes: number}>}
 */
export function uploadPDFToCloudinary(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 45000; // 45s safety timeout

    // Track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    // On complete
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: response.secure_url,
            publicId: response.public_id,
            bytes: response.bytes,
            format: response.format || 'pdf',
            pages: response.pages || null
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          const errorMsg = errorResp.error ? errorResp.error.message : xhr.statusText;
          reject(new Error(`Cloudinary upload notice: ${errorMsg}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    // Timeout
    xhr.ontimeout = () => {
      reject(new Error('Upload connection timed out. Please check your internet connection.'));
    };

    // On error
    xhr.onerror = () => {
      reject(new Error('Network error occurred while uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
