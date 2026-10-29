import React, { useState, useEffect } from 'react'
import BootLoader from './components/BootLoader'
import AmbientLayers from './components/AmbientLayers'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import CommandDeck from './components/CommandDeck'
import Hero from './components/Hero'
import AllianceBanner from './components/AllianceBanner'
import FlawsAndFixesSection from './components/FlawsAndFixesSection'
import ArchitecturalPillars from './components/ArchitecturalPillars'
import ProtocolLab from './components/ProtocolLab'
import ThreatModelMatrix from './components/ThreatModelMatrix'
import DeveloperSdk from './components/DeveloperSdk'
import FaultyTerminalCard from './components/FaultyTerminalCard'
import Footer from './components/Footer'

export default function App() {
  const [isCommandDeckOpen, setIsCommandDeckOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  // Intersection Observer for .reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-black relative">
      {/* 1. Aura Enclave Boot Loader */}
      <BootLoader />

      {/* 2. Ambient Visual Layers (Grid, Noise, Floating Orbs, Mouse Glow) */}
      <AmbientLayers />

      {/* 3. Fluid Custom Cursor */}
      <CustomCursor />

      {/* 4. Full-Screen Command Deck Overlay (Ctrl + K) */}
      <CommandDeck
        isOpen={isCommandDeckOpen}
        onClose={() => setIsCommandDeckOpen(false)}
      />

      {/* 5. Floating Frosted Glass Navbar */}
      <Navbar onOpenCommandDeck={() => setIsCommandDeckOpen(true)} />

      {/* 6. Main Interactive Showcase Content */}
      <main className="px-4 sm:px-6 md:px-8">
        {/* Hero Section with Tor OnionFibers 3D WebGL2 Shader */}
        <Hero onNotify={showToast} />

        {/* Section 00: Industrial Cryptographic Foundation */}
        <AllianceBanner />

        {/* Section 01: Vulnerabilities in Traditional Networks vs Aura Fixes */}
        <FlawsAndFixesSection />

        {/* Section 02: 4 Core Architectural Pillars with 3D Flip Security Plates */}
        <ArchitecturalPillars />

        {/* Section 03: The Interactive Cryptographic Protocol Laboratories */}
        <ProtocolLab onNotify={showToast} />

        {/* Section 04: Formal Threat Model Matrix (ADV-1 through ADV-6) */}
        <ThreatModelMatrix />

        {/* Section 05: Headless Aura Architecture & Developer SDK Hub */}
        <DeveloperSdk onNotify={showToast} />

        {/* Section 06: Terminal Diagnostic Console with FaultyTerminal Matrix Shader */}
        <FaultyTerminalCard />
      </main>

      {/* 7. Footer with Links & Cyber Toast Alert */}
      <Footer toastMessage={toastMessage} />
    </div>
  )
}
