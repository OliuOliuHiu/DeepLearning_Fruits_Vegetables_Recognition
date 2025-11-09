import React from 'react';
import { TrophyIcon, ActivityIcon, LightbulbIcon } from 'lucide-react';
import { PredictionResult } from '../App';
interface ResultCardProps {
  result: PredictionResult;
}
export function ResultCard({
  result
}: ResultCardProps) {
  return <div className="bg-white rounded-3xl shadow-xl p-8 animate-[fadeIn_0.5s_ease-in]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-orange-100 px-6 py-3 rounded-full mb-4">
          <TrophyIcon className="w-6 h-6 text-orange-500" />
          <span className="text-gray-600 font-medium">Prediction Result</span>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-4">
          {result.fruitName}
        </h2>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700 font-semibold flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-green-500" />
            Confidence Score
          </span>
          <span className="text-2xl font-bold text-green-600">
            {result.confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-1000 ease-out" style={{
          width: `${result.confidence}%`
        }} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            Nutritional Facts
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Calories</span>
              <span className="font-semibold text-gray-800">
                {result.nutritionalFacts.calories} kcal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rich in</span>
              <span className="font-semibold text-gray-800">
                {result.nutritionalFacts.vitamin}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fiber</span>
              <span className="font-semibold text-gray-800">
                {result.nutritionalFacts.fiber}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5 text-orange-500" />
            Fun Fact
          </h3>
          <p className="text-gray-700 leading-relaxed">{result.funFact}</p>
        </div>
      </div>
    </div>;
}