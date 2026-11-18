import React, { useState, useEffect, useRef } from 'react'
import { Member, SpinRecord } from '../types'
import { normalizeVietnamese } from '../utils/vietnamese'
import { isHideGoiY as defaultHideGoiY } from '../config/gameConfig'
import { Search, UserCheck, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react'

interface NameSelectorProps {
  members: Member[]
  records: SpinRecord[]
  selectedMember: Member | null
  onSelectMember: (member: Member | null) => void
  disabled?: boolean
  isHideGoiY?: boolean
  onShowAlert?: (config: { title: string; message: string; type?: 'info' | 'warning' | 'success' }) => void
}

export const NameSelector: React.FC<NameSelectorProps> = ({
  members,
  records,
  selectedMember,
  onSelectMember,
  disabled,
  isHideGoiY = defaultHideGoiY
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Quy ước: isHideGoiY = false nghĩa là ẨN GỢI Ý theo đúng yêu cầu người dùng
  const hideSuggestion = isHideGoiY === false

  // Danh sách ID những người đã quay
  const spunMemberIds = new Set(records.map(r => r.memberId))

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cập nhật input khi selectedMember thay đổi
  useEffect(() => {
    if (selectedMember) {
      setSearchTerm(selectedMember.name)
    }
  }, [selectedMember])

  // Hàm kiểm tra khớp tên: Hỗ trợ tiếng Việt có dấu, không dấu, viết hoa, viết thường
  const checkMatch = (inputText: string): Member | null => {
    const trimmed = inputText.trim()
    if (!trimmed) return null

    const normInput = normalizeVietnamese(trimmed)

    // Khớp tuyệt đối theo tên không dấu hoặc tên gốc
    return members.find(m => {
      return m.normalizedName === normInput || m.name.toLowerCase() === trimmed.toLowerCase()
    }) || null
  }

  // Xử lý khi người dùng nhập tên
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)

    const matched = checkMatch(val)
    if (matched) {
      onSelectMember(matched)
      setIsOpen(false)
    } else {
      onSelectMember(null)
      // Chỉ mở dropdown nếu không bị ẩn gợi ý
      if (!hideSuggestion && val.trim().length > 0) {
        setIsOpen(true)
      }
    }
  }

  const handleClear = () => {
    if (disabled) return
    setSearchTerm('')
    onSelectMember(null)
    setIsOpen(false)
  }

  const hasAlreadySpun = selectedMember ? spunMemberIds.has(selectedMember.id) : false

  // Lọc gợi ý nếu bật gợi ý
  const filteredMembers = members.filter(m => {
    if (!searchTerm) return true
    const normSearch = normalizeVietnamese(searchTerm)
    return m.normalizedName.includes(normSearch) || m.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-xs uppercase tracking-wider text-gold-400 font-bold mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-gold-400" />
          DANH TÍNH NAM THẦN THAM GIA
        </span>
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Bảo mật danh tính
        </span>
      </label>

      {/* Input gõ tên */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-gold-500/80" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (!hideSuggestion && searchTerm.trim().length > 0) {
              setIsOpen(true)
            }
          }}
          disabled={disabled}
          placeholder={
            hideSuggestion
              ? "Nhập họ tên của bạn (không dấu hoặc có dấu)..."
              : "Gõ tên nam thần (không dấu hoặc có dấu)..."
          }
          className={`w-full pl-11 pr-10 py-3 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border text-sm sm:text-base font-semibold transition focus:outline-none focus:ring-2 ${
            hasAlreadySpun
              ? 'border-red-500/70 focus:ring-red-500/40'
              : selectedMember
              ? 'border-emerald-500/80 focus:ring-emerald-500/40'
              : 'border-slate-700/80 focus:border-gold-500 focus:ring-gold-500/30'
          }`}
        />

        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trạng thái xác nhận danh tính */}
      {selectedMember ? (
        <div className="mt-2 text-xs flex items-center gap-1.5 font-medium animate-in fade-in duration-200">
          {hasAlreadySpun ? (
            <span className="text-red-400 flex items-center gap-1 bg-red-950/60 px-2.5 py-1.5 rounded-lg border border-red-800/60 w-full">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Anh <strong>{selectedMember.name}</strong> đã ẵm quà rồi nha! Tham lam là bị tịch thu đấy! 🚨
              </span>
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 w-full">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Đã nhận diện nam thần: <strong>{selectedMember.name}</strong> (Cầu trời khấn phật tay thơm!) 🔥
              </span>
            </span>
          )}
        </div>
      ) : (
        searchTerm.trim().length > 0 && (
          <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1">
            <span>💡 Hãy nhập đầy đủ họ và tên (ví dụ: &ldquo;{normalizeVietnamese(members[0].name)}&rdquo; hoặc &ldquo;{members[0].name}&rdquo;)</span>
          </div>
        )
      )}

      {/* Dropdown danh sách gợi ý (Chỉ hiển thị khi KHÔNG ẩn gợi ý) */}
      {!hideSuggestion && isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-md divide-y divide-slate-800/80">
          {filteredMembers.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 text-center">
              Không tìm thấy tên &ldquo;{searchTerm}&rdquo; trong danh sách 32 anh em.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const spun = spunMemberIds.has(member.id)
              const isSelected = selectedMember?.id === member.id

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelectMember(member)
                    setSearchTerm(member.name)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition ${
                    isSelected
                      ? 'bg-gold-500/20 text-gold-300 font-bold'
                      : 'hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">#{member.id.replace('mem_', '')}</span>
                    <span className="font-semibold">{member.name}</span>
                  </div>

                  {spun ? (
                    <span className="text-[11px] bg-red-950/70 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-full font-medium">
                      Đã quay 🎁
                    </span>
                  ) : (
                    <span className="text-[11px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                      Chưa quay 🟢
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
