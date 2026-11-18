import React from 'react'
import { AlertTriangle, AlertCircle, HelpCircle, X, Check } from 'lucide-react'

export interface ConfirmModalConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmModalProps {
  config: ConfirmModalConfig | null
  onClose: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ config, onClose }) => {
  if (!config) return null

  const {
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    type = 'warning',
    onConfirm,
    onCancel
  } = config

  const handleCancel = () => {
    if (onCancel) onCancel()
    onClose()
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          iconBg: 'bg-red-950/80 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          borderColor: 'border-red-500/70',
          btnBg: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-950'
        }
      case 'info':
        return {
          icon: <HelpCircle className="w-6 h-6 text-gold-400" />,
          iconBg: 'bg-gold-950/80 border-gold-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          borderColor: 'border-gold-500/70',
          btnBg: 'bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950'
        }
      case 'warning':
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
          iconBg: 'bg-amber-950/80 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          borderColor: 'border-amber-500/70',
          btnBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950'
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel()
      }}
    >
      <div
        className={`relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 ${theme.borderColor} rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Nút X đóng */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon nổi bật */}
        <div
          className={`mx-auto w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${theme.iconBg}`}
        >
          {theme.icon}
        </div>

        {/* Tiêu đề & Thông điệp */}
        <h3 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 px-2">
          {message}
        </p>

        {/* Hành động */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${theme.btnBg}`}
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
