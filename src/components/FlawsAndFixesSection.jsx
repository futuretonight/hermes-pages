import React, { useState } from 'react'

export default function FlawsAndFixesSection() {
  const [activeFlawIndex, setActiveFlawIndex] = useState(0)

  const flaws = [
    {
      id: 'hsdir',
      tag: 'VULN-01',
      title: 'HSDir Directory Scraping & Snooping',
      area: 'TOR v3 DISCOVERY',
      legacyFlaw: {
        title: 'Public Distributed Hash Table (DHT) Enumeration',
        desc: 'Traditional Tor hidden services publish plaintext descriptors to DHT directories. Malicious HSDir relay operators easily scrape addresses, log uptime patterns, and correlate user availability.',
        impact: 'High metadata correlation; passive adversaries discover active endpoints without permission.'
      },
      auraFix: {
        title: 'Stealth Client-Authorization via Hermes ID',
        desc: 'Hermes embeds a 32-byte X25519 client-auth public key directly into the 97-byte Hermes ID. Descriptors uploaded to the DHT are encrypted with this key, rendering them cryptographically indistinguishable from random noise to relay operators.',
        invariant: 'Zero DHT descriptor leakage; only peers possessing your exact Hermes ID can decrypt introduction points.'
      },
      techSpec: 'X25519 ECDH + AES-256-CTR descriptor layer wrapping in arti-client'
    },
    {
      id: 'guardmgr',
      tag: 'VULN-02',
      title: 'Tor Guardmgr Deadlocks & Relay Stalls',
      area: 'CONSENSUS & RELAY SELECTION',
      legacyFlaw: {
        title: 'Consensus Loop Lockout on Unlisted Bridges',
        desc: 'In upstream tor-guardmgr, stale or blocked unlisted bridges cause the relay selection loop to stall while holding an immutable borrow, freezing all inbound and outbound traffic indefinitely.',
        impact: 'Connection hang requiring full app restart; network paralysis under censorship.'
      },
      auraFix: {
        title: 'Lock-Free Async Selection & State Auto-Repair',
        desc: 'Aura implements non-blocking lock-free guard selection and auto-repairs corrupted persistent state caches. If a guard circuit fails, consensus rotation automatically switches to fallback relays in under 800ms.',
        invariant: 'Lock-free consensus progression; 100% resilient to poisoned bridge state.'
      },
      techSpec: 'Atomic swap guardmgr cache + auto-repair corrupted state purge'
    },
    {
      id: 'traffic-analysis',
      tag: 'VULN-03',
      title: 'Packet Size & Traffic Timing Profiling',
      area: 'WIRE FRAMING & ISP OBSERVERS',
      legacyFlaw: {
        title: 'Variable Packet Lengths & Timing Leaks',
        desc: 'Even over TLS/Tor, message sizes vary drastically (e.g., 20-byte text vs 400-byte voice). Passive ISP observers perform traffic analysis, fingerprinting conversation rhythm and keystrokes.',
        impact: 'Statistical correlation attacks identify communicating parties despite onion routing.'
      },
      auraFix: {
        title: 'HPAD 514-Byte Cell Alignment & Murmur Cover Jitter',
        desc: 'All wire packets are quantized into strict 514-byte Tor link cells (n × 498 payload + CSPRNG dummy padding). A continuous Poisson-jitter cover traffic generator (Murmur) maintains identical wire cadence during chat and idle states.',
        invariant: 'Zero packet size leakage; wire footprint is statistically indistinguishable from random noise.'
      },
      techSpec: '514-byte cell-aligned HPAD framing + Poisson distribution cover traffic'
    },
    {
      id: 'ctp-fountain',
      tag: 'VULN-04',
      title: 'Tor Circuit Congestion & Transfer Choking',
      area: 'P2P FILE STREAMING',
      legacyFlaw: {
        title: 'Single-Circuit TCP Window Collapse',
        desc: 'Transferring multi-megabyte payloads over single Tor circuits triggers TCP buffer bloat, head-of-line blocking, and catastrophic circuit collapse when any relay flaps.',
        impact: 'Transfer speeds drop to zero; dropped circuits require starting 50MB transfers over from 0%.'
      },
      auraFix: {
        title: 'Rateless Fountain Multi-Circuit Streaming (CTP)',
        desc: 'Aura encodes files into rateless fountain droplets (Luby Transform / Soliton distribution) striped across 3 independent Tor rendezvous circuits simultaneously. Reconstructed as soon as K + ε droplets arrive without any retransmission requests.',
        invariant: 'Immune to packet loss; transfer continues seamlessly even if 2 out of 3 circuits collapse.'
      },
      techSpec: 'Rateless Luby Transform / Soliton degree distribution over 3 parallel Tor rendezvous'
    },
    {
      id: 'memory-scraping',
      tag: 'VULN-05',
      title: 'Forensic RAM Scraping & Cold-Boot Dumps',
      area: 'HOST FORENSICS & MEMORY DUMPS',
      legacyFlaw: {
        title: 'Plaintext PGP Keys & Decryption Buffers in Heap',
        desc: 'Standard messaging apps leave decrypted keys and messages in plaintext memory buffers. Malware or physical device seizure (cold-boot attacks) can easily extract PGP private keys from RAM dumps.',
        impact: 'Total compromise of long-term cryptographic identities from temporary physical access.'
      },
      auraFix: {
        title: 'MaskedMemory Ephemeral XOR Pads & Zeroize',
        desc: 'Secrets are stored in memory as M = P ⊕ K_pad using cryptographically random XOR pads. Plaintext is only reassembled inside CPU registers for the nanoseconds required for crypto operations, and wiped with zeroize on drop.',
        invariant: 'RAM dumps yield high-entropy random noise; zero plaintext keys exposed in heap.'
      },
      techSpec: 'volatile memory zeroization + XOR entropy pad masking on all SecretKey structs'
    },
    {
      id: 'identity-replay',
      tag: 'VULN-06',
      title: 'Identity Spoofing & Handshake Replays',
      area: 'IDENTITY AUTHENTICATION',
      legacyFlaw: {
        title: 'Loose Public Key Announcements',
        desc: 'Clearnet apps and simple P2P clients use mutable usernames or standalone public keys vulnerable to replay attacks and man-in-the-middle handshake injection.',
        impact: 'Adversary can claim to be a contact or replay old signed session requests.'
      },
      auraFix: {
        title: '97-Byte Hermes ID with SHA3-256 Commitment & SAS',
        desc: 'Aura unifies the Ed25519 Onion address, X25519 auth key, SHA3-256 PGP bundle commitment, 64-bit SAS nonce, and CRC32 polynomial into a single atomic 97-byte binary layout verified mathematically.',
        invariant: 'Zero identity ambiguity; binary payload guarantees non-repudiation and replay defense.'
      },
      techSpec: '97-byte canonical binary layout with IEEE 802.3 CRC32 polynomial (0xEDB88320)'
    }
  ]

  const current = flaws[activeFlawIndex]

  return (
    <section id="flaws-fixes" className="section">
      <div className="section-head reveal show">
        <div>
          <div className="kicker">01 / VULNERABILITY AUDIT &amp; SOLUTIONS</div>
          <h2>The flaws in traditional networks.<br /><span className="gradient">How Aura fixed them.</span></h2>
        </div>
        <p>
          Conventional privacy apps make fatal compromises with centralized directories, traffic profiling, and unmasked RAM.
          Here is how the Aura Engine resolves the 6 hardest challenges in surveillance resistance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {flaws.map((flaw, idx) => (
          <button
            key={flaw.id}
            type="button"
            onClick={() => setActiveFlawIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeFlawIndex === idx
                ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] opacity-60">{flaw.tag}</span>
            <span>{flaw.title.split(' ')[0]} {flaw.title.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Detailed Side-by-Side Comparison Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 reveal show">
        {/* The Flaw */}
        <div className="rounded-3xl bg-gradient-to-br from-rose-950/20 via-slate-900/80 to-slate-950/90 border border-rose-500/20 p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase tracking-widest">
              THE VULNERABILITY // {current.tag}
            </span>
            <span className="font-mono text-xs text-slate-500">{current.area}</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            {current.legacyFlaw.title}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {current.legacyFlaw.desc}
          </p>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
            <div className="font-mono text-[10px] text-rose-400 uppercase tracking-widest mb-1">
              EXPLOIT VECTOR &amp; IMPACT:
            </div>
            <div className="text-xs text-rose-200 leading-relaxed font-mono">
              {current.legacyFlaw.impact}
            </div>
          </div>
        </div>

        {/* The Aura Fix */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950/25 via-slate-900/90 to-slate-950/90 border border-emerald-500/40 p-8 backdrop-blur-xl relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 uppercase tracking-widest">
              AURA CRYPTOGRAPHIC FIX // RESOLVED
            </span>
            <span className="font-mono text-xs text-emerald-400">ZERO LEAK GUARANTEE</span>
          </div>

          <h3 className="text-2xl font-bold text-emerald-300 mb-3">
            {current.auraFix.title}
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed mb-6">
            {current.auraFix.desc}
          </p>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 mb-4">
            <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mb-1">
              MATHEMATICAL INVARIANT:
            </div>
            <div className="text-xs text-emerald-200 leading-relaxed font-mono">
              {current.auraFix.invariant}
            </div>
          </div>

          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-emerald-400">⚙ TECH SPEC:</span>
            <span>{current.techSpec}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
