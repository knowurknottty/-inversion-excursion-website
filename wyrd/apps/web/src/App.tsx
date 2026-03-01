import { useState, useMemo } from 'react'
import { scanner, ScanResult, InversionResult } from '@wyrd/etymology'
import { DailyWyrd } from './components/DailyWyrd'
import { getDailyWord } from './utils/daily-word'

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [inversion, setInversion] = useState<InversionResult | null>(null)

  // Get daily word (memoized so it doesn't change during session)
  const dailyWord = useMemo(() => getDailyWord(), [])

  const handleScan = () => {
    if (!input.trim()) return
    const scanResult = scanner.scan(input)
    const inversionResult = scanner.detectInversion(input)
    setResult(scanResult)
    setInversion(inversionResult)
  }

  const getChargeColor = (charge: number) => {
    if (charge >= 8) return 'text-wyrd-300' // green
    if (charge >= 5) return 'text-wyrd-400' // yellow
    if (charge >= 2) return 'text-wyrd-500' // orange
    return 'text-wyrd-600' // red
  }

  const getBleachingLabel = (stage: string) => {
    switch (stage) {
      case 'intact': return 'Intact'
      case 'partial': return 'Partially Bleached'
      case 'severe': return 'Severely Bleached'
      case 'total': return 'Totally Bleached'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-wyrd-900 text-wyrd-100">
      {/* Header */}
      <header className="border-b border-wyrd-700/50 py-6">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-serif tracking-tight">
            <span className="text-wyrd-600">WYRD</span>
          </h1>
          <p className="text-wyrd-100/60 mt-2 font-mono text-sm">
            Etymology Engine — Crack the fossil open
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Daily Wyrd Card */}
        <div className="mb-12">
          <DailyWyrd
            specimen={dailyWord}
            audioUrl={`/${dailyWord.modern}_daily.mp3`}
          />
        </div>

        {/* Scanner Input */}
        <div className="mb-12">
          <label className="block text-sm font-mono text-wyrd-100/60 mb-3">
            ENTER WORD TO SCAN
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g., salary, disaster, deadline, quarantine..."
              className="flex-1 bg-wyrd-800 border border-wyrd-700 rounded-lg px-4 py-3 
                         text-lg font-serif placeholder:text-wyrd-100/30
                         focus:outline-none focus:border-wyrd-600"
            />
            <button
              onClick={handleScan}
              className="bg-wyrd-600 hover:bg-wyrd-600/80 text-white px-8 py-3 rounded-lg
                         font-mono text-sm tracking-wide transition-colors"
            >
              CRACK IT
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Main Result Card */}
            <div className="bg-wyrd-800/50 border border-wyrd-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-serif capitalize mb-2">
                    {result.word}
                  </h2>
                  {result.pieRoot && (
                    <p className="font-mono text-wyrd-100/60">
                      PIE: {result.pieRoot}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-serif ${getChargeColor(result.liveCharge)}`}>
                    {result.liveCharge}/10
                  </div>
                  <p className="text-sm font-mono text-wyrd-100/60 mt-1">
                    Live Charge
                  </p>
                </div>
              </div>

              {/* Bleaching Status */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-wyrd-700/50">
                <span className="font-mono text-sm text-wyrd-100/60">STATUS:</span>
                <span className={`font-mono text-sm ${getChargeColor(result.liveCharge)}`}>
                  {getBleachingLabel(result.bleachingStage).toUpperCase()}
                </span>
                {result.inversionDetected && (
                  <span className="bg-wyrd-600/20 text-wyrd-600 px-3 py-1 rounded-full text-xs font-mono">
                    INVERSION DETECTED
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                {result.notes.map((note, i) => (
                  <p key={i} className="font-mono text-sm text-wyrd-100/80">
                    {note}
                  </p>
                ))}
              </div>
            </div>

            {/* Etymology Chain */}
            {result.specimen && (
              <div className="bg-wyrd-800/30 border border-wyrd-700 rounded-xl p-6">
                <h3 className="font-mono text-sm text-wyrd-100/60 mb-4">
                  ETYMOLOGY CHAIN
                </h3>
                <div className="space-y-4">
                  {result.specimen.stages.map((stage, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-32 shrink-0 font-mono text-xs text-wyrd-100/40">
                        {stage.period.split('(')[0].trim()}
                      </div>
                      <div className="flex-1">
                        <p className="font-serif text-lg">
                          <span className="text-wyrd-600">{stage.form}</span>
                          {' '}"{stage.meaning}"
                        </p>
                        {stage.notes && (
                          <p className="text-sm text-wyrd-100/50 mt-1">
                            {stage.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inversion Details */}
            {inversion && inversion.inverted && (
              <div className="bg-wyrd-600/10 border border-wyrd-600/30 rounded-xl p-6">
                <h3 className="font-mono text-sm text-wyrd-600 mb-4">
                  INVERSION ANALYSIS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-mono text-wyrd-100/40 mb-1">ORIGINAL</p>
                    <p className="font-serif">{inversion.originalMeaning}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-wyrd-100/40 mb-1">MODERN (INVERTED)</p>
                    <p className="font-serif text-wyrd-600">{inversion.modernMeaning}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-mono text-wyrd-100/40">
                  Mechanism: {inversion.mechanism}
                </p>
              </div>
            )}

            {/* Not Found */}
            {!result.found && (
              <div className="bg-wyrd-800/30 border border-wyrd-700 rounded-xl p-6 text-center">
                <p className="font-mono text-wyrd-100/60">
                  {result.notes[0]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="text-center py-20">
            <p className="font-mono text-wyrd-100/40 text-sm">
              Enter a word to begin etymological analysis
            </p>
            <p className="font-mono text-wyrd-100/20 text-xs mt-2">
              Try: weird, wicked, bad, evil, naughty
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
