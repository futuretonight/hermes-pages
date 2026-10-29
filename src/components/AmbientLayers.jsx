import React, { useEffect, useRef } from 'react'

export default function AmbientLayers() {
  const glowRef = useRef(null)

  useEffect(() => {
    let glowX = window.innerWidth / 2
    let glowY = window.innerHeight / 2
    let mouseX = glowX
    let mouseY = glowY
    let animId

    const handlePointerMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const loop = () => {
      glowX += (mouseX - glowX) * 0.08
      glowY += (mouseY - glowY) * 0.08
      if (glowRef.current) {
        glowRef.current.style.left = `${glowX}px`
        glowRef.current.style.top = `${glowY}px`
      }
      animId = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    animId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div className="grid" aria-hidden="true" />
      <div className="orb" aria-hidden="true" />
      <div className="orb orb2" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div ref={glowRef} className="mouse-glow" aria-hidden="true" />
    </>
  )
}
