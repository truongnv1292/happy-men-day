import { SpinRecord, GreetingBannerConfig } from '../types'

const CLOUD_CONFIG_STORAGE_KEY = 'MENDAY_CLOUD_CONFIG_V1'
export const GREETING_BANNER_STORAGE_KEY = 'MENDAY_GREETING_BANNER_V1'

export const DEFAULT_GREETING_MESSAGE =
  'Chúc các chàng trai của Nonelab một ngày tràn ngập tình yêu thương và may mắn nha <3'

export const DEFAULT_GREETING_BANNER: GreetingBannerConfig = {
  enabled: true,
  message: DEFAULT_GREETING_MESSAGE
}

export function getGreetingBannerConfig(): GreetingBannerConfig {
  try {
    const raw = localStorage.getItem(GREETING_BANNER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
        message:
          typeof parsed.message === 'string' && parsed.message.trim()
            ? parsed.message
            : DEFAULT_GREETING_MESSAGE
      }
    }
  } catch (e) {
    console.error('Lỗi đọc greeting banner:', e)
  }
  return DEFAULT_GREETING_BANNER
}

export function saveGreetingBannerConfig(config: GreetingBannerConfig): void {
  try {
    localStorage.setItem(GREETING_BANNER_STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Lỗi lưu greeting banner:', e)
  }
}

export async function syncGreetingBannerToFirebase(config: GreetingBannerConfig): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    const url = `${cfg.firebaseDbUrl}/greetingBanner.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi đồng bộ Banner lên Firebase:', e)
    return false
  }
}

export async function fetchGreetingBannerFromFirebase(): Promise<GreetingBannerConfig | null> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return null

  try {
    const url = `${cfg.firebaseDbUrl}/greetingBanner.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data !== 'object') return null
    return {
      enabled: typeof data.enabled === 'boolean' ? data.enabled : true,
      message:
        typeof data.message === 'string' && data.message.trim()
          ? data.message
          : DEFAULT_GREETING_MESSAGE
    }
  } catch (e) {
    console.error('Lỗi tải banner từ Firebase:', e)
    return null
  }
}

export interface CloudConfig {
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
  firebaseDbUrl: string // e.g. https://your-project-default-rtdb.firebaseio.com
}

// Lấy cấu hình từ localStorage hoặc biến môi trường Vite (.env)
export function getCloudConfig(): CloudConfig {
  let stored: Partial<CloudConfig> = {}
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY)
    if (raw) stored = JSON.parse(raw)
  } catch {
    // ignore
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {}

  return {
    cloudinaryCloudName:
      stored.cloudinaryCloudName ||
      metaEnv.VITE_CLOUDINARY_CLOUD_NAME ||
      '',
    cloudinaryUploadPreset:
      stored.cloudinaryUploadPreset ||
      metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ||
      '',
    firebaseDbUrl: (
      stored.firebaseDbUrl ||
      metaEnv.VITE_FIREBASE_DB_URL ||
      ''
    ).replace(/\/+$/, '')
  }
}

export function saveCloudConfig(config: CloudConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Không thể lưu Cloud config:', e)
  }
}

export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudConfig()
  return !!cfg.cloudinaryCloudName && !!cfg.cloudinaryUploadPreset
}

export function isFirebaseConfigured(): boolean {
  const cfg = getCloudConfig()
  return !!cfg.firebaseDbUrl
}

// Tải Video hoặc Ảnh lên Cloudinary (Unsigned Preset)
export async function uploadToCloudinary(
  blob: Blob,
  resourceType: 'video' | 'image'
): Promise<string> {
  const cfg = getCloudConfig()
  if (!cfg.cloudinaryCloudName || !cfg.cloudinaryUploadPreset) {
    throw new Error('Chưa cấu hình Cloudinary Cloud Name và Upload Preset')
  }

  const formData = new FormData()
  const extension = resourceType === 'video' ? 'webm' : 'jpg'
  formData.append('file', blob, `challenge_${Date.now()}.${extension}`)
  formData.append('upload_preset', cfg.cloudinaryUploadPreset)

  const url = `https://api.cloudinary.com/v1_1/${cfg.cloudinaryCloudName}/${resourceType}/upload`

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Lỗi upload Cloudinary:', errorText)
    throw new Error(`Upload thất bại: ${response.status}`)
  }

  const data = await response.json()
  return data.secure_url as string
}

// Lưu 1 bản ghi người chơi lên Firebase Realtime Database
export async function syncRecordToFirebase(record: SpinRecord): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    const url = `${cfg.firebaseDbUrl}/records/${record.memberId}.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi đồng bộ Firebase:', e)
    return false
  }
}

// Lấy danh sách toàn bộ bản ghi từ Firebase
export async function fetchRecordsFromFirebase(): Promise<SpinRecord[] | null> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return null

  try {
    const url = `${cfg.firebaseDbUrl}/records.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data) return []

    // Map object to array
    return Object.values(data) as SpinRecord[]
  } catch (e) {
    console.error('Lỗi tải danh sách từ Firebase:', e)
    return null
  }
}

// Xóa 1 bản ghi trên Firebase
export async function deleteRecordFromFirebase(memberId: string): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    const url = `${cfg.firebaseDbUrl}/records/${memberId}.json`
    const res = await fetch(url, { method: 'DELETE' })
    return res.ok
  } catch (e) {
    console.error('Lỗi xóa trên Firebase:', e)
    return false
  }
}

// Xóa toàn bộ dữ liệu trên Firebase (Xóa sạch triệt để cả node /records lẫn root /.json)
export async function resetAllFirebaseRecords(): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    // 1. Xóa sạch nhánh /records.json
    await fetch(`${cfg.firebaseDbUrl}/records.json`, { method: 'DELETE' })
    // 2. Xóa sạch toàn bộ root database /.json để triệt để 100% không còn bất kỳ dữ liệu nào sót lại
    const res = await fetch(`${cfg.firebaseDbUrl}/.json`, { method: 'DELETE' })
    return res.ok
  } catch (e) {
    console.error('Lỗi reset toàn bộ Firebase:', e)
    return false
  }
}

// Lắng nghe Realtime SSE (Server-Sent Events) từ Firebase để tự động cập nhật mọi thiết bị
export function subscribeToFirebaseRecords(
  onUpdate: (records: SpinRecord[]) => void
): () => void {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return () => {}

  let eventSource: EventSource | null = null
  let pollInterval: number | null = null

  try {
    const streamUrl = `${cfg.firebaseDbUrl}/records.json`
    eventSource = new EventSource(streamUrl)

    eventSource.addEventListener('put', async () => {
      const records = await fetchRecordsFromFirebase()
      if (records) onUpdate(records)
    })

    eventSource.addEventListener('patch', async () => {
      const records = await fetchRecordsFromFirebase()
      if (records) onUpdate(records)
    })

    eventSource.onerror = () => {
      // Nếu EventSource gặp lỗi (ví dụ CORS hoặc network), chuyển sang Polling 5s/lần
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      if (!pollInterval) {
        pollInterval = window.setInterval(async () => {
          const records = await fetchRecordsFromFirebase()
          if (records) onUpdate(records)
        }, 5000)
      }
    }
  } catch (err) {
    console.warn('EventSource không hỗ trợ, dùng polling fallback:', err)
    pollInterval = window.setInterval(async () => {
      const records = await fetchRecordsFromFirebase()
      if (records) onUpdate(records)
    }, 5000)
  }

  return () => {
    if (eventSource) eventSource.close()
    if (pollInterval) clearInterval(pollInterval)
  }
}
