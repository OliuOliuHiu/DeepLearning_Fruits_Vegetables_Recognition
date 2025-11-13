import React from 'react';
import { TrophyIcon, ActivityIcon } from 'lucide-react';
import { PredictionResult } from '../App';

interface EnhancedResultCardProps {
  result: PredictionResult;
}

export function EnhancedResultCard({
  result
}: EnhancedResultCardProps) {
  const tagLabel =
    result.tag === 'vegetable'
      ? 'Vegetable'
      : result.tag === 'fruit'
      ? 'Fruit'
      : 'Unknown';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-[fadeIn_0.5s_ease-in]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-orange-100 dark:from-green-900 dark:to-orange-900 px-6 py-3 rounded-full mb-4">
          <TrophyIcon className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">Prediction Result</span>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-4">
          {result.fruitName}
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tag:</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{tagLabel}</span>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
            Confidence Score
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {result.confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}