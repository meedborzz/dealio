import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Plus } from 'lucide-react';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { Button } from './ui/button';

interface PhotoUploadProps {
  maxPhotos?: number;
  onPhotosChange: (photoUrls: string[]) => void;
  existingPhotos?: string[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  maxPhotos = 3,
  onPhotosChange,
  existingPhotos = []
}) => {
  const { uploadMultiplePhotos, uploading, error } = usePhotoUpload();
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate total photos won't exceed max
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    try {
      // Create previews immediately
      const newPreviews = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      setPreviews(prev => [...prev, ...newPreviews]);

      // Upload photos
      const uploadedUrls = await uploadMultiplePhotos(
        files,
        `reviews/${Date.now()}`
      );

      if (uploadedUrls.length > 0) {
        const updatedPhotos = [...photos, ...uploadedUrls];
        setPhotos(updatedPhotos);
        onPhotosChange(updatedPhotos);
      }

      // Clear previews after upload
      setPreviews([]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setPreviews([]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const canAddMorePhotos = photos.length + previews.length < maxPhotos;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photoUrl, index) => (
          <div key={photoUrl} className="relative group">
            <img
              src={photoUrl}
              alt={`Photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Preview Loading Photos */}
        {previews.map((preview, index) => (
          <div key={preview} className="relative">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        {canAddMorePhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            ) : (
              <>
                <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || !canAddMorePhotos}
      />

      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} photos • Max 5MB par photo
      </p>
    </div>
  );
};

export default PhotoUpload;