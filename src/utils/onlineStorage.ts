import { SpinRecord, GreetingBannerConfig } from '../types'
import { DEFAULT_CLOUD_CONFIG, CloudConfig } from '../config/cloudConfig'

export type { CloudConfig }
export { DEFAULT_CLOUD_CONFIG }

const CLOUD_CONFIG_STORAGE_KEY = 'MENDAY_CLOUD_CONFIG_V1'
const GREETING_BANNER_STORAGE_KEY = 'MENDAY_GREETING_BANNER_CONFIG_V1'

export const DEFAULT_GREETING_MESSAGE =
  'Chúc toàn thể 500 anh em một ngày Quốc tế Đàn Ông 19/11: Tiền đầy túi, tình đầy tim, deadline tự tan biến, phong độ ngời ngời và không bị bắt rửa bát! 🍻💪🚀'

export const DEFAULT_GREETING_BANNER: GreetingBannerConfig = {
  enabled: true,
  message: DEFAULT_GREETING_MESSAGE
}

export function getGreetingBannerConfig(): GreetingBannerConfig {
  try {
    const raw = localStorage.getItem(GREETING_BANNER_STORAGE_KEY)
    if (raw) return { ...DEFAULT_GREETING_BANNER, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return DEFAULT_GREETING_BANNER
}

export function saveGreetingBannerConfig(config: GreetingBannerConfig): void {
  try {
    localStorage.setItem(GREETING_BANNER_STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Không thể lưu banner config:', e)
  }
}

// Đồng bộ lời chúc Banner lên Firebase Realtime Database
export async function syncGreetingBannerToFirebase(config: GreetingBannerConfig): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    const url = `${cfg.firebaseDbUrl}/greeting_banner.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi đồng bộ banner Firebase:', e)
    return false
  }
}

// Lấy lời chúc Banner từ Firebase
export async function fetchGreetingBannerFromFirebase(): Promise<GreetingBannerConfig | null> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return null

  try {
    const url = `${cfg.firebaseDbUrl}/greeting_banner.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data) return null
    return data as GreetingBannerConfig
  } catch (e) {
    console.error('Lỗi tải banner từ Firebase:', e)
    return null
  }
}

// Chuẩn hóa đường link Firebase Database URL (xử lý link console, thiếu https, có dấu / thừa)
export function normalizeFirebaseUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let url = rawUrl.trim()

  // Nếu người dùng paste link từ Firebase Console:
  // e.g. https://console.firebase.google.com/u/0/project/my-app/database/my-app-default-rtdb/data...
  const consoleMatch = url.match(/\/database\/([^/]+)/)
  if (consoleMatch && consoleMatch[1]) {
    const dbName = consoleMatch[1]
    url = `https://${dbName}.firebaseio.com`
  }

  // Đảm bảo có https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  // Bỏ dấu gạch chéo cuối cùng và các path thừa
  url = url.replace(/\/+$/, '')
  url = url.replace(/\/records(\.json)?$/, '')
  url = url.replace(/\.json$/, '')

  return url
}

// Lấy cấu hình từ localStorage, file cloudConfig mặc định hoặc biến môi trường Vite (.env)
export function getCloudConfig(): CloudConfig {
  let stored: Partial<CloudConfig> = {}
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY)
    if (raw) stored = JSON.parse(raw)
  } catch {
    // ignore
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {}

  let rawFbUrl = stored.firebaseDbUrl || ''
  if (!rawFbUrl || rawFbUrl.includes('your-project') || rawFbUrl.includes('placeholder')) {
    rawFbUrl = metaEnv.VITE_FIREBASE_DB_URL || ''
  }

  let cloudName = stored.cloudinaryCloudName || ''
  if (!cloudName || cloudName.includes('your-') || cloudName.includes('placeholder')) {
    cloudName = metaEnv.VITE_CLOUDINARY_CLOUD_NAME || ''
  }

  let uploadPreset = stored.cloudinaryUploadPreset || ''
  if (!uploadPreset || uploadPreset.includes('your-') || uploadPreset.includes('placeholder')) {
    uploadPreset = metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || ''
  }

  return {
    cloudinaryCloudName: cloudName,
    cloudinaryUploadPreset: uploadPreset,
    firebaseDbUrl: normalizeFirebaseUrl(rawFbUrl)
  }
}

export function saveCloudConfig(config: CloudConfig): void {
  try {
    const normalized: CloudConfig = {
      ...config,
      firebaseDbUrl: normalizeFirebaseUrl(config.firebaseDbUrl)
    }
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(normalized))

    // 1. Tự động ghi vào mã nguồn project (cloudConfig.ts & .env) qua Vite dev-server endpoint
    // Giúp tất cả người chơi khác kết nối vào dev-server có ngay config mà không cần nhập
    fetch('/api/save-cloud-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    }).catch(() => {
      // Bỏ qua nếu chạy bản build tĩnh không có Vite dev server
    })

    // 2. Nếu có Firebase, lưu config lên Firebase để bất kỳ thiết bị nào kết nối vào cũng lấy được
    if (normalized.firebaseDbUrl) {
      syncCloudCredentialsToFirebase(normalized).catch(() => {})
    }

    // Bắn sự kiện để toàn bộ app nhận biết cấu hình mới ngay lập tức
    window.dispatchEvent(new CustomEvent('MENDAY_FIREBASE_CONFIG_CHANGED', { detail: normalized }))
  } catch (e) {
    console.error('Không thể lưu Cloud config:', e)
  }
}

// Đồng bộ Cloudinary credentials lên Firebase để máy khác tự lấy
export async function syncCloudCredentialsToFirebase(config: CloudConfig): Promise<boolean> {
  if (!config.firebaseDbUrl) return false
  try {
    const url = `${config.firebaseDbUrl}/cloud_credentials.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi đồng bộ Cloud credentials lên Firebase:', e)
    return false
  }
}

// Tự động kéo Cloud credentials từ Firebase nếu máy người chơi chưa có Cloudinary
export async function fetchCloudCredentialsFromFirebase(): Promise<CloudConfig | null> {
  const currentCfg = getCloudConfig()
  if (!currentCfg.firebaseDbUrl) return null
  try {
    const url = `${currentCfg.firebaseDbUrl}/cloud_credentials.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data !== 'object') return null

    const incoming: CloudConfig = {
      cloudinaryCloudName: data.cloudinaryCloudName || currentCfg.cloudinaryCloudName || '',
      cloudinaryUploadPreset: data.cloudinaryUploadPreset || currentCfg.cloudinaryUploadPreset || '',
      firebaseDbUrl: normalizeFirebaseUrl(data.firebaseDbUrl || currentCfg.firebaseDbUrl)
    }

    // Nếu remote có cloudinary mà local chưa có, lưu vào local để dùng ngay
    if (incoming.cloudinaryCloudName && !currentCfg.cloudinaryCloudName) {
      localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(incoming))
      window.dispatchEvent(new CustomEvent('MENDAY_FIREBASE_CONFIG_CHANGED', { detail: incoming }))
    }

    return incoming
  } catch {
    return null
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

// Kiểm tra kết nối tới Firebase và kiểm tra quyền Rules
export async function testFirebaseConnection(customUrl?: string): Promise<{
  success: boolean
  message: string
  code?: 'permission_denied' | 'network_error' | 'invalid_url' | 'ok'
}> {
  const targetUrl = customUrl ? normalizeFirebaseUrl(customUrl) : getCloudConfig().firebaseDbUrl
  if (!targetUrl) {
    return {
      success: false,
      message: 'Chưa nhập URL Firebase Realtime Database!',
      code: 'invalid_url'
    }
  }

  try {
    const res = await fetch(`${targetUrl}/records.json?shallow=true`, {
      method: 'GET'
    })

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        code: 'permission_denied',
        message:
          'Firebase từ chối truy cập (Permission Denied 401)! Quy tắc (Rules) của bạn đang bị khóa. Hãy vào Firebase Console -> Tab Rules -> Đổi thành { ".read": true, ".write": true } rồi bấm Publish.'
      }
    }

    if (!res.ok) {
      return {
        success: false,
        code: 'network_error',
        message: `Lỗi kết nối Firebase (HTTP ${res.status}). Vui lòng kiểm tra lại URL Database.`
      }
    }

    return {
      success: true,
      code: 'ok',
      message: 'Kết nối Firebase Realtime Database thành công 100%!'
    }
  } catch (err: unknown) {
    console.error('Lỗi test Firebase:', err)
    return {
      success: false,
      code: 'network_error',
      message:
        'Không thể kết nối đến Firebase! Vui lòng kiểm tra lại đường link Database hoặc mạng internet.'
    }
  }
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

// Hòa trộn danh sách lượt quay (Đảm bảo Realtime 2 chiều, chống hồi sinh bản ghi đã bị xóa)
export function mergeRecords(
  localList: SpinRecord[],
  remoteList: SpinRecord[]
): SpinRecord[] {
  const remoteMap = new Map<string, SpinRecord>()
  for (const r of remoteList) {
    if (r && r.memberId) {
      remoteMap.set(r.memberId, { ...r, synced: true })
    }
  }

  const result: SpinRecord[] = []

  // 1. Những bản ghi có trên Remote -> Là nguồn dữ liệu chuẩn (hòa trộn media local nếu remote thiếu)
  for (const [memberId, remoteRecord] of remoteMap.entries()) {
    const local = localList.find((l) => l.memberId === memberId)
    if (local) {
      result.push({
        ...remoteRecord,
        photoUrl: remoteRecord.photoUrl || local.photoUrl,
        videoUrl: remoteRecord.videoUrl || local.videoUrl,
        mediaStorageKey: local.mediaStorageKey || remoteRecord.mediaStorageKey,
        synced: true
      })
    } else {
      result.push(remoteRecord)
    }
  }

  // 2. Những bản ghi chỉ có ở Local:
  // CHỈ giữ lại nếu CHƯA sync lên Cloud (synced === false / mới quay offline)
  // Nếu đã từng sync rồi mà remote không còn -> nghĩa là Admin đã xóa -> Không hồi sinh lại!
  for (const local of localList) {
    if (local && local.memberId && !remoteMap.has(local.memberId)) {
      if (local.synced === false) {
        result.push(local)
      }
    }
  }

  return result
}

// Lưu 1 bản ghi người chơi lên Firebase Realtime Database
export async function syncRecordToFirebase(record: SpinRecord): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    const recordToSync = { ...record, synced: true }
    const url = `${cfg.firebaseDbUrl}/records/${record.memberId}.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordToSync)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi đồng bộ 1 record Firebase:', e)
    return false
  }
}

// Đẩy toàn bộ danh sách bản ghi lên Firebase một lần (Dùng khi vừa kết nối Firebase hoặc đồng bộ)
export async function syncAllRecordsToFirebase(records: SpinRecord[]): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl || records.length === 0) return false

  try {
    const payload: Record<string, SpinRecord> = {}
    records.forEach((r) => {
      if (r && r.memberId) {
        payload[r.memberId] = { ...r, synced: true }
      }
    })

    const url = `${cfg.firebaseDbUrl}/records.json`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return res.ok
  } catch (e) {
    console.error('Lỗi syncAllRecordsToFirebase:', e)
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
    if (!res.ok) {
      console.warn(`fetchRecordsFromFirebase: HTTP ${res.status}`)
      return null
    }
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

// Xóa toàn bộ lượt quay trên Firebase (Bảo tồn cấu hình Banner)
export async function resetAllFirebaseRecords(): Promise<boolean> {
  const cfg = getCloudConfig()
  if (!cfg.firebaseDbUrl) return false

  try {
    // Xóa sạch nhánh /records.json
    const res = await fetch(`${cfg.firebaseDbUrl}/records.json`, { method: 'DELETE' })
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
  let isCleanedUp = false

  const refreshData = async () => {
    if (isCleanedUp) return
    const records = await fetchRecordsFromFirebase()
    if (records !== null) {
      onUpdate(records)
    }
  }

  try {
    const streamUrl = `${cfg.firebaseDbUrl}/records.json`
    eventSource = new EventSource(streamUrl)

    eventSource.addEventListener('put', () => {
      refreshData()
    })

    eventSource.addEventListener('patch', () => {
      refreshData()
    })

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      // Chuyển sang Polling dự phòng 4 giây/lần
      if (!pollInterval && !isCleanedUp) {
        pollInterval = window.setInterval(refreshData, 4000)
      }
    }
  } catch (err) {
    console.warn('EventSource không hỗ trợ, dùng polling fallback:', err)
    if (!pollInterval && !isCleanedUp) {
      pollInterval = window.setInterval(refreshData, 4000)
    }
  }

  // Khởi động 1 lần polling nhẹ dự phòng để luôn đồng bộ ngay cả khi SSE chậm
  const backupPoll = window.setInterval(refreshData, 6000)

  return () => {
    isCleanedUp = true
    if (eventSource) eventSource.close()
    if (pollInterval) clearInterval(pollInterval)
    if (backupPoll) clearInterval(backupPoll)
  }
}
