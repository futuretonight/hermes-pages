import React, { useState, useEffect } from 'react'

export default function Navbar({ onOpenCommandDeck }) {
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['flaws-fixes', 'pillars', 'protocol-labs', 'threat-matrix', 'developer-sdk']
      const scrollPos = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i])
          return
        }
      }
      setActiveSection('hero')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="nav">
      <a className="brand" href="#hero">
        <div className="brand-logos">
          <img src="/shield.svg" alt="Hermes Shield" className="brand-shield" />
        </div>
        <div className="brand-title">
          <span className="brand-name">Hermes</span>
          <span className="brand-sub">AURA PRIVACY CORE</span>
        </div>
        <div className="partner-badge hidden sm:flex">
          <span className="partner-tag">ARTI TOR v3</span>
          <span className="partner-tag">SEQUOIA PGP</span>
        </div>
      </a>

      <div className="navlinks">
        <a href="#flaws-fixes" className={activeSection === 'flaws-fixes' ? 'active' : ''}>
          Flaws &amp; Fixes
        </a>
        <a href="#pillars" className={activeSection === 'pillars' ? 'active' : ''}>
          3D Pillars
        </a>
        <a href="#protocol-labs" className={activeSection === 'protocol-labs' ? 'active' : ''}>
          Protocol Labs
        </a>
        <a href="#threat-matrix" className={activeSection === 'threat-matrix' ? 'active' : ''}>
          Threat Matrix
        </a>
        <a href="#developer-sdk" className={activeSection === 'developer-sdk' ? 'active' : ''}>
          Rust SDK
        </a>
      </div>

      <div className="nav-right">
        <a className="navcta hidden md:inline-flex" href="#protocol-labs">
          LAUNCH LABS ↗
        </a>
        <button
          type="button"
          className="menu-btn"
          aria-label="Toggle Command Deck"
          onClick={() => onOpenCommandDeck(true)}
          title="Command Deck (Ctrl + K)"
        >
          ☰
        </button>
      </div>
    </nav>
  )
}
