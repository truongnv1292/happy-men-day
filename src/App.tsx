import React, { useState, useEffect, useRef } from 'react'
import { MEMBERS } from './data/members'
import { PRIZES } from './data/prizes'
import { Member, Prize, SpinRecord } from './types'
import { LuckyWheel } from './components/LuckyWheel'
import { NameSelector } from './components/NameSelector'
import { WinnerModal } from './components/WinnerModal'
import { BlockedModal } from './components/BlockedModal'
import { HistoryList } from './components/HistoryList'
import { AdminLoginModal } from './components/AdminLoginModal'
import { AdminSettingsModal } from './components/AdminSettingsModal'
import { AlertModal, AlertModalConfig } from './components/AlertModal'
import { CameraCapture, CameraCaptureHandle } from './components/CameraCapture'
import { soundManager } from './utils/audio'
import { Volume2, VolumeX, Settings, Sparkles, Flame, Crown, Lock } from 'lucide-react'

const STORAGE_KEY = 'MENDAY_SPIN_RECORDS_V1'
const ADMIN_SESSION_KEY = 'MENDAY_ADMIN_AUTH_STATE'

export const App: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [records, setRecords] = useState<SpinRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [mustSpin, setMustSpin] = useState<boolean>(false)
  const [spinningMemberId, setSpinningMemberId] = useState<string | null>(null)
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null)
  const [winnerModalPrize, setWinnerModalPrize] = useState<Prize | null>(null)
  const [blockedModalData, setBlockedModalData] = useState<{ member: Member; record: SpinRecord } | null>(null)
  const [alertConfig, setAlertConfig] = useState<AlertModalConfig | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const cameraRef = useRef<CameraCaptureHandle>(null)

  // Quản lý trạng thái Admin & Cài đặt
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)

  const [isMuted, setIsMuted] = useState<boolean>(false)

  // Lưu records vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch (e) {
      console.error('Không thể lưu LocalStorage:', e)
    }
  }, [records])

  // Toggle Mute
  const toggleMute = () => {
    const nextState = !isMuted
    setIsMuted(nextState)
    soundManager.setMuted(nextState)
  }

  // Kiểm tra người này đã quay chưa
  const existingRecord = selectedMember
    ? records.find((r) => r.memberId === selectedMember.id)
    : null

  // Xử lý bấm nút QUAY NGAY - Lưu lịch sử ngay lập tức và khoá lượt quay lại
  const handleStartSpin = () => {
    if (mustSpin) return

    if (!selectedMember) {
      setAlertConfig({
        title: 'CHƯA CHỌN NAM THẦN',
        message: 'Vui lòng chọn hoặc gõ tên nam thần trước khi nhấn nút quay khởi động cỗ máy may mắn!',
        buttonText: 'ĐÃ HIỂU, ĐỂ TÔI CHỌN',
        type: 'warning'
      })
      return
    }

    // Nếu đã quay rồi -> Bật popup chặn troll
    if (existingRecord) {
      setBlockedModalData({
        member: selectedMember,
        record: existingRecord
      })
      return
    }

    // Chọn ngẫu nhiên 1 giải thưởng từ danh sách
    const randomIndex = Math.floor(Math.random() * PRIZES.length)
    const prize = PRIZES[randomIndex]

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`

    // Chụp lại khuôn mặt của người đang quay làm bằng chứng
    const capturedPhoto = cameraRef.current?.capturePhoto() || undefined
    setCurrentPhotoUrl(capturedPhoto || null)

    const newRecord: SpinRecord = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      prizeId: prize.id,
      prizeName: prize.name,
      prizeIcon: prize.icon,
      spunAt: timeString,
      photoUrl: capturedPhoto
    }

    // LƯU LỊCH SỬ NGAY LẬP TỨC: Người này không thể quay lại kể cả khi tải lại trang!
    setRecords((prev) => [newRecord, ...prev])
    setSpinningMemberId(selectedMember.id)
    setTargetPrizeIndex(randomIndex)
    setMustSpin(true)
  }

  // Kết thúc vòng quay
  const handleWheelFinished = (prize: Prize) => {
    setMustSpin(false)
    setSpinningMemberId(null)
    setWinnerModalPrize(prize)
  }

  // Đăng nhập thành công -> Lưu session, hiển thị nút Cài đặt và mở popup Reset Data
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true)
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    } catch (e) {
      console.error(e)
    }
    setShowLoginModal(false)
    setShowSettingsModal(true)
  }

  // Đăng xuất Admin -> Ẩn nút Cài đặt
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
    } catch (e) {
      console.error(e)
    }
    setShowSettingsModal(false)
  }

  // Admin Actions: Toàn quyền reset lịch sử phục vụ test
  const handleResetAll = () => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
    setSelectedMember(null)
    setTargetPrizeIndex(null)
    setWinnerModalPrize(null)
    setBlockedModalData(null)
    setSpinningMemberId(null)
  }

  const handleResetMember = (memberId: string) => {
    setRecords((prev) => prev.filter((r) => r.memberId !== memberId))
    if (selectedMember?.id === memberId) {
      setWinnerModalPrize(null)
      setBlockedModalData(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Background Glow trang trí nam tính */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-gold-300">
              🎩
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full border border-gold-500/30">
                  MEN&apos;S DAY 19/11
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-gold-400" /> Bản Lĩnh Phái Mạnh
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                ĐẠI CHIẾN BÀN TAY VÀNG <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút bật tắt âm thanh */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-gold-500/50 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
              <span className="hidden md:inline">{isMuted ? 'Đã tắt tiếng' : 'Âm thanh'}</span>
            </button>

            {/* Khi chưa đăng nhập: Nhấn vào nút Admin để mở popup Login */}
            {!isAdminLoggedIn ? (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs font-bold"
                title="Đăng nhập quản trị"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            ) : (
              /* Khi đã đăng nhập xong: Hiển thị nút Cài đặt để mở phần Reset Data */
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-gold-500/60 hover:border-gold-400 text-gold-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                title="Mở cài đặt & reset dữ liệu"
              >
                <Settings className="w-4 h-4 text-gold-400" />
                <span>Cài đặt</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-[1536px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* CỘT TRÁI: Form nhập tên & Nút Engine Start/Stop (Chiếm 3/12 cột = 25%) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-5 order-2 lg:order-1">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                <Crown className="w-5 h-5 text-gold-400" />
                <h2 className="font-extrabold text-base text-slate-200">
                  LƯỢT QUAY CHIẾN THẦN
                </h2>
              </div>

              {/* Selector Tên Thông Minh */}
              <NameSelector
                members={MEMBERS}
                records={records}
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                disabled={mustSpin}
                onShowAlert={(cfg) => setAlertConfig(cfg)}
              />

              {/* Camera Face ID - Chụp ảnh bằng chứng chống quay hộ */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <CameraCapture
                  ref={cameraRef}
                  isActive={!!selectedMember}
                  playerName={selectedMember?.name || ''}
                />
              </div>

              {/* Nút QUAY NGAY kiểu Engine Start/Stop */}
              <div className="mt-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleStartSpin}
                  disabled={mustSpin}
                  className={`group relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2.5 transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center text-center select-none ${
                    mustSpin
                      ? 'cursor-not-allowed opacity-80 rotate-180'
                      : existingRecord
                      ? 'cursor-pointer hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                      : selectedMember
                      ? 'cursor-pointer hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] animate-pulse-glow'
                      : 'cursor-pointer opacity-90 hover:opacity-100 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {/* Viền ngoài kim loại */}
                  <div
                    className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-700 ${
                      mustSpin
                        ? 'border-gold-400 animate-spin'
                        : existingRecord
                        ? 'border-red-500'
                        : 'border-gold-500 group-hover:rotate-45'
                    }`}
                  />

                  {/* Lõi nút bấm */}
                  <div
                    className={`w-full h-full rounded-full flex flex-col items-center justify-center p-3 shadow-inner transition ${
                      existingRecord
                        ? 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white'
                        : 'bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 text-slate-950'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-80">
                      {mustSpin ? 'ĐANG QUAY...' : existingRecord ? 'ĐÃ QUAY XONG' : 'ENGINE START'}
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight leading-none my-1">
                      {existingRecord ? 'XEM LẠI' : 'QUAY NGAY'}
                    </span>
                    <span className="text-[10px] font-bold opacity-75">
                      {existingRecord ? 'Không được quay lại' : '1 Lượt duy nhất'}
                    </span>
                  </div>
                </button>

                <p className="mt-4 text-xs text-center text-slate-400">
                  {mustSpin ? (
                    <span className="text-gold-400 font-semibold animate-pulse">
                      ⚡ Bánh xe đang quay, chúc anh em may mắn!
                    </span>
                  ) : existingRecord ? (
                    <span className="text-red-400 font-semibold">
                      ⛔ Anh đã dùng hết lượt. Bấm để xem lại quà đã nhận!
                    </span>
                  ) : selectedMember ? (
                    <span className="text-emerald-400 font-semibold">
                      🔥 Nhấn nút to ở trên để quay (kết quả lưu ngay vào Bảng Vàng)!
                    </span>
                  ) : (
                    <span>💡 Gõ tên anh em vào ô phía trên rồi nhấn QUAY</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA: Vòng quay may mắn Canvas phóng to 150% (Chiếm 6/12 cột = 50% trung tâm) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center order-1 lg:order-2">
            <LuckyWheel
              prizes={PRIZES}
              mustSpin={mustSpin}
              targetPrizeIndex={targetPrizeIndex}
              onFinished={handleWheelFinished}
              disabled={mustSpin}
            />
          </div>

          {/* CỘT PHẢI: Bảng vàng vinh danh (Live feed) - (Chiếm 3/12 cột = 25%) */}
          <div className="lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-end order-3 h-full">
            <div className="w-full">
              <HistoryList
                records={records}
                totalMembers={MEMBERS.length}
                members={MEMBERS}
                spinningMemberId={spinningMemberId}
              />
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-400">
        <p>
          🎉 Chúc toàn thể anh em công ty một ngày <strong>Quốc tế Đàn Ông 19/11</strong> luôn bản lĩnh, phong độ và ngập tràn niềm vui! 🍻💪
        </p>
      </footer>

      {/* POPUP CHÚC MỪNG CHIẾN THẮNG (Tự động ghi nhận, không cần nút xác nhận) */}
      {winnerModalPrize && selectedMember && (
        <WinnerModal
          member={selectedMember}
          prize={winnerModalPrize}
          photoUrl={currentPhotoUrl || records.find(r => r.memberId === selectedMember?.id)?.photoUrl}
          onClose={() => setWinnerModalPrize(null)}
        />
      )}

      {/* POPUP CẢNH SÁT TROLL KHI QUAY LẦN 2 */}
      {blockedModalData && (
        <BlockedModal
          member={blockedModalData.member}
          record={blockedModalData.record}
          onClose={() => setBlockedModalData(null)}
        />
      )}

      {/* POPUP ĐĂNG NHẬP ADMIN (Bảo mật, không hiển thị username/pass) */}
      {showLoginModal && (
        <AdminLoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* POPUP CÀI ĐẶT & RESET DỮ LIỆU PHỤC VỤ TEST */}
      {showSettingsModal && (
        <AdminSettingsModal
          records={records}
          members={MEMBERS}
          onResetAll={handleResetAll}
          onResetMember={handleResetMember}
          onLogout={handleAdminLogout}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      {/* POPUP THÔNG BÁO ALERT ĐẸP MẮT */}
      <AlertModal
        config={alertConfig}
        onClose={() => setAlertConfig(null)}
      />
    </div>
  )
}

export default App
