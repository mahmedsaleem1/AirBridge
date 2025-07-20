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

  // Placeholder functions for button actions
  const handleDownload = (url) => {
    alert(`Download functionality will be implemented for: ${url}`);
  };

  const handleCopyLink = (url) => {
    alert(`Copy link functionality will be implemented for: ${url}`);
  };

  const handleShareWhatsApp = (url) => {
    alert(`WhatsApp share functionality will be implemented for: ${url}`);
  };

  const handleMultipleDownload = () => {
    alert(`Multiple files download functionality will be implemented`);
  };

  const handleMultipleShareWhatsApp = () => {
    alert(`WhatsApp share all links functionality will be implemented`);
  };

  const handleSingleFileSubmit = async (data) => {
    const file = data.file[0];

    try {
      // Use storage service to upload file
      const { data: uploadData, error } = await uploadFile(file);

      if (error) {
        alert(error.message);
        return;
      }

      alert('File uploaded!');

      // Get public URL using storage service
      const publicUrl = getPublicUrl(uploadData.path);
      setDownloadUrl(publicUrl);

      // Send to backend API with correct data structure
      const response = await fetch('http://localhost:8000/api/v1/file/single-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: file.name, url: publicUrl }),
      });

      const backendData = await response.json();

      // Save to database if user is logged in using service
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
      // Use storage service to upload multiple files
      const { results, errors } = await uploadMultipleFiles(selectedFiles);

      if (errors.length > 0) {
        const errorMessages = errors.map(err => `${err.fileName}: ${err.error.message}`).join('\n');
        alert(`Some files failed to upload:\n${errorMessages}`);
      }

      if (results.length === 0) {
        alert('No files were uploaded successfully');
        return;
      }

      // Process successful uploads
      const uploadResults = [];
      const fileUrls = [];
      
      for (const result of results) {
        const publicUrl = getPublicUrl(result.uploadData.path);
        
        // Save to database if user is logged in using service
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

        fileUrls.push({
          fileName: result.fileName,
          url: publicUrl
        });
      }

      setMultipleFileUrls(fileUrls);

      // Send to backend API
      const response = await fetch('http://localhost:8000/api/v1/file/multiple-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadResults),
      });

      const backendData = await response.json();
      
      alert(`Successfully uploaded ${uploadResults.length} files!`);
      
      // Show download options
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
            
            {/* Action Buttons for Multiple Files */}
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