import React, { useState } from 'react';
import { UploadIcon, Loader2Icon } from 'lucide-react';
import { PredictionResult } from '../App';
import { BatchResultsTable } from '../components/BatchResultsTable';
import { API_BASE_URL } from '../config';
interface FileWithPreview {
  file: File;
  preview: string;
}

export function BatchUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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
          
          // Update state after all files are read
          if (loadedCount === imageFiles.length) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
          }
          }
        };
        reader.readAsDataURL(file);
    });
    
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };
  
  const handleBatchPredict = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);
    
    try {
      // Tạo FormData với tất cả các file
      const formData = new FormData();
      uploadedFiles.forEach((fileWithPreview) => {
        formData.append('files', fileWithPreview.file);
      });
      
      // Gọi API batch-predict
      const response = await fetch(`${API_BASE_URL}/batch-predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Map kết quả từ API thành PredictionResult format
      // Tạo map filename -> file preview để match đúng
      const fileMap = new Map(uploadedFiles.map(f => [f.file.name, f.preview]));
      
      const newPredictions: PredictionResult[] = data.results
        .filter((r: any) => r.result && !r.error) // Chỉ lấy kết quả thành công
        .map((result: any, index: number) => {
          const preview = fileMap.get(result.filename) || '';
        return {
          id: result.duplicate_info?.id || `${Date.now()}-${index}`,
            fruitName: result.result.label || 'Unknown',
            confidence: Number(((result.result.confidence ?? 0) * 100).toFixed(1)),
            imageUrl: preview,
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
      });
      
      setPredictions(newPredictions);
      
      // Show summary with duplicate info
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
      alert(`Error: ${err.message || 'Failed to process images'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearFiles = () => {
    setUploadedFiles([]);
    setPredictions([]);
  };
  return <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Batch Upload
        </h1>
        <p className="text-gray-600">
          Upload multiple fruit images for batch prediction
        </p>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <UploadIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            Upload Multiple Images
          </h3>
          <p className="text-gray-500 mb-6">
            Select multiple fruit images to analyze
          </p>
          <input type="file" multiple accept="image/*" onChange={handleMultipleFilesSelect} className="hidden" id="batch-upload" />
          <label htmlFor="batch-upload" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <UploadIcon className="w-5 h-5" />
            Select Images
          </label>
        </div>
        {uploadedFiles.length > 0 && <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">
                Uploaded Images ({uploadedFiles.length})
            </h4>
              <button onClick={handleClearFiles} className="text-sm text-red-500 hover:text-red-600 font-medium">
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {uploadedFiles.map((fileWithPreview, index) => <img key={index} src={fileWithPreview.preview} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-xl shadow-md" />)}
            </div>
            <button onClick={handleBatchPredict} disabled={isLoading} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  Processing...
                </> : 'Predict All'}
            </button>
          </div>}
      </div>
      {predictions.length > 0 && <BatchResultsTable predictions={predictions} />}
    </div>;
}