import { useState } from 'react';
import { Header } from '../components/Header';
import { ImageUpload } from '../components/ImageUpload';
import { EnhancedResultCard } from '../components/EnhancedResultCard';
import { FruitCategories } from '../components/FruitCategories';
import { BatchResultsTable } from '../components/BatchResultsTable';
import { PredictionResult } from '../App';
import { API_BASE_URL } from '../config';
import { UploadIcon, Loader2Icon, ImageIcon, ImagesIcon } from 'lucide-react';

type PredictionTag = 'fruit' | 'vegetable' | 'unknown';

const normalizeTag = (value: unknown): PredictionTag => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'fruit' || normalized === 'vegetable') {
    return normalized;
  }
  return 'unknown';
};

const tagToCategory = (tag: PredictionTag): string => {
  switch (tag) {
    case 'vegetable':
      return 'Vegetable';
    case 'fruit':
      return 'Fruit';
    default:
      return 'General';
  }
};

interface FileWithPreview {
  file: File;
  preview: string;
}

type Mode = 'single' | 'batch';

export function PredictPage() {
  // Single upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  
  // Batch upload state
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  
  // Common state
  const [mode, setMode] = useState<Mode>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Single upload handlers
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
      
      setIsDuplicate(data.is_duplicate || false);
      setDuplicateInfo(data.duplicate_info || null);
      
      const apiResult = data.result;
      const tag = normalizeTag(apiResult.tag);
      const mappedResult: PredictionResult = {
        id: data.duplicate_info?.id || Date.now().toString(),
        fruitName: apiResult.label || 'Unknown',
        confidence: Number((apiResult.confidence ?? 0) * 100),
        imageUrl: uploadedImage,
        timestamp: new Date(),
        tag,
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
        category: tagToCategory(tag)
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

  // Batch upload handlers
  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    const newFiles: FileWithPreview[] = [];
    let loadedCount = 0;
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          newFiles.push({
            file: file,
            preview: event.target.result as string
          });
          loadedCount++;
          
          if (loadedCount === imageFiles.length) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };
  
  const handleBatchPredict = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      uploadedFiles.forEach((fileWithPreview) => {
        formData.append('files', fileWithPreview.file);
      });
      
      const response = await fetch(`${API_BASE_URL}/batch-predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const fileMap = new Map(uploadedFiles.map(f => [f.file.name, f.preview]));
      
      const newPredictions: PredictionResult[] = data.results
        .filter((r: any) => r.result && !r.error)
        .map((result: any, index: number) => {
          const preview = fileMap.get(result.filename) || '';
          const tag = normalizeTag(result.result?.tag);
          return {
            id: result.duplicate_info?.id || `${Date.now()}-${index}`,
            fruitName: result.result.label || 'Unknown',
            confidence: Number((result.result.confidence ?? 0) * 100),
            imageUrl: preview,
            timestamp: new Date(),
            tag,
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
            category: tagToCategory(tag)
          };
        });
      
      setPredictions(newPredictions);
      
      let message = `Processed ${data.success} out of ${data.total} images successfully.`;
      if (data.duplicates > 0) {
        message += `\n⚠️ ${data.duplicates} duplicate image(s) detected. New records were created.`;
      }
      if (data.success < data.total) {
        message += `\nSome images may have failed.`;
      }
      alert(message);
    } catch (err: any) {
      console.error('Batch predict error:', err);
      setError(err?.message || 'Failed to process images');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearFiles = () => {
    setUploadedFiles([]);
    setPredictions([]);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Clear all state when switching modes
    handleReset();
    handleClearFiles();
    setError(null);
  };

  return (
    <>
      <Header />
      <div className="mt-12">
        {/* Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1 inline-flex gap-2">
            <button
              onClick={() => handleModeChange('single')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'single'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              Single Upload
            </button>
            <button
              onClick={() => handleModeChange('batch')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'batch'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <ImagesIcon className="w-5 h-5" />
              Batch Upload
            </button>
          </div>
        </div>

        {/* Single Upload Mode */}
        {mode === 'single' && (
          <>
            <ImageUpload
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onPredict={handlePredict}
              onReset={handleReset}
              isLoading={isLoading}
              hasResult={!!predictionResult}
            />
            
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
                      {' '}(Confidence: {((duplicateInfo.confidence || 0) * 100).toFixed(2)}%)
                    </p>
                    {duplicateInfo.predicted_tag && (
                      <p className="text-sm mt-1">
                        Tag trước đó:{' '}
                        <span className="font-semibold">
                          {normalizeTag(duplicateInfo.predicted_tag) === 'vegetable'
                            ? 'Vegetable'
                            : normalizeTag(duplicateInfo.predicted_tag) === 'fruit'
                            ? 'Fruit'
                            : 'Unknown'}
                        </span>
                      </p>
                    )}
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
          </>
        )}

        {/* Batch Upload Mode */}
        {mode === 'batch' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
              <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
                <UploadIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Multiple Images
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Select multiple fruit images to analyze
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFilesSelect}
                  className="hidden"
                  id="batch-upload"
                />
                <label
                  htmlFor="batch-upload"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                >
                  <UploadIcon className="w-5 h-5" />
                  Select Images
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      Uploaded Images ({uploadedFiles.length})
                    </h4>
                    <button
                      onClick={handleClearFiles}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {uploadedFiles.map((fileWithPreview, index) => (
                      <img
                        key={index}
                        src={fileWithPreview.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl shadow-md"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleBatchPredict}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Predict All'
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            {predictions.length > 0 && (
              <div className="mb-8">
                <BatchResultsTable predictions={predictions} />
              </div>
            )}
          </>
        )}

        {/* Supported Fruit Categories */}
        <div className="mt-16">
          <FruitCategories />
        </div>
      </div>
    </>
  );
}

