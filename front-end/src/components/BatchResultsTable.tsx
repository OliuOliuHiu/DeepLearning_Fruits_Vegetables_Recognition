import { PredictionResult } from '../App';
interface BatchResultsTableProps {
  predictions: PredictionResult[];
}
export function BatchResultsTable({
  predictions
}: BatchResultsTableProps) {
  return <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-green-500 to-green-600">
        <h2 className="text-2xl font-bold text-white">
          Batch Prediction Results
        </h2>
        <p className="text-green-100">
          Analysis of {predictions.length} images
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Image
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Fruit Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tag
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {predictions.map(prediction => <tr key={prediction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <img src={prediction.imageUrl} alt={prediction.fruitName} className="w-16 h-16 object-cover rounded-lg shadow" />
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-800">
                    {prediction.fruitName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {prediction.tag === 'vegetable'
                      ? 'Vegetable'
                      : prediction.tag === 'fruit'
                      ? 'Fruit'
                      : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{
                    width: `${prediction.confidence}%`
                  }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {prediction.confidence.toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}