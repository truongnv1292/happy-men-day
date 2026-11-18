import React, { useEffect } from 'react'
import { Prize, Member } from '../types'
import { Trophy, X, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { soundManager } from '../utils/audio'

interface WinnerModalProps {
  member: Member
  prize: Prize
  photoUrl?: string
  onClose: () => void
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  member,
  prize,
  photoUrl,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border-2 border-gold-500/80 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Nút X đóng góc trên */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

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
        <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-gold-400 mb-3 drop-shadow">
          {member.name}
        </p>

        {/* Khung ảnh selfie bằng chứng */}
        {photoUrl && (
          <div className="mb-4 flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-gold-500 via-amber-300 to-amber-600 shadow-xl">
              <img
                src={photoUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-full border-2 border-slate-900"
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-950 text-sm p-1 rounded-full border border-gold-500 shadow">
                📸
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold mt-1 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
              Khoảnh khắc chiến thắng (Bằng chứng chống quay hộ)
            </span>
          </div>
        )}

        {/* Box giải thưởng */}
        <div className="relative bg-slate-900/90 border border-gold-500/50 rounded-xl p-5 mb-5 shadow-inner">
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

        {/* Thông báo đã tự động ghi nhận */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold mb-5 bg-emerald-950/40 border border-emerald-800/40 py-2 px-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Kết quả đã được tự động lưu vào Bảng Vàng vinh danh!</span>
        </div>

        {/* Nút đóng đơn giản */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Đóng
        </button>
      </div>
    </div>
  )
}
