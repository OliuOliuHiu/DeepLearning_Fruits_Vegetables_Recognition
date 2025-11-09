import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ImageUpload } from '../components/ImageUpload';
import { EnhancedResultCard } from '../components/EnhancedResultCard';
import { FruitCategories } from '../components/FruitCategories';
import { PredictionResult } from '../App';
import { API_BASE_URL } from '../config';

export function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleImageUpload = (imageUrl: string, file: File) => {
    setUploadedImage(imageUrl);
    setUploadedFile(file);
    setPredictionResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    if (!uploadedFile || !uploadedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check for duplicate
      setIsDuplicate(data.is_duplicate || false);
      setDuplicateInfo(data.duplicate_info || null);
      
      // Map API response to PredictionResult format
      const apiResult = data.result;
      const mappedResult: PredictionResult = {
        id: data.duplicate_info?.id || Date.now().toString(),
        fruitName: apiResult.label || 'Unknown',
        confidence: Number(((apiResult.confidence ?? 0) * 100).toFixed(1)),
        imageUrl: uploadedImage,
        timestamp: new Date(),
        nutritionalFacts: {
          calories: 0,
          carbs: '0g',
          sugar: '0g',
          vitaminC: '0% DV',
          fiber: '0g'
        },
        priceEstimation: {
          perKg: 0,
          perFruit: 0,
          currency: 'USD'
        },
        similarFruits: [],
        funFact: '',
        category: 'General'
      };

      setPredictionResult(mappedResult);
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err?.message || 'Failed to predict. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setPredictionResult(null);
    setError(null);
    setDuplicateInfo(null);
    setIsDuplicate(false);
  };
  return <>
      <Header />
      <div className="mt-12">
        <ImageUpload uploadedImage={uploadedImage} onImageUpload={handleImageUpload} onPredict={handlePredict} onReset={handleReset} isLoading={isLoading} hasResult={!!predictionResult} />
      </div>
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {isDuplicate && duplicateInfo && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Ảnh đã được upload trước đó!</p>
              <p className="text-sm mt-1">
                Ảnh này đã được upload vào lúc: {duplicateInfo.created_at ? new Date(duplicateInfo.created_at).toLocaleString('vi-VN') : 'N/A'}
              </p>
              <p className="text-sm mt-1">
                Kết quả trước đó: <span className="font-semibold">{duplicateInfo.predicted_label}</span> 
                {' '}(Confidence: {((duplicateInfo.confidence || 0) * 100).toFixed(1)}%)
              </p>
              <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-400">
                Một bản ghi mới đã được tạo. Bạn có thể xóa bản ghi cũ trong History nếu muốn.
              </p>
            </div>
          </div>
        </div>
      )}
      {predictionResult && (
        <div className="mt-8">
          <EnhancedResultCard result={predictionResult} />
        </div>
      )}
      <div className="mt-16">
        <FruitCategories />
      </div>
    </>;
}