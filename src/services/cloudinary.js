// Cloudinary Storage Service for MH VISION
export const CLOUDINARY_CONFIG = {
  cloudName: 'ljjwa6sr',
  apiKey: '533336682954658',
  apiSecret: '7y4dEy4WDY_QVGwJ5sT4dSS-GYw',
  uploadPreset: 'mh_pdf_uploads'
};

/**
 * Extract clean Cloudinary public_id from full URL or asset string
 */
export function extractCloudinaryPublicId(urlOrId) {
  if (!urlOrId) return '';
  if (!urlOrId.includes('/') && !urlOrId.includes(':')) {
    return urlOrId.replace(/\.pdf$/i, '');
  }
  try {
    const match = urlOrId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (match && match[1]) {
      return match[1].replace(/\.pdf$/i, '');
    }
  } catch (e) {}
  return urlOrId.split('/').pop().replace(/\.[^/.]+$/, "");
}

/**
 * Generate a high-resolution, CORS-free image URL for any specific page of an uploaded PDF.
 * @param {string} publicId - Cloudinary asset public_id
 * @param {number} pageNum - Page number (1-indexed)
 * @returns {string} Optimized CDN image URL
 */
export function getCloudinaryPageUrl(publicId, pageNum = 1) {
  if (!publicId) return '';
  const cleanId = extractCloudinaryPublicId(publicId);
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
 * Generate SHA-1 hex signature for Cloudinary signed API requests via Web Crypto API
 */
async function generateCloudinarySignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(paramString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload a PDF file directly to Cloudinary using signed authentication (API key + SHA-1 signature).
 * Falls back to unsigned upload preset if signed upload is rejected.
 * @param {File} file - The PDF file object
 * @param {Function} onProgress - Progress callback function (percentage: number)
 * @returns {Promise<{secureUrl: string, publicId: string, pages: number, bytes: number}>}
 */
export async function uploadPDFToCloudinary(file, onProgress = () => {}) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
  const timestamp = Math.round(Date.now() / 1000);

  // 1. Try Signed API Upload first
  try {
    const signature = await generateCloudinarySignature({ timestamp }, CLOUDINARY_CONFIG.apiSecret);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    return await performXhrUpload(url, formData, onProgress);
  } catch (signedErr) {
    console.warn('Signed Cloudinary upload notice, trying unsigned preset fallback:', signedErr);

    // 2. Fallback to Unsigned Preset Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    return await performXhrUpload(url, formData, onProgress);
  }
}

/**
 * Helper to perform XMLHttpRequest with progress callbacks
 */
function performXhrUpload(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 60000; // 60s timeout for large PDFs

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

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
          reject(new Error(`Cloudinary upload: ${errorMsg}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload connection timed out. Please check your internet connection.'));
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred while uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
}

/**
 * Query Cloudinary Admin API directly to list all active PDF assets stored in Cloudinary
 * @returns {Promise<Array<{publicId: string, secureUrl: string, bytes: number, createdAt: string}>>}
 */
export async function fetchCloudinaryStorageAssets() {
  const pdfAssets = [];

  // 1. Try local server proxy endpoint first (bypasses browser CORS restrictions)
  try {
    const proxyRes = await fetch('/api/cloudinary/resources');
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && Array.isArray(data.resources)) {
        data.resources.forEach(res => {
          if (res.format === 'pdf' || res.public_id.endsWith('.pdf') || (res.secure_url && res.secure_url.endsWith('.pdf'))) {
            pdfAssets.push({
              publicId: res.public_id,
              secureUrl: res.secure_url,
              bytes: res.bytes || 0,
              createdAt: res.created_at || new Date().toISOString()
            });
          }
        });
        return pdfAssets;
      }
    }
  } catch (proxyErr) {
    console.warn('Local proxy resources endpoint notice, trying direct API fallback:', proxyErr);
  }

  // 2. Direct Cloudinary Admin API fallback
  const credentials = btoa(`${CLOUDINARY_CONFIG.apiKey}:${CLOUDINARY_CONFIG.apiSecret}`);
  const authHeader = `Basic ${credentials}`;

  try {
    for (const resType of ['image', 'raw']) {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/resources/${resType}?max_results=500`;
      const response = await fetch(url, {
        headers: { 'Authorization': authHeader }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.resources)) {
          data.resources.forEach(res => {
            if (res.format === 'pdf' || res.public_id.endsWith('.pdf') || (res.secure_url && res.secure_url.endsWith('.pdf'))) {
              pdfAssets.push({
                publicId: res.public_id,
                secureUrl: res.secure_url,
                bytes: res.bytes || 0,
                createdAt: res.created_at || new Date().toISOString()
              });
            }
          });
        }
      }
    }
    return pdfAssets;
  } catch (err) {
    console.warn('Could not fetch Cloudinary assets:', err);
    return [];
  }
}

/**
 * Delete a PDF asset directly from Cloudinary storage via Admin API
 * @param {string} publicId - Cloudinary asset public_id or URL
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return { success: false };
  const cleanId = extractCloudinaryPublicId(publicId);
  const credentials = btoa(`${CLOUDINARY_CONFIG.apiKey}:${CLOUDINARY_CONFIG.apiSecret}`);
  const authHeader = `Basic ${credentials}`;

  try {
    for (const resType of ['image', 'raw']) {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/resources/${resType}/upload?public_ids[]=${encodeURIComponent(cleanId)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      if (response.ok) {
        return { success: true };
      }
    }
    return { success: false };
  } catch (err) {
    console.warn('Could not delete Cloudinary asset:', err);
    return { success: false };
  }
}
