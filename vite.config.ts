import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin cho phép Admin lưu cấu hình Firebase & Cloudinary trực tiếp từ trình duyệt vào file .env
function cloudConfigApiPlugin(): Plugin {
  return {
    name: 'cloud-config-api',
    configureServer(server) {
      server.middlewares.use('/api/save-cloud-config', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)

              // Cập nhật file .env duy nhất (không ghi vào code)
              const envContent = `# Cấu hình đồng bộ Firebase & Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=${data.cloudinaryCloudName || ''}
VITE_CLOUDINARY_UPLOAD_PRESET=${data.cloudinaryUploadPreset || ''}
VITE_FIREBASE_DB_URL=${data.firebaseDbUrl || ''}
`
              fs.writeFileSync(path.resolve(__dirname, '.env'), envContent, 'utf-8')

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err: unknown) {
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: (err as Error).message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('Method Not Allowed')
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudConfigApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
