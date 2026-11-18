import React, { useState } from 'react'
import { SpinRecord, Member } from '../types'
import { Shield, RotateCcw, Download, X, KeyRound } from 'lucide-react'

interface AdminModalProps {
  records: SpinRecord[]
  members?: Member[]
  onResetAll: () => void
  onResetMember: (memberId: string) => void
  onClose: () => void
}

export const AdminModal: React.FC<AdminModalProps> = ({
  records,
  onResetAll,
  onResetMember,
  onClose
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '1911' || password === 'admin') {
      setIsAuthenticated(true)
      setErrorMsg('')
    } else {
      setErrorMsg('Mật khẩu không đúng! (Gợi ý: 1911)')
    }
  }

  // Xuất file CSV hỗ trợ Excel tiếng Việt (kèm UTF-8 BOM)
  const handleExportCSV = () => {
    const header = ['STT', 'Họ và tên', 'Phần quà nhận được', 'Thời gian nhận']
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.memberName}"`,
      `"${r.prizeName}"`,
      `"${r.spunAt}"`
    ])

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Ket_Qua_Vong_Quay_19_11_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gold-400" />
          <h3 className="font-extrabold text-lg text-white">
            BAN TỔ CHỨC / QUẢN TRỊ VIÊN
          </h3>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-xs text-slate-400">
              Nhập mã bảo vệ của Ban tổ chức để quản trị kết quả hoặc xuất báo cáo:
            </p>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mã pin (mặc định 1911)..."
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gold-500 hover:bg-gold-400 text-slate-950 transition"
            >
              MỞ KHOÁ QUẢN TRỊ
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Xuất file Excel/CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Xuất kết quả trao giải (Excel / CSV)
            </button>

            {/* Danh sách reset lẻ từng người */}
            <div className="border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">
                Huỷ lượt quay cá nhân (quay nháp/lỗi):
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-xs">
                {records.length === 0 ? (
                  <div className="text-slate-500 text-center py-2">Chưa có ai quay</div>
                ) : (
                  records.map((r) => (
                    <div
                      key={r.memberId}
                      className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800"
                    >
                      <span>
                        <strong>{r.memberName}</strong> ({r.prizeName})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn cấp lại lượt quay cho ${r.memberName}?`)) {
                            onResetMember(r.memberId)
                          }
                        }}
                        className="text-amber-400 hover:text-amber-300 underline font-semibold ml-2"
                      >
                        Cho quay lại
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset tất cả */}
            <div className="border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xoá toàn bộ lịch sử quay và chơi lại từ đầu?')) {
                    onResetAll()
                    onClose()
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset trắng toàn bộ dữ liệu (Chơi lại từ đầu)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
