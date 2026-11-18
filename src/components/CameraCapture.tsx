import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { Camera, CameraOff, Scan, ShieldCheck } from 'lucide-react'

export interface CameraCaptureHandle {
  capturePhoto: () => string | null
}

interface CameraCaptureProps {
  isActive: boolean
  playerName: string
}

export const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  ({ isActive, playerName }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [hasCamera, setHasCamera] = useState<boolean>(true)
    const [cameraAllowed, setCameraAllowed] = useState<boolean>(false)
    const [isRequesting, setIsRequesting] = useState<boolean>(false)

    // Khởi động Camera
    const startCamera = async () => {
      setIsRequesting(true)
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false)
          setIsRequesting(false)
          return
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 320 },
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
      } catch (err) {
        console.warn('Không thể truy cập camera:', err)
        setCameraAllowed(false)
      } finally {
        setIsRequesting(false)
      }
    }

    // Tự động yêu cầu camera khi có người chơi
    useEffect(() => {
      if (isActive && !stream) {
        startCamera()
      }

      return () => {
        // Cleanup stream khi unmount
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }, [isActive])

    // Cập nhật video element khi stream có
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
      }
    }, [stream])

    // Chụp lại 1 khung hình
    useImperativeHandle(ref, () => ({
      capturePhoto: () => {
        if (!videoRef.current || !cameraAllowed) return null

        try {
          const video = videoRef.current
          const canvas = document.createElement('canvas')
          canvas.width = 240
          canvas.height = 240
          const ctx = canvas.getContext('2d')
          if (!ctx) return null

          // Cắt vuông từ tâm video và flip ngang cho tự nhiên (mirror)
          const minDim = Math.min(video.videoWidth, video.videoHeight)
          const sx = (video.videoWidth - minDim) / 2
          const sy = (video.videoHeight - minDim) / 2

          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, canvas.width, canvas.height)

          // Xuất ảnh JPEG chất lượng 0.7 để dung lượng nhẹ ~15KB
          return canvas.toDataURL('image/jpeg', 0.7)
        } catch (e) {
          console.error('Lỗi chụp ảnh:', e)
          return null
        }
      }
    }))

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
              <div className="absolute top-1 right-2 text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> REC
              </div>
            </>
          ) : (
            <div className="p-3 text-center flex flex-col items-center justify-center text-slate-400">
              {hasCamera ? (
                <>
                  <CameraOff className="w-6 h-6 text-slate-500 mb-1" />
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={isRequesting}
                    className="text-[10px] text-gold-400 hover:underline font-bold"
                  >
                    {isRequesting ? 'Đang mở...' : 'Bật Camera'}
                  </button>
                </>
              ) : (
                <div className="text-[10px] text-slate-500">
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  Không có Camera
                </div>
              )}
            </div>
          )}

          {/* Icon scan ở góc */}
          <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-gold-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-gold-500/30 flex items-center gap-1">
              <Scan className="w-2.5 h-2.5" />
              FACE ID 19/11
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-[11px] text-slate-400 text-center font-medium flex items-center gap-1">
          <Camera className="w-3 h-3 text-gold-400" />
          {cameraAllowed
            ? `Đã nhận diện: ${playerName || 'Sẵn sàng'}`
            : 'Tự động chụp ảnh bằng chứng khi bấm quay'}
        </p>
      </div>
    )
  }
)

CameraCapture.displayName = 'CameraCapture'
