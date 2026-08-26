import React, { useState, useEffect } from 'react';
import { 
  verifyAdminPassword, 
  changeAdminPassword, 
  addPdf, 
  updatePdf, 
  deletePdf, 
  subscribeToAnalytics 
} from '../services/pdfStore';
import { uploadToCloudinary } from '../services/cloudinary';
import { 
  X, 
  Lock, 
  KeyRound, 
  UploadCloud, 
  IndianRupee, 
  TrendingUp, 
  BookOpen, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  PackageCheck,
  Layers
} from 'lucide-react';

export const AdminModal = ({ isOpen, onClose, pdfs }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [adminTab, setAdminTab] = useState('analytics');
  const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalSalesCount: 0 });

  // Upload Form State
  const [isBundle, setIsBundle] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('General');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [editingPdf, setEditingPdf] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setAdminPasswordInput('');
      setAuthError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const unsub = subscribeToAnalytics(setAnalytics);
    return () => unsub();
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAuthenticated(false);
    setAdminPasswordInput('');
    setAuthError('');
    onClose();
  };

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const isValid = await verifyAdminPassword(adminPasswordInput);
      if (isValid) {
        setIsAuthenticated(true);
        setAdminPasswordInput('');
      } else {
        setAuthError('Incorrect Admin Password. (Default: admin123)');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Failed to verify password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (isBundle) {
      setPdfFiles(files);
    } else {
      setPdfFiles(files.slice(0, 1));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (pdfFiles.length === 0) {
      alert("Please select at least one PDF file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess('');
    setUploadError('');

    try {
      const uploadedBundleFiles = [];

      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const res = await uploadToCloudinary(file, 'auto', (p) => {
          const overall = Math.round(((i + p / 100) / pdfFiles.length) * 100);
          setUploadProgress(overall);
        });
        uploadedBundleFiles.push({
          name: file.name.replace(/\.pdf$/i, ''),
          url: res.url
        });
      }

      let coverUrl = '';
      if (coverFile) {
        const coverRes = await uploadToCloudinary(coverFile, 'image');
        coverUrl = coverRes.url;
      }

      await addPdf({
        title,
        description,
        price: Number(price) || 0,
        category,
        isBundle: isBundle || pdfFiles.length > 1,
        bundleFiles: uploadedBundleFiles,
        pdfUrl: uploadedBundleFiles[0]?.url || '',
        coverUrl: coverUrl
      });

      setUploadSuccess(`Published "${title}" live! (${uploadedBundleFiles.length} PDF ${uploadedBundleFiles.length > 1 ? 'Files in Bundle' : 'File'})`);
      setPdfFiles([]);
      setCoverFile(null);
      setTitle('');
      setDescription('');
      setPrice('');
      setIsBundle(false);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.message?.includes('Permission') || err.message?.includes('permission-denied')) {
        setUploadError("Firestore Permission Error: Please update your Firestore Database Security Rules in Firebase Console to allow read/write.");
      } else {
        setUploadError(err.message || "Failed to publish PDF.");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPdf) return;

    try {
      await updatePdf(editingPdf.id, {
        title: editingPdf.title,
        description: editingPdf.description,
        price: Number(editingPdf.price) || 0,
        category: editingPdf.category,
        isBundle: !!editingPdf.isBundle
      });
      alert("PDF updated successfully!");
      setEditingPdf(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update PDF.");
    }
  };

  const handleDelete = async (pdfId, pdfTitle) => {
    if (window.confirm(`Are you sure you want to delete "${pdfTitle}"?`)) {
      try {
        await deletePdf(pdfId);
      } catch (err) {
        console.error(err);
        alert(err.message || "Failed to delete PDF.");
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    try {
      await changeAdminPassword(newPassword);
      setPasswordSuccess('Admin password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError('Failed to change admin password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 max-w-md mx-auto my-auto text-center w-full">
            <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-sky-600 dark:text-sky-400 shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-sky-400 mb-1">MH VISION Admin</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Enter master admin password to access revenue dashboard & store management.</p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  placeholder="Enter Admin Password (admin123)"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                {authLoading ? 'Verifying...' : 'Unlock Admin Panel'}
              </button>
            </form>
          </div>
        ) : (

          <div className="flex flex-col h-full overflow-hidden">
            
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-2">
                  <span>MH VISION Control Center</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Revenue analytics, PDF/Bundle upload & store management</p>
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setAdminTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    adminTab === 'analytics' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Revenue</span>
                </button>
                <button
                  onClick={() => setAdminTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    adminTab === 'upload' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload PDF / Bundle</span>
                </button>
                <button
                  onClick={() => setAdminTab('manage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    adminTab === 'manage' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manage ({pdfs.length})</span>
                </button>
                <button
                  onClick={() => setAdminTab('password')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    adminTab === 'password' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Security</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {adminTab === 'analytics' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Revenue & Store Statistics</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-sky-50/50 dark:bg-slate-950 p-5 rounded-2xl border border-sky-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
                      <div className="p-3.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <IndianRupee className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</span>
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-sky-400">₹{analytics.totalRevenue || 0}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-slate-950 p-5 rounded-2xl border border-emerald-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Total Direct Purchases</span>
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{analytics.totalSalesCount || 0}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-slate-950 p-5 rounded-2xl border border-blue-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
                      <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Active Listings Published</span>
                        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{pdfs.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-sky-700 dark:text-sky-400">💡 PDF & Multi-PDF Bundle Package Store</p>
                    <p>Upload single PDFs or multi-file Bundle Packages under a single price point. Customer purchases trigger instant watermarked downloads of all files to their devices.</p>
                  </div>
                </div>
              )}

              {adminTab === 'upload' && (
                <form onSubmit={handleUpload} className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {isBundle ? 'Upload PDF Bundle Package' : 'Upload Single PDF'}
                    </h4>

                    {/* BUNDLE TOGGLE SWITCH */}
                    <button
                      type="button"
                      onClick={() => { setIsBundle(!isBundle); setPdfFiles([]); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isBundle ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isBundle ? '📦 PDF Bundle Mode: ON' : 'Single PDF Mode'}</span>
                    </button>
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isBundle ? 'Bundle Title (e.g. Kerala PSC Super Pack 2026)' : 'PDF Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isBundle ? "e.g. Current Affairs + GK 3-in-1 Bundle" : "e.g. Current Affairs 2026 Guide"}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price for Package in ₹ *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 99 (0 for free)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      >
                        <option value="General">General</option>
                        <option value="Education">Education</option>
                        <option value="Current Affairs">Current Affairs</option>
                        <option value="History">History</option>
                        <option value="Science & Tech">Science & Tech</option>
                        <option value="Bundle Pack">Bundle Pack</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder={isBundle ? "List what's included in this PDF bundle package..." : "Brief overview of what the PDF covers..."}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center">
                      <FileText className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isBundle ? 'Select Multiple PDF Files *' : 'Select PDF File *'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        required
                        multiple={isBundle}
                        onChange={handleFileChange}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer"
                      />
                      {pdfFiles.length > 0 && (
                        <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-2">
                          {pdfFiles.length} PDF {pdfFiles.length > 1 ? 'Files Selected' : 'File Selected'}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center">
                      <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Thumbnail (Optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-sky-600 dark:text-sky-400 font-semibold">
                        <span>Uploading Files to Cloudinary...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div className="bg-sky-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploading ? 'Uploading Bundle...' : isBundle ? 'Publish PDF Bundle Live' : 'Publish PDF Live'}</span>
                  </button>
                </form>
              )}

              {adminTab === 'manage' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Uploaded Products Manager</h4>

                  {editingPdf && (
                    <form onSubmit={handleUpdate} className="p-4 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-400">Editing: {editingPdf.title}</span>
                        <button type="button" onClick={() => setEditingPdf(null)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingPdf.title}
                          onChange={(e) => setEditingPdf({ ...editingPdf, title: e.target.value })}
                          placeholder="Title"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                        <input
                          type="number"
                          value={editingPdf.price}
                          onChange={(e) => setEditingPdf({ ...editingPdf, price: e.target.value })}
                          placeholder="Price ₹"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <textarea
                        value={editingPdf.description || ''}
                        onChange={(e) => setEditingPdf({ ...editingPdf, description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />

                      <button type="submit" className="px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-lg">Save Changes</button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {pdfs.map((pdf) => (
                      <div key={pdf.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-200">{pdf.title}</h5>
                            {pdf.isBundle && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                📦 Bundle ({pdf.bundleFiles?.length || 1} PDFs)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs mt-0.5">
                            <span className="text-sky-600 dark:text-sky-400 font-semibold">₹{pdf.price}</span>
                            <span className="text-slate-500">Category: {pdf.category || 'General'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingPdf(pdf)}
                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs flex items-center space-x-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(pdf.id, pdf.title)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Change Admin Password</h4>

                  {passwordSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Master Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={4}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={4}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                  >
                    Update Password
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
