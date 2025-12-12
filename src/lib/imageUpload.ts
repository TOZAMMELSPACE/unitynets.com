import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image file to Supabase Storage and returns the public URL
 * @param file - The file to upload
 * @param userId - The user's ID for organizing uploads
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadPostImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadPostImage:', error);
    return null;
  }
};

/**
 * Uploads multiple images and returns their URLs
 * @param files - Array of files to upload
 * @param userId - The user's ID
 * @returns Array of public URLs for successfully uploaded images
 */
export const uploadMultipleImages = async (files: File[], userId: string): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadPostImage(file, userId));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

/**
 * Deletes an image from storage
 * @param imageUrl - The public URL of the image to delete
 */
export const deletePostImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const urlParts = imageUrl.split('/post-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePostImage:', error);
    return false;
  }
};
