import React, { useState, useEffect, useRef } from 'react'
import { ChallengeItem } from '../types'
import {
  saveMediaBlob,
  getMediaObjectUrl
} from '../utils/indexedDbStorage'
import {
  isCloudinaryConfigured,
  uploadToCloudinary
} from '../utils/onlineStorage'
import {
  Video,
  Camera,
  X,
  RotateCcw,
  CheckCircle2,
  UploadCloud,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react'

interface ChallengeStudioModalProps {
  playerName: string
  memberId: string
  challenge: ChallengeItem
  onCompleted: (result: {
    videoUrl?: string
    photoUrl?: string
    challengeId: string
    challengeTitle: string
    mediaType: 'video' | 'photo'
  }) => void
  onClose: () => void
}

export const ChallengeStudioModal: React.FC<ChallengeStudioModalProps> = ({
  playerName,
  memberId,
  challenge,
  onCompleted,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const [streamReady, setStreamReady] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string>('')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [laughCountdown, setLaughCountdown] = useState<number>(10)

  // Preview State
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('')

  // Khởi động Camera và Micro
  useEffect(() => {
    let active = true

    const initCamera = async () => {
      setCameraError('')
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ truy cập camera/micro')
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 640 }
          },
          audio: challenge.mediaType === 'video'
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStreamReady(true)
      } catch (err: unknown) {
        console.error('Lỗi mở camera/mic:', err)
        const e = err as { name?: string; message?: string }
        if (e.name === 'NotAllowedError') {
          setCameraError('Bạn chưa cấp quyền truy cập Camera / Micro trong trình duyệt.')
        } else {
          setCameraError(e.message || 'Không thể mở Camera / Micro trên thiết bị.')
        }
      }
    }

    initCamera()

    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [challenge.mediaType])

  // Đếm thời gian ghi hình
  useEffect(() => {
    let timer: number
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording])

  // Bộ đếm 10 giây cho thử thách "Cười trong 10 giây"
  useEffect(() => {
    let countdownInterval: number
    if (isRecording && challenge.id === 'laugh10s') {
      countdownInterval = window.setInterval(() => {
        setLaughCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(countdownInterval)
  }, [isRecording, challenge.id])

  // Bắt đầu quay Video
  const handleStartRecording = () => {
    if (!streamRef.current) return
    recordedChunksRef.current = []

    try {
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ]
      let selectedMime = ''
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m
          break
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(streamRef.current, options)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blobType = selectedMime || 'video/webm'
        const videoBlob = new Blob(recordedChunksRef.current, { type: blobType })
        setPreviewBlob(videoBlob)
        const objUrl = URL.createObjectURL(videoBlob)
        setPreviewUrl(objUrl)
        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start(500) // Nhận chunks mỗi 500ms
      setIsRecording(true)
      setRecordingSeconds(0)
      if (challenge.id === 'laugh10s') {
        setLaughCountdown(10)
      }
    } catch (err) {
      console.error('Không thể bắt đầu quay video:', err)
      setCameraError('Thiết bị không hỗ trợ MediaRecorder quay video.')
    }
  }

  // Dừng quay Video
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  // Chụp ảnh Selfie
  const handleCapturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Cắt vuông từ tâm và lật gương (mirror)
    const minDim = Math.min(video.videoWidth, video.videoHeight)
    const sx = (video.videoWidth - minDim) / 2
    const sy = (video.videoHeight - minDim) / 2

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPreviewBlob(blob)
          const objUrl = URL.createObjectURL(blob)
          setPreviewUrl(objUrl)
        }
      },
      'image/jpeg',
      0.85
    )
  }

  // Quay lại / Chụp lại
  const handleResetMedia = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewBlob(null)
    setPreviewUrl(null)
    setRecordingSeconds(0)
    setLaughCountdown(10)

    // Khởi động lại stream nếu cần
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }

  // Nộp Bằng Chứng (Lưu IndexedDB + Upload Cloudinary nếu có)
  const handleSubmitMedia = async () => {
    if (!previewBlob) return

    setIsUploading(true)
    setUploadProgressMsg('Đang lưu bằng chứng vào hệ thống...')

    const mediaKey = `challenge_${memberId}_${Date.now()}`
    let finalVideoUrl: string | undefined = undefined
    let finalPhotoUrl: string | undefined = undefined

    try {
      // 1. Luôn lưu vào IndexedDB nội bộ để đảm bảo không mất video
      await saveMediaBlob(mediaKey, previewBlob, challenge.mediaType)

      // 2. Nếu Cloudinary đã cấu hình -> Đẩy lên mây để mọi người cùng xem trực tuyến
      if (isCloudinaryConfigured()) {
        setUploadProgressMsg('Đang tải lên Cloudinary để đồng bộ online...')
        try {
          const cloudUrl = await uploadToCloudinary(
            previewBlob,
            challenge.mediaType === 'video' ? 'video' : 'image'
          )
          if (challenge.mediaType === 'video') {
            finalVideoUrl = cloudUrl
          } else {
            finalPhotoUrl = cloudUrl
          }
        } catch (cloudErr) {
          console.warn('Lỗi upload Cloudinary, fallback dùng link IndexedDB:', cloudErr)
        }
      }

      // 3. Fallback: Nếu không có Cloudinary hoặc upload lỗi, dùng local object URL
      if (!finalVideoUrl && challenge.mediaType === 'video') {
        const localUrl = await getMediaObjectUrl(mediaKey)
        finalVideoUrl = localUrl || previewUrl || undefined
      }

      if (!finalPhotoUrl && challenge.mediaType === 'photo') {
        // Chuyển blob thành dataURL base64 cho ảnh nhỏ
        const reader = new FileReader()
        finalPhotoUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(previewBlob)
        })
      }

      setUploadProgressMsg('Hoàn tất! Đang mở khóa Vòng Quay May Mắn...')

      setTimeout(() => {
        setIsUploading(false)
        onCompleted({
          videoUrl: finalVideoUrl,
          photoUrl: finalPhotoUrl,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          mediaType: challenge.mediaType
        })
      }, 800)
    } catch (e) {
      console.error('Lỗi khi nộp bằng chứng:', e)
      setIsUploading(false)
      alert('Có lỗi xảy ra khi lưu bằng chứng. Vui lòng thử lại!')
    }
  }

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-gold-500/80 rounded-3xl p-4 sm:p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Nút thoát */}
        {!isRecording && !isUploading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header thử thách */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            THỬ THÁCH CHO {playerName.toUpperCase()}
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-1.5">
            <span>{challenge.icon}</span>
            <span>{challenge.title}</span>
          </h3>
          <p className="text-xs text-amber-300/90 font-medium px-4 mt-1 leading-snug">
            {challenge.instruction}
          </p>
        </div>

        {/* Khung Camera / Video Preview */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] my-2 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner">
          {cameraError ? (
            <div className="p-4 text-center text-red-400 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-2 text-red-400 animate-bounce" />
              <p className="text-sm font-bold mb-1">Lỗi Camera / Micro</p>
              <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
            </div>
          ) : previewUrl ? (
            /* CHẾ ĐỘ XEM LẠI (PREVIEW) */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {challenge.mediaType === 'video' ? (
                <video
                  ref={previewVideoRef}
                  src={previewUrl}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full max-h-[380px] object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Ảnh Selfie Bằng Chứng"
                  className="w-full h-full max-h-[380px] object-cover"
                />
              )}

              {/* Tag Bằng chứng đã sẵn sàng */}
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bằng chứng đã quay xong</span>
              </div>
            </div>
          ) : (
            /* CHẾ ĐỘ CAMERA LIVE */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[380px] object-cover transform -scale-x-100"
              />

              {/* Huy hiệu REC nhấp nháy khi đang quay video */}
              {isRecording && (
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>REC {formatSeconds(recordingSeconds)}</span>
                </div>
              )}

              {/* Bộ đếm ngược 10 giây riêng cho thử thách Cười */}
              {isRecording && challenge.id === 'laugh10s' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[2px]">
                  <span className="text-6xl sm:text-7xl font-black text-amber-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-ping">
                    {laughCountdown}
                  </span>
                  <span className="text-sm font-extrabold text-white mt-2 bg-slate-900/80 px-3 py-1 rounded-full border border-gold-500/40">
                    Cười tươi lên nào! 😂
                  </span>
                </div>
              )}

              {/* Khung hướng dẫn chụp cho ảnh chu mỏ / mắt lác */}
              {challenge.mediaType === 'photo' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                  <div className="text-[11px] font-bold text-gold-300 bg-slate-900/90 px-3 py-1 rounded-full border border-gold-500/40 shadow">
                    {challenge.id === 'pout_selfie'
                      ? '😚 Chu mỏ tạo dáng rồi bấm chụp!'
                      : '🤪 Liếc mắt lác rồi bấm chụp!'}
                  </div>
                  <div className="w-48 h-48 border-2 border-dashed border-gold-400/50 rounded-full" />
                  <div className="text-[10px] text-slate-400">Canh mặt vào giữa vòng tròn</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thanh trạng thái đang upload */}
        {isUploading && (
          <div className="my-2 p-3 bg-slate-950 border border-gold-500/50 rounded-2xl flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
            <span className="text-xs font-bold text-gold-300">{uploadProgressMsg}</span>
          </div>
        )}

        {/* BẢNG ĐIỀU KHIỂN NÚT BẤM (CONTROLS) */}
        <div className="mt-2 pt-2 border-t border-slate-800">
          {previewUrl ? (
            /* CÁC NÚT KHI ĐÃ CÓ BẰNG CHỨNG (PREVIEW) */
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetMedia}
                disabled={isUploading}
                className="flex-1 py-3 px-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{challenge.mediaType === 'video' ? 'Quay lại' : 'Chụp lại'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitMedia}
                disabled={isUploading}
                className="flex-[2] py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG GỬI...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>GỬI BẰNG CHỨNG & MỞ KHÓA</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* CÁC NÚT THAO TÁC TRỰC TIẾP */
            <div>
              {challenge.mediaType === 'video' ? (
                isRecording ? (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="w-3.5 h-3.5 rounded-sm bg-white" />
                    <span>HOÀN TẤT & DỪNG QUAY ({formatSeconds(recordingSeconds)})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={!streamReady || !!cameraError}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-4 h-4 text-red-600 fill-red-600" />
                    <span>BẮT ĐẦU QUAY VIDEO</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!streamReady || !!cameraError}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>CHỤP ẢNH SELFIE</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
