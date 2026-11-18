import React, { useState } from 'react'
import { SpinRecord, Member } from '../types'
import { Award, Clock, Users, Gift, Search, Loader2, PlayCircle, Eye, Video } from 'lucide-react'

interface HistoryListProps {
  records: SpinRecord[]
  totalMembers: number
  members: Member[]
  spinningMemberId?: string | null
  onSelectRecord?: (record: SpinRecord) => void
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  totalMembers,
  members,
  spinningMemberId,
  onSelectRecord
}) => {
  const [filter, setFilter] = useState<'all' | 'unspun'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const spunMemberIds = new Set(records.map((r) => r.memberId))
  const unspunMembers = members.filter((m) => !spunMemberIds.has(m.id))

  // Lọc theo search
  const filteredRecords = records.filter(
    (r) =>
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.challengeTitle && r.challengeTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredUnspun = unspunMembers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const progressPercent = Math.round((records.length / totalMembers) * 100)

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col h-full w-full min-w-0">
      {/* Header & Số lượng đã quay */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Award className="w-5 h-5 text-gold-400" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-100 uppercase tracking-wider">
            BẢNG VÀNG 19/11
          </h3>
        </div>
        <div className="text-[11px] font-extrabold text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30 whitespace-nowrap flex-shrink-0">
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

      {/* Tabs chuyển đổi xem Đã nhận / Chưa nhận */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl mb-3 border border-slate-800 text-[11px] sm:text-xs font-bold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
            filter === 'all'
              ? 'bg-slate-850 text-gold-400 shadow border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Đã quay ({records.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('unspun')}
          className={`flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
            filter === 'unspun'
              ? 'bg-slate-850 text-gold-400 shadow border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Chưa quay ({unspunMembers.length})</span>
        </button>
      </div>

      {/* Tìm kiếm nhanh */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên, quà hoặc thử thách..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Nội dung danh sách cuộn */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1">
        {filter === 'all' ? (
          filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Chưa có ai quay nhận quà. Hãy chọn tên và bắt đầu thử vận may!
            </div>
          ) : (
            filteredRecords.map((r, idx) => {
              const isSpinningThis = spinningMemberId === r.memberId
              const hasVideo = !!r.videoUrl
              const hasPhoto = !!r.photoUrl

              return (
                <div
                  key={idx}
                  onClick={() => onSelectRecord && onSelectRecord(r)}
                  className={`bg-slate-950/70 border rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 transition min-w-0 cursor-pointer group ${
                    isSpinningThis
                      ? 'border-gold-500/60 bg-gold-950/20 animate-pulse'
                      : 'border-slate-800/90 hover:border-gold-500/60 hover:bg-slate-900/90'
                  }`}
                  title="Nhấn để xem video / ảnh thử thách"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Ảnh Selfie hoặc Icon Quà */}
                    {hasPhoto ? (
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full overflow-hidden border border-gold-500/80 shadow">
                        <img
                          src={r.photoUrl}
                          alt={r.memberName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 text-[10px] bg-slate-950 rounded-full">
                          {r.prizeIcon}
                        </span>
                      </div>
                    ) : hasVideo ? (
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-slate-900 border border-red-500/80 shadow flex items-center justify-center">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        <span className="absolute bottom-0 right-0 text-[10px] bg-slate-950 rounded-full">
                          {r.prizeIcon}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {isSpinningThis ? '🎲' : r.prizeIcon}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-100 truncate flex items-center gap-1.5">
                        <span className="truncate">{r.memberName}</span>
                        {(hasVideo || hasPhoto) && (
                          <span className="text-[10px] text-amber-400 font-semibold opacity-80 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
                            {hasVideo ? <PlayCircle className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3 text-gold-400" />}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs text-gold-400 font-medium truncate">
                        {isSpinningThis ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-gold-400" />
                            <span>Đang quay thưởng...</span>
                          </span>
                        ) : (
                          <span>{r.prizeName}</span>
                        )}
                      </div>
                      {/* Thử thách đã hoàn thành */}
                      {r.challengeTitle && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          🎯 {r.challengeTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-slate-500 flex flex-col items-end gap-1 whitespace-nowrap flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{r.spunAt}</span>
                    </div>
                    {(hasVideo || hasPhoto) && (
                      <span className="text-[9px] sm:text-[10px] text-gold-400 font-semibold group-hover:underline">
                        Xem video nhiệm vụ &rarr;
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )
        ) : filteredUnspun.length === 0 ? (
          <div className="text-center py-8 text-xs text-emerald-400 font-semibold">
            🎉 Tuyệt vời! Toàn bộ {totalMembers} anh em đều đã nhận quà!
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
