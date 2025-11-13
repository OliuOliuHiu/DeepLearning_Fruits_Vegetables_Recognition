import { useEffect, useState } from 'react';
import { ClockIcon, TrashIcon, CheckSquareIcon, SquareIcon } from 'lucide-react';
import { PredictionResult } from '../App';
import { API_BASE_URL } from '../config';

type PredictionTag = 'fruit' | 'vegetable' | 'unknown';

const normalizeTag = (value: unknown): PredictionTag => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'fruit' || normalized === 'vegetable') {
    return normalized;
  }
  return 'unknown';
};

const tagToCategory = (tag: PredictionTag): string => {
  switch (tag) {
    case 'vegetable':
      return 'Vegetable';
    case 'fruit':
      return 'Fruit';
    default:
      return 'General';
  }
};

export function PredictionHistoryPage() {
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFromDb = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = (data?.history || []) as Array<any>;
      // Map backend fields -> existing UI model
      const transparentPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAmMBcVb0lWQAAAAASUVORK5CYII=';
      const mapped: PredictionResult[] = items.map((d: any) => {
        // Convert base64 image to data URL if available
        let imageUrl = transparentPng;
        if (d.image_base64) {
          // Determine content type from meta or default to jpeg
          const contentType = d.meta?.content_type || 'image/jpeg';
          imageUrl = `data:${contentType};base64,${d.image_base64}`;
        }
        const tag = normalizeTag(d.predicted_tag);
        return {
          id: String(d.id || d._id || Date.now()),
          fruitName: String(d.predicted_label || 'Unknown'),
          confidence: Number((d.confidence ?? 0) * 100),
          imageUrl: imageUrl,
          timestamp: d.created_at ? new Date(d.created_at) : new Date(),
          tag,
          nutritionalFacts: { calories: 0, carbs: '0g', sugar: '0g', vitaminC: '0% DV', fiber: '0g' },
          priceEstimation: { perKg: 0, perFruit: 0, currency: 'USD' },
          similarFruits: [],
          funFact: '',
          category: tagToCategory(tag),
        };
      });
      setHistory(mapped);
      setSelectedIds(new Set()); // Clear selection when data refreshes
    } catch (e: any) {
      setError(e?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromDb();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(h => h.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} mục đã chọn?`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Refresh history after deletion
      await fetchFromDb();
      
      alert(`Đã xóa thành công ${data.deleted_count} mục`);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.message || 'Failed to delete predictions. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  const allSelected = history.length > 0 && selectedIds.size === history.length;

  return <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Prediction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">View your past fruit predictions</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-5 h-5" />
                {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
              </button>
            )}
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
            >
              {allSelected ? (
                <CheckSquareIcon className="w-5 h-5" />
              ) : (
                <SquareIcon className="w-5 h-5" />
              )}
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>
      {loading ? <div className="text-gray-600 dark:text-gray-400">Loading...</div> : error ? <div className="text-red-600 dark:text-red-400">{error}</div> : history.length === 0 ? <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 text-center">
          <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
            No History Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your prediction history will appear here
          </p>
        </div> : <div className="grid md:grid-cols-2 gap-6">
          {history.map(prediction => {
            const isSelected = selectedIds.has(prediction.id);
            return (
              <div
                key={prediction.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 ${
                  isSelected ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-transparent'
                }`}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img
                      src={prediction.imageUrl}
                      alt={prediction.fruitName}
                      className="w-24 h-24 object-cover rounded-xl shadow"
                    />
                    <button
                      onClick={() => handleToggleSelect(prediction.id)}
                      className="absolute top-1 left-1 bg-white rounded p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquareIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <SquareIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {prediction.fruitName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {new Date(prediction.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tag</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                          {prediction.tag === 'vegetable'
                            ? 'Vegetable'
                            : prediction.tag === 'fruit'
                            ? 'Fruit'
                            : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {prediction.confidence.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
    </div>;
}