// Cấu hình Cloud mặc định (Dành cho toàn bộ người chơi khi truy cập)
export interface CloudConfig {
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
  firebaseDbUrl: string
}

export const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
  firebaseDbUrl: ''
}
