import React, { useState, useEffect, useRef } from 'react'
import { Member, SpinRecord } from '../types'
import { matchVietnamese } from '../utils/vietnamese'
import { Search, UserCheck, CheckCircle2, AlertCircle, X, Shuffle } from 'lucide-react'

interface NameSelectorProps {
  members: Member[]
  records: SpinRecord[]
  selectedMember: Member | null
  onSelectMember: (member: Member | null) => void
  disabled?: boolean
}

export const NameSelector: React.FC<NameSelectorProps> = ({
  members,
  records,
  selectedMember,
  onSelectMember,
  disabled
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  // Cập nhật search term khi selectedMember thay đổi
  useEffect(() => {
    if (selectedMember) {
      setSearchTerm(selectedMember.name)
    }
  }, [selectedMember])

  // Lọc gợi ý theo input
  const filteredMembers = members.filter(m => {
    if (!searchTerm) return true
    return matchVietnamese(searchTerm, m.name)
  })

  // Chọn ngẫu nhiên 1 bạn chưa quay
  const handleRandomPick = () => {
    if (disabled) return
    const unspunMembers = members.filter(m => !spunMemberIds.has(m.id))
    if (unspunMembers.length === 0) {
      alert('Tất cả 32 anh em đều đã quay xong!')
      return
    }
    const randomMember = unspunMembers[Math.floor(Math.random() * unspunMembers.length)]
    onSelectMember(randomMember)
    setSearchTerm(randomMember.name)
    setIsOpen(false)
  }

  const handleClear = () => {
    if (disabled) return
    setSearchTerm('')
    onSelectMember(null)
    setIsOpen(false)
  }

  const hasAlreadySpun = selectedMember ? spunMemberIds.has(selectedMember.id) : false

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-xs uppercase tracking-wider text-gold-400 font-bold mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-gold-400" />
          DANH TÍNH NAM THẦN THAM GIA
        </span>
        <button
          type="button"
          onClick={handleRandomPick}
          disabled={disabled}
          title="Chọn ngẫu nhiên 1 anh em chưa quay"
          className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/40 transition"
        >
          <Shuffle className="w-3 h-3" />
          Chọn ngẫu nhiên
        </button>
      </label>

      {/* Input gõ tên */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-gold-500/80" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            // Nếu người dùng gõ trùng khớp hoàn toàn với một tên
            const exactMatch = members.find(m => m.name.toLowerCase() === e.target.value.trim().toLowerCase())
            if (exactMatch) {
              onSelectMember(exactMatch)
            } else {
              onSelectMember(null)
            }
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Nhập tên (không dấu hoặc có dấu)..."
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
      {selectedMember && (
        <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
          {hasAlreadySpun ? (
            <span className="text-red-400 flex items-center gap-1 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/60">
              <AlertCircle className="w-3.5 h-3.5" />
              Anh <strong>{selectedMember.name}</strong> đã nhận quà rồi! Không được ăn gian nha!
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sẵn sàng: <strong>{selectedMember.name}</strong> (1 lượt quay may mắn)
            </span>
          )}
        </div>
      )}

      {/* Dropdown danh sách gợi ý */}
      {isOpen && (
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
