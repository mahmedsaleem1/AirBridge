import { supabase } from './supabase';

/**
 * Upload a single file to Supabase storage
 * @param {File} file - The file to upload
 * @param {string} bucketName - The storage bucket name
 * @param {string} folderPath - The folder path (optional)
 * @returns {Promise<{data: object, error: object}>}
 */
export const uploadFile = async (file, bucketName = 'airbridge-file-storage', folderPath = 'uploads') => {
  try {
    const filePath = `${folderPath}/${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Upload multiple files to Supabase storage
 * @param {File[]} files - Array of files to upload
 * @param {string} bucketName - The storage bucket name
 * @param {string} folderPath - The folder path (optional)
 * @returns {Promise<{results: object[], errors: object[]}>}
 */
export const uploadMultipleFiles = async (files, bucketName = 'airbridge-file-storage', folderPath = 'uploads') => {
  const results = [];
  const errors = [];

  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadFile(file, bucketName, folderPath);
      
      if (result.error) {
        errors.push({
          fileName: file.name,
          error: result.error
        });
        return null;
      }

      return {
        fileName: file.name,
        uploadData: result.data
      };
    } catch (error) {
      errors.push({
        fileName: file.name,
        error
      });
      return null;
    }
  });

  const uploadResults = await Promise.all(uploadPromises);
  results.push(...uploadResults.filter(result => result !== null));

  return { results, errors };
};

/**
 * Get public URL for a file in Supabase storage
 * @param {string} filePath - The path to the file in storage
 * @param {string} bucketName - The storage bucket name
 * @returns {string} - The public URL
 */
export const getPublicUrl = (filePath, bucketName = 'airbridge-file-storage') => {
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Get public URLs for multiple files
 * @param {string[]} filePaths - Array of file paths
 * @param {string} bucketName - The storage bucket name
 * @returns {string[]} - Array of public URLs
 */
export const getMultiplePublicUrls = (filePaths, bucketName = 'airbridge-file-storage') => {
  return filePaths.map(filePath => getPublicUrl(filePath, bucketName));
};

/**
 * Delete a file from Supabase storage
 * @param {string} filePath - The path to the file in storage
 * @param {string} bucketName - The storage bucket name
 * @returns {Promise<{data: object, error: object}>}
 */
export const deleteFile = async (filePath, bucketName = 'airbridge-file-storage') => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const insertFileTransaction = async (email, fileUrl) => {
  const { error } = await supabase
    .from('airbridge-file-transactions')
    .insert([
      {
        email: email,
        file_url: fileUrl,
      },
    ]);

  if (error) {
    throw new Error(`Error saving to database: ${error.message}`);
  }
  
  return { success: true };
};

// ...existing code...

/**
 * Get file transactions for a specific email
 * @param {string} email - The email to filter transactions by
 * @returns {Promise<{data: object[], error: object}>}
 */
export const getFileTransactionsByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('airbridge-file-transactions')
      .select()
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getAllFileTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('airbridge-file-transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
