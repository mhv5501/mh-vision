const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'wz1dlstf';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Detects the media type of a file
 * @param {File} file 
 * @returns {'pdf' | 'video' | 'image'}
 */
export const detectMediaType = (file) => {
  if (!file) return 'image';
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (type.startsWith('video/') || name.match(/\.(mp4|mov|avi|mkv|webm|flv|m4v)$/)) {
    return 'video';
  }
  return 'image';
};

/**
 * Uploads a file (PDF, Video, or Image) directly to Cloudinary
 * @param {File} file 
 * @param {string} resourceType - 'auto', 'raw', 'video', or 'image'
 * @param {function} onProgress - optional progress callback
 * @returns {Promise<{url: string, publicId: string, format: string, mediaType: string}>}
 */
export const uploadToCloudinary = async (file, resourceType = 'auto', onProgress) => {
  const mediaType = detectMediaType(file);
  
  // Route file to correct Cloudinary API endpoint based on media type
  let targetResourceType = 'image';
  if (mediaType === 'pdf') {
    targetResourceType = 'raw';
  } else if (mediaType === 'video') {
    targetResourceType = 'video';
  } else {
    targetResourceType = resourceType === 'auto' ? 'image' : resourceType;
  }
  
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
          format: response.format || mediaType,
          bytes: response.bytes,
          mediaType: mediaType
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
 * Helper to generate Cloudinary cover thumbnail for a document or video
 */
export const getPdfCoverUrl = (pdfUrl, fallbackCover) => {
  if (fallbackCover) return fallbackCover;
  if (!pdfUrl) return '/logo.jpg';
  
  if (pdfUrl.includes('cloudinary.com')) {
    if (pdfUrl.includes('/video/upload/')) {
      return pdfUrl.replace(/\.[a-z0-9]+$/i, '.jpg');
    }
    if (pdfUrl.includes('/image/upload/')) {
      return pdfUrl.replace(/\.pdf$/i, '.jpg');
    }
  }
  return '/logo.jpg';
};
