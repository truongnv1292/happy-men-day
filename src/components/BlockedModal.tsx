import React, { useEffect, useState } from 'react'
import { Member, SpinRecord } from '../types'
import { ShieldAlert, AlertTriangle, X } from 'lucide-react'
import { soundManager } from '../utils/audio'

interface BlockedModalProps {
  member: Member
  record: SpinRecord
  onClose: () => void
}

const TROLL_QUOTES = [
  'Ơ kìa người anh em! ✋ Cảnh sát 19/11 bắt tại trận tính ăn gian nha! Tham lam thế này thì chị em phụ nữ 8/3 cũng phải bái làm sư phụ! 😂',
  'Định làm cú đúp ẵm 2 phần quà hả sếp? Nhường cơ hội cho các đồng râm khác đi, quà về tay rồi thì về chỗ rung đùi xem Youtube đi anh!',
  'Bản lĩnh đàn ông là biết dừng lại đúng lúc! Tham bát bỏ mâm là bị cả công ty bắt khao trà sữa full topping đấy nha!',
  'Hệ thống AI vừa quét được: Mức độ "tham lam vô đáy" của anh đã vượt quá ngưỡng chịu tải của máy chủ! Còi hú inh ỏi rồi té lẹ đi sếp ơi! 🚨',
  'Alo công an phường hả? Ở đây có một nam thần tính cuỗm 2 phần quà của anh em! Về chỗ ngay kẻo bị ban tổ chức tịch thu luôn quà cũ giờ! 🚔',
  'Thôi thôi anh trai ơi! Mặt dày thế này thì kem chống nắng xịn nhất thế giới cũng không che nổi đâu! Mỗi người 1 lượt, luật làng bất biến nha! 😜'
]

export const BlockedModal: React.FC<BlockedModalProps> = ({
  member,
  record,
  onClose
}) => {
  const [quote] = useState(() => {
    return TROLL_QUOTES[Math.floor(Math.random() * TROLL_QUOTES.length)]
  })

  useEffect(() => {
    soundManager.playSiren()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-2xl p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon cảnh sát */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-3xl mb-4 animate-bounce">
          🚨
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-700/60 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-4 h-4" />
          CẢNH SÁT 19/11 TUÝT CÒI BẮT TẠI TRẬN
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          Ơ KÌA NAM THẦN {member.name.toUpperCase()}!
        </h3>

        <p className="text-sm text-red-300 font-medium mb-4 italic px-2">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Thông tin quà đã nhận */}
        <div className="bg-slate-950/80 border border-red-900/60 rounded-xl p-4 mb-5 text-left">
          <div className="text-xs text-slate-400 uppercase font-semibold mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Chiến lợi phẩm anh đã rinh về trước đó:
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{record.prizeIcon}</span>
            <div>
              <div className="font-bold text-base text-gold-400">{record.prizeName}</div>
              <div className="text-xs text-slate-400">Thời gian nhận: {record.spunAt}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 transition shadow-lg shadow-red-900/50"
        >
          DẠ EM BIẾT RỒI, EM XIN CHỪA & NHƯỜNG ANH EM KHÁC! 🏃💨
        </button>
      </div>
    </div>
  )
}
