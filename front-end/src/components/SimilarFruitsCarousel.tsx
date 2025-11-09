import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
interface SimilarFruitsCarouselProps {
  similarFruits: string[];
}
const fruitEmojis: Record<string, string> = {
  Apple: '🍎',
  Banana: '🍌',
  Orange: '🍊',
  Grapes: '🍇',
  Strawberry: '🍓',
  Watermelon: '🍉',
  Pineapple: '🍍',
  Mango: '🥭',
  Pear: '🍐',
  Peach: '🍑',
  Plum: '🫐',
  Tangerine: '🍊',
  Grapefruit: '🍊',
  Lemon: '🍋',
  Plantain: '🍌',
  Papaya: '🫐',
  Raspberry: '🫐',
  Blackberry: '🫐',
  Blueberry: '🫐'
};
export function SimilarFruitsCarousel({
  similarFruits
}: SimilarFruitsCarouselProps) {
  return <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        Similar Fruits You Might Like
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {similarFruits.map(fruit => <div key={fruit} className="flex-shrink-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border-2 border-gray-100 hover:border-green-300 min-w-[140px]">
            <div className="text-5xl mb-3 text-center">
              {fruitEmojis[fruit] || '🍎'}
            </div>
            <p className="text-center font-semibold text-gray-700">{fruit}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-green-600 text-sm">
              <span>Explore</span>
              <ChevronRightIcon className="w-4 h-4" />
            </div>
          </div>)}
      </div>
    </div>;
}