import React, { useEffect } from 'react'
import { Prize, Member } from '../types'
import { Trophy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { soundManager } from '../utils/audio'

interface WinnerModalProps {
  member: Member
  prize: Prize
  onClose: () => void
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  member,
  prize,
  onClose
}) => {
  useEffect(() => {
    // Phát âm thanh chiến thắng
    soundManager.playWin()

    // Bắn pháo hoa Confetti liên hoàn
    const end = Date.now() + 2500
    const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6']

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border-2 border-gold-500/80 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Họa tiết ánh sáng vàng nền */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4">
          <Trophy className="w-4 h-4 text-gold-400" />
          KẾT QUẢ VÒNG QUAY 19/11
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-200 mb-1">
          CHÚC MỪNG NAM THẦN
        </h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-gold-400 mb-6 drop-shadow">
          {member.name}
        </p>

        {/* Box giải thưởng */}
        <div className="relative bg-slate-900/90 border border-gold-500/50 rounded-xl p-5 mb-6 shadow-inner">
          <div className="text-6xl sm:text-7xl mb-3 animate-bounce-subtle">
            {prize.icon}
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {prize.name}
          </h4>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            {prize.description}
          </p>

          {/* Lời nhắn Troll độc quyền */}
          {prize.trollMessage && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs sm:text-sm text-amber-300 font-semibold bg-amber-950/40 p-2.5 rounded-lg border border-amber-600/30">
              {prize.trollMessage}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl font-black text-base text-slate-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          XÁC NHẬN NHẬN QUÀ & LƯU LỊCH SỬ
        </button>
      </div>
    </div>
  )
}
