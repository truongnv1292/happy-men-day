// Local Media Storage sử dụng IndexedDB (Lưu trữ Video Blob & Ảnh chụp không giới hạn 5MB)
const DB_NAME = 'MENDAY_MEDIA_DB_V1'
const DB_VERSION = 1
const STORE_NAME = 'media_blobs'

interface StoredMedia {
  key: string
  blob: Blob
  type: 'video' | 'photo'
  mimeType: string
  createdAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB không được hỗ trợ trên trình duyệt này'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveMediaBlob(
  key: string,
  blob: Blob,
  type: 'video' | 'photo'
): Promise<string> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const data: StoredMedia = {
        key,
        blob,
        type,
        mimeType: blob.type,
        createdAt: Date.now()
      }
      const request = store.put(data)
      request.onsuccess = () => resolve(key)
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('Lỗi khi lưu IndexedDB:', e)
    return key
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result as StoredMedia | undefined
        resolve(result ? result.blob : null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('Lỗi khi lấy media từ IndexedDB:', e)
    return null
  }
}

export async function getMediaObjectUrl(key: string): Promise<string | null> {
  const blob = await getMediaBlob(key)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('Lỗi xóa media từ IndexedDB:', e)
  }
}

export async function clearAllMedia(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('Lỗi xóa toàn bộ media:', e)
  }
}
