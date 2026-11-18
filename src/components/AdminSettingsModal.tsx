import React, { useState, useEffect } from 'react'
import { SpinRecord, Member, GreetingBannerConfig } from '../types'
import { ConfirmModal, ConfirmModalConfig } from './ConfirmModal'
import {
  getCloudConfig,
  saveCloudConfig,
  CloudConfig,
  isCloudinaryConfigured,
  isFirebaseConfigured,
  resetAllFirebaseRecords,
  deleteRecordFromFirebase,
  DEFAULT_GREETING_MESSAGE,
  normalizeFirebaseUrl,
  testFirebaseConnection,
  syncAllRecordsToFirebase
} from '../utils/onlineStorage'
import { clearAllMedia, deleteMediaBlob } from '../utils/indexedDbStorage'
import {
  Settings,
  RotateCcw,
  Download,
  X,
  LogOut,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  Save,
  Loader2,
  Heart,
  Sparkles,
  MessageSquare
} from 'lucide-react'

interface AdminSettingsModalProps {
  records: SpinRecord[]
  members?: Member[]
  isHideGoiY: boolean
  onToggleHideGoiY: (value: boolean) => void
  greetingBanner: GreetingBannerConfig
  onUpdateGreetingBanner: (config: GreetingBannerConfig) => Promise<void> | void
  initialTab?: 'general' | 'banner' | 'cloud'
  onResetAll: () => void
  onResetMember: (memberId: string) => void
  onLogout: () => void
  onClose: () => void
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  records,
  isHideGoiY,
  onToggleHideGoiY,
  greetingBanner,
  onUpdateGreetingBanner,
  initialTab = 'general',
  onResetAll,
  onResetMember,
  onLogout,
  onClose
}) => {
  const [successMsg, setSuccessMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null)

  // Cloud Config State
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(getCloudConfig())
  const [activeTab, setActiveTab] = useState<'general' | 'banner' | 'cloud'>(initialTab)

  // Greeting Banner State
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(greetingBanner.enabled)
  const [bannerMessage, setBannerMessage] = useState<string>(greetingBanner.message)
  const [isSavingBanner, setIsSavingBanner] = useState<boolean>(false)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    setBannerEnabled(greetingBanner.enabled)
    setBannerMessage(greetingBanner.message)
  }, [greetingBanner])

  useEffect(() => {
    setCloudConfig(getCloudConfig())
  }, [])

  const [isTestingCloud, setIsTestingCloud] = useState<boolean>(false)
  const [cloudErrorMsg, setCloudErrorMsg] = useState<string>('')

  const handleSaveCloudConfig = async () => {
    setCloudErrorMsg('')
    setIsTestingCloud(true)

    const normalizedUrl = normalizeFirebaseUrl(cloudConfig.firebaseDbUrl)
    const newConfig = { ...cloudConfig, firebaseDbUrl: normalizedUrl }
    setCloudConfig(newConfig)
    saveCloudConfig(newConfig)

    // Nếu người dùng có điền Firebase URL -> Test kết nối thực tế
    if (normalizedUrl) {
      const testResult = await testFirebaseConnection(normalizedUrl)
      if (!testResult.success) {
        setIsTestingCloud(false)
        setCloudErrorMsg(testResult.message)
        return
      }

      // Kết nối thành công! Tự động đồng bộ toàn bộ lượt quay hiện có lên Firebase để không bị mất
      if (records.length > 0) {
        await syncAllRecordsToFirebase(records)
      }
      setSuccessMsg(`✅ Kết nối Firebase thành công! Đã tự động đồng bộ ${records.length} lượt quay lên mây.`)
    } else {
      setSuccessMsg('Đã lưu cấu hình Cloud!')
    }

    setIsTestingCloud(false)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSaveBanner = async () => {
    const trimmed = bannerMessage.trim()
    const finalMsg = trimmed || DEFAULT_GREETING_MESSAGE
    if (!trimmed) {
      setBannerMessage(DEFAULT_GREETING_MESSAGE)
    }
    setIsSavingBanner(true)
    try {
      await onUpdateGreetingBanner({
        enabled: bannerEnabled,
        message: finalMsg
      })
      setSuccessMsg('Đã lưu và cập nhật lời chúc đầu trang thành công!')
    } catch (e) {
      console.error(e)
      setSuccessMsg('Đã lưu lời chúc thành công!')
    } finally {
      setIsSavingBanner(false)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleResetBannerToDefault = () => {
    setBannerEnabled(true)
    setBannerMessage(DEFAULT_GREETING_MESSAGE)
  }

  // Xuất file CSV hỗ trợ Excel tiếng Việt (kèm UTF-8 BOM)
  const handleExportCSV = () => {
    const header = [
      'STT',
      'Họ và tên',
      'Phần quà nhận được',
      'Thử thách đã làm',
      'Thời gian nhận',
      'Link Video Nhiệm Vụ'
    ]
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.memberName}"`,
      `"${r.prizeName}"`,
      `"${r.challengeTitle || 'N/A'}"`,
      `"${r.spunAt}"`,
      `"${r.videoUrl || r.photoUrl || 'N/A'}"`
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

  const [isResetting, setIsResetting] = useState(false)

  // Lọc danh sách đã quay để reset lẻ
  const filteredRecords = records.filter(
    (r) =>
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleResetAllRecords = () => {
    setConfirmConfig({
      title: 'XÓA SẠCH TOÀN BỘ DATA (CLOUD FIREBASE & MÁY)?',
      message: `Hành động này sẽ XÓA SẠCH TRIỆT ĐỂ toàn bộ ${records.length} lượt quay, video và ảnh trên cả Firebase Realtime Database và bộ nhớ máy. Tất cả thiết bị kết nối sẽ được reset về 0 ngay lập tức!`,
      confirmText: 'XÁC NHẬN XÓA SẠCH 100%',
      cancelText: 'HỦY BỎ',
      type: 'danger',
      onConfirm: async () => {
        setIsResetting(true)
        setSuccessMsg('Đang gửi lệnh xóa sạch toàn bộ Database Cloud & Máy...')
        try {
          // 1. Xóa sạch Firebase Realtime Database trên mây (cả node /records và root /.json)
          const fbOk = await resetAllFirebaseRecords()
          // 2. Xóa sạch kho lưu trữ Media Blob IndexedDB
          await clearAllMedia()
          // 3. Xóa LocalStorage và reset state ứng dụng
          onResetAll()

          if (isFirebaseConfigured()) {
            if (fbOk) {
              setSuccessMsg('✅ ĐÃ XÓA SẠCH 100% TOÀN BỘ DATABASE TRÊN FIREBASE CLOUD VÀ BỘ NHỚ MÁY!')
            } else {
              setSuccessMsg('Đã xóa dữ liệu trên máy. Không thể xóa Firebase Cloud (vui lòng kiểm tra lại URL Database).')
            }
          } else {
            setSuccessMsg('✅ Đã xóa sạch toàn bộ lịch sử và video/ảnh trên máy!')
          }
        } catch (err) {
          console.error('Lỗi khi reset:', err)
          setSuccessMsg('Đã xóa sạch dữ liệu!')
        } finally {
          setIsResetting(false)
          setTimeout(() => setSuccessMsg(''), 4500)
        }
      }
    })
  }

  const handleResetFirebaseOnly = () => {
    setConfirmConfig({
      title: 'XÓA TRẮNG DATABASE FIREBASE CLOUD?',
      message: 'Hành động này sẽ xóa toàn bộ dữ liệu trên Firebase Realtime Database (không ảnh hưởng đến bộ nhớ offline máy hiện tại).',
      confirmText: 'XÓA TRẮNG FIREBASE',
      cancelText: 'HỦY',
      type: 'danger',
      onConfirm: async () => {
        setIsResetting(true)
        const fbOk = await resetAllFirebaseRecords()
        setIsResetting(false)
        if (fbOk) {
          setSuccessMsg('✅ Đã xóa trắng 100% Database trên Firebase!')
        } else {
          setSuccessMsg('⚠️ Không thể kết nối hoặc xóa Firebase. Vui lòng kiểm tra lại cấu hình.')
        }
        setTimeout(() => setSuccessMsg(''), 3500)
      }
    })
  }

  const handleConfirmResetMember = (r: SpinRecord) => {
    setConfirmConfig({
      title: 'CẤP LẠI LƯỢT QUAY?',
      message: `Cấp lại lượt quay cho anh ${r.memberName}? Phần quà "${r.prizeName}" và video/ảnh thử thách trước đó sẽ được xoá để anh này có thể quay lại.`,
      confirmText: 'ĐỒNG Ý CẤP LẠI',
      cancelText: 'HỦY',
      type: 'warning',
      onConfirm: async () => {
        onResetMember(r.memberId)
        if (r.mediaStorageKey) await deleteMediaBlob(r.mediaStorageKey)
        await deleteRecordFromFirebase(r.memberId)
        setSuccessMsg(`Đã cấp lại lượt quay cho ${r.memberName}!`)
        setTimeout(() => setSuccessMsg(''), 2500)
      }
    })
  }

  const hasCloudReady = isCloudinaryConfigured() && isFirebaseConfigured()

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {/* Nút X đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition z-10"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Modal */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                CÀI ĐẶT & RESET DỮ LIỆU
              </h3>
              <p className="text-[11px] text-slate-400">
                Toàn quyền quản trị, đồng bộ online và kiểm thử
              </p>
            </div>
          </div>

          {/* Alert Thông báo thành công */}
          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tabs chuyển đổi giữa Quản lý, Lời chúc & Cấu hình Cloud */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950 p-1 rounded-xl mb-3 border border-slate-800 text-[11px] sm:text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition ${
                activeTab === 'general'
                  ? 'bg-slate-800 text-gold-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lịch sử & Reset
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banner')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'banner'
                  ? 'bg-slate-800 text-gold-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>Lời chúc 19/11</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'cloud'
                  ? 'bg-slate-800 text-gold-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3 h-3" />
              <span>Cloud Online</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasCloudReady ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
            {activeTab === 'banner' ? (
              /* TAB CẤU HÌNH LỜI CHÚC GHIM ĐẦU TRANG */
              <div className="space-y-3.5">
                {/* Bật / Tắt Banner */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Ghim lời chúc mừng ở đầu trang web</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {bannerEnabled
                        ? 'Đang bật: Lời chúc xuất hiện cố định ở đỉnh website'
                        : 'Đang tắt: Ẩn thanh lời chúc'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerEnabled(!bannerEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      bannerEnabled ? 'bg-gold-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                        bannerEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Khung Soạn Thảo */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                      <span>Nội dung lời chúc mừng:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleResetBannerToDefault}
                      className="text-[11px] text-slate-400 hover:text-gold-400 flex items-center gap-1 transition"
                      title="Đặt lại lời chúc gốc"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Khôi phục mặc định
                    </button>
                  </div>

                  <textarea
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    rows={3}
                    placeholder="Nhập lời chúc ghim ở đầu trang web..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-gold-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none transition"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Gợi ý: Thêm icon hoặc trái tim &lt;3 để câu chúc thật ấm áp!</span>
                    <span>{bannerMessage.length} ký tự</span>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem trước thanh thông báo:</span>
                  </div>

                  {bannerEnabled ? (
                    <div className="w-full bg-gradient-to-r from-amber-950/95 via-rose-950/90 to-amber-950/95 border border-amber-500/40 rounded-xl p-2.5 text-center text-xs font-semibold text-amber-100 flex items-center justify-center gap-2 shadow-inner">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse flex-shrink-0" />
                      <span className="break-words font-bold">
                        {bannerMessage.trim() || DEFAULT_GREETING_MESSAGE}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500 italic">
                      (Thanh thông báo đang TẮT - sẽ không xuất hiện trên web)
                    </div>
                  )}
                </div>

                {/* Nút Lưu Cấu hình Banner */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSaveBanner}
                    disabled={isSavingBanner}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-gold-500 to-amber-600 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                  >
                    {isSavingBanner ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Save className="w-4 h-4 text-slate-950" />
                    )}
                    <span>LƯU CẤU HÌNH LỜI CHÚC</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    * Lưu vào bộ nhớ máy và tự động đồng bộ realtime lên Firebase Cloud (nếu đã kết nối).
                  </p>
                </div>
              </div>
            ) : activeTab === 'cloud' ? (
              /* TAB CẤU HÌNH CLOUD ONLINE (FIREBASE & CLOUDINARY) */
              <div className="space-y-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gold-400">
                    <Cloud className="w-4 h-4" />
                    <span>TRẠNG THÁI KẾT NỐI ONLINE:</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cloudinary (Lưu Video & Ảnh):</span>
                      <span
                        className={`font-bold ${
                          isCloudinaryConfigured()
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isCloudinaryConfigured() ? '✅ Đã kích hoạt' : '⚠️ Chưa điền key (dùng máy local)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Firebase Realtime (Đồng bộ Bảng vàng):</span>
                      <span
                        className={`font-bold ${
                          isFirebaseConfigured()
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isFirebaseConfigured() ? '✅ Đã kích hoạt' : '⚠️ Chưa điền URL (dùng máy local)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">
                    1. Cloudinary Upload (Lưu Video Free)
                  </h4>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Cloud Name:
                    </label>
                    <input
                      type="text"
                      value={cloudConfig.cloudinaryCloudName}
                      onChange={(e) =>
                        setCloudConfig((prev) => ({
                          ...prev,
                          cloudinaryCloudName: e.target.value.trim()
                        }))
                      }
                      placeholder="Ví dụ: my-cloud-1911"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Upload Preset (Unsigned):
                    </label>
                    <input
                      type="text"
                      value={cloudConfig.cloudinaryUploadPreset}
                      onChange={(e) =>
                        setCloudConfig((prev) => ({
                          ...prev,
                          cloudinaryUploadPreset: e.target.value.trim()
                        }))
                      }
                      placeholder="Ví dụ: menday_preset"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">
                    2. Firebase Realtime Database URL
                  </h4>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Database URL:
                    </label>
                    <input
                      type="text"
                      value={cloudConfig.firebaseDbUrl}
                      onChange={(e) =>
                        setCloudConfig((prev) => ({
                          ...prev,
                          firebaseDbUrl: e.target.value.trim()
                        }))
                      }
                      placeholder="https://your-project-default-rtdb.firebaseio.com"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Hiển thị lỗi nếu kết nối Firebase thất bại */}
                {cloudErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-start gap-2 shadow animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="block text-red-200 mb-0.5">LỖI KẾT NỐI FIREBASE:</strong>
                      <span>{cloudErrorMsg}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCloudConfig}
                    disabled={isTestingCloud}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow transition"
                  >
                    {isTestingCloud ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ĐANG KIỂM TRA KẾT NỐI...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>LƯU CẤU HÌNH ONLINE</span>
                      </>
                    )}
                  </button>

                  {isFirebaseConfigured() && (
                    <button
                      type="button"
                      onClick={handleResetFirebaseOnly}
                      disabled={isResetting}
                      className="py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      title="Xóa toàn bộ database trên Firebase"
                    >
                      {isResetting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>Xóa Firebase</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* TAB QUẢN LÝ DỮ LIỆU & RESET */
              <div className="space-y-3.5">
                {/* Trạng thái đăng nhập */}
                <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Đang đăng nhập quyền: <strong className="text-gold-400">Admin</strong>
                  </span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>

                {/* Shortcut Cấu hình Lời chúc đầu trang */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/50" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>Lời chúc ghim đầu trang:</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                            bannerEnabled
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {bannerEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-[280px]">
                        &quot;{bannerMessage}&quot;
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('banner')}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gold-400 text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
                  >
                    Chỉnh sửa
                  </button>
                </div>

                {/* Ẩn / Hiện gợi ý tên */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Ẩn gợi ý danh sách tên (Bảo mật)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isHideGoiY === false
                        ? 'Đang bật ẩn: Người chơi phải tự gõ đúng họ tên'
                        : 'Đang hiện: Cho phép xem danh sách và gợi ý dropdown'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !isHideGoiY
                      onToggleHideGoiY(nextVal)
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

                {/* RESET TOÀN BỘ (CLOUD FIREBASE + MEDIA + MÁY) */}
                <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5 text-red-400 font-bold text-xs uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    Reset toàn bộ dữ liệu kiểm thử (Cloud & Máy):
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Xoá sạch toàn bộ {records.length} lượt quay, video/ảnh trên <strong>Firebase Realtime Database</strong> và bộ nhớ máy:
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAllRecords}
                    disabled={isResetting}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ĐANG XÓA TOÀN BỘ DATABASE & FIREBASE...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>XÓA TOÀN BỘ DATABASE TRÊN CLOUD & FIREBASE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* RESET TỪNG NGƯỜI */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase mb-2">
                    Reset lượt quay từng người ({records.length}):
                  </h4>

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

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
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
                          >
                            <Trash2 className="w-3 h-3" />
                            Cho quay lại
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* XUẤT CSV */}
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
            )}
          </div>
        </div>
      </div>

      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </>
  )
}
