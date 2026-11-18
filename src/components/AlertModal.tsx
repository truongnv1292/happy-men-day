import React from 'react'
import { Sparkles, AlertCircle, CheckCircle2, X } from 'lucide-react'

export interface AlertModalConfig {
  title: string
  message: string
  buttonText?: string
  type?: 'warning' | 'info' | 'success'
  icon?: React.ReactNode
}

interface AlertModalProps {
  config: AlertModalConfig | null
  onClose: () => void
}

export const AlertModal: React.FC<AlertModalProps> = ({ config, onClose }) => {
  if (!config) return null

  const {
    title,
    message,
    buttonText = 'ĐÃ HIỂU',
    type = 'warning',
    icon
  } = config

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          defaultIcon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
          iconBg: 'bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]',
          borderColor: 'border-emerald-500/70',
          btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white'
        }
      case 'info':
        return {
          defaultIcon: <Sparkles className="w-7 h-7 text-gold-400" />,
          iconBg: 'bg-gold-950/80 border-gold-500/50 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
          borderColor: 'border-gold-500/70',
          btnBg: 'bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950'
        }
      case 'warning':
      default:
        return {
          defaultIcon: <AlertCircle className="w-7 h-7 text-amber-400" />,
          iconBg: 'bg-amber-950/80 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
          borderColor: 'border-gold-500/70',
          btnBg: 'bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 hover:from-gold-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-gold-500/20'
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 ${theme.borderColor} rounded-2xl p-6 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Nút X đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Họa tiết ánh sáng vàng nền */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon nổi bật */}
        <div
          className={`mx-auto w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${theme.iconBg}`}
        >
          {icon || theme.defaultIcon}
        </div>

        {/* Tiêu đề & Thông điệp */}
        <h3 className="text-xl font-black text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 px-3">
          {message}
        </p>

        {/* Nút đóng/xác nhận */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-6 rounded-xl font-black text-sm tracking-wide transition transform hover:scale-[1.02] active:scale-[0.98] ${theme.btnBg}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
