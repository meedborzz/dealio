import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, path: string): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image doit faire moins de 5MB');
      }

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('review-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiplePhotos = async (files: File[], basePath: string): Promise<string[]> => {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/photo-${index}-${Date.now()}.${file.name.split('.').pop()}`;
      return uploadPhoto(file, path);
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  return {
    uploadPhoto,
    uploadMultiplePhotos,
    uploading,
    error
  };
}