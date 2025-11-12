import { useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Car, Sparkles, Trophy } from 'lucide-react'
import CarCompare from './components/CarCompare'

function App() {
  const [showHero, setShowHero] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-indigo-50">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/60 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Car size={22} /> AutoCompare
          </div>
          <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">Backend Test</a>
        </div>
      </header>

      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/8fw9Z-c-rqW3nWBN/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-10 md:bottom-14 flex justify-center">
          <div className="bg-white/80 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl p-4 md:p-6 max-w-2xl w-[92%]">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1"><Sparkles size={18}/> Compare up to 3 cars instantly</div>
            <p className="text-sm md:text-base text-gray-700">Pick your favorites and we’ll analyze power, efficiency, safety, recency and value to suggest the best choice.</p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 -mt-10 md:-mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:p-8">
          <div className="flex items-center gap-2 mb-6 text-gray-800 text-xl font-semibold"><Trophy size={20}/> Car Selection</div>
          <CarCompare />
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 py-8">Made with ❤️ for car lovers</footer>
    </div>
  )
}

export default App
