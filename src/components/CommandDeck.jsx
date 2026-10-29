import React, { useState, useEffect } from 'react'

export default function CommandDeck({ isOpen, onClose }) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(true) // toggle open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const sections = [
    {
      num: '00',
      id: 'alliance',
      name: 'Cryptographic Alliance',
      icon: '🛡️',
      desc: 'Arti Tor, Sequoia OpenPGP, Curve25519, and ChaCha20-Poly1305 foundation.',
      category: 'SECURITY BASELINE'
    },
    {
      num: '01',
      id: 'flaws-fixes',
      name: 'The Flaws & Fixes',
      icon: '⚡',
      desc: 'Comparative breakdown of 6 critical vulnerabilities in traditional E2EE vs Aura fixes.',
      category: 'CORE DIFFERENTIATOR'
    },
    {
      num: '02',
      id: 'pillars',
      name: '3D Architectural Pillars',
      icon: '◈',
      desc: 'Hermes ID, HPAD cell quantization, CTP fountain codes, and AVLT v2 vault.',
      category: 'SYSTEM ARCHITECTURE'
    },
    {
      num: '03',
      id: 'protocol-labs',
      name: 'Interactive Protocol Labs',
      icon: '🧪',
      desc: 'Live 97-byte Hermes ID inspector, cell quantization slider, fountain simulator & RAM guard.',
      category: 'LIVE SIMULATORS'
    },
    {
      num: '04',
      id: 'threat-matrix',
      name: 'Threat Model Matrix',
      icon: '🔒',
      desc: 'Adversary tiers ADV-1 through ADV-6 with guaranteed mathematical invariants.',
      category: 'FORMAL VERIFICATION'
    },
    {
      num: '05',
      id: 'developer-sdk',
      name: 'Developer SDK & Rust Core',
      icon: '💻',
      desc: 'Runnable Rust code recipes for headless P2P daemons, cell senders & fountain streaming.',
      category: 'IMPLEMENTATION'
    }
  ]

  const filtered = sections.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (id) => {
    onClose()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={`adc-command-deck ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div className="adc-deck-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs">
            ⌘K
          </div>
          <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">
            AURA_TELEMETRY // COMMAND_DECK
          </span>
        </div>
        <button type="button" className="adc-deck-close" onClick={onClose}>
          CLOSE [ESC] ✕
        </button>
      </div>

      <div className="w-full max-w-[1220px] mx-auto my-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search architecture modules, threat models, cryptographic algorithms, or RFC specs..."
            className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-2xl px-6 py-4 text-base text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xl transition-all"
            autoFocus={isOpen}
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
            {filtered.length} SECTIONS FOUND
          </div>
        </div>
      </div>

      <div className="adc-deck-rows">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="adc-deck-row"
            onClick={() => handleSelect(item.id)}
          >
            <div className="adc-deck-left">
              <span className="adc-deck-num">{item.num}</span>
              <div className="adc-deck-icon">{item.icon}</div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                  {item.category}
                </span>
                <div className="adc-deck-name">{item.name}</div>
              </div>
            </div>
            <div className="adc-deck-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-[1220px] mx-auto mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-slate-400">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">TOR CONSENSUS</span>
          <span className="text-emerald-400 font-bold">100% SYNCHRONIZED</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">LINK FRAMING</span>
          <span className="text-cyan-400 font-bold">514B HPAD CELL ALIGNED</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">MEMORY GUARD</span>
          <span className="text-violet-400 font-bold">MaskedMemory XOR ARMED</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">CLEARNET LEAKS</span>
          <span className="text-emerald-400 font-bold">ZERO (FAIL-CLOSED)</span>
        </div>
      </div>

      <div className="adc-deck-footer">
        <div>TIP: USE [CTRL + K] ANYTIME TO TOGGLE THIS COMMAND DECK</div>
        <div>HERMES v2.4 • SEQUOIA OPENPGP + ARTI TOR ENGINE</div>
      </div>
    </div>
  )
}
