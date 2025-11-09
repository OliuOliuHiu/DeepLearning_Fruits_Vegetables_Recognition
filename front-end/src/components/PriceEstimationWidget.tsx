import React from 'react';
import { DollarSignIcon, TrendingUpIcon } from 'lucide-react';
interface PriceEstimationWidgetProps {
  priceEstimation: {
    perKg: number;
    perFruit: number;
    currency: string;
  };
}
export function PriceEstimationWidget({
  priceEstimation
}: PriceEstimationWidgetProps) {
  return <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <DollarSignIcon className="w-5 h-5 text-orange-500" />
        Price Estimation
      </h3>
      <div className="space-y-4">
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Per Kilogram</span>
            <span className="text-2xl font-bold text-orange-600">
              ${priceEstimation.perKg.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUpIcon className="w-4 h-4" />
            <span>Market average</span>
          </div>
        </div>
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Per Fruit</span>
            <span className="text-2xl font-bold text-orange-600">
              ${priceEstimation.perFruit.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-500">Estimated cost per piece</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">5 fruits</p>
              <p className="text-2xl font-bold">
                ${(priceEstimation.perFruit * 5).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">10 fruits</p>
              <p className="text-2xl font-bold">
                ${(priceEstimation.perFruit * 10).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}