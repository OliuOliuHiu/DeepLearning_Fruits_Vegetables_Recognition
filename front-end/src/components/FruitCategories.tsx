import React from 'react';
export function FruitCategories() {
  const fruits = [{
    name: 'Apple',
    emoji: '🍎'
  }, {
    name: 'Banana',
    emoji: '🍌'
  }, {
    name: 'Grapes',
    emoji: '🍇'
  }, {
    name: 'Orange',
    emoji: '🍊'
  }, {
    name: 'Strawberry',
    emoji: '🍓'
  }, {
    name: 'Watermelon',
    emoji: '🍉'
  }, {
    name: 'Pineapple',
    emoji: '🍍'
  }, {
    name: 'Mango',
    emoji: '🥭'
  }];
  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        Supported Fruit Categories
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {fruits.map(fruit => (
          <div
            key={fruit.name}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all transform hover:scale-110 cursor-pointer"
          >
            <div className="text-4xl mb-2">{fruit.emoji}</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{fruit.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}