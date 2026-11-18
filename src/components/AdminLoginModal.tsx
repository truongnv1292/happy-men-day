import React, { useState } from 'react'
import { ADMIN_CONFIG } from '../config/admin'
import { Lock, KeyRound, User, X, Eye, EyeOff } from 'lucide-react'

interface AdminLoginModalProps {
  onLoginSuccess: () => void
  onClose: () => void
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onLoginSuccess,
  onClose
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      username.trim() === ADMIN_CONFIG.username &&
      password === ADMIN_CONFIG.password
    ) {
      setErrorMsg('')
      onLoginSuccess()
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Nút X đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">
              ĐĂNG NHẬP ADMIN
            </h3>
            <p className="text-xs text-slate-400">
              Vui lòng xác thực quyền quản trị
            </p>
          </div>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold bg-red-950/40 p-2 rounded-lg border border-red-900/60">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-gold-500 hover:bg-gold-400 text-slate-950 transition shadow-lg shadow-gold-500/20"
          >
            ĐĂNG NHẬP
          </button>
        </form>
      </div>
    </div>
  )
}
