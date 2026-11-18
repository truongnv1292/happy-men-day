import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Camera, CameraOff, Scan, ShieldCheck, RefreshCw } from 'lucide-react'

export interface CameraCaptureHandle {
  capturePhoto: () => string | null
  startCamera: () => Promise<boolean>
  hasCamera: boolean
  cameraAllowed: boolean
  isRequesting: boolean
}

interface CameraCaptureProps {
  isActive?: boolean
  playerName: string
}

export const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  ({ playerName }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [hasCamera, setHasCamera] = useState<boolean>(true)
    const [cameraAllowed, setCameraAllowed] = useState<boolean>(false)
    const [isRequesting, setIsRequesting] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    // Khởi động Camera (Hỗ trợ cả máy tính & điện thoại di động)
    const startCamera = useCallback(async (): Promise<boolean> => {
      setIsRequesting(true)
      setErrorMessage('')

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false)
          setCameraAllowed(false)
          setIsRequesting(false)
          return false
        }

        // Kiểm tra xem thiết bị có phần cứng camera không
        if (navigator.mediaDevices.enumerateDevices) {
          try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoInputs = devices.filter((d) => d.kind === 'videoinput')
            if (devices.length > 0 && videoInputs.length === 0) {
              setHasCamera(false)
              setCameraAllowed(false)
              setIsRequesting(false)
              return false
            }
          } catch {
            // bỏ qua nếu enumerateDevices bị chặn khi chưa cấp quyền
          }
        }

        // Yêu cầu camera trước (selfie trên mobile, webcam trên PC)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        })

        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setCameraAllowed(true)
        setHasCamera(true)
        setErrorMessage('')
        setIsRequesting(false)
        return true
      } catch (err: unknown) {
        console.warn('Lỗi mở Camera:', err)
        setCameraAllowed(false)
        const error = err as { name?: string; message?: string }

        if (
          error?.name === 'NotFoundError' ||
          error?.name === 'DevicesNotFoundError'
        ) {
          setHasCamera(false)
          setErrorMessage('Thiết bị không có Camera')
        } else if (
          error?.name === 'NotAllowedError' ||
          error?.name === 'PermissionDeniedError'
        ) {
          setHasCamera(true)
          setErrorMessage('Trình duyệt đang chặn camera')
        } else {
          setHasCamera(true)
          setErrorMessage('Chưa bật quyền camera')
        }
        setIsRequesting(false)
        return false
      }
    }, [])

    // Tự động yêu cầu quyền camera ngay khi vào trang web (cả desktop & mobile)
    useEffect(() => {
      startCamera()

      return () => {
        // Cleanup stream khi rời trang
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }, [])

    // Gắn stream vào video khi có stream
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
      }
    }, [stream])

    // Expose các hàm và trạng thái ra ngoài qua ref
    useImperativeHandle(
      ref,
      () => ({
        capturePhoto: () => {
          if (!videoRef.current || !cameraAllowed) return null

          try {
            const video = videoRef.current
            const canvas = document.createElement('canvas')
            canvas.width = 280
            canvas.height = 280
            const ctx = canvas.getContext('2d')
            if (!ctx) return null

            // Cắt vuông từ tâm và lật gương (mirror) tự nhiên
            const minDim = Math.min(video.videoWidth, video.videoHeight)
            const sx = (video.videoWidth - minDim) / 2
            const sy = (video.videoHeight - minDim) / 2

            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(
              video,
              sx,
              sy,
              minDim,
              minDim,
              0,
              0,
              canvas.width,
              canvas.height
            )

            // Ảnh JPEG chất lượng cao dung lượng tối ưu ~20KB
            return canvas.toDataURL('image/jpeg', 0.8)
          } catch (e) {
            console.error('Lỗi chụp ảnh selfie:', e)
            return null
          }
        },
        startCamera,
        hasCamera,
        cameraAllowed,
        isRequesting
      }),
      [startCamera, hasCamera, cameraAllowed, isRequesting]
    )

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gold-500/80 bg-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center">
          {cameraAllowed && stream ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {/* Radar scanner overlay */}
              <div className="absolute inset-0 pointer-events-none border border-gold-400/40 rounded-full animate-pulse" />
              <div className="absolute top-1.5 right-2 text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> REC
              </div>
            </>
          ) : (
            <div className="p-3 text-center flex flex-col items-center justify-center text-slate-400">
              {hasCamera ? (
                <>
                  <CameraOff className="w-6 h-6 text-amber-400/80 mb-1" />
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={isRequesting}
                    className="text-[11px] text-gold-400 hover:text-gold-300 font-extrabold flex items-center gap-1 bg-gold-500/10 hover:bg-gold-500/20 px-2.5 py-1 rounded-full border border-gold-500/30 transition shadow"
                  >
                    {isRequesting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Đang mở...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>Bật Camera</span>
                      </>
                    )}
                  </button>
                  {errorMessage && (
                    <span className="text-[9px] text-red-400 font-medium mt-1 leading-tight">
                      {errorMessage}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-[10px] text-slate-400 flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                  <span>Không có Camera</span>
                  <span className="text-[9px] text-emerald-400/80 font-semibold">(Được phép quay)</span>
                </div>
              )}
            </div>
          )}

          {/* Icon scan ở góc */}
          <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-gold-300 bg-slate-900/95 px-2 py-0.5 rounded-full border border-gold-500/40 flex items-center gap-1 shadow">
              <Scan className="w-2.5 h-2.5 text-gold-400" />
              FACE ID 19/11
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-[11px] text-slate-400 text-center font-medium flex items-center gap-1">
          <Camera className="w-3 h-3 text-gold-400" />
          {cameraAllowed
            ? `Đã nhận diện: ${playerName || 'Sẵn sàng ghi hình'}`
            : hasCamera
            ? 'Vui lòng bật camera để nhận diện trước khi quay'
            : 'Thiết bị không có cam - Cho phép quay trực tiếp'}
        </p>
      </div>
    )
  }
)

CameraCapture.displayName = 'CameraCapture'
