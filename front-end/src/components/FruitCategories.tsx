import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { getFruitIcon } from '../utils/fruitIcons';

export function FruitCategories() {
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/labels`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setLabels(data.labels || []);
      } catch (err) {
        console.error('Error fetching labels:', err);
        setLabels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Supported Fruit and Vegetable Categories
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Supported Fruit and Vegetable Categories
        </h3>
        <p className="text-gray-500 dark:text-gray-400">No categories available</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        Supported Fruit and Vegetable Categories
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {labels.map((label, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all transform hover:scale-110 cursor-pointer"
          >
            <div className="text-4xl mb-2">{getFruitIcon(label)}</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}