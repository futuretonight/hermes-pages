import React, { useState, useMemo } from 'react'

// IEEE 802.3 standard CRC32 polynomial computation
function computeCRC32(bytes) {
  let crc = 0 ^ -1
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[i] = c >>> 0
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}

export default function ProtocolLab({ onNotify }) {
  const [activeTab, setActiveTab] = useState('hermes-id')

  // --- Lab 1: Hermes ID State ---
  const [identityEntropy, setIdentityEntropy] = useState(1)
  const [hoveredRange, setHoveredRange] = useState(null)

  // Generate 97-byte Hermes ID buffer
  const hermesIdData = useMemo(() => {
    const buf = new Uint8Array(97)
    // Byte 0: Version 2
    buf[0] = 0x02

    // Deterministic pseudo-random bytes based on entropy seed
    let seed = 0x4845524d + identityEntropy * 0x9e3779b9
    const nextRand = () => {
      seed = (seed ^ (seed << 13)) >>> 0
      seed = (seed ^ (seed >>> 17)) >>> 0
      seed = (seed ^ (seed << 5)) >>> 0
      return seed & 0xff
    }

    // Bytes 1..32: Ed25519 Onion Pubkey
    for (let i = 1; i <= 32; i++) buf[i] = nextRand()
    // Bytes 33..64: X25519 Client-Auth Pubkey
    for (let i = 33; i <= 64; i++) buf[i] = nextRand()
    // Bytes 65..80: SHA3-256 Bundle Commitment
    for (let i = 65; i <= 80; i++) buf[i] = nextRand()
    // Bytes 81..88: 64-bit SAS Nonce
    for (let i = 81; i <= 88; i++) buf[i] = nextRand()
    // Bytes 89..92: Reserved Flags
    buf[89] = 0x00
    buf[90] = 0x00
    buf[91] = 0x00
    buf[92] = 0x00

    // Bytes 93..96: CRC32 of bytes 0..92
    const checksum = computeCRC32(buf.subarray(0, 93))
    buf[93] = (checksum >>> 24) & 0xff
    buf[94] = (checksum >>> 16) & 0xff
    buf[95] = (checksum >>> 8) & 0xff
    buf[96] = checksum & 0xff

    // Derive Onion Address preview
    const onionPrefix = Array.from(buf.subarray(1, 14))
      .map((b) => 'abcdefghijklmnopqrstuvwxyz234567'[b % 32])
      .join('')
    const onionAddress = `${onionPrefix}...hermes.onion`

    // Derive 6-digit SAS code
    const sasVal = ((buf[81] << 16) | (buf[82] << 8) | buf[83]) % 1000000
    const sasCode = sasVal.toString().padStart(6, '0')

    return {
      bytes: buf,
      hex: toHex(buf),
      checksumHex: checksum.toString(16).padStart(8, '0').toUpperCase(),
      onionAddress,
      sasCode
    }
  }, [identityEntropy])

  // --- Lab 2: Tor Cell Quantization State ---
  const [payloadSize, setPayloadSize] = useState(640) // bytes

  const cellStats = useMemo(() => {
    const usablePerCell = 498
    const totalCells = Math.max(1, Math.ceil(payloadSize / usablePerCell))
    const totalWireBytes = totalCells * 514
    const totalPaddingBytes = totalWireBytes - payloadSize - totalCells * 16
    const cells = []

    let remaining = payloadSize
    for (let i = 0; i < totalCells; i++) {
      const pLen = Math.min(remaining, usablePerCell)
      const padLen = usablePerCell - pLen
      cells.push({
        index: i + 1,
        header: 16,
        payload: pLen,
        padding: padLen,
        total: 514
      })
      remaining -= pLen
    }

    return {
      totalCells,
      totalWireBytes,
      totalPaddingBytes,
      cells
    }
  }, [payloadSize])

  // --- Lab 3: Fountain Simulator State ---
  const [lossRate, setLossRate] = useState(25)
  const [isSimulating, setIsSimulating] = useState(false)
  const [fountainProgress, setFountainProgress] = useState(0)
  const [droplets, setDroplets] = useState([])

  const runFountainSimulation = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setFountainProgress(0)
    setDroplets([])

    const kRequired = 20
    let arrived = 0
    let totalSent = 0
    const stream = []

    const timer = setInterval(() => {
      totalSent++
      const circuitIndex = totalSent % 3 // 0: Alpha, 1: Beta, 2: Gamma
      const dropped = Math.random() * 100 < lossRate

      if (!dropped) {
        arrived++
      }

      stream.push({
        id: totalSent,
        circuit: ['Alpha', 'Beta', 'Gamma'][circuitIndex],
        color: ['#10b981', '#00d2ff', '#8b5cf6'][circuitIndex],
        dropped
      })
      setDroplets([...stream.slice(-24)])

      const pct = Math.min(100, Math.floor((arrived / kRequired) * 100))
      setFountainProgress(pct)

      if (arrived >= kRequired || totalSent >= 50) {
        clearInterval(timer)
        setIsSimulating(false)
        onNotify?.('Rateless Fountain Payload Reconstructed Successfully!')
      }
    }, 120)
  }

  // --- Lab 4: MaskedMemory State ---
  const [plaintextKey, setPlaintextKey] = useState('SUPER_SECRET_PGP_KEY_2026')
  const [ramMaskSeed, setRamMaskSeed] = useState(1)

  const maskedMemoryData = useMemo(() => {
    const pBytes = Array.from(plaintextKey).map((c) => c.charCodeAt(0))
    const maskBytes = pBytes.map((_, i) => ((ramMaskSeed * 37 + i * 19) % 256))
    const ramDumpBytes = pBytes.map((p, i) => p ^ maskBytes[i])

    return {
      plaintextHex: pBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
      maskHex: maskBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
      ramDumpHex: ramDumpBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
    }
  }, [plaintextKey, ramMaskSeed])

  return (
    <section id="protocol-labs" className="section">
      <div className="section-head reveal show">
        <div>
          <div className="kicker">03 / INTERACTIVE PROTOCOL LABORATORIES</div>
          <h2>Live cryptographic testbed.<br /><span className="gradient">Test the invariants.</span></h2>
        </div>
        <p>
          Interact directly with Aura’s mathematical algorithms in real time.
          Inspect 97-byte identity layouts, test 514-byte cell quantization, and simulate rateless fountain transfer over flapped Tor circuits.
        </p>
      </div>

      {/* Lab Selector Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8">
        {[
          { id: 'hermes-id', label: '1. Hermes ID 97B Inspector', icon: '🧅' },
          { id: 'cell-quant', label: '2. HPAD Tor Cell Quantizer', icon: '📦' },
          { id: 'fountain', label: '3. Multi-Circuit Fountain Sim', icon: '⚡' },
          { id: 'masked-ram', label: '4. MaskedMemory RAM Guard', icon: '🔐' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-2xl text-xs font-mono transition-all flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- LAB 1: HERMES ID 97B INSPECTOR --- */}
      {activeTab === 'hermes-id' && (
        <div className="rounded-3xl bg-slate-900/85 border border-slate-800 p-8 backdrop-blur-xl reveal show">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                RFC-AURA-001 // SPECIFICATION
              </span>
              <h3 className="text-xl font-bold text-white">
                97-Byte Self-Authenticating Binary Layout
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIdentityEntropy((e) => e + 1)}
                className="btn ghost text-xs font-mono"
              >
                ⟳ GENERATE NEW ENTROPY
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(hermesIdData.hex)
                  onNotify?.('Copied 97-Byte Hermes ID (Hex) to clipboard!')
                }}
                className="btn primary text-xs font-mono"
              >
                COPY HEX [97B] ⎘
              </button>
            </div>
          </div>

          {/* Identity Metadata Chips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">DERIVED ONION SERVICE</span>
              <span className="text-emerald-400 font-bold block mt-1 truncate">
                {hermesIdData.onionAddress}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">64-BIT SAS CODE</span>
              <span className="text-cyan-400 font-bold block mt-1">
                SAS-{hermesIdData.sasCode}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">CRC32 POLYNOMIAL (0xEDB88320)</span>
              <span className="text-violet-400 font-bold block mt-1">
                0x{hermesIdData.checksumHex} [VALID]
              </span>
            </div>
          </div>

          {/* Color-Coded Hex Breakdown */}
          <div className="mb-6">
            <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>INTERACTIVE HEX MATRIX (HOVER TO INSPECT BYTES):</span>
              <span className="text-emerald-400">{hermesIdData.bytes.length} BYTES TOTAL</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 font-mono text-xs leading-relaxed tracking-wider break-all select-all flex flex-wrap gap-1.5">
              {Array.from(hermesIdData.bytes).map((byte, idx) => {
                let colorClass = 'text-slate-400 hover:bg-slate-800'
                let rangeKey = ''

                if (idx === 0) {
                  colorClass = 'text-emerald-400 bg-emerald-500/10'
                  rangeKey = 'version'
                } else if (idx >= 1 && idx <= 32) {
                  colorClass = 'text-cyan-300 bg-cyan-500/10'
                  rangeKey = 'ed25519'
                } else if (idx >= 33 && idx <= 64) {
                  colorClass = 'text-violet-300 bg-violet-500/10'
                  rangeKey = 'x25519'
                } else if (idx >= 65 && idx <= 80) {
                  colorClass = 'text-amber-300 bg-amber-500/10'
                  rangeKey = 'bundle'
                } else if (idx >= 81 && idx <= 88) {
                  colorClass = 'text-blue-300 bg-blue-500/10'
                  rangeKey = 'sas'
                } else if (idx >= 89 && idx <= 92) {
                  colorClass = 'text-slate-500 bg-slate-800/40'
                  rangeKey = 'reserved'
                } else if (idx >= 93 && idx <= 96) {
                  colorClass = 'text-emerald-300 bg-emerald-500/20 font-bold'
                  rangeKey = 'crc32'
                }

                return (
                  <span
                    key={idx}
                    onMouseEnter={() => setHoveredRange(rangeKey)}
                    onMouseLeave={() => setHoveredRange(null)}
                    className={`px-1 py-0.5 rounded cursor-pointer transition-all ${colorClass} ${
                      hoveredRange === rangeKey ? 'ring-1 ring-white/60 scale-105' : ''
                    }`}
                  >
                    {byte.toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Byte Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold">Byte 00</span>
              <p className="text-[11px] text-slate-400 mt-1">Version Header (0x02)</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold">Bytes 01..32</span>
              <p className="text-[11px] text-slate-400 mt-1">Ed25519 Onion Public Key</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-violet-500/30">
              <span className="text-violet-400 font-bold">Bytes 33..64</span>
              <p className="text-[11px] text-slate-400 mt-1">X25519 Stealth Client-Auth</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-amber-500/30">
              <span className="text-amber-400 font-bold">Bytes 65..80</span>
              <p className="text-[11px] text-slate-400 mt-1">SHA3-256 Bundle Commitment</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-blue-500/30">
              <span className="text-blue-400 font-bold">Bytes 81..88</span>
              <p className="text-[11px] text-slate-400 mt-1">64-bit Short Auth String (SAS)</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-700/30">
              <span className="text-slate-400 font-bold">Bytes 89..92</span>
              <p className="text-[11px] text-slate-400 mt-1">Reserved Flag Extensions</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-emerald-500/30 col-span-2">
              <span className="text-emerald-400 font-bold">Bytes 93..96</span>
              <p className="text-[11px] text-slate-400 mt-1">
                IEEE 802.3 CRC32 Checksum (Polynomial: 0xEDB88320)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- LAB 2: HPAD TOR CELL QUANTIZATION SIMULATOR --- */}
      {activeTab === 'cell-quant' && (
        <div className="rounded-3xl bg-slate-900/85 border border-slate-800 p-8 backdrop-blur-xl reveal show">
          <div className="pb-6 border-b border-slate-800 mb-6">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
              TRAFFIC ANALYSIS DEFENSE // 514-BYTE HPAD FRAMING
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
              Link Cell Quantization &amp; Dummy Entropy Padding
            </h3>
            <p className="text-sm text-slate-300">
              Every message payload is sliced into strict 498-byte chunks, wrapped with a 16-byte HMAC authentication header, and padded with cryptographic entropy to exactly 514 bytes.
              To an outside ISP observer, all traffic is identical in size.
            </p>
          </div>

          {/* Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between font-mono text-xs mb-3">
              <span className="text-slate-300">ADJUST PAYLOAD SIZE:</span>
              <span className="text-emerald-400 font-bold text-base">{payloadSize} BYTES</span>
            </div>
            <input
              type="range"
              min="10"
              max="1500"
              step="10"
              value={payloadSize}
              onChange={(e) => setPayloadSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>10 Bytes (Short Chat)</span>
              <span>498 Bytes (1 Cell Boundary)</span>
              <span>996 Bytes (2 Cell Boundary)</span>
              <span>1500 Bytes (3 Cells)</span>
            </div>
          </div>

          {/* Quantization Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TOTAL CELLS GENERATED</span>
              <span className="text-emerald-400 font-bold text-xl mt-1 block">
                {cellStats.totalCells} Cells
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TOTAL WIRE TRANSMISSION</span>
              <span className="text-cyan-400 font-bold text-xl mt-1 block">
                {cellStats.totalWireBytes} Bytes ({cellStats.totalCells} × 514B)
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">DUMMY NOISE PADDING</span>
              <span className="text-violet-400 font-bold text-xl mt-1 block">
                {cellStats.totalPaddingBytes} Bytes
              </span>
            </div>
          </div>

          {/* Visual Cell Stacks */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400">
              TOR LINK CELL FRAMES ON WIRE (EXACT 514 BYTES EACH):
            </div>
            {cellStats.cells.map((cell) => {
              const payloadPct = (cell.payload / 514) * 100
              const headerPct = (cell.header / 514) * 100
              const padPct = (cell.padding / 514) * 100

              return (
                <div key={cell.index} className="p-4 rounded-2xl bg-black/60 border border-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-white font-bold">CELL #{cell.index} // 514B FIXED</span>
                    <span className="text-slate-400">
                      Payload: {cell.payload}B | Padding: {cell.padding}B
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-8 rounded-xl bg-slate-950 overflow-hidden flex border border-slate-700/50">
                    {/* Header */}
                    <div
                      style={{ width: `${headerPct}%` }}
                      className="bg-blue-600 h-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                      title="16B HMAC Auth Header"
                    >
                      AUTH
                    </div>
                    {/* Payload */}
                    <div
                      style={{ width: `${payloadPct}%` }}
                      className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-mono text-black font-bold"
                      title={`${cell.payload}B Useful Payload`}
                    >
                      PAYLOAD ({cell.payload}B)
                    </div>
                    {/* Padding */}
                    {cell.padding > 0 && (
                      <div
                        style={{ width: `${padPct}%` }}
                        className="bg-slate-800 h-full flex items-center justify-center text-[10px] font-mono text-slate-400 border-l border-slate-700/60"
                        title={`${cell.padding}B CSPRNG Dummy Noise`}
                      >
                        ENTROPY PAD ({cell.padding}B)
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* --- LAB 3: MULTI-CIRCUIT FOUNTAIN SIMULATOR --- */}
      {activeTab === 'fountain' && (
        <div className="rounded-3xl bg-slate-900/85 border border-slate-800 p-8 backdrop-blur-xl reveal show">
          <div className="pb-6 border-b border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                RATELess ERASURE CODING // MULTI-PATH CTP
              </span>
              <h3 className="text-xl font-bold text-white mb-1">
                Rateless Fountain Streaming Across 3 Tor Rendezvous Circuits
              </h3>
              <p className="text-sm text-slate-300">
                Transforms payload into rateless droplets striped across Circuits Alpha, Beta, and Gamma.
                Receiver decodes the entire file as soon as K + ε droplets arrive, completely ignoring circuit flaps and packet loss!
              </p>
            </div>
            <button
              type="button"
              disabled={isSimulating}
              onClick={runFountainSimulation}
              className={`btn primary text-xs font-mono ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSimulating ? 'TRANSMITTING STREAM...' : '▶ STREAM 2.5 MB OVER TOR'}
            </button>
          </div>

          {/* Loss Rate Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between font-mono text-xs mb-2">
              <span className="text-slate-300">SIMULATED CIRCUIT PACKET LOSS RATE:</span>
              <span className="text-rose-400 font-bold">{lossRate}% LOSS</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={lossRate}
              disabled={isSimulating}
              onChange={(e) => setLossRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Decoder Progress Bar */}
          <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 mb-6">
            <div className="flex justify-between items-center font-mono text-xs mb-2">
              <span className="text-slate-300">FOUNTAIN SOLITON DECODER STATUS:</span>
              <span className="text-emerald-400 font-bold text-sm">{fountainProgress}% COMPLETE</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-violet-500 transition-all duration-150"
                style={{ width: `${fountainProgress}%` }}
              />
            </div>
          </div>

          {/* Droplet Activity Grid */}
          <div className="space-y-2">
            <div className="font-mono text-xs text-slate-400">
              LIVE DROPLETS ON 3 PARALLEL TOR RENDEZVOUS CIRCUITS:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {droplets.map((d) => (
                <div
                  key={d.id}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    d.dropped
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-400 line-through'
                      : 'bg-slate-900/80 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Circuit {d.circuit}</div>
                  <div className="font-bold mt-0.5">
                    {d.dropped ? 'DROPPED ✕' : `DROPLET #${d.id} ✓`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- LAB 4: MASKEDMEMORY RAM GUARD --- */}
      {activeTab === 'masked-ram' && (
        <div className="rounded-3xl bg-slate-900/85 border border-slate-800 p-8 backdrop-blur-xl reveal show">
          <div className="pb-6 border-b border-slate-800 mb-6">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
              ANTI-FORENSICS &amp; COLD-BOOT DEFENSE // MaskedMemory
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
              Ephemeral XOR Entropy Masking in Heap Memory
            </h3>
            <p className="text-sm text-slate-300">
              To defend against physical cold-boot attacks and malware memory scraping, Aura stores secrets in RAM as M = P ⊕ K_pad.
              An attacker dumping RAM sees only high-entropy pseudorandom noise. Secrets are only unmasked in CPU registers.
            </p>
          </div>

          {/* Interactive Plaintext Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between font-mono text-xs mb-2">
              <span className="text-slate-300">SECRET PAYLOAD (TEST STRING):</span>
              <button
                type="button"
                onClick={() => setRamMaskSeed((s) => s + 1)}
                className="text-emerald-400 hover:text-emerald-300 text-xs"
              >
                ⟳ RE-ROLL XOR ONE-TIME PAD
              </button>
            </div>
            <input
              type="text"
              value={plaintextKey}
              onChange={(e) => setPlaintextKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 font-mono text-sm text-slate-100 focus:outline-none"
            />
          </div>

          {/* Side by Side Hex Dump Comparison */}
          <div className="space-y-4 font-mono text-xs">
            {/* Step 1: Plaintext */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block mb-1">
                1. PLAINTEXT SECRET IN CPU REGISTER (P)
              </span>
              <div className="text-cyan-400 break-all select-all">
                {maskedMemoryData.plaintextHex}
              </div>
            </div>

            {/* Step 2: Ephemeral XOR Pad */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block mb-1">
                2. EPHEMERAL RANDOM XOR ENTROPY PAD (K_pad)
              </span>
              <div className="text-violet-400 break-all select-all">
                {maskedMemoryData.maskHex}
              </div>
            </div>

            {/* Step 3: What Attacker Sees in RAM Dump */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-rose-400 text-[10px] uppercase font-bold">
                  3. WHAT ATTACKER SCRAPES IN PHYSICAL RAM DUMP (M = P ⊕ K_pad)
                </span>
                <span className="text-rose-400 text-[10px]">ZERO KEYS EXPOSED</span>
              </div>
              <div className="text-rose-300 break-all select-all font-bold">
                {maskedMemoryData.ramDumpHex}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
