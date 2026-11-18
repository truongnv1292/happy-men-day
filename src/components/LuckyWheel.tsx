import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Prize } from '../types'
import { soundManager } from '../utils/audio'

interface LuckyWheelProps {
  prizes: Prize[]
  mustSpin: boolean
  targetPrizeIndex: number | null
  onFinished: (prize: Prize) => void
  disabled?: boolean
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  prizes,
  mustSpin,
  targetPrizeIndex,
  onFinished,
  disabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [rotation, setRotation] = useState<number>(0)
  const isSpinningRef = useRef<boolean>(false)
  const animFrameRef = useRef<number | null>(null)
  const ledPhaseRef = useRef<number>(0)
  const lastTickAngleRef = useRef<number>(0)

  const numSlices = prizes.length
  const sliceAngle = (2 * Math.PI) / numSlices

  // Vẽ vòng quay lên canvas (Kích thước 750x750 siêu nét, chữ to rõ ràng)
  const drawWheel = useCallback((currentRotation: number, ledPhase: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 34

    ctx.clearRect(0, 0, width, height)

    // 1. Vẽ viền ngoài mạ vàng ánh kim (Outer Gold Rim)
    const rimGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius + 3,
      centerX,
      centerY,
      radius + 32
    )
    rimGradient.addColorStop(0, '#78350F')
    rimGradient.addColorStop(0.3, '#F59E0B')
    rimGradient.addColorStop(0.6, '#FEF3C7')
    rimGradient.addColorStop(0.8, '#D97706')
    rimGradient.addColorStop(1, '#451A03')

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 30, 0, 2 * Math.PI)
    ctx.fillStyle = rimGradient
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#B45309'
    ctx.stroke()

    // 2. Vẽ 28 đèn LED viền Casino nhấp nháy
    const numLeds = 28
    for (let i = 0; i < numLeds; i++) {
      const ledAngle = (i * 2 * Math.PI) / numLeds
      const lx = centerX + (radius + 16) * Math.cos(ledAngle)
      const ly = centerY + (radius + 16) * Math.sin(ledAngle)

      const isLit = (i + ledPhase) % 2 === 0
      ctx.beginPath()
      ctx.arc(lx, ly, 5.5, 0, 2 * Math.PI)
      ctx.fillStyle = isLit ? '#FFFFFF' : '#F59E0B'
      ctx.shadowColor = isLit ? '#FEF08A' : 'transparent'
      ctx.shadowBlur = isLit ? 10 : 0
      ctx.fill()
    }
    ctx.shadowBlur = 0 // reset shadow

    // 3. Vẽ các nan quạt
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(currentRotation)

    for (let i = 0; i < numSlices; i++) {
      const prize = prizes[i]
      const startAngle = i * sliceAngle
      const endAngle = startAngle + sliceAngle

      // Nan quạt
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()

      // Đường phân cách mạ vàng giữa các ô
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 3
      ctx.stroke()

      // Vẽ Icon & Text to rõ ràng (150% kích thước)
      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      // Icon to 34px
      ctx.font = '34px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
      ctx.fillText(prize.icon, radius - 24, 0)

      // Chữ giải thưởng to 18px đậm, tương phản cao, dễ đọc từ xa
      ctx.fillStyle = prize.textColor
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.85)'
      ctx.shadowBlur = 6

      // Giữ tối đa 25 ký tự, toàn bộ giải thưởng đều hiển thị trọn vẹn
      let text = prize.name
      if (text.length > 25) {
        text = text.substring(0, 23) + '..'
      }
      ctx.fillText(text, radius - 70, 0)
      ctx.restore()
    }

    ctx.restore()

    // 4. Trục xoay tâm mạ vàng sang trọng (Center Cap to hơn)
    const centerGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      8,
      centerX,
      centerY,
      56
    )
    centerGradient.addColorStop(0, '#FFFBEB')
    centerGradient.addColorStop(0.4, '#FBBF24')
    centerGradient.addColorStop(0.8, '#D97706')
    centerGradient.addColorStop(1, '#78350F')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 52, 0, 2 * Math.PI)
    ctx.fillStyle = centerGradient
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#FFFFFF'
    ctx.stroke()

    // Icon vương miện / quý ông ở tâm
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎩', centerX, centerY)
  }, [prizes, numSlices, sliceAngle])

  // Vẽ ban đầu
  useEffect(() => {
    drawWheel(rotation, ledPhaseRef.current)
  }, [drawWheel, rotation])

  // Xử lý hiệu ứng quay khi mustSpin = true
  useEffect(() => {
    if (!mustSpin || targetPrizeIndex === null || isSpinningRef.current) return

    isSpinningRef.current = true
    const duration = 6500 // 6.5 giây hồi hộp kịch tính
    const startTime = performance.now()
    const startRotation = rotation

    // Tính toán góc đích
    const targetOffset = 1.5 * Math.PI - (targetPrizeIndex + 0.5) * sliceAngle
    const extraRounds = 7 * 2 * Math.PI // Quay tối thiểu 7 vòng

    const currentModulo = startRotation % (2 * Math.PI)
    let diff = targetOffset - currentModulo
    while (diff < 0) {
      diff += 2 * Math.PI
    }
    const totalRotationTarget = startRotation + extraRounds + diff

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    let lastLedToggle = 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      const currentAngle =
        startRotation + (totalRotationTarget - startRotation) * easedProgress
      setRotation(currentAngle)

      // Kiểm tra âm thanh tick
      const anglePerSlice = sliceAngle
      if (Math.abs(currentAngle - lastTickAngleRef.current) >= anglePerSlice) {
        soundManager.playTick()
        lastTickAngleRef.current = currentAngle
      }

      // Đổi phase LED nhấp nháy
      if (currentTime - lastLedToggle > 120) {
        ledPhaseRef.current = (ledPhaseRef.current + 1) % 2
        lastLedToggle = currentTime
      }

      drawWheel(currentAngle, ledPhaseRef.current)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        isSpinningRef.current = false
        onFinished(prizes[targetPrizeIndex])
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [mustSpin, targetPrizeIndex, prizes, sliceAngle, onFinished, drawWheel])

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* Kim chỉ mạ vàng phía đỉnh (Pointer Needle phóng to theo tỷ lệ) */}
      <div className="absolute -top-4 z-20 flex flex-col items-center filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]">
        <div className="w-11 h-14 relative">
          <svg viewBox="0 0 44 56" className="w-full h-full drop-shadow">
            <polygon
              points="22,54 6,12 38,12"
              fill="#EF4444"
              stroke="#F59E0B"
              strokeWidth="3.5"
            />
            <circle
              cx="22"
              cy="14"
              r="10"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            <circle cx="22" cy="14" r="4.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Vòng quay Canvas */}
      <div
        className={`relative p-2.5 sm:p-3.5 md:p-4 rounded-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 shadow-[0_0_60px_rgba(245,158,11,0.3)] border-4 border-gold-500/40 transition-all max-w-full flex items-center justify-center ${
          disabled ? 'opacity-90' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={750}
          height={750}
          className="w-full h-auto aspect-square max-w-[320px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[450px] xl:max-w-[530px] 2xl:max-w-[620px] block"
        />
      </div>
    </div>
  )
}
