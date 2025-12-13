import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a profile image (avatar or cover) to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID for organizing uploads
 * @param type - 'avatar' or 'cover'
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadProfileImage = async (
  file: File, 
  userId: string, 
  type: 'avatar' | 'cover'
): Promise<string | null> => {
  try {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File size exceeds 5MB limit');
      return null;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
  }
};

/**
 * Deletes a profile image from storage
 * @param imageUrl - The public URL of the image to delete
 */
export const deleteProfileImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const urlParts = imageUrl.split('/profile-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting profile image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};
