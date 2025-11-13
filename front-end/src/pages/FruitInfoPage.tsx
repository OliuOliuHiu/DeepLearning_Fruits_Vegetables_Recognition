import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getFruitIcon } from '../utils/fruitIcons';

export function FruitInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fruits, setFruits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFruits = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/fruits`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setFruits(data.fruits || []);
      } catch (err: any) {
        console.error('Error fetching fruits:', err);
        setError(err?.message || 'Failed to load fruits');
      } finally {
        setLoading(false);
      }
    };

    fetchFruits();
  }, []);

  const filteredFruits = fruits.filter(fruit => 
    fruit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading fruits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Fruit Information Database
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore fruits that have been predicted in the system
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search fruits..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800" 
          />
        </div>
      </div>
      {filteredFruits.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No fruits found matching your search.' : 'No fruits in database yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFruits.map(fruit => (
            <div 
              key={fruit} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
            >
              <div className="text-6xl mb-4 text-center">{getFruitIcon(fruit)}</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center capitalize">
                {fruit}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}