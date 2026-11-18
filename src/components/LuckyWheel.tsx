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

  // Vẽ vòng quay lên canvas
  const drawWheel = useCallback((currentRotation: number, ledPhase: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 24

    ctx.clearRect(0, 0, width, height)

    // 1. Vẽ viền ngoài mạ vàng ánh kim (Outer Gold Rim)
    const rimGradient = ctx.createRadialGradient(centerX, centerY, radius + 2, centerX, centerY, radius + 22)
    rimGradient.addColorStop(0, '#78350F')
    rimGradient.addColorStop(0.3, '#F59E0B')
    rimGradient.addColorStop(0.6, '#FEF3C7')
    rimGradient.addColorStop(0.8, '#D97706')
    rimGradient.addColorStop(1, '#451A03')

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI)
    ctx.fillStyle = rimGradient
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#B45309'
    ctx.stroke()

    // 2. Vẽ 24 đèn LED viền Casino nhấp nháy
    const numLeds = 24
    for (let i = 0; i < numLeds; i++) {
      const ledAngle = (i * 2 * Math.PI) / numLeds
      const lx = centerX + (radius + 11) * Math.cos(ledAngle)
      const ly = centerY + (radius + 11) * Math.sin(ledAngle)

      const isLit = (i + ledPhase) % 2 === 0
      ctx.beginPath()
      ctx.arc(lx, ly, 4, 0, 2 * Math.PI)
      ctx.fillStyle = isLit ? '#FFFFFF' : '#F59E0B'
      ctx.shadowColor = isLit ? '#FEF08A' : 'transparent'
      ctx.shadowBlur = isLit ? 8 : 0
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
      ctx.lineWidth = 2
      ctx.stroke()

      // Vẽ Icon & Text
      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      // Icon
      ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
      ctx.fillText(prize.icon, radius - 18, 0)

      // Chữ giải thưởng
      ctx.fillStyle = prize.textColor
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 4
      
      // Cắt bớt nếu tên dài
      let text = prize.name
      if (text.length > 15) {
        text = text.substring(0, 13) + '..'
      }
      ctx.fillText(text, radius - 52, 0)
      ctx.restore()
    }

    ctx.restore()

    // 4. Trục xoay tâm mạ vàng sang trọng (Center Cap)
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 42)
    centerGradient.addColorStop(0, '#FFFBEB')
    centerGradient.addColorStop(0.4, '#FBBF24')
    centerGradient.addColorStop(0.8, '#D97706')
    centerGradient.addColorStop(1, '#78350F')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI)
    ctx.fillStyle = centerGradient
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#FFFFFF'
    ctx.stroke()

    // Icon vương miện / quý ông ở tâm
    ctx.font = '22px sans-serif'
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
    const duration = 6500 // 6.5 giây tạo cảm giác hồi hộp đỉnh cao
    const startTime = performance.now()
    const startRotation = rotation

    // Tính toán góc đích:
    // Kim chỉ nằm ở đỉnh (góc -Math.PI / 2 hay 3 * Math.PI / 2).
    // Ô trúng: targetPrizeIndex
    // Nan quạt i nằm từ i * sliceAngle đến (i+1)*sliceAngle.
    // Tâm của nan quạt = (i + 0.5) * sliceAngle.
    // Khi xoay một góc R, toạ độ mới của tâm ô là (i + 0.5)*sliceAngle + R.
    // Muốn tâm ô này trùng với kim ở đỉnh (3 * Math.PI / 2 tương đương 1.5 * Math.PI):
    // => (i + 0.5)*sliceAngle + R ≡ 1.5 * Math.PI (mod 2*Math.PI)
    // => R ≡ 1.5 * Math.PI - (i + 0.5)*sliceAngle (mod 2*Math.PI)
    
    const targetOffset = (1.5 * Math.PI) - ((targetPrizeIndex + 0.5) * sliceAngle)
    const extraRounds = 7 * 2 * Math.PI // Quay tối thiểu 7 vòng cho kịch tính

    // Đưa góc hiện tại về dạng chuẩn
    const currentModulo = startRotation % (2 * Math.PI)
    let diff = targetOffset - currentModulo
    while (diff < 0) {
      diff += 2 * Math.PI
    }
    const totalRotationTarget = startRotation + extraRounds + diff

    // Hiệu ứng easing mượt mà: easeOutQuart hoặc easeOutCubic
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    let lastLedToggle = 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      const currentAngle = startRotation + (totalRotationTarget - startRotation) * easedProgress
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
        // Dừng chính xác
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
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Kim chỉ mạ vàng phía đỉnh (Pointer Needle) */}
      <div className="absolute -top-3 z-20 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        <div className="w-8 h-10 relative">
          <svg viewBox="0 0 32 40" className="w-full h-full drop-shadow">
            <polygon
              points="16,38 4,8 28,8"
              fill="#EF4444"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
            <circle cx="16" cy="10" r="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="16" cy="10" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Vòng quay Canvas */}
      <div className={`relative p-3 rounded-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.25)] border-4 border-gold-500/40 transition-all ${disabled ? 'opacity-90' : ''}`}>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="max-w-full h-auto w-[340px] sm:w-[440px] md:w-[480px]"
        />
      </div>
    </div>
  )
}
