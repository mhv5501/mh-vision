import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  BookOpen, 
  ShieldCheck,
  RefreshCw,
  Download
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const PdfReaderModal = ({ pdf, isOpen, onClose, userEmail }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [readingMode, setReadingMode] = useState('light');
  const [loading, setLoading] = useState(true);
  const [renderMode, setRenderMode] = useState('canvas');

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Content Protection & Anti-Copying
  useEffect(() => {
    if (!isOpen) return;

    const handleContextMenu = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getCloudinaryPageImageUrl = (pdfUrl, pageNumber) => {
    if (!pdfUrl) return '/logo.jpg';
    if (pdfUrl.includes('cloudinary.com')) {
      if (pdfUrl.includes('/upload/')) {
        return pdfUrl.replace('/upload/', `/upload/pg_${pageNumber},w_1200,f_auto,q_auto/`).replace(/\.pdf$/i, '.jpg');
      }
      return pdfUrl.replace(/\.pdf$/i, `.jpg`);
    }
    return pdfUrl;
  };

  // Helper to get raw attachment URL for Cloudinary PDFs
  const getCloudinaryDownloadUrl = (pdfUrl) => {
    if (!pdfUrl) return '';
    if (pdfUrl.includes('cloudinary.com') && pdfUrl.includes('/upload/')) {
      return pdfUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    return pdfUrl;
  };

  // Load PDF Document & Set Exact Total Page Count
  useEffect(() => {
    if (!isOpen || !pdf?.pdfUrl) return;

    setLoading(true);
    setPageNum(1);
    setRenderMode('canvas');

    let isMounted = true;

    fetch(pdf.pdfUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        if (!isMounted) return;
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true
        });
        return loadingTask.promise;
      })
      .then((loadedPdf) => {
        if (!isMounted || !loadedPdf) return;
        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("ArrayBuffer load notice, trying direct PDF.js load:", err);
        const directTask = pdfjsLib.getDocument({
          url: pdf.pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true
        });

        directTask.promise
          .then((loadedPdf) => {
            if (!isMounted) return;
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setLoading(false);
          })
          .catch(() => {
            if (isMounted) {
              setLoading(false);
              setRenderMode('imagePages');
              setNumPages(pdf.pageCount || 1);
            }
          });
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, pdf]);

  // Render Canvas Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || renderMode !== 'canvas') return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    pdfDoc.getPage(pageNum).then((page) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;
      
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1 
        ? [outputScale, 0, 0, outputScale, 0, 0] 
        : null;

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise.catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error("Page render error:", err);
        }
      });
    });
  }, [pdfDoc, pageNum, scale, renderMode]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      if (pageNum < numPages) setPageNum(prev => prev + 1);
    } else if (distance < -minSwipeDistance) {
      if (pageNum > 1) setPageNum(prev => prev - 1);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdf?.pdfUrl) return;
    
    const downloadUrl = getCloudinaryDownloadUrl(pdf.pdfUrl);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      
      // Ensure correct MIME type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeTitle = (pdf.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch (err) {
      console.warn("Direct blob download notice, opening attachment URL directly:", err);
      window.open(downloadUrl, '_blank');
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  if (!isOpen) return null;

  const getReadingModeBg = () => {
    switch (readingMode) {
      case 'dark': return 'bg-slate-950 text-slate-100';
      case 'sepia': return 'bg-[#fbf0d9] text-[#5f4b32]';
      case 'light': default: return 'bg-slate-100 text-slate-900';
    }
  };

  const getCanvasFilter = () => {
    if (readingMode === 'dark') return 'invert(0.9) hue-rotate(180deg)';
    if (readingMode === 'sepia') return 'sepia(0.3)';
    return 'none';
  };

  const activeUserText = userEmail || 'LICENSED PURCHASER';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md select-none no-select protected-reader-area overflow-hidden">
      
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 bg-white dark:bg-slate-900 border-b border-sky-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 z-20 shadow-xs">
        
        <div className="flex items-center space-x-2 truncate max-w-[35%] sm:max-w-[45%]">
          <BookOpen className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <span className="font-bold text-xs sm:text-sm truncate">{pdf?.title}</span>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          
          {/* Download Button (Only visible if admin enabled allowDownload for this PDF) */}
          {pdf?.allowDownload && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
              title="Download Original PDF File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReadingMode('light')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                readingMode === 'light' ? 'bg-sky-500 text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingMode('sepia')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                readingMode === 'sepia' ? 'bg-sky-700 text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Sepia Mode"
            >
              <span className="text-[11px]">Sepia</span>
            </button>
            <button
              onClick={() => setReadingMode('dark')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                readingMode === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {renderMode === 'canvas' && (
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button onClick={zoomOut} className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-bold text-sky-600 dark:text-sky-400">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={resetZoom} className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg" title="Reset Zoom">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 transition-colors ml-2"
            title="Close Reader"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Main Reader View Body */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 overflow-auto flex items-center justify-center p-2 sm:p-6 transition-colors ${getReadingModeBg()}`}
      >

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-3 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
            <p className="text-xs font-bold text-sky-600 dark:text-sky-400">Loading Document Pages...</p>
          </div>
        )}

        {/* Dynamic Security Purchaser Watermark Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-around items-center opacity-30 select-none py-16">
          <div className="transform -rotate-25 font-black text-sky-600 dark:text-sky-400 text-sm sm:text-base tracking-widest text-center space-y-1">
            <p>MH VISION OFFICIAL</p>
            <p className="text-xs font-semibold">{activeUserText}</p>
          </div>

          <div className="transform -rotate-25 font-black text-sky-600 dark:text-sky-400 text-sm sm:text-base tracking-widest text-center space-y-1">
            <p>MH VISION LICENSED COPY</p>
            <p className="text-xs font-semibold">{activeUserText}</p>
          </div>
        </div>

        {/* MODE A: Canvas Engine */}
        {renderMode === 'canvas' && !loading && (
          <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700/50 max-w-full">
            <canvas 
              ref={canvasRef} 
              style={{ filter: getCanvasFilter() }}
              className="mx-auto block max-w-full h-auto transition-all" 
            />
          </div>
        )}

        {/* MODE B: Cloudinary High-Res Page Image Renderer */}
        {renderMode === 'imagePages' && !loading && (
          <div className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-4">
            <img
              src={getCloudinaryPageImageUrl(pdf.pdfUrl, pageNum)}
              alt={`${pdf.title} Page ${pageNum}`}
              onError={() => {
                if (pageNum > 1) {
                  setNumPages(pageNum - 1);
                  setPageNum(pageNum - 1);
                }
              }}
              style={{ filter: getCanvasFilter() }}
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-300 dark:border-slate-800"
            />
          </div>
        )}

      </div>

      {/* Bottom Floating Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-20">
        
        <button
          onClick={() => {
            if (renderMode === 'canvas') setRenderMode('imagePages');
            else setRenderMode('canvas');
          }}
          className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 flex items-center space-x-1"
          title="Switch Viewer Engine"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Engine: {renderMode}</span>
        </button>

        {/* Page Switcher */}
        <div className="flex items-center space-x-3 mx-auto">
          <button
            onClick={() => setPageNum(prev => Math.max(prev - 1, 1))}
            disabled={pageNum <= 1 || loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
            Page <span className="text-sky-600 dark:text-sky-400 font-bold">{pageNum}</span> of {numPages}
          </span>

          <button
            onClick={() => setPageNum(prev => Math.min(prev + 1, numPages))}
            disabled={pageNum >= numPages || loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[11px] text-sky-600 dark:text-sky-400 flex items-center space-x-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">DRM Watermarked</span>
        </div>

      </div>

    </div>
  );
};
