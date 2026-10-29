import React, { useState, useEffect } from 'react'

export default function BootLoader() {
  const [complete, setComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusLog, setStatusLog] = useState('Initializing Aura Secure Enclave...')

  useEffect(() => {
    // Check if user already saw bootloader in this session
    const seen = sessionStorage.getItem('hermes_boot_done') === '1'
    if (seen) {
      setComplete(true)
      return
    }

    const logs = [
      'Auditing Sequoia OpenPGP Keyring & Curve25519 Enclaves...',
      'Bootstrapping Embedded Arti Tor v3 Onion Circuits...',
      'Mounting 97-Byte Hermes ID CRC32 (0xEDB88320) Validator...',
      'Arming MaskedMemory Ephemeral XOR Pad & Anti-Forensics...',
      'Initializing HPAD 514-Byte Link Quantization Engine...',
      'Calibrating Rateless Fountain Multi-Circuit Streaming...',
      'Enclave Online — Fail-Closed Zero-Clearnet Invariant Locked.'
    ]

    let currentProg = 0
    const interval = setInterval(() => {
      currentProg += Math.floor(14 + Math.random() * 18)
      if (currentProg > 100) currentProg = 100
      setProgress(currentProg)

      const logIndex = Math.min(logs.length - 1, Math.floor((currentProg / 100) * logs.length))
      setStatusLog(logs[logIndex])

      if (currentProg >= 100) {
        clearInterval(interval)
        sessionStorage.setItem('hermes_boot_done', '1')
        setTimeout(() => {
          setComplete(true)
        }, 220)
      }
    }, 75)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`adc-boot-loader ${complete ? 'boot-done' : ''}`} aria-hidden={complete}>
      <div className="adc-boot-shutter-top" />
      <div className="adc-boot-shutter-bottom" />
      <div className="adc-boot-core">
        <div className="adc-boot-head">
          <span className="adc-boot-tag">AURA_KERNEL // SECURE_ENCLAVE_v2</span>
          <span className="adc-boot-pct">{progress}%</span>
        </div>
        <div className="adc-boot-title">Hermes &amp; Aura Engine</div>
        <div className="adc-boot-status">{statusLog}</div>
        <div className="adc-boot-bar-wrap">
          <div className="adc-boot-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>TOR_CONSENSUS: VERIFYING</span>
          <button 
            type="button" 
            onClick={() => { setComplete(true); sessionStorage.setItem('hermes_boot_done', '1') }}
            className="hover:text-emerald-400 transition-colors"
          >
            SKIP SEQUENCE [ESC] →
          </button>
        </div>
      </div>
    </div>
  )
}
