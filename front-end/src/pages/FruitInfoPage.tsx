import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';
export function FruitInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const fruits = [{
    name: 'Apple',
    emoji: '🍎',
    category: 'Pome Fruit',
    calories: 95,
    vitaminC: '14% DV'
  }, {
    name: 'Banana',
    emoji: '🍌',
    category: 'Tropical',
    calories: 105,
    vitaminC: '17% DV'
  }, {
    name: 'Orange',
    emoji: '🍊',
    category: 'Citrus',
    calories: 62,
    vitaminC: '116% DV'
  }, {
    name: 'Strawberry',
    emoji: '🍓',
    category: 'Berry',
    calories: 49,
    vitaminC: '149% DV'
  }, {
    name: 'Grapes',
    emoji: '🍇',
    category: 'Berry',
    calories: 104,
    vitaminC: '27% DV'
  }, {
    name: 'Watermelon',
    emoji: '🍉',
    category: 'Berry',
    calories: 46,
    vitaminC: '21% DV'
  }, {
    name: 'Pineapple',
    emoji: '🍍',
    category: 'Tropical',
    calories: 82,
    vitaminC: '131% DV'
  }, {
    name: 'Mango',
    emoji: '🥭',
    category: 'Tropical',
    calories: 99,
    vitaminC: '67% DV'
  }];
  const filteredFruits = fruits.filter(fruit => fruit.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Fruit Information Database
        </h1>
        <p className="text-gray-600">
          Explore nutritional information for various fruits
        </p>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search fruits..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-700" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFruits.map(fruit => <div key={fruit.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
            <div className="text-6xl mb-4 text-center">{fruit.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {fruit.name}
            </h3>
            <div className="flex justify-center mb-4">
              <CategoryBadge category={fruit.category} />
            </div>
            <div className="space-y-2 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Calories</span>
                <span className="font-semibold text-gray-800">
                  {fruit.calories} kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vitamin C</span>
                <span className="font-semibold text-gray-800">
                  {fruit.vitaminC}
                </span>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}