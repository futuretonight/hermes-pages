import React, { useEffect, useRef } from 'react'
import { initGhostFibers } from '../shaders/GhostFibers.js'

export default function Hero({ onNotify }) {
  const fibersContainerRef = useRef(null)

  useEffect(() => {
    if (!fibersContainerRef.current) return
    let cleanup = () => {}

    try {
      cleanup = initGhostFibers(fibersContainerRef.current, {
        glowColor: '#10b981',
        lineColor: '#e0f2fe',
        secondaryColor: '#00d2ff',
        speed: 0.52,
        threads: 42,
        density: 0.65,
        hoverEffect: 'part'
      }) || (() => {})
    } catch (err) {
      console.warn('GhostFibers shader fallback:', err)
    }

    return () => cleanup()
  }, [])

  return (
    <section id="hero" className="hero">
      {/* Hardware-Adaptive Tor OnionFibers 3D Shader */}
      <div 
        ref={fibersContainerRef} 
        className="hero-fibers-bg ghost-fibers-container"
        id="hero-ghost-fibers"
      />

      <div className="hero-copy reveal show">
        <div className="eyebrow-pill">
          <span className="pulse-dot" />
          ZERO CENTRAL INFRASTRUCTURE • EMBEDDED ARTI TOR • SEQUOIA PGP
        </div>

        <h1>
          SURVEILLANCE-PROOF.<br />
          <span className="gradient">ZERO METADATA.</span>
        </h1>

        <p className="tagline">
          Peer-to-Peer Tor v3 Onion Circuits • Sequoia OpenPGP • Rateless Fountain Streaming
        </p>

        <p className="desc">
          Hermes is an autonomous privacy engine engineered for communication in adversarial networks.
          By embedding a full-featured Tor client (Arti) and Sequoia OpenPGP, peers establish direct,
          end-to-end encrypted Tor rendezvous circuits with zero clearnet leaks, zero phone numbers, and zero central telemetry.
        </p>

        <div className="actions">
          <a className="btn primary" href="#protocol-labs">
            LAUNCH PROTOCOL LAB ↗
          </a>
          <a className="btn ghost" href="#flaws-fixes">
            EXPLORE FLAWS &amp; FIXES ↓
          </a>
          <button
            type="button"
            className="btn ghost font-mono text-xs"
            onClick={() => {
              navigator.clipboard?.writeText('cargo add aura-core')
              onNotify?.('Copied "cargo add aura-core" to clipboard!')
            }}
          >
            $ cargo add aura-core ⎘
          </button>
        </div>

        <div className="hero-meta">
          <div className="stat">
            <strong>0</strong>
            <span>Central Servers or Relays</span>
          </div>
          <div className="stat">
            <strong>97 B</strong>
            <span>Self-Authenticating Hermes ID</span>
          </div>
          <div className="stat">
            <strong>514 B</strong>
            <span>Strict Cell Quantization (HPAD)</span>
          </div>
          <div className="stat">
            <strong>100%</strong>
            <span>Fail-Closed Cryptographic Vault</span>
          </div>
        </div>
      </div>
    </section>
  )
}
