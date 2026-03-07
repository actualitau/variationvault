'use client';

import { useState } from 'react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          return url;
        }
        return null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      onPhotosChange([...photos, ...validUrls]);
    } catch (error) {
      alert('Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-4">Photo Evidence</h2>
      
      <div className="space-y-4">
        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div className="text-gray-600">
              {isUploading ? (
                <div>Uploading...</div>
              ) : (
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="text-sm">Tap to add photos</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Before, during, after shots
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Camera Access Button */}
        <button
          type="button"
          onClick={() => {
            // Trigger camera access via file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => handleFileUpload(e as any);
            input.click();
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          📷 Take Photo
        </button>
      </div>
    </div>
  );
}