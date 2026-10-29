import React, { useState } from 'react'

export default function ArchitecturalPillars() {
  const [flipped, setFlipped] = useState({
    pillar1: false,
    pillar2: false,
    pillar3: false,
    pillar4: false
  })

  const toggleFlip = (key) => {
    setFlipped((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const pillars = [
    {
      key: 'pillar1',
      num: 'PILLAR // 01',
      title: 'Hermes ID & Stealth Rendezvous',
      tagline: '97-Byte Canonical Binary Identity',
      summary: 'Combines an Ed25519 Tor v3 Onion address and an X25519 client-auth key into an atomic, self-authenticating credential that prevents directory scraping.',
      icon: '🧅',
      frontBadge: 'Curve25519 / Ed25519',
      backKicker: 'BINARY SPECIFICATION // HERMES-ID-v2',
      backTitle: 'Hermes ID Memory Layout',
      backDesc: 'Encodes onion discovery, client authorization, bundle commitment, and polynomial integrity in a single 97-byte buffer.',
      specs: [
        { label: 'BYTE LENGTH', val: '97 Bytes' },
        { label: 'CHECKSUM', val: 'CRC32 (0xEDB88320)' },
        { label: 'DISCOVERY', val: 'Stealth Client-Auth' },
        { label: 'MODULE', val: 'aura-core::identity' }
      ],
      clearance: 'SPEC // RFC-AURA-001',
      verified: 'MATHEMATICALLY PROVED ✓'
    },
    {
      key: 'pillar2',
      num: 'PILLAR // 02',
      title: 'HPAD 514-Byte Link Quantization',
      tagline: 'Zero Packet Size & Timing Profiling',
      summary: 'All wire packets are quantized into strict 514-byte cells. Continuous Poisson-jitter cover traffic (Murmur) ensures active chats and idle connections look identical.',
      icon: '📦',
      frontBadge: 'Tor Link Layer 514B',
      backKicker: 'WIRE GEOMETRY // HPAD-FRAMING',
      backTitle: '514-Byte Link Cell Geometry',
      backDesc: 'Payload is partitioned into n × 498-byte slices, wrapped with 16-byte HMAC auth, and padded with cryptographic entropy.',
      specs: [
        { label: 'CELL GEOMETRY', val: '514 Bytes Fixed' },
        { label: 'PAYLOAD SLICE', val: '498 Bytes (n × 498)' },
        { label: 'COVER TRAFFIC', val: 'Murmur Poisson Jitter' },
        { label: 'MODULE', val: 'aura-core::transport' }
      ],
      clearance: 'SPEC // RFC-AURA-002',
      verified: 'TRAFFIC-ANALYSIS PROOF ✓'
    },
    {
      key: 'pillar3',
      num: 'PILLAR // 03',
      title: 'CTP Rateless Fountain Engine',
      tagline: 'Multi-Circuit Parallel Streaming',
      summary: 'Transforms payloads into rateless fountain droplets striped across 3 independent Tor rendezvous circuits simultaneously, recovering from drops with zero resend latency.',
      icon: '⚡',
      frontBadge: 'Luby / Soliton Fountain',
      backKicker: 'ERASURE CODING // MULTI-PATH CTP',
      backTitle: 'Rateless Fountain Degree Math',
      backDesc: 'File chunks are XOR-combined according to the Robust Soliton distribution. The receiver reconstructs the payload as soon as K + ε droplets arrive.',
      specs: [
        { label: 'CIRCUITS', val: '3 Parallel Tor Paths' },
        { label: 'CODE FAMILY', val: 'Rateless Fountain (LT)' },
        { label: 'REPAIR OVERHEAD', val: 'ε < 0.05 (95% efficiency)' },
        { label: 'MODULE', val: 'aura-core::transfer' }
      ],
      clearance: 'SPEC // RFC-AURA-003',
      verified: 'FLAP-RESISTANT ✓'
    },
    {
      key: 'pillar4',
      num: 'PILLAR // 04',
      title: 'AVLT v2 Vault & MaskedMemory',
      tagline: 'Zero-Knowledge Encrypted Persistence',
      summary: 'Local SQLite encrypted database hardened with Argon2id, ChaCha20-Poly1305, MaskedMemory ephemeral XOR RAM pads, and a 4-phase atomic commit pipeline.',
      icon: '🔐',
      frontBadge: 'Argon2id + ChaCha20',
      backKicker: 'FORENSIC DEFENSE // AVLT-v2',
      backTitle: 'MaskedMemory & 4-Phase Atomic Commit',
      backDesc: 'Secrets are stored in heap memory as M = P ⊕ K_pad. Disk writes follow .vault-tmp → fsync → atomic rename with zeroize memory wiping.',
      specs: [
        { label: 'KDF EXPENSE', val: 'Argon2id (64MB, t=3)' },
        { label: 'RAM DEFENSE', val: 'Ephemeral XOR One-Time Pad' },
        { label: 'ATOMIC PIPELINE', val: 'fsync + Safe Atomic Rename' },
        { label: 'MODULE', val: 'aura-core::storage' }
      ],
      clearance: 'SPEC // RFC-AURA-004',
      verified: 'COLD-BOOT HARDENED ✓'
    }
  ]

  return (
    <section id="pillars" className="section">
      <div className="section-head reveal show">
        <div>
          <div className="kicker">02 / CORE ARCHITECTURE</div>
          <h2>Architectural pillars.<br /><span className="gradient">Built for hostile networks.</span></h2>
        </div>
        <p>
          Every layer of Hermes is designed from first cryptographic principles.
          Click the <span className="text-emerald-400 font-mono">↻</span> button on any card to flip and inspect the formal credential plate, binary layout, and mathematical proofs.
        </p>
      </div>

      <div className="team-grid">
        {pillars.map((pillar) => (
          <article
            key={pillar.key}
            className={`person ${flipped[pillar.key] ? 'is-flipped' : ''}`}
          >
            <div className="person-flip-inner">
              {/* FRONT PLATE */}
              <div className="person-front">
                <div className="person-img-header">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-3xl mb-3 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                    {pillar.icon}
                  </div>
                  <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">
                    {pillar.num}
                  </span>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {pillar.tagline}
                  </div>
                </div>

                <div className="person-info">
                  <div>
                    <span className="role">{pillar.frontBadge}</span>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.summary}</p>
                  </div>

                  <div className="person-footer-bar">
                    <div className="tag-badge">{pillar.frontBadge}</div>
                    <button
                      type="button"
                      className="card-flip-btn"
                      onClick={() => toggleFlip(pillar.key)}
                      title="Flip for Cryptographic Credential Plate"
                      data-flip-card
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>

              {/* BACK CREDENTIAL PLATE */}
              <div className="person-back">
                <div className="back-top-bar">
                  <span className="back-chip">⚡ AURA CRYPTOGRAPHIC CREDENTIAL PLATE</span>
                  <button
                    type="button"
                    className="card-flip-btn"
                    onClick={() => toggleFlip(pillar.key)}
                    title="Flip Back"
                    data-flip-card
                  >
                    ↻
                  </button>
                </div>

                <div className="back-body">
                  <div className="role-kicker">{pillar.backKicker}</div>
                  <h4>{pillar.backTitle}</h4>
                  <p>{pillar.backDesc}</p>

                  <div className="back-specs-grid">
                    {pillar.specs.map((s, idx) => (
                      <div key={idx} className="back-spec">
                        <strong>{s.val}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="back-footer">
                  <span className="tag-badge">{pillar.clearance}</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    {pillar.verified}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
