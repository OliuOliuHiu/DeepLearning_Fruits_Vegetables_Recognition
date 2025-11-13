import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUpIcon, ImageIcon, CopyIcon,
  CalendarIcon, AwardIcon, HardDriveIcon
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface AnalyticsData {
  total_predictions: number;
  unique_images: number;
  duplicate_count: number;
  today_count: number;
  week_count: number;
  month_count: number;
  confidence: {
    average: number;
    max: number;
    min: number;
  };
  top_labels: Array<{ label: string; count: number }>;
  daily_stats: Array<{ date: string; count: number }>;
  hourly_stats: Array<{ hour: number; count: number }>;
  storage: {
    estimated_mb: number;
    saved_mb: number;
  };
}


export function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/analytics`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err: any) {
        console.error('Analytics error:', err);
        setError(err?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading analytics...</div>
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Business Dashboard
        </h1>
        <p className="text-gray-600">Analytics and insights for your fruit classification system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Predictions"
          value={data.total_predictions}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Unique Images"
          value={data.unique_images}
          icon={<ImageIcon className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Duplicates"
          value={data.duplicate_count}
          icon={<CopyIcon className="w-6 h-6" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Today"
          value={data.today_count}
          icon={<CalendarIcon className="w-6 h-6" />}
          color="bg-purple-500"
        />
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-800">{data.week_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-800">{data.month_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AwardIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-800">{data.confidence.average}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Predictions by Day (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Predictions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Stats Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Predictions by Hour (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hourly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Predictions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Labels Chart - Horizontal Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Predicted Fruits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data.top_labels.slice().reverse()} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="label" 
                type="category" 
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence & Storage Stats */}
        <div className="space-y-6">
          {/* Confidence Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confidence Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average</span>
                <span className="text-2xl font-bold text-green-600">{data.confidence.average}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Maximum</span>
                <span className="text-2xl font-bold text-blue-600">{data.confidence.max}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Minimum</span>
                <span className="text-2xl font-bold text-orange-600">{data.confidence.min}%</span>
              </div>
            </div>
          </div>

          {/* Storage Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <HardDriveIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Storage</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Storage</span>
                <span className="text-xl font-bold text-gray-800">{data.storage.estimated_mb} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Saved (Duplicates)</span>
                <span className="text-xl font-bold text-green-600">{data.storage.saved_mb} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Labels Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 10 Predicted Fruits</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 text-gray-600">Fruit Name</th>
                <th className="text-right py-3 px-4 text-gray-600">Count</th>
                <th className="text-right py-3 px-4 text-gray-600">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.top_labels.map((item, index) => (
                <tr key={item.label} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800">#{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.label}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-gray-800">{item.count}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-600">
                      {((item.count / data.total_predictions) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} p-4 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

