import { useEffect, useMemo, useState } from 'react'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Stat({ label, value, highlight=false }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-gray-50'}`}>
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
    </div>
  )
}

function CarCard({ car, selected, onToggle }) {
  return (
    <button onClick={() => onToggle(car)} className={`w-full text-left p-4 rounded-xl border transition-all ${selected ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{car.brand}</div>
          <div className="text-lg font-semibold">{car.model}</div>
        </div>
        <div className="text-sm text-gray-500">{car.year}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Stat label="HP" value={car.horsepower} />
        <Stat label="MPG" value={car.mpg} />
        <Stat label="$" value={car.price.toLocaleString()} />
      </div>
    </button>
  )
}

export default function CarCompare() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${backend}/cars`)
        const data = await res.json()
        setCars(data)
      } catch (e) {
        setError('Failed to load cars')
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [])

  const filtered = useMemo(() => {
    if (!query) return cars
    const q = query.toLowerCase()
    return cars.filter(c => `${c.brand} ${c.model}`.toLowerCase().includes(q))
  }, [cars, query])

  const toggleSelect = (car) => {
    const exists = selected.find(c => c.id === car.id)
    if (exists) {
      setSelected(selected.filter(c => c.id !== car.id))
    } else {
      if (selected.length >= 3) return
      setSelected([...selected, car])
    }
  }

  const compare = async () => {
    try {
      setError(null)
      const ids = selected.map(c => c.id)
      if (ids.length === 0) return
      const res = await fetch(`${backend}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Comparison failed')
    }
  }

  const bestIds = useMemo(() => {
    if (!result) return {}
    const ids = new Set()
    if (result.winner?.car?.id) ids.add(result.winner.car.id)
    Object.values(result.feature_winners || {}).forEach(id => ids.add(id))
    return ids
  }, [result])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search brand or model..."
          className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={compare}
          disabled={selected.length === 0}
          className={`px-5 py-3 rounded-xl font-semibold transition ${selected.length ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          Compare {selected.length > 0 ? `(${selected.length})` : ''}
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <div className="col-span-3 text-center text-gray-500">Loading cars...</div>
        ) : (
          filtered.map(car => (
            <CarCard key={car.id} car={car} selected={!!selected.find(c => c.id === car.id)} onToggle={toggleSelect} />
          ))
        )}
      </div>

      {selected.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="text-lg font-semibold mb-3">Selected Cars</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="p-2">Spec</th>
                  {selected.map(c => (
                    <th key={c.id} className="p-2">{c.brand} {c.model}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Year', 'year'],
                  ['Horsepower', 'horsepower'],
                  ['MPG/MPGe', 'mpg'],
                  ['Safety', 'safety_rating'],
                  ['Seating', 'seating'],
                  ['Drivetrain', 'drivetrain'],
                  ['Body', 'body_type'],
                  ['Price ($)', 'price'],
                ].map(([label, key]) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="p-2 font-medium text-gray-700">{label}</td>
                    {selected.map(c => (
                      <td key={c.id + key} className={`p-2 ${bestIds.has(c.id) && (key==='horsepower' || key==='mpg' || key==='safety_rating' || key==='price' || key==='year') ? 'bg-emerald-50' : ''}`}>
                        {key === 'price' ? c[key].toLocaleString() : c[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
              <div className="font-semibold mb-1">Best Overall Choice</div>
              <div className="text-gray-700">
                {result.winner?.car ? (
                  <span>
                    {result.winner.car.brand} {result.winner.car.model} ({result.winner.car.year}) is the best overall based on power, efficiency, safety, recency and value.
                  </span>
                ) : 'Select cars and press Compare'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
