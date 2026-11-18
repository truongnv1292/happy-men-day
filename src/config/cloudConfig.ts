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
