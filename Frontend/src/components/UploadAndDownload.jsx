import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  uploadFile, 
  uploadMultipleFiles, 
  getPublicUrl, 
  insertFileTransaction 
} from '../supabase/services';

function FileUploadForm() {
  const { register, handleSubmit, reset } = useForm();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [uploadMode, setUploadMode] = useState(null); // 'single' or 'multiple'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showNotification, setShowNotification] = useState(!user);
  const [multipleFilesUploaded, setMultipleFilesUploaded] = useState(false);
  const [multipleFileUrls, setMultipleFileUrls] = useState([]);
  const [fileDataWithQR, setFileDataWithQR] = useState([]);
  const [qrCode, setQrCode] = useState('');


  // Implemented functions for button actions
  const handleDownload = (url) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = ''; // This will use the filename from the URL
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleShareWhatsApp = (url) => {
    const message = encodeURIComponent(`Check out this file I shared: ${url}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMultipleDownload = () => {
    if (multipleFileUrls.length === 0) {
      alert('No files available for download');
      return;
    }

    try {
      // Download each file with a small delay to avoid overwhelming the browser
      multipleFileUrls.forEach((file, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500); // 500ms delay between downloads
      });
      
      alert(`Starting download of ${multipleFileUrls.length} files...`);
    } catch (error) {
      console.error('Multiple download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleMultipleShareWhatsApp = () => {
    if (multipleFileUrls.length === 0) {
      alert('No files available for sharing');
      return;
    }

    const filesList = multipleFileUrls
      .map(file => `• ${file.fileName}: ${file.url}`)
      .join('\n');
    
    const message = encodeURIComponent(
      `I've shared ${multipleFileUrls.length} files with you:\n\n${filesList}`
    );
    
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSingleFileSubmit = async (data) => {
  const file = data.file[0];

  try {
    const { data: uploadData, error } = await uploadFile(file);

    if (error) {
      alert(error.message);
      return;
    }

    alert('File uploaded!');
    const publicUrl = getPublicUrl(uploadData.path);
    setDownloadUrl(publicUrl);

    const response = await fetch(`https://air-bridge-1qzh7hqkg-mahmedsaleem1s-projects.vercel.app/api/v1/file/single-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, url: publicUrl }),
    });

    const result = await response.json();
    setQrCode(result.data.qrCode); // 👈 save QR code

    if (user) {
      try {
        await insertFileTransaction(user.email, publicUrl);
        alert('File information saved to database successfully!');
      } catch (dbError) {
        alert(dbError.message);
      }
    }
  } catch (error) {
    alert(`Upload failed: ${error.message}`);
  }
};

const handleMultipleFileSubmit = async () => {
  if (selectedFiles.length === 0) {
    alert('Please select at least one file');
    return;
  }

  try {
    const { results, errors } = await uploadMultipleFiles(selectedFiles);

    if (errors.length > 0) {
      const errorMessages = errors.map(err => `${err.fileName}: ${err.error.message}`).join('\n');
      alert(`Some files failed to upload:\n${errorMessages}`);
    }

    if (results.length === 0) {
      alert('No files were uploaded successfully');
      return;
    }

    const uploadResults = [];

    for (const result of results) {
      const publicUrl = getPublicUrl(result.uploadData.path);

      if (user) {
        try {
          await insertFileTransaction(user.email, publicUrl);
        } catch (dbError) {
          console.error(`Error saving ${result.fileName} to database:`, dbError.message);
        }
      }

      uploadResults.push({
        fileName: result.fileName,
        url: publicUrl
      });
    }

    // Send to backend
    const response = await fetch(`https://air-bridge-1qzh7hqkg-mahmedsaleem1s-projects.vercel.app/api/v1/file/multiple-files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uploadResults),
    });

    const result = await response.json();
    setFileDataWithQR(result.data); // 👈 contains fileName, url, qrCode
    setMultipleFileUrls(uploadResults); // 👈 Add this line to fix the multiple download functionality

    alert(`Successfully uploaded ${uploadResults.length} files!`);
    setMultipleFilesUploaded(true);

  } catch (error) {
    alert(`Upload failed: ${error.message}`);
  }
};

  const handleFileSelection = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Calculate how many files we can still add
    const remainingSlots = 4 - selectedFiles.length;
    
    if (newFiles.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more file(s). Maximum 4 files allowed.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    reset();
    setSelectedFiles([]);
    setUploadMode(null);
    setDownloadUrl(null);
    setMultipleFilesUploaded(false);
    setMultipleFileUrls([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AirBridge</h1>
          <p className="text-blue-200">Secure file transfer made simple</p>
        </div>

        {showNotification && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-400/30 rounded-lg">
            <p className="text-amber-200 text-sm">
              💡 Sign up to save your file history and access advanced features!
            </p>
          </div>
        )}

        {!uploadMode && (
          <div className="space-y-4">
            <button
              onClick={() => setUploadMode('single')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Upload Single File
            </button>
            <button
              onClick={() => setUploadMode('multiple')}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Upload Multiple Files
            </button>
          </div>
        )}

        {uploadMode === 'single' && (
          <form onSubmit={handleSubmit(handleSingleFileSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Choose File
              </label>
              <input
                type="file"
                {...register('file', { required: true })}
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {uploadMode === 'multiple' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Choose Files (Max 4)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileSelection}
                disabled={selectedFiles.length >= 4}
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 disabled:opacity-50"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-blue-200 text-sm">Selected files ({selectedFiles.length}/4):</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/10 p-2 rounded">
                    <span className="text-white text-sm truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleMultipleFileSubmit}
                disabled={selectedFiles.length === 0}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Files
              </button>
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-green-200 text-sm mb-3">File uploaded successfully!</p>
            
            {/* QR Code Display for Single File */}
            {qrCode && (
              <div className="mb-4 text-center">
                <p className="text-green-300 text-xs mb-2">QR Code:</p>
                <div className="flex justify-center">
                  <img 
                    src={qrCode} 
                    alt="QR Code for file download" 
                    className="w-32 h-32 bg-white p-2 rounded-lg"
                  />
                </div>
              </div>
            )}
            
            {/* Action Buttons for Single File */}
            <div className="space-y-2">
              <button
                onClick={() => handleDownload(downloadUrl)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                📥 Download File
              </button>
              
              <button
                onClick={() => handleCopyLink(downloadUrl)}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                📋 Copy Link
              </button>
              
              <button
                onClick={() => handleShareWhatsApp(downloadUrl)}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                📱 Share on WhatsApp
              </button>
            </div>
            
            {/* Original download link */}
            <div className="mt-3 pt-3 border-t border-green-400/30">
              <p className="text-green-300 text-xs mb-1">Direct link:</p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-200 underline text-xs break-all"
              >
                {downloadUrl}
              </a>
            </div>
          </div>
        )}

        {multipleFilesUploaded && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-green-200 text-sm mb-3">Multiple files uploaded successfully!</p>
            
            {/* QR Codes Display for Multiple Files */}
            {fileDataWithQR.length > 0 && (
              <div className="mb-4">
                <p className="text-green-300 text-xs mb-3">QR Codes for each file:</p>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {fileDataWithQR.map((file, index) => (
                    <div key={index} className="text-center">
                      <p className="text-white text-xs font-medium mb-1 truncate">{file.fileName}</p>
                      <img 
                        src={file.qrCode} 
                        alt={`QR Code for ${file.fileName}`} 
                        className="w-20 h-20 bg-white p-1 rounded mx-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              <button
                onClick={handleMultipleDownload}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                📥 Download All Files
              </button>
              
              <button
                onClick={handleMultipleShareWhatsApp}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                📱 Share All on WhatsApp
              </button>
            </div>

            {/* Individual file links */}
            {multipleFileUrls.length > 0 && (
              <div className="border-t border-green-400/30 pt-3">
                <p className="text-green-300 text-xs mb-2">Individual files:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {multipleFileUrls.map((file, index) => (
                    <div key={index} className="bg-white/10 p-2 rounded">
                      <p className="text-white text-xs font-medium truncate">{file.fileName}</p>
                      <div className="flex space-x-1 mt-1">
                        <button
                          onClick={() => handleDownload(file.url)}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => handleCopyLink(file.url)}
                          className="text-xs px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(file.url)}
                          className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          📱
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        </div>
    </div>
  );
}

export default FileUploadForm;