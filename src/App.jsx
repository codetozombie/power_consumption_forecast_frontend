import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// Use Vite's environment variable (VITE_API_URL) to set the API endpoint.
// When running locally, if VITE_API_URL is not defined, it will default to 'http://localhost:5000'
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [days, setDays] = useState(7)
  const [startDate, setStartDate] = useState(() => {
    // Default to current date-time in local format for datetime-local input
    const now = new Date()
    // Format: YYYY-MM-DDTHH:MM (omit seconds)
    return now.toISOString().slice(0, 16)
  })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const payload = { days, startDate }
      // Use the API URL from the environment variable
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await response.json()
      if (result.error) {
        console.error("Server error:", result.error)
      } else {
        setData(
          result.timestamps.map((timestamp, i) => ({
            timestamp,
            power: result.predictions[i]
          }))
        )
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Power Consumption Forecast</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 mb-6">
            <div className="flex-1 mb-4 sm:mb-0">
              <label className="block text-gray-700 font-medium mb-2">
                Start Date & Time:
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 mb-4 sm:mb-0">
              <label className="block text-gray-700 font-medium mb-2">
                Number of Days:
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="30"
              />
            </div>
            <div className="flex-none">
              <button
                onClick={fetchPredictions}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Predict'}
              </button>
            </div>
          </div>

          {data.length > 0 && (
            <div className="overflow-x-auto">
              <LineChart width={800} height={400} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#2563eb" 
                  name="Power Consumption"
                />
              </LineChart>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
