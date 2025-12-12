import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a video file to Supabase Storage and returns the public URL
 * @param file - The video file to upload
 * @param userId - The user's ID for organizing uploads
 * @returns The public URL of the uploaded video, or null if upload failed
 */
export const uploadPostVideo = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid video type:', file.type);
      return null;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('post-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('post-videos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadPostVideo:', error);
    return null;
  }
};

/**
 * Deletes a video from storage
 * @param videoUrl - The public URL of the video to delete
 */
export const deletePostVideo = async (videoUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const urlParts = videoUrl.split('/post-videos/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('post-videos')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting video:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePostVideo:', error);
    return false;
  }
};
