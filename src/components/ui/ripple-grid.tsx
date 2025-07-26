'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function RippleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let ripples: Array<{
      x: number
      y: number
      radius: number
      maxRadius: number
      alpha: number
    }> = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createRipple = (x: number, y: number) => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: 150,
        alpha: 0.5,
      })
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)' // Purple grid
      ctx.lineWidth = 1

      const gridSize = 50

      // Draw vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid
      drawGrid()

      // Update and draw ripples
      ripples = ripples.filter((ripple) => {
        ripple.radius += 2
        ripple.alpha -= 0.01

        if (ripple.alpha <= 0) return false

        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139, 92, 246, ${ripple.alpha})`
        ctx.lineWidth = 2
        ctx.stroke()

        // Inner circle
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(20, 184, 166, ${ripple.alpha * 0.7})`
        ctx.stroke()

        return true
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Auto-generate ripples
    const autoRipple = () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      createRipple(x, y)
    }

    const rippleInterval = setInterval(autoRipple, 2000)

    // Mouse move creates ripples
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.95) {
        createRipple(e.clientX, e.clientY)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(rippleInterval)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  )
}