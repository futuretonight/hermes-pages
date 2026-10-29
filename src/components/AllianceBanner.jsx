import React from 'react'

export default function AllianceBanner() {
  const primitives = [
    {
      name: 'Arti Tor Client (Rust)',
      role: 'DECENTRALIZED TRANSPORT',
      icon: '🧅',
      desc: 'Next-generation pure-Rust Tor client. Hosts authenticated v3 Onion Services directly in-process with zero local Tor daemon dependencies.'
    },
    {
      name: 'Sequoia OpenPGP',
      role: 'MESSAGE & SIGNATURE CRYPTO',
      icon: '🛡️',
      desc: 'Memory-safe, modular OpenPGP standard library. Strips all legacy vulnerabilities and enforces strict key zeroization on drop.'
    },
    {
      name: 'Curve25519 & Ed25519',
      role: 'ASYMMETRIC KEYPAIR CORE',
      icon: '⚡',
      desc: 'Constant-time elliptic curve cryptography immune to cache timing attacks. Ed25519 for Onion addresses, X25519 for stealth descriptor decryption.'
    },
    {
      name: 'Argon2id + ChaCha20',
      role: 'AUTHENTICATED VAULT ENCRYPT',
      icon: '🔐',
      desc: 'State-of-the-art memory-hard KDF resistant to GPU/ASIC cracking, combined with authenticated Poly1305 AEAD stream encryption.'
    }
  ]

  return (
    <section id="alliance" className="section">
      <div className="banner reveal show">
        <div className="kicker">00 / INDUSTRIAL CRYPTOGRAPHIC FOUNDATION</div>
        <h2>Engineered on battle-tested, memory-safe primitives.</h2>
        <p>
          Hermes completely abandons legacy clearnet architectures, centralized signaling, and unsafe C codebases.
          Every component runs in high-assurance Rust with formal guarantees of zero data leakage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {primitives.map((p) => (
            <div
              key={p.name}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all group"
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mb-1">
                {p.role}
              </div>
              <h4 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                {p.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
