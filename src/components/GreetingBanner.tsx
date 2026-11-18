import React, { useRef, useState, useEffect } from 'react'
import { Heart, Sparkles, Settings2 } from 'lucide-react'
import { GreetingBannerConfig } from '../types'

interface GreetingBannerProps {
  config: GreetingBannerConfig
  isAdmin?: boolean
  onEditClick?: () => void
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({
  config,
  isAdmin,
  onEditClick
}) => {
  const bannerRef = useRef<HTMLElement>(null)
  const [bannerHeight, setBannerHeight] = useState<number>(40)

  useEffect(() => {
    if (!config.enabled || !bannerRef.current) return

    const updateHeight = () => {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })
    resizeObserver.observe(bannerRef.current)
    window.addEventListener('resize', updateHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [config.enabled, config.message])

  if (!config.enabled || !config.message.trim()) {
    return null
  }

  return (
    <>
      {/* BANNER GHIM CỐ ĐỊNH Ở ĐỈNH MÀN HÌNH - KHÔNG BỊ TRÔI KHI CUỘN/VUỐT */}
      <aside
        ref={bannerRef}
        aria-label="Thông báo chúc mừng"
        className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-amber-950/95 via-rose-950/90 to-amber-950/95 border-b border-amber-500/40 backdrop-blur-md shadow-lg text-amber-100"
      >
        <div className="max-w-[1536px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5">
          {/* Left Badge (Responsive: ẩn trên màn hình siêu nhỏ, hiện từ sm+) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider flex-shrink-0 shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Nonelab 19/11</span>
          </div>

          {/* Center Main Message */}
          <div className="flex-1 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-semibold tracking-wide">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 animate-pulse flex-shrink-0" />
            <span className="text-amber-100 font-bold drop-shadow-sm select-none break-words">
              {config.message}
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 hidden xs:inline-block" />
          </div>

          {/* Right Admin Shortcut (Chỉ hiện khi Admin đã đăng nhập) */}
          {isAdmin && onEditClick ? (
            <button
              type="button"
              onClick={onEditClick}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-[11px] font-bold transition shadow-sm"
              title="Chỉnh sửa lời chúc này trong Cài đặt Admin"
            >
              <Settings2 className="w-3 h-3" />
              <span className="hidden md:inline">Sửa lời chúc</span>
            </button>
          ) : (
            /* Khoảng trống để cân đối vị trí chữ ở giữa */
            <div className="hidden sm:block w-[100px] flex-shrink-0" />
          )}
        </div>
      </aside>

      {/* THẺ GIỮ CHỖ (SPACER) ĐẢM BẢO NỘI DUNG DƯỚI KHÔNG BỊ BANNER ĐÈ LÊN */}
      <div
        style={{ height: `${bannerHeight}px` }}
        className="w-full flex-shrink-0 pointer-events-none transition-all duration-150"
        aria-hidden="true"
      />
    </>
  )
}
