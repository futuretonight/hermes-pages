import React, { useState } from 'react'

export default function DeveloperSdk({ onNotify }) {
  const [activeCodeTab, setActiveCodeTab] = useState('daemon')

  const codeSnippets = {
    daemon: {
      title: 'Headless P2P Onion Daemon (Rust)',
      desc: 'Initializes embedded Arti Tor client and listens for peer rendezvous messages without any GUI.',
      code: `use aura_core::{AuraNode, Identity, Result};
use tokio::signal;

#[tokio::main]
async fn main() -> Result<()> {
    // Load or generate 97-byte Hermes Identity
    let identity = Identity::load_or_generate("~/.hermes/vault.db", "passphrase")?;
    println!("Node initialized with Hermes ID: {}", identity.hermes_id_hex());
    println!("Onion Service Address: {}", identity.onion_address());

    // Boot headless Arti Tor engine (in-process)
    let mut node = AuraNode::builder()
        .with_identity(identity)
        .with_cell_quantization(514) // Strict HPAD framing
        .with_murmur_cover_traffic(true) // Continuous Poisson cover jitter
        .build()
        .await?;

    println!("Tor consensus synchronized. Waiting for rendezvous handshakes...");

    // Event loop for inbound cell-aligned messages
    tokio::spawn(async move {
        while let Some(msg) = node.next_message().await {
            println!("Received 514B cell from [{}]: {}", msg.sender_onion, msg.payload_text()?);
        }
    });

    signal::ctrl_c().await?;
    println!("Enclave shutting down. Clearing volatile memory...");
    Ok(())
}`
    },
    sender: {
      title: '514-Byte Cell-Aligned HPAD Sender (Rust)',
      desc: 'Encrypts payload with Sequoia OpenPGP and slices into strict 514-byte link cells with dummy padding.',
      code: `use aura_core::transport::{HpadFramer, TorCircuit};
use aura_core::crypto::SequoiaEnclave;

pub async fn send_quantized_message(
    circuit: &TorCircuit,
    recipient_hermes_id: &str,
    plaintext: &[u8],
) -> Result<(), aura_core::Error> {
    // 1. Parse and validate recipient 97-byte Hermes ID
    let target = aura_core::Identity::parse_hermes_id(recipient_hermes_id)?;

    // 2. Encrypt plaintext using recipient Sequoia OpenPGP bundle
    let encrypted = SequoiaEnclave::encrypt_to_peer(&target.pgp_bundle, plaintext)?;

    // 3. Slice into strict 514-byte cells (n * 498 bytes payload + HMAC + padding)
    let cells = HpadFramer::quantize_into_cells(&encrypted)?;

    println!("Message of {} bytes packed into {} discrete 514-byte cells", plaintext.len(), cells.len());

    // 4. Dispatch over Tor rendezvous circuit with Poisson jitter
    for cell in cells {
        circuit.send_link_cell(&cell).await?;
        tokio::time::sleep(tokio::time::Duration::from_millis(35)).await;
    }

    Ok(())
}`
    },
    fountain: {
      title: 'Rateless Fountain Multi-Circuit Streaming (Rust)',
      desc: 'Streams multi-megabyte payloads across 3 independent Tor rendezvous paths simultaneously.',
      code: `use aura_core::transfer::{FountainEncoder, MultiCircuitPool};
use std::path::Path;

pub async fn stream_payload_multi_circuit(
    pool: &MultiCircuitPool,
    target_hermes_id: &str,
    file_path: &Path,
) -> Result<(), aura_core::Error> {
    let file_bytes = tokio::fs::read(file_path).await?;
    println!("Preparing rateless fountain stream for {} bytes...", file_bytes.len());

    // Initialize Luby Transform / Soliton degree distribution encoder
    let mut encoder = FountainEncoder::new(&file_bytes, 498)?; // 498B usable payload per droplet
    println!("Source chunks: {}. Generating infinite rateless droplets...", encoder.k_chunks());

    // Stripe droplets across 3 parallel Tor circuits (Alpha, Beta, Gamma)
    while !encoder.is_acknowledged() {
        let droplet = encoder.next_droplet();
        let circuit = pool.select_least_congested_circuit().await?;
        
        circuit.dispatch_droplet(droplet).await?;
    }

    println!("Peer decoded payload using K + epsilon droplets! Zero retransmission stalls.");
    Ok(())
}`
    },
    validator: {
      title: 'Hermes ID Validation & CRC32 (Rust)',
      desc: 'Deconstructs 97-byte binary buffer and validates IEEE 802.3 CRC32 polynomial (0xEDB88320).',
      code: `use crc32fast::Hasher;
use ed25519_dalek::VerifyingKey as EdPubkey;
use x25519_dalek::PublicKey as XPubkey;

pub struct HermesIdLayout {
    pub version: u8,
    pub onion_ed25519_pubkey: EdPubkey,
    pub stealth_client_auth_x25519: XPubkey,
    pub bundle_commitment_sha3: [u8; 16],
    pub sas_nonce: [u8; 8],
    pub crc32_checksum: u32,
}

impl HermesIdLayout {
    pub fn parse(raw: &[u8]) -> Result<Self, &'static str> {
        if raw.len() != 97 {
            return Err("Invalid Hermes ID length: must be exactly 97 bytes");
        }

        // Validate CRC32 of first 93 bytes
        let mut hasher = Hasher::new();
        hasher.update(&raw[0..93]);
        let computed_crc = hasher.finalize();

        let expected_crc = u32::from_be_bytes(raw[93..97].try_into().unwrap());
        if computed_crc != expected_crc {
            return Err("Hermes ID CRC32 verification failed (0xEDB88320 mismatch)");
        }

        Ok(Self {
            version: raw[0],
            onion_ed25519_pubkey: EdPubkey::from_bytes(&raw[1..33]).map_err(|_| "Bad Ed25519")?,
            stealth_client_auth_x25519: XPubkey::from(<[u8; 32]>::try_from(&raw[33..65]).unwrap()),
            bundle_commitment_sha3: raw[65..81].try_into().unwrap(),
            sas_nonce: raw[81..89].try_into().unwrap(),
            crc32_checksum: expected_crc,
        })
    }
}`
    }
  }

  const current = codeSnippets[activeCodeTab]

  return (
    <section id="developer-sdk" className="section">
      <div className="section-head reveal show">
        <div>
          <div className="kicker">05 / HEADLESS INTEGRATION &amp; RUST SDK</div>
          <h2>Decoupled Aura Core.<br /><span className="gradient">Embed in any environment.</span></h2>
        </div>
        <p>
          Aura is completely headless with zero GUI dependencies.
          Embed the Rust privacy core into background daemons, CLI utilities, autonomous agents, or high-assurance services.
        </p>
      </div>

      {/* Decoupled Architecture Diagram */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 mb-8 backdrop-blur-xl reveal show">
        <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-4">
          DECOUPLED ENGINE ARCHITECTURE // HEADLESS MULTI-TARGET CORE
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center font-mono text-xs">
          <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/40">
            <div className="text-2xl mb-2">🧅</div>
            <strong className="text-white block text-sm mb-1">Arti Tor Client</strong>
            <span className="text-slate-400 text-[11px]">Embedded In-Process v3 Onion Services</span>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40">
            <div className="text-2xl mb-2">🛡️</div>
            <strong className="text-white block text-sm mb-1">Sequoia OpenPGP</strong>
            <span className="text-slate-400 text-[11px]">Memory-Safe Keyring &amp; Message Crypto</span>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-violet-500/40">
            <div className="text-2xl mb-2">⚡</div>
            <strong className="text-white block text-sm mb-1">HPAD + CTP</strong>
            <span className="text-slate-400 text-[11px]">514B Link Cell Quantizer &amp; Fountain Codes</span>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/40">
            <div className="text-2xl mb-2">🔐</div>
            <strong className="text-white block text-sm mb-1">AVLT v2 Vault</strong>
            <span className="text-slate-400 text-[11px]">MaskedMemory XOR &amp; 4-Phase Atomic DB</span>
          </div>
        </div>

        <div className="my-4 text-center text-slate-500 font-mono text-xs">
          ↓ EXPORTS CLEAN ASYNC RUST CRATE API (`aura-core`) ↓
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
            Desktop UI (Tauri)
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
            Headless Daemon
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
            CLI Utility
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
            Autonomous Agent
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl reveal show">
        {/* Editor Tab Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'daemon', label: 'daemon.rs' },
              { id: 'sender', label: 'hpad_sender.rs' },
              { id: 'fountain', label: 'fountain_stream.rs' },
              { id: 'validator', label: 'hermes_id_crc.rs' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCodeTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  activeCodeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(current.code)
              onNotify?.(`Copied ${current.title} to clipboard!`)
            }}
            className="btn ghost text-xs font-mono py-1.5 px-3"
          >
            COPY RUST CODE ⎘
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-x-auto">
          <div className="text-xs font-mono text-slate-400 mb-4 pb-2 border-b border-slate-800/80">
            // {current.desc}
          </div>
          <pre className="font-mono text-xs text-slate-200 leading-relaxed">
            <code>{current.code}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
