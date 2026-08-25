const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'wz1dlstf';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Uploads a file (PDF or Image) directly to Cloudinary
 * @param {File} file 
 * @param {string} resourceType - 'auto', 'raw', or 'image'
 * @param {function} onProgress - optional progress callback
 * @returns {Promise<{url: string, publicId: string, format: string}>}
 */
export const uploadToCloudinary = async (file, resourceType = 'auto', onProgress) => {
  // Determine resource type: 'raw' or 'auto' for PDFs, 'image' for images
  const targetResourceType = file.type === 'application/pdf' ? 'auto' : resourceType;
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${targetResourceType}/upload`;
  const formData = new FormData();
  
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
          format: response.format,
          bytes: response.bytes
        });
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || 'Cloudinary upload failed'));
        } catch {
          reject(new Error('Cloudinary upload failed with status ' + xhr.status));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
    xhr.send(formData);
  });
};

/**
 * Helper to generate Cloudinary thumbnail for a PDF document
 */
export const getPdfCoverUrl = (pdfUrl, fallbackCover) => {
  if (fallbackCover) return fallbackCover;
  if (!pdfUrl) return '/logo.jpg';
  
  if (pdfUrl.includes('cloudinary.com')) {
    return pdfUrl.replace(/\.pdf$/i, '.jpg');
  }
  return '/logo.jpg';
};
