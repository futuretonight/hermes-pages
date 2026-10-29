import React from 'react'

export default function Footer({ toastMessage }) {
  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="flex items-center gap-3">
            <img src="/shield.svg" alt="Hermes Shield" className="w-7 h-7" />
            <span className="font-bold text-white text-sm">Hermes &amp; Aura Privacy Engine</span>
            <span className="text-slate-600">×</span>
            <span className="text-xs text-slate-400 font-mono">Arti Tor v3 + Sequoia OpenPGP</span>
          </div>

          <div className="footer-links font-mono text-xs">
            <a href="https://github.com/futuretonight/hermes" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <a href="https://tpo.pages.torproject.net/core/arti/" target="_blank" rel="noopener noreferrer">
              Arti Tor ↗
            </a>
            <a href="https://sequoia-pgp.org/" target="_blank" rel="noopener noreferrer">
              Sequoia PGP ↗
            </a>
            <a href="#hero">
              Back to Top ↑
            </a>
          </div>

          <div className="text-[11px] font-mono text-slate-600 w-full text-center sm:text-right sm:w-auto">
            © 2026 Hermes Project. Open-Source Software under MIT / Apache 2.0.
          </div>
        </div>
      </footer>

      {/* Cyber Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`} role="alert">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        <span>{toastMessage}</span>
      </div>
    </>
  )
}
