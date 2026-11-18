import React, { useState, useEffect, useRef } from 'react'
import { MEMBERS } from './data/members'
import { PRIZES } from './data/prizes'
import { Member, Prize, SpinRecord, ChallengeItem, GreetingBannerConfig } from './types'
import { LuckyWheel } from './components/LuckyWheel'
import { NameSelector } from './components/NameSelector'
import { WinnerModal } from './components/WinnerModal'
import { BlockedModal } from './components/BlockedModal'
import { HistoryList } from './components/HistoryList'
import { AdminLoginModal } from './components/AdminLoginModal'
import { AdminSettingsModal } from './components/AdminSettingsModal'
import { AlertModal, AlertModalConfig } from './components/AlertModal'
import { CameraCapture, CameraCaptureHandle } from './components/CameraCapture'
import { ChallengeWheelModal } from './components/ChallengeWheelModal'
import { ChallengeStudioModal } from './components/ChallengeStudioModal'
import { MemberDetailModal } from './components/MemberDetailModal'
import { GreetingBanner } from './components/GreetingBanner'
import { isHideGoiY as defaultHideGoiY } from './config/gameConfig'
import { soundManager } from './utils/audio'
import {
  syncRecordToFirebase,
  fetchRecordsFromFirebase,
  subscribeToFirebaseRecords,
  getGreetingBannerConfig,
  saveGreetingBannerConfig,
  syncGreetingBannerToFirebase,
  fetchGreetingBannerFromFirebase
} from './utils/onlineStorage'
import {
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Flame,
  Crown,
  Lock,
  Dices,
  CheckCircle2,
  RotateCcw
} from 'lucide-react'

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
  const [winnerChallengeTitle, setWinnerChallengeTitle] = useState<string | undefined>(undefined)
  const [winnerVideoUrl, setWinnerVideoUrl] = useState<string | undefined>(undefined)
  const [blockedModalData, setBlockedModalData] = useState<{ member: Member; record: SpinRecord } | null>(null)
  const [alertConfig, setAlertConfig] = useState<AlertModalConfig | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const cameraRef = useRef<CameraCaptureHandle>(null)

  // Quản lý Luồng Thử Thách (Challenge Flow)
  const [showChallengeWheel, setShowChallengeWheel] = useState<boolean>(false)
  const [activeStudioChallenge, setActiveStudioChallenge] = useState<ChallengeItem | null>(null)
  const [completedChallenge, setCompletedChallenge] = useState<{
    videoUrl?: string
    photoUrl?: string
    challengeId: string
    challengeTitle: string
    mediaType: 'video' | 'photo'
  } | null>(null)

  // Modal xem chi tiết Video / Ảnh bằng chứng của từng người
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<SpinRecord | null>(null)

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
  const [adminInitialTab, setAdminInitialTab] = useState<'general' | 'banner' | 'cloud'>('general')

  // Cấu hình Lời chúc ghim đầu trang
  const [greetingBanner, setGreetingBanner] = useState<GreetingBannerConfig>(() =>
    getGreetingBannerConfig()
  )

  const handleUpdateGreetingBanner = async (newConfig: GreetingBannerConfig) => {
    setGreetingBanner(newConfig)
    saveGreetingBannerConfig(newConfig)
    await syncGreetingBannerToFirebase(newConfig)
  }

  // Cấu hình ẩn / hiện gợi ý tên
  const [isHideGoiYState, setIsHideGoiYState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('MENDAY_IS_HIDE_GOIY')
      return saved !== null ? saved === 'true' : defaultHideGoiY
    } catch {
      return defaultHideGoiY
    }
  })

  const handleToggleHideGoiY = (val: boolean) => {
    setIsHideGoiYState(val)
    try {
      localStorage.setItem('MENDAY_IS_HIDE_GOIY', String(val))
    } catch (e) {
      console.error(e)
    }
  }

  const [isMuted, setIsMuted] = useState<boolean>(false)

  // Khi đổi người chơi -> Reset thử thách hiện tại của người đó
  useEffect(() => {
    setCompletedChallenge(null)
  }, [selectedMember?.id])

  // Lưu records vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch (e) {
      console.error('Không thể lưu LocalStorage:', e)
    }
  }, [records])

  // Đồng bộ Online Realtime từ Firebase
  useEffect(() => {
    const initOnline = async () => {
      const onlineRecords = await fetchRecordsFromFirebase()
      if (onlineRecords && onlineRecords.length > 0) {
        setRecords(onlineRecords)
      }
      const onlineBanner = await fetchGreetingBannerFromFirebase()
      if (onlineBanner) {
        setGreetingBanner(onlineBanner)
        saveGreetingBannerConfig(onlineBanner)
      }
    }
    initOnline()

    const unsubscribe = subscribeToFirebaseRecords((updatedRecords) => {
      if (updatedRecords && Array.isArray(updatedRecords)) {
        setRecords(updatedRecords)
      }
    })
    return () => unsubscribe()
  }, [])

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

  // Bắt đầu quy trình Thử Thách
  const handleOpenChallengeFlow = () => {
    if (!selectedMember) {
      setAlertConfig({
        title: 'Ơ KÌA CHƯA CHỌN DANH TÍNH!',
        message: '👉 Vui lòng chọn hoặc nhập tên mình vào ô phía trên trước khi bốc thử thách nhé nam thần!',
        buttonText: 'CHỌN TÊN NGAY',
        type: 'warning'
      })
      return
    }

    if (existingRecord) {
      setBlockedModalData({
        member: selectedMember,
        record: existingRecord
      })
      return
    }

    setShowChallengeWheel(true)
  }

  // Chọn xong thử thách từ Vòng Quay Thử Thách -> Chuyển vào Studio ghi hình
  const handleSelectChallenge = (challenge: ChallengeItem) => {
    setShowChallengeWheel(false)
    setActiveStudioChallenge(challenge)
  }

  // Hoàn tất ghi hình / chụp ảnh thử thách
  const handleChallengeCompleted = (result: {
    videoUrl?: string
    photoUrl?: string
    challengeId: string
    challengeTitle: string
    mediaType: 'video' | 'photo'
  }) => {
    setActiveStudioChallenge(null)
    setCompletedChallenge(result)
    soundManager.playWin()
  }

  // Xử lý bấm nút QUAY VÒNG MAY MẮN
  const handleStartSpin = () => {
    if (mustSpin) return

    if (!selectedMember) {
      setAlertConfig({
        title: 'Ơ KÌA CHƯA CHỌN DANH TÍNH!',
        message: '👉 Tính quay lén hay sao mà chưa chọn tên thế người anh em? Gõ tên mình vào ô phía trên rồi hãy bấm nút khởi động cỗ máy nha!',
        buttonText: 'DẠ EM BIẾT RỒI, ĐỂ EM CHỌN NGAY!',
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

    // NẾU CHƯA HOÀN THÀNH THỬ THÁCH -> BẮT BUỘC MỞ THỬ THÁCH
    if (!completedChallenge) {
      setAlertConfig({
        title: 'CHƯA HOÀN THÀNH THỬ THÁCH! 🎯',
        message: 'Quy định 19/11: Để được mở khóa Vòng Quay May Mắn, bạn cần bốc ngẫu nhiên và vượt qua Thử Thách Nam Thần (quay video/chụp ảnh). Bấm nút bên dưới để bốc thử thách ngay!',
        buttonText: 'BỐC THỬ THÁCH NGAY',
        type: 'warning',
        onAction: () => {
          setShowChallengeWheel(true)
        }
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

    // Ảnh bằng chứng (ưu tiên ảnh thử thách hoặc chụp từ Face ID)
    const capturedPhoto =
      completedChallenge.photoUrl ||
      cameraRef.current?.capturePhoto() ||
      undefined

    setCurrentPhotoUrl(capturedPhoto || null)
    setWinnerChallengeTitle(completedChallenge.challengeTitle)
    setWinnerVideoUrl(completedChallenge.videoUrl)

    const newRecord: SpinRecord = {
      id: `spin_${selectedMember.id}_${Date.now()}`,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      prizeId: prize.id,
      prizeName: prize.name,
      prizeIcon: prize.icon,
      spunAt: timeString,
      photoUrl: capturedPhoto,
      videoUrl: completedChallenge.videoUrl,
      challengeId: completedChallenge.challengeId as any,
      challengeTitle: completedChallenge.challengeTitle,
      mediaType: completedChallenge.mediaType
    }

    // LƯU LỊCH SỬ VÀ ĐỒNG BỘ ONLINE LÊN FIREBASE
    setRecords((prev) => [newRecord, ...prev])
    syncRecordToFirebase(newRecord)

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

  // Đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true)
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    } catch (e) {
      console.error(e)
    }
    setShowLoginModal(false)
    setAdminInitialTab('general')
    setShowSettingsModal(true)
  }

  // Đăng xuất Admin
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
    } catch (e) {
      console.error(e)
    }
    setShowSettingsModal(false)
  }

  // Admin Actions: Reset lịch sử toàn bộ (Xóa cả Firebase Cloud và IndexedDB máy)
  const handleResetAll = async () => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
    setSelectedMember(null)
    setTargetPrizeIndex(null)
    setWinnerModalPrize(null)
    setBlockedModalData(null)
    setSpinningMemberId(null)
    setCompletedChallenge(null)
  }

  const handleResetMember = (memberId: string) => {
    setRecords((prev) => prev.filter((r) => r.memberId !== memberId))
    if (selectedMember?.id === memberId) {
      setWinnerModalPrize(null)
      setBlockedModalData(null)
      setCompletedChallenge(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* GHIM LỜI CHÚC MỪNG Ở ĐẦU TRANG WEB */}
      <GreetingBanner
        config={greetingBanner}
        isAdmin={isAdminLoggedIn}
        onEditClick={() => {
          setAdminInitialTab('banner')
          setShowSettingsModal(true)
        }}
      />

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
                  <Sparkles className="w-3 h-3 text-gold-400" /> Ngày Của Đấng Mày Râu - Đẹp Trai Không Cần Giải Thích 😎
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

            {/* Nút Admin */}
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
              <button
                type="button"
                onClick={() => {
                  setAdminInitialTab('general')
                  setShowSettingsModal(true)
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-gold-500/60 hover:border-gold-400 text-gold-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                title="Mở cài đặt & đồng bộ online"
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
          
          {/* CỘT TRÁI: Form nhập tên & Thử Thách & Nút Engine Start/Stop (Chiếm 3/12 cột = 25%) */}
          <div className="lg:col-span-3 xl:col-span-3 min-w-0 flex flex-col gap-4 order-2 lg:order-1">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-800">
                <Crown className="w-5 h-5 text-gold-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-200">
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
                isHideGoiY={isHideGoiYState}
                onShowAlert={(cfg) => setAlertConfig(cfg)}
              />

              {/* KHỐI THỬ THÁCH BẮT BUỘC (CHALLENGE ACTION CARD) */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-800">
                {existingRecord ? (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-center">
                    <span className="text-xs text-red-300 font-bold">
                      ⛔ Bạn đã hoàn thành lượt quay nhận quà!
                    </span>
                  </div>
                ) : completedChallenge ? (
                  /* ĐÃ HOÀN THÀNH THỬ THÁCH -> HIỆN HUY HIỆU XÁC NHẬN */
                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/60 rounded-xl flex items-center justify-between gap-2 shadow animate-in fade-in">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">ĐÃ XONG THỬ THÁCH!</span>
                      </div>
                      <div className="text-[11px] text-slate-200 font-semibold truncate mt-0.5">
                        {completedChallenge.challengeTitle}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 font-medium">
                        {completedChallenge.mediaType === 'video' ? '🎥 Đã quay video' : '📸 Đã chụp selfie'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenChallengeFlow}
                      disabled={mustSpin}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center"
                      title="Làm lại thử thách khác nếu muốn"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* CHƯA HOÀN THÀNH THỬ THÁCH -> NÚT BỐC THỬ THÁCH */
                  <div className="p-3 bg-gold-950/30 border border-gold-500/50 rounded-xl text-center shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-gold-400 text-xs font-black uppercase mb-1">
                      <Dices className="w-4 h-4 text-gold-400 animate-spin" />
                      <span>BƯỚC 1: LÀM THỬ THÁCH</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2 leading-tight">
                      Cần thực hiện thử thách (quay video hoặc chụp ảnh) để mở khóa nút Quay May Mắn!
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenChallengeFlow}
                      disabled={mustSpin}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>BỐC THỬ THÁCH NGAY</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Face ID Scanner */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <CameraCapture
                  ref={cameraRef}
                  isActive={!!selectedMember}
                  playerName={selectedMember?.name || ''}
                />
              </div>

              {/* Nút QUAY NGAY kiểu Engine Start/Stop */}
              <div className="mt-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleStartSpin}
                  disabled={mustSpin}
                  className={`group relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-2.5 transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center text-center select-none ${
                    mustSpin
                      ? 'cursor-not-allowed opacity-80 rotate-180'
                      : existingRecord
                      ? 'cursor-pointer hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                      : completedChallenge
                      ? 'cursor-pointer hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] animate-pulse-glow'
                      : 'cursor-pointer opacity-75 hover:opacity-90 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  {/* Viền ngoài kim loại */}
                  <div
                    className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-700 ${
                      mustSpin
                        ? 'border-gold-400 animate-spin'
                        : existingRecord
                        ? 'border-red-500'
                        : completedChallenge
                        ? 'border-gold-400 group-hover:rotate-45'
                        : 'border-slate-600'
                    }`}
                  />

                  {/* Lõi nút bấm */}
                  <div
                    className={`w-full h-full rounded-full flex flex-col items-center justify-center p-3 shadow-inner transition ${
                      existingRecord
                        ? 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white'
                        : completedChallenge
                        ? 'bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 text-slate-950'
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-80">
                      {mustSpin
                        ? 'ĐANG QUAY...'
                        : existingRecord
                        ? 'HẾT LƯỢT RỒI'
                        : completedChallenge
                        ? 'ĐÃ MỞ KHÓA'
                        : 'KHÓA QUAY'}
                    </span>
                    <span className="text-lg sm:text-xl font-black tracking-tight leading-none my-1">
                      {existingRecord
                        ? 'XEM LẠI'
                        : completedChallenge
                        ? 'QUAY NGAY'
                        : 'LÀM THỬ THÁCH'}
                    </span>
                    <span className="text-[9px] font-bold opacity-75">
                      {existingRecord
                        ? 'Tham là ăn đòn nha'
                        : completedChallenge
                        ? 'Bấm để nhận quà!'
                        : 'Cần làm thử thách trước'}
                    </span>
                  </div>
                </button>

                <p className="mt-3 text-xs text-center text-slate-400">
                  {mustSpin ? (
                    <span className="text-gold-400 font-semibold animate-pulse">
                      ⚡ Bánh xe đang quay tít mù, cầu trời khấn phật đừng trúng món bựa nhất! 😂
                    </span>
                  ) : existingRecord ? (
                    <span className="text-red-400 font-semibold">
                      ⛔ Hết lượt rồi sếp ơi! Nhấn vào nút để ngắm lại chiến lợi phẩm!
                    </span>
                  ) : completedChallenge ? (
                    <span className="text-emerald-400 font-semibold">
                      🔥 Tuyệt vời! Bạn đã vượt qua thử thách, bấm nút to tướng để quay thưởng ngay!
                    </span>
                  ) : (
                    <span>💡 Hoàn thành thử thách (quay video / chụp ảnh) để mở khóa vòng quay may mắn!</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA: Vòng quay may mắn Canvas (Chiếm 6/12 cột = 50% trung tâm) */}
          <div className="lg:col-span-6 xl:col-span-6 min-w-0 flex justify-center order-1 lg:order-2">
            <LuckyWheel
              prizes={PRIZES}
              mustSpin={mustSpin}
              targetPrizeIndex={targetPrizeIndex}
              onFinished={handleWheelFinished}
              disabled={mustSpin}
            />
          </div>

          {/* CỘT PHẢI: Bảng vàng vinh danh (Live feed) - (Chiếm 3/12 cột = 25%) */}
          <div className="lg:col-span-3 xl:col-span-3 min-w-0 flex justify-center lg:justify-end order-3 h-full">
            <div className="w-full">
              <HistoryList
                records={records}
                totalMembers={MEMBERS.length}
                members={MEMBERS}
                spinningMemberId={spinningMemberId}
                onSelectRecord={(r) => setSelectedRecordForDetail(r)}
              />
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-400">
        <p>
          🎉 Chúc toàn thể 500 anh em một ngày <strong>Quốc tế Đàn Ông 19/11</strong>: Tiền đầy túi, tình đầy tim, deadline tự tan biến, phong độ ngời ngời và tối nay không bị ai bắt rửa bát hay quét nhà! 🍻💪🚀
        </p>
      </footer>

      {/* POPUP VÒNG QUAY THỬ THÁCH (BƯỚC 1) */}
      {showChallengeWheel && selectedMember && (
        <ChallengeWheelModal
          playerName={selectedMember.name}
          onSelectChallenge={handleSelectChallenge}
          onClose={() => setShowChallengeWheel(false)}
        />
      )}

      {/* PHÒNG STUDIO QUAY VIDEO / CHỤP ẢNH THỬ THÁCH (BƯỚC 2) */}
      {activeStudioChallenge && selectedMember && (
        <ChallengeStudioModal
          playerName={selectedMember.name}
          memberId={selectedMember.id}
          challenge={activeStudioChallenge}
          onCompleted={handleChallengeCompleted}
          onClose={() => setActiveStudioChallenge(null)}
        />
      )}

      {/* POPUP XEM CHI TIẾT VIDEO / ẢNH THỬ THÁCH CỦA TỪNG NGƯỜI TRONG BẢNG VÀNG */}
      {selectedRecordForDetail && (
        <MemberDetailModal
          record={selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
        />
      )}

      {/* POPUP CHÚC MỪNG CHIẾN THẮNG */}
      {winnerModalPrize && selectedMember && (
        <WinnerModal
          member={selectedMember}
          prize={winnerModalPrize}
          photoUrl={currentPhotoUrl || records.find(r => r.memberId === selectedMember?.id)?.photoUrl}
          videoUrl={winnerVideoUrl || records.find(r => r.memberId === selectedMember?.id)?.videoUrl}
          challengeTitle={winnerChallengeTitle || records.find(r => r.memberId === selectedMember?.id)?.challengeTitle}
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

      {/* POPUP ĐĂNG NHẬP ADMIN */}
      {showLoginModal && (
        <AdminLoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* POPUP CÀI ĐẶT & RESET DỮ LIỆU PHỤC VỤ TEST & CẤU HÌNH CLOUD */}
      {showSettingsModal && (
        <AdminSettingsModal
          records={records}
          members={MEMBERS}
          isHideGoiY={isHideGoiYState}
          onToggleHideGoiY={handleToggleHideGoiY}
          greetingBanner={greetingBanner}
          onUpdateGreetingBanner={handleUpdateGreetingBanner}
          initialTab={adminInitialTab}
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
