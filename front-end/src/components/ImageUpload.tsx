import React, { useRef } from 'react';
import { UploadIcon, ImageIcon, XIcon, Loader2Icon } from 'lucide-react';

interface ImageUploadProps {
  uploadedImage: string | null;
  onImageUpload: (imageUrl: string, file: File) => void;
  onPredict: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

export function ImageUpload({ 
  uploadedImage, 
  onImageUpload, 
  onPredict, 
  onReset, 
  isLoading
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================
  // HANDLE FILE UPLOAD / DROP
  // ==========================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string, droppedFile);
        }
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string, selectedFile);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors">
      <div
        className={`relative border-3 border-dashed rounded-2xl p-12 transition-all ${
          isDragging
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : uploadedImage
            ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded fruit"
              className="max-h-96 mx-auto rounded-xl shadow-lg object-contain"
            />
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-orange-100 dark:from-green-900 dark:to-orange-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Drop your fruit image here
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              or click the button below to browse
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <UploadIcon className="w-5 h-5" />
          Upload Image
        </button>

        <button
          onClick={onPredict}
          disabled={!uploadedImage || isLoading}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="w-5 h-5 animate-spin" />
              Predicting...
            </>
          ) : (
            'Predict'
          )}
        </button>
      </div>
    </div>
  );
}
