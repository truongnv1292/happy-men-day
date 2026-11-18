import React, { useState, useEffect } from 'react'
import { SpinRecord } from '../types'
import { getMediaObjectUrl } from '../utils/indexedDbStorage'
import {
  Trophy,
  X,
  Download,
  Calendar,
  Sparkles,
  Video
} from 'lucide-react'

interface MemberDetailModalProps {
  record: SpinRecord
  onClose: () => void
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  record,
  onClose
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(record.videoUrl || null)
  const [photoSrc] = useState<string | null>(record.photoUrl || null)

  // Nếu link là IndexedDB key, thử lấy Object URL
  useEffect(() => {
    let active = true

    const loadLocalMedia = async () => {
      if (!record.videoUrl && record.mediaStorageKey) {
        const url = await getMediaObjectUrl(record.mediaStorageKey)
        if (active && url) setVideoSrc(url)
      }
    }

    loadLocalMedia()
    return () => {
      active = false
    }
  }, [record.videoUrl, record.mediaStorageKey])

  // Tải video về máy
  const handleDownloadVideo = () => {
    if (!videoSrc) return
    const a = document.createElement('a')
    a.href = videoSrc
    a.download = `Challenge_${record.memberName}_19-11.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Tải ảnh về máy
  const handleDownloadPhoto = () => {
    if (!photoSrc) return
    const a = document.createElement('a')
    a.href = photoSrc
    a.download = `Selfie_${record.memberName}_19-11.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border-2 border-gold-500/80 rounded-3xl p-5 sm:p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-black uppercase tracking-wider mx-auto mb-2">
          <Trophy className="w-4 h-4 text-gold-400" />
          HỒ SƠ BẰNG CHỨNG 19/11
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-gold-400">
          {record.memberName}
        </h3>

        {/* Quà đã nhận */}
        <div className="my-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-3xl">{record.prizeIcon}</span>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Chiến lợi phẩm:</div>
              <div className="text-sm font-black text-gold-400">{record.prizeName}</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold-500" />
            <span>{record.spunAt}</span>
          </div>
        </div>

        {/* Thông tin thử thách */}
        {record.challengeTitle && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gold-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Thử thách đã làm: {record.challengeTitle}</span>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-900 text-gold-400 border border-gold-500/30">
              {record.mediaType === 'video' ? '🎥 Video' : '📸 Selfie'}
            </span>
          </div>
        )}

        {/* KHUNG VIDEO HOẶC ẢNH BẰNG CHỨNG */}
        <div className="relative flex-1 min-h-[250px] sm:min-h-[300px] rounded-2xl overflow-hidden bg-black border-2 border-slate-800 flex items-center justify-center my-1 shadow-inner">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              playsInline
              className="w-full h-full max-h-[360px] object-contain"
            />
          ) : photoSrc ? (
            <img
              src={photoSrc}
              alt={record.memberName}
              className="w-full h-full max-h-[360px] object-contain"
            />
          ) : (
            <div className="text-slate-500 text-xs flex flex-col items-center">
              <Video className="w-8 h-8 mb-1 text-slate-600" />
              <span>Chưa có video hoặc ảnh lưu trữ</span>
            </div>
          )}
        </div>

        {/* Nút Tải Về Máy */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2">
          {videoSrc && (
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-gold-500 hover:brightness-110 text-slate-950 transition flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Tải Video Thử Thách (.webm)</span>
            </button>
          )}

          {photoSrc && !videoSrc && (
            <button
              type="button"
              onClick={handleDownloadPhoto}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-gold-500 hover:brightness-110 text-slate-950 transition flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Selfie (.jpg)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
