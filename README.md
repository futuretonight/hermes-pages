# Hermes & Aura Privacy Engine — Architecture & Technical Showcase

Interactive technical showcase and architectural reference for **Hermes** and the **Aura Privacy Engine**.

## 🚀 Key Modules & Interactive Features

- **The Flaws & How We Fixed Them:** Side-by-side interactive explorer covering directory scraping (HSDir), upstream bridge deadlocks (`tor-guardmgr`), packet size and timing profiling, transfer window choking (CTP), RAM key scraping (`MaskedMemory`), and message re-forwarding spoofing.
- **Hero & Live Node Telemetry:** Live simulated node status, canonical 97-byte Hermes ID copy, and key transport indicators.
- **Lift-and-Drop Modularity Explorer:** Architectural visualization showing how the decoupled `aura` Rust engine runs headless across desktop (`pgp-ui`), CLI, autonomous agents, and microservices with zero GUI dependencies.
- **Interactive Hermes ID Inspector:** Live deconstruction of the 97-byte binary layout (Version, Ed25519 Onion key, X25519 Client-Auth key, SHA3-256 Bundle Commitment, 64-bit SAS token, and CRC32 polynomial `0xEDB88320` validator).
- **Tor Link Cell Quantization Simulator:** Interactive slider dynamically demonstrating 514-byte cell-aligned HPAD framing ($n \times 498$ usable bytes) and Murmur continuous cover traffic.
- **CTP Multi-Circuit Mode & Flap Simulator:** Interactive side-by-side simulation comparing Standard, Turbo, and 4-cell Rateless Fountain erasure coding under circuit failure conditions.
- **AVLT v2 Vault & In-Memory Anti-Forensics:** 4-phase atomic commit pipeline (`.vault-tmp` -> `fsync` -> atomic rename) and `MaskedMemory` XOR one-time pad memory guard.
- **Formal Threat Model Matrix:** Filterable adversary classifications (ADV-1 to ADV-6) with guaranteed cryptographic invariants.
- **Developer Integration SDK Hub:** Runnable Rust code recipes for building serverless P2P receiver daemons, cell-aligned senders, and fountain transfers.

---

## 🛠️ Local Development

```bash
cd website
npm install
npm run dev
```

To test the production build:
```bash
npm run build
npm run preview
```
