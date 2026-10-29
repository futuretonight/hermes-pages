import React, { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onPointerMove = (e) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const interactiveSelectors = 'a, button, .btn, .card, .person, [data-flip-card], input, select'
    const handleMouseOver = (e) => {
      const target = e.target.closest(interactiveSelectors)
      if (target) {
        cursor.style.width = '38px'
        cursor.style.height = '38px'
        cursor.style.borderColor = 'rgba(16, 185, 129, 0.95)'
        cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.12)'
      }
    }

    const handleMouseOut = (e) => {
      const target = e.target.closest(interactiveSelectors)
      if (target) {
        cursor.style.width = '22px'
        cursor.style.height = '22px'
        cursor.style.borderColor = 'rgba(16, 185, 129, 0.75)'
        cursor.style.backgroundColor = 'transparent'
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return <div ref={cursorRef} className="cursor" aria-hidden="true" />
}
