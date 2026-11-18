import React, { useState, useEffect, useRef } from 'react'
import { ChallengeItem } from '../types'
import { CHALLENGES } from '../data/challenges'
import { soundManager } from '../utils/audio'
import { Dices, Sparkles, X, ArrowRight, Video, Camera } from 'lucide-react'

interface ChallengeWheelModalProps {
  playerName: string
  onSelectChallenge: (challenge: ChallengeItem) => void
  onClose: () => void
}

export const ChallengeWheelModal: React.FC<ChallengeWheelModalProps> = ({
  playerName,
  onSelectChallenge,
  onClose
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [rotation, setRotation] = useState<number>(0)
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null)
  const [hasLanded, setHasLanded] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const numItems = CHALLENGES.length
  const arcAngle = (2 * Math.PI) / numItems

  // Màu sắc các lát cắt của vòng quay thử thách
  const sliceColors = [
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#F97316'  // Orange
  ]

  // Vẽ Canvas Vòng Quay Thử Thách
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 12

    ctx.clearRect(0, 0, size, size)

    // Vẽ từng lát cắt
    CHALLENGES.forEach((challenge, index) => {
      const angle = index * arcAngle
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, angle, angle + arcAngle)
      ctx.closePath()

      // Gradient màu cho từng lát
      const grad = ctx.createRadialGradient(center, center, 20, center, center, radius)
      grad.addColorStop(0, sliceColors[index % sliceColors.length])
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fill()

      // Viền lát cắt
      ctx.strokeStyle = '#FDE68A'
      ctx.lineWidth = 2
      ctx.stroke()

      // Vẽ Icon & Tên Thử thách
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(angle + arcAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 4

      // Rút gọn text nếu quá dài
      const shortTitle =
        challenge.title.length > 16
          ? challenge.title.slice(0, 15) + '...'
          : challenge.title

      ctx.fillText(`${challenge.icon} ${shortTitle}`, radius - 20, 5)
      ctx.restore()
    })

    // Vẽ viền tròn ngoài ánh kim
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 6
    ctx.stroke()

    // Vẽ tâm vòng quay
    ctx.beginPath()
    ctx.arc(center, center, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#0f172a'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#FDE68A'
    ctx.stroke()

    // Chữ trung tâm
    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('19/11', center, center)
  }, [arcAngle])

  // Xử lý Quay Thử Thách Ngẫu Nhiên
  const handleSpinChallenge = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setHasLanded(false)
    setSelectedChallenge(null)

    // Chọn ngẫu nhiên 1 trong 7 thử thách
    const targetIndex = Math.floor(Math.random() * numItems)
    const picked = CHALLENGES[targetIndex]

    // Tính góc quay (quay tối thiểu 5 vòng = 1800 độ + góc tới lát cắt)
    const segmentDegree = 360 / numItems
    // Kim chỉ ở vị trí 270 độ (đỉnh trên)
    const targetDegree = 270 - (targetIndex * segmentDegree + segmentDegree / 2)
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360
    const finalRotation = rotation + extraRounds + (targetDegree - (rotation % 360))

    setRotation(finalRotation)

    // Âm thanh quay cạch cạch
    let ticks = 0
    const tickInterval = setInterval(() => {
      soundManager.playTick()
      ticks++
      if (ticks > 25) clearInterval(tickInterval)
    }, 150)

    // Kết thúc vòng quay sau 4 giây
    setTimeout(() => {
      clearInterval(tickInterval)
      setIsSpinning(false)
      setSelectedChallenge(picked)
      setHasLanded(true)
      soundManager.playWin()
    }, 4200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (!isSpinning && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border-2 border-gold-500/80 rounded-3xl p-6 sm:p-7 text-center shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden">
        {/* Nút đóng */}
        {!isSpinning && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Tiêu đề Modal */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-black uppercase tracking-widest mb-3">
          <Dices className="w-4 h-4 text-gold-400" />
          BƯỚC 1: BỐC THỬ THÁCH NAM THẦN
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          VÒNG QUAY THỬ THÁCH 19/11
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
          Nam thần <strong className="text-gold-400">{playerName}</strong> hãy nhấn nút quay để chọn nhiệm vụ mở khóa chiếc chìa khóa may mắn!
        </p>

        {/* Khung Vòng Quay Canvas */}
        <div className="relative my-6 flex justify-center items-center">
          {/* Kim chỉ ở đỉnh trên */}
          <div className="absolute -top-3 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-gold-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
            <div className="w-3 h-3 rounded-full bg-gold-300 -mt-5 shadow" />
          </div>

          {/* Vòng quay Canvas xoay theo state rotation */}
          <div
            className="transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="w-72 h-72 sm:w-80 sm:h-80 drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]"
            />
          </div>
        </div>

        {/* Thẻ Kết Quả Thử Thách Trúng */}
        {hasLanded && selectedChallenge ? (
          <div className="bg-slate-900 border-2 border-gold-400/80 rounded-2xl p-4 sm:p-5 mb-4 shadow-xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl">{selectedChallenge.icon}</span>
              <span className="text-base sm:text-lg font-black text-gold-400">
                {selectedChallenge.title}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2 bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {selectedChallenge.mediaType === 'video' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>Yêu cầu: Quay Video có tiếng</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Yêu cầu: Chụp Ảnh Selfie</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              👉 {selectedChallenge.instruction}
            </p>

            {selectedChallenge.hint && (
              <p className="text-[11px] text-amber-300/80 italic mt-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                💡 {selectedChallenge.hint}
              </p>
            )}

            <button
              type="button"
              onClick={() => onSelectChallenge(selectedChallenge)}
              className="mt-4 w-full py-3 px-5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>VÀO THỰC HIỆN NHIỆM VỤ NGAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleSpinChallenge}
              disabled={isSpinning}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.35)] transform active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSpinning ? 'ĐANG BỐC THỬ THÁCH...' : 'QUAY THỬ THÁCH NGAY'}</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Hoàn thành thử thách để mở khóa nút Quay Vòng May Mắn!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
