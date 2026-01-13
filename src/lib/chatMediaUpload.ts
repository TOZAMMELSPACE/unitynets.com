import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a chat media file to the chat-media storage bucket
 * Files are organized by: {chat_id}/{timestamp}-{random}.{ext}
 * 
 * @param file - The file or Blob to upload
 * @param chatId - The chat ID for organizing the file
 * @param type - The type of media being uploaded
 * @returns The public URL of the uploaded file, or null if upload failed
 */
export const uploadChatMedia = async (
  file: File | Blob,
  chatId: string,
  type: 'image' | 'video' | 'voice' | 'file'
): Promise<string | null> => {
  try {
    // Determine file extension
    let fileExt = 'bin';
    if (file instanceof File) {
      fileExt = file.name.split('.').pop() || 'bin';
    } else if (file.type) {
      // For Blobs, try to get extension from mime type
      const mimeToExt: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/mp3': 'mp3',
        'audio/mpeg': 'mp3',
        'audio/ogg': 'ogg',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      fileExt = mimeToExt[file.type] || 'bin';
    }

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${type}-${timestamp}-${randomStr}.${fileExt}`;
    
    // Path: {chat_id}/{fileName}
    const filePath = `${chatId}/${fileName}`;

    // Upload to chat-media bucket
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading chat media:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadChatMedia:', error);
    return null;
  }
};

/**
 * Deletes a chat media file from storage
 * @param mediaUrl - The public URL of the media to delete
 * @returns true if deletion was successful, false otherwise
 */
export const deleteChatMedia = async (mediaUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const urlParts = mediaUrl.split('/chat-media/');
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('chat-media')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting chat media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteChatMedia:', error);
    return false;
  }
};

/**
 * Compresses an image file before upload (client-side compression)
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default 1920)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Compressed image as Blob
 */
export const compressImage = async (
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
};
