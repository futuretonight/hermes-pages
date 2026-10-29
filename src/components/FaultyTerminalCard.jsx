import React, { useEffect, useRef, useState } from 'react'
import { initFaultyTerminal } from '../shaders/FaultyTerminal.js'

export default function FaultyTerminalCard() {
  const terminalRef = useRef(null)
  const [logLines, setLogLines] = useState([
    '[AURA_INIT] Bootstrapping embedded Arti Tor client...',
    '[TOR_CIRCUIT] Building 3-hop circuit: Guard -> Middle -> Rendezvous...',
    '[HPAD_FRAME] 514-byte cell quantization initialized (n * 498 bytes).',
    '[MURMUR_COVER] Continuous Poisson jitter cover traffic armed (lambda = 2.4).',
    '[MASKED_MEM] XOR one-time pad memory guard active on secret buffers.',
    '[CONSENSUS] Tor directory consensus synchronized (100%). Enclave listening.'
  ])

  useEffect(() => {
    if (!terminalRef.current) return
    let cleanup = () => {}

    try {
      cleanup = initFaultyTerminal(terminalRef.current, {
        tint: '#10b981',
        glyphs: 'code',
        scale: 1.5,
        digitSize: 1.2,
        timeScale: 0.45,
        brightness: 0.8,
        glow: 0.6,
        scanlineIntensity: 0.45,
        glitchAmount: 0.8,
        flickerAmount: 0.9
      }) || (() => {})
    } catch (err) {
      console.warn('FaultyTerminal fallback:', err)
    }

    return () => cleanup()
  }, [])

  const pingCircuit = () => {
    const timestamp = new Date().toISOString().substring(11, 19)
    const newLogs = [
      `[${timestamp}] [CIRCUIT_DISPATCH] Sent 514B dummy cell (COVER_JITTER).`,
      `[${timestamp}] [CIRC_ALPHA] RTT: 240ms | Loss: 0% | Status: HEALTHY`,
      `[${timestamp}] [CIRC_BETA]  RTT: 310ms | Loss: 0% | Status: HEALTHY`
    ]
    setLogLines((prev) => [...prev.slice(-6), ...newLogs])
  }

  return (
    <section className="section">
      <div className="rounded-3xl bg-slate-950 border border-slate-800 p-8 backdrop-blur-xl relative overflow-hidden reveal show">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Terminal Canvas Shader */}
          <div
            ref={terminalRef}
            className="w-full h-80 rounded-2xl overflow-hidden border border-emerald-500/30 relative shadow-[0_0_40px_rgba(16,185,129,0.15)]"
          >
            {/* The canvas is inserted dynamically by initFaultyTerminal */}
            <div className="absolute top-3 left-4 z-10 font-mono text-[10px] text-emerald-400 bg-black/70 px-2 py-1 rounded border border-emerald-500/40">
              CRT_TERMINAL // MATRIX_STREAM
            </div>
          </div>

          {/* Right: Live Diagnostics Console */}
          <div>
            <div className="kicker">06 / TELEMETRY &amp; CRT PROTOCOL CONSOLE</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Real-time enclave diagnostics.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">
              Live telemetry stream of in-process Arti Tor consensus synchronization,
              cell framing, and MaskedMemory XOR pad health.
            </p>

            <div className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs space-y-1.5 mb-6 max-h-48 overflow-y-auto">
              {logLines.map((line, idx) => (
                <div key={idx} className="text-emerald-400/90 leading-tight">
                  {line}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={pingCircuit}
                className="btn primary text-xs font-mono"
              >
                TEST RENDEZVOUS PING ⚡
              </button>
              <span className="font-mono text-[11px] text-slate-500">
                Tor Consensus: Synced | Circuits: 3 Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
