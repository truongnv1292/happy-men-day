import React, { useState } from 'react'
import { SpinRecord, Member } from '../types'
import { ConfirmModal, ConfirmModalConfig } from './ConfirmModal'
import {
  Settings,
  RotateCcw,
  Download,
  X,
  LogOut,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

interface AdminSettingsModalProps {
  records: SpinRecord[]
  members?: Member[]
  isHideGoiY: boolean
  onToggleHideGoiY: (value: boolean) => void
  onResetAll: () => void
  onResetMember: (memberId: string) => void
  onLogout: () => void
  onClose: () => void
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  records,
  isHideGoiY,
  onToggleHideGoiY,
  onResetAll,
  onResetMember,
  onLogout,
  onClose
}) => {
  const [successMsg, setSuccessMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null)

  // Xuất file CSV hỗ trợ Excel tiếng Việt (kèm UTF-8 BOM)
  const handleExportCSV = () => {
    const header = ['STT', 'Họ và tên', 'Phần quà nhận được', 'Thời gian nhận']
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.memberName}"`,
      `"${r.prizeName}"`,
      `"${r.spunAt}"`
    ])

    const csvContent =
      '\uFEFF' + [header.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `Ket_Qua_Vong_Quay_19_11_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Lọc danh sách đã quay để reset lẻ
  const filteredRecords = records.filter(
    (r) =>
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleResetAllRecords = () => {
    setConfirmConfig({
      title: 'RESET TOÀN BỘ LỊCH SỬ?',
      message: `Hành động này sẽ xoá sạch toàn bộ ${records.length} lượt quay đã lưu của tất cả anh em để bạn bắt đầu kiểm thử lại từ đầu.`,
      confirmText: 'XÁC NHẬN XOÁ HẾT',
      cancelText: 'HỦY BỎ',
      type: 'danger',
      onConfirm: () => {
        onResetAll()
        setSuccessMsg('Đã xoá sạch toàn bộ lịch sử quay!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    })
  }

  const handleConfirmResetMember = (r: SpinRecord) => {
    setConfirmConfig({
      title: 'CẤP LẠI LƯỢT QUAY?',
      message: `Cấp lại lượt quay cho anh ${r.memberName}? Phần quà "${r.prizeName}" đã nhận trước đó sẽ được xoá để anh này có thể quay lại.`,
      confirmText: 'ĐỒNG Ý CẤP LẠI',
      cancelText: 'HỦY',
      type: 'warning',
      onConfirm: () => {
        onResetMember(r.memberId)
        setSuccessMsg(`Đã cấp lại lượt quay cho ${r.memberName}!`)
        setTimeout(() => setSuccessMsg(''), 2500)
      }
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden">
          {/* Nút X đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Modal */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                CÀI ĐẶT & RESET DỮ LIỆU
              </h3>
              <p className="text-xs text-slate-400">
                Toàn quyền quản trị và reset dữ liệu phục vụ kiểm thử
              </p>
            </div>
          </div>

          {/* Alert Thông báo thành công */}
          {successMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Trạng thái đăng nhập & Nút Đăng xuất */}
            <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Đang đăng nhập quyền: <strong className="text-gold-400">Admin</strong>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition"
                title="Đăng xuất khỏi quyền Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            </div>

            {/* CẤU HÌNH BẢO MẬT: ẨN / HIỆN GỢI Ý TÊN */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">
                  Ẩn gợi ý danh sách tên (Bảo mật)
                </div>
                <div className="text-[11px] text-slate-400">
                  {isHideGoiY === false
                    ? 'Đang bật ẩn: Người chơi phải tự gõ đúng họ tên (không dấu hoặc có dấu)'
                    : 'Đang hiện: Cho phép xem danh sách và gợi ý dropdown'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !isHideGoiY
                  onToggleHideGoiY(nextVal)
                  setSuccessMsg(
                    nextVal === false
                      ? 'Đã bật chế độ Ẩn gợi ý (Người chơi phải tự gõ tên)!'
                      : 'Đã mở lại danh sách gợi ý chọn tên!'
                  )
                  setTimeout(() => setSuccessMsg(''), 2500)
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isHideGoiY === false ? 'bg-gold-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    isHideGoiY === false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* KHỐI RESET TOÀN BỘ (DÀNH CHO TEST) */}
            <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                Reset toàn bộ dữ liệu kiểm thử:
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Xoá toàn bộ lịch sử {records.length} lượt quay đã lưu để bắt đầu thử nghiệm lại từ đầu:
              </p>
              <button
                type="button"
                onClick={handleResetAllRecords}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950"
              >
                <RotateCcw className="w-4 h-4" />
                RESET TOÀN BỘ LỊCH SỬ QUAY (VỀ 0)
              </button>
            </div>

            {/* KHỐI RESET TỪNG NGƯỜI CỤ THỂ */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase">
                  Reset lượt quay từng người ({records.length}):
                </h4>
              </div>

              {/* Tìm kiếm người cần reset */}
              {records.length > 0 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên người cần cho quay lại..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {records.length === 0 ? (
                  <div className="text-slate-500 text-center py-4 bg-slate-900/40 rounded-lg border border-slate-800">
                    Chưa có ai quay. Tất cả đều có thể quay ngay!
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-slate-500 text-center py-2">
                    Không tìm thấy người khớp với &ldquo;{searchTerm}&rdquo;
                  </div>
                ) : (
                  filteredRecords.map((r) => (
                    <div
                      key={r.memberId}
                      className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-200">{r.memberName}</div>
                        <div className="text-[11px] text-gold-400">
                          {r.prizeIcon} {r.prizeName} • <span className="text-slate-500">{r.spunAt}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConfirmResetMember(r)}
                        className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-600 px-2 py-1 rounded-md border border-amber-500/30 transition"
                        title="Cho phép người này quay lại"
                      >
                        <Trash2 className="w-3 h-3" />
                        Cho quay lại
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* XUẤT FILE EXCEL / CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Xuất kết quả trao giải ra file Excel / CSV ({records.length})
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN ĐẸP MẮT */}
      <ConfirmModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </>
  )
}
