// Cloudinary Storage Service for MH VISION
export const CLOUDINARY_CONFIG = {
  cloudName: 'ljjwa6sr',
  uploadPreset: 'mh_pdf_uploads'
};

/**
 * Upload a PDF file directly to Cloudinary using the unsigned upload preset.
 * @param {File} file - The PDF file object
 * @param {Function} onProgress - Progress callback function (percentage: number)
 * @returns {Promise<{secureUrl: string, publicId: string, bytes: number}>}
 */
export function uploadPDFToCloudinary(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

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
          reject(new Error(`Cloudinary upload failed: ${errorMsg}`));
        } catch (e) {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    // On error
    xhr.onerror = () => {
      reject(new Error('Network error occurred while uploading PDF to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
