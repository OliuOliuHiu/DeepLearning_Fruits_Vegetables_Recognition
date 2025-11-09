import React from 'react';
import { InfoIcon } from 'lucide-react';
interface NutritionWidgetProps {
  nutritionalFacts: {
    calories: number;
    carbs: string;
    sugar: string;
    vitaminC: string;
    fiber: string;
  };
}
export function NutritionWidget({
  nutritionalFacts
}: NutritionWidgetProps) {
  const nutritionItems = [{
    label: 'Calories',
    value: `${nutritionalFacts.calories} kcal`,
    icon: '🔥'
  }, {
    label: 'Carbs',
    value: nutritionalFacts.carbs,
    icon: '🌾'
  }, {
    label: 'Sugar',
    value: nutritionalFacts.sugar,
    icon: '🍯'
  }, {
    label: 'Vitamin C',
    value: nutritionalFacts.vitaminC,
    icon: '🍊'
  }, {
    label: 'Fiber',
    value: nutritionalFacts.fiber,
    icon: '🥬'
  }];
  return <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🥗</span>
        Nutritional Facts
        <InfoIcon className="w-4 h-4 text-gray-400 ml-auto cursor-help" title="Per 100g serving" />
      </h3>
      <div className="space-y-3">
        {nutritionItems.map(item => <div key={item.label} className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className="font-semibold text-gray-800">{item.value}</span>
          </div>)}
      </div>
      <div className="mt-6 pt-4 border-t border-green-200">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="w-full bg-green-200 rounded-full h-2 mb-1">
              <div className="bg-green-600 h-2 rounded-full" style={{
              width: '70%'
            }} />
            </div>
            <p className="text-xs text-gray-600">Vitamins</p>
          </div>
          <div className="text-center">
            <div className="w-full bg-green-200 rounded-full h-2 mb-1">
              <div className="bg-green-600 h-2 rounded-full" style={{
              width: '50%'
            }} />
            </div>
            <p className="text-xs text-gray-600">Minerals</p>
          </div>
          <div className="text-center">
            <div className="w-full bg-green-200 rounded-full h-2 mb-1">
              <div className="bg-green-600 h-2 rounded-full" style={{
              width: '80%'
            }} />
            </div>
            <p className="text-xs text-gray-600">Fiber</p>
          </div>
        </div>
      </div>
    </div>;
}