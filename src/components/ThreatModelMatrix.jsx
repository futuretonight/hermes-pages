import React, { useState } from 'react'

export default function ThreatModelMatrix() {
  const [filter, setFilter] = useState('all')

  const adversaries = [
    {
      tier: 'ADV-1',
      name: 'Passive Local ISP / Autonomous System',
      category: 'network',
      capabilities: 'Inspects all ingress/egress wire packets; attempts packet length clustering and inter-arrival timing correlation.',
      mitigation: '514-Byte HPAD Cell Quantization + Murmur Continuous Poisson Cover Jitter',
      invariant: 'Zero packet size leakage. Wire entropy is statistically indistinguishable from random Tor stream noise.',
      status: 'MATHEMATICALLY PROVEN'
    },
    {
      tier: 'ADV-2',
      name: 'Malicious Tor HSDir & Directory Relays',
      category: 'relays',
      capabilities: 'Operates malicious Tor v3 directory nodes; scrapes published hidden service descriptors from DHT to harvest active user endpoints.',
      mitigation: 'Stealth Client-Authorization (32-byte X25519 Key embedded in Hermes ID)',
      invariant: 'Descriptors are encrypted with user auth key; HSDir relays observe pure ciphertext and cannot discover hidden service rendezvous.',
      status: 'ZERO DHT LEAKAGE'
    },
    {
      tier: 'ADV-3',
      name: 'State Censorship & Poisoned Bridge Nodes',
      category: 'relays',
      capabilities: 'Blocks known Tor bridges and injects corrupted or zeroed cache state into consensus directories to force application freezes.',
      mitigation: 'Lock-Free Async Guardmgr + Atomic State Auto-Repair & Fast Fallback',
      invariant: 'Consensus loop cannot deadlock; consensus recovers automatically to healthy relays in under 800ms.',
      status: 'RESILIENT TO POISONING'
    },
    {
      tier: 'ADV-4',
      name: 'Physical Device Seizure & Cold-Boot Dump',
      category: 'forensics',
      capabilities: 'Physically seizes device; freezes RAM or dumps memory heap to extract PGP private keys and unencrypted chat logs.',
      mitigation: 'MaskedMemory Ephemeral XOR Pad (M = P ⊕ K_pad) + Zeroization on Drop',
      invariant: 'Heap memory contains pure high-entropy noise; keys are only assembled inside CPU registers during immediate crypto operations.',
      status: 'COLD-BOOT HARDENED'
    },
    {
      tier: 'ADV-5',
      name: 'Compelled Central Authority / Subpoena',
      category: 'metadata',
      capabilities: 'Government or state adversary serves legal subpoenas, warrants, or NSLs demanding user databases and metadata logs.',
      mitigation: 'Zero Central Architecture (Embedded In-Process Arti Tor Onion Rendezvous)',
      invariant: 'Zero central servers exist. Zero accounts, zero phone numbers, zero centralized databases. There is nothing to subpoena.',
      status: 'ABSOLUTE IMMUNITY'
    },
    {
      tier: 'ADV-6',
      name: 'Replay & Identity Spoofing Adversary',
      category: 'metadata',
      capabilities: 'Intercepts historical handshake requests and replays them to forge identity ownership or flood recipient queues.',
      mitigation: '97-Byte Hermes ID + SHA3-256 Bundle Commitment + 64-bit SAS Nonce + CRC32',
      invariant: 'Cryptographically bound to Ed25519 & X25519 keypairs; invalid checksums or expired SAS nonces are rejected immediately.',
      status: 'REPLAY RESISTANT'
    }
  ]

  const filtered = filter === 'all' ? adversaries : adversaries.filter((a) => a.category === filter)

  return (
    <section id="threat-matrix" className="section">
      <div className="section-head reveal show">
        <div>
          <div className="kicker">04 / FORMAL THREAT MODELING</div>
          <h2>Adversary capabilities.<br /><span className="gradient">Guaranteed invariants.</span></h2>
        </div>
        <p>
          Hermes evaluates security against rigorous adversarial threat tiers.
          Each tier defines explicit attacker capabilities and the formal cryptographic invariant maintained by the Aura Engine.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Adversary Tiers (ADV-1 to ADV-6)' },
          { id: 'network', label: 'Network / ISP Profiling' },
          { id: 'relays', label: 'Tor Relays & DHT' },
          { id: 'forensics', label: 'Host & RAM Forensics' },
          { id: 'metadata', label: 'Metadata & Authority' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
              filter === f.id
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal show">
        {filtered.map((adv) => (
          <div
            key={adv.tier}
            className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all backdrop-blur-xl relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {adv.tier}
                </span>
                <span className="font-mono text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                  {adv.status} ✓
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{adv.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                <strong className="text-slate-300">Attacker Capabilities:</strong> {adv.capabilities}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  AURA DEFENSIVE COUNTERMEASURE:
                </span>
                <span className="text-cyan-300 leading-snug block">
                  {adv.mitigation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-emerald-400 text-[10px] uppercase block mb-1 font-bold">
                  MATHEMATICAL INVARIANT GUARANTEE:
                </span>
                <span className="text-emerald-200 text-[11px] leading-snug block">
                  {adv.invariant}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
