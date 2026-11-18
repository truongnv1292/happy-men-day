# 🎩 VÒNG QUAY MAY MẮN - QUỐC TẾ ĐÀN ÔNG 19/11 🍺🎮

Ứng dụng Web Game Vòng quay may mắn dành riêng cho ngày Quốc tế Đàn Ông 19/11, xây dựng bằng **React + TypeScript + Tailwind CSS** và tối ưu sẵn sàng cho **Vercel**.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao diện Nam Tính & Đẳng Cấp**:
   - Tone màu Midnight Slate & Vàng Kim (Champagne Gold), viền LED Casino nhấp nháy.
   - Nút quay phong cách **Engine Start/Stop** của siêu xe.
   - Hiệu ứng pháo hoa Confetti rực rỡ và các icon đặc trưng phái mạnh.

2. **Dữ Liệu Chuẩn & Tìm Kiếm Thông Minh (Smart Vietnamese Match)**:
   - Đầy đủ 32 nhân sự nam thần và 12 phần quà hấp dẫn (Chuột laptop, bia Tiger, Bò Húc, dầu ăn Neptune, sầu riêng, 200k...).
   - Hỗ trợ gõ tiếng Việt không dấu, viết hoa/thường, gợi ý tức thì (Auto-complete dropdown).
   - Nút "Chọn ngẫu nhiên" 1 bạn chưa quay tiện lợi cho ban tổ chức.

3. **Kiểm Soát 1 Lượt Duy Nhất & Cà Khịa Duyên Dáng**:
   - Mỗi người chỉ được quay 1 lần.
   - Cảnh sát 19/11 tuýt còi kèm loạt câu thoại hài hước khi anh nào cố tình quay lần 2.

4. **Âm Thanh Sống Động (100% Web Audio API)**:
   - Âm thanh cơ khí tạch tạch của vòng quay, nhạc chiến thắng và tiếng còi cảnh sát troll, không phụ thuộc file mp3 bên ngoài (tránh lỗi 404).

5. **Bảng Vinh Danh & Ban Tổ Chức (Admin Panel)**:
   - Bảng vàng cập nhật trực tiếp ai đã nhận quà gì, tiến độ X/32 người.
   - Ban tổ chức (Mật khẩu: `1911`): Reset lượt quay, xuất kết quả trao thưởng ra file Excel/CSV tiếng Việt UTF-8.

---

## 🚀 Hướng Dẫn Chạy Local

```bash
# 1. Cài đặt dependencies (nếu chưa cài)
npm install

# 2. Khởi động môi trường dev
npm run dev
```

Mở trình duyệt tại đường dẫn hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 🌐 Hướng Dẫn Deploy Lên Vercel (Miễn phí 100%)

### Cách 1: Deploy qua Vercel Web Dashboard (Khuyên dùng - Cực dễ)
1. Đẩy mã nguồn dự án lên GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: Men's Day 19/11 lucky wheel game"
   git branch -M main
   git remote add origin <URL_REPO_GITHUB_CUA_BAN>
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) và đăng nhập.
3. Chọn **Add New...** -> **Project**.
4. Chọn repository GitHub vừa tạo và bấm **Deploy**.
5. Vercel sẽ tự động build và cấp link web chạy trực tiếp (dạng `https://ten-du-an.vercel.app`).

### Cách 2: Deploy trực tiếp qua Vercel CLI
```bash
# Cài đặt Vercel CLI nếu chưa có
npm i -g vercel

# Deploy nhanh
vercel
```
