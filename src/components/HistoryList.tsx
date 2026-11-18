import React, { useState } from 'react'
import { SpinRecord, Member } from '../types'
import { Award, Clock, Users, Gift, Search, Loader2 } from 'lucide-react'

interface HistoryListProps {
  records: SpinRecord[]
  totalMembers: number
  members: Member[]
  spinningMemberId?: string | null
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  totalMembers,
  members,
  spinningMemberId
}) => {
  const [filter, setFilter] = useState<'all' | 'unspun'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const spunMemberIds = new Set(records.map((r) => r.memberId))
  const unspunMembers = members.filter((m) => !spunMemberIds.has(m.id))

  // Lọc theo search
  const filteredRecords = records.filter(
    (r) =>
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUnspun = unspunMembers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const progressPercent = Math.round((records.length / totalMembers) * 100)

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col h-full w-full">
      {/* Header & Số lượng đã quay (Trên 1 dòng không bao giờ xuống dòng) */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Award className="w-5 h-5 text-gold-400" />
          <h3 className="font-extrabold text-base text-slate-100 uppercase tracking-wider whitespace-nowrap">
            BẢNG VÀNG 19/11
          </h3>
        </div>
        <div className="text-xs font-extrabold text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 whitespace-nowrap flex-shrink-0">
          <span className="text-gold-300">{records.length}/{totalMembers}</span> ĐÃ QUAY
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div className="my-3">
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 to-gold-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tabs chuyển đổi xem Đã nhận / Chưa nhận (trên 1 dòng) */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl mb-3 border border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-850 text-gold-400 shadow border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Đã quay ({records.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('unspun')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            filter === 'unspun'
              ? 'bg-slate-850 text-gold-400 shadow border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Chưa quay ({unspunMembers.length})</span>
        </button>
      </div>

      {/* Tìm kiếm nhanh */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên hoặc quà..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Nội dung danh sách cuộn - Rộng rãi, không bị 3 chấm */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1">
        {filter === 'all' ? (
          filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Chưa có ai quay nhận quà. Hãy chọn tên và bắt đầu thử vận may!
            </div>
          ) : (
            filteredRecords.map((r, idx) => {
              const isSpinningThis = spinningMemberId === r.memberId
              return (
                <div
                  key={idx}
                  className={`bg-slate-950/70 border rounded-xl p-3 flex items-center justify-between gap-3 transition ${
                    isSpinningThis
                      ? 'border-gold-500/60 bg-gold-950/20 animate-pulse'
                      : 'border-slate-800/90 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Ảnh Selfie hoặc Icon Quà */}
                    {r.photoUrl ? (
                      <div className="relative w-9 h-9 flex-shrink-0 rounded-full overflow-hidden border border-gold-500/80 shadow">
                        <img
                          src={r.photoUrl}
                          alt={r.memberName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 text-[10px] bg-slate-950 rounded-full">
                          {r.prizeIcon}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl flex-shrink-0">
                        {isSpinningThis ? '🎲' : r.prizeIcon}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-100 whitespace-nowrap">
                        {r.memberName}
                      </div>
                      <div className="text-xs text-gold-400 font-medium">
                        {isSpinningThis ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-gold-400" />
                            <span>Đang quay thưởng...</span>
                          </span>
                        ) : (
                          r.prizeName
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {r.spunAt}
                  </div>
                </div>
              )
            })
          )
        ) : filteredUnspun.length === 0 ? (
          <div className="text-center py-8 text-xs text-emerald-400 font-semibold">
            🎉 Tuyệt vời! Toàn bộ 32 anh em đều đã nhận quà!
          </div>
        ) : (
          filteredUnspun.map((m) => (
            <div
              key={m.id}
              className="bg-slate-950/50 border border-slate-800/60 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-200 whitespace-nowrap">{m.name}</span>
              <span className="text-slate-500 whitespace-nowrap">Chưa quay</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
