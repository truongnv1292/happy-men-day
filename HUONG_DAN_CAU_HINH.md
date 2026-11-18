# 📖 HƯỚNG DẪN CẤU HÌNH HỆ THỐNG ONLINE (MEN'S DAY 19/11)

Tài liệu này hướng dẫn bạn cách thiết lập để **33 anh em có thể tự mở link trên điện thoại cá nhân ở các nơi khác nhau**, thực hiện thử thách, quay video/ảnh và tự động đồng bộ Bảng Vàng trực tuyến theo thời gian thực (Realtime).

---

## ⚡ CƠ CHẾ HOẠT ĐỘNG CỦA HỆ THỐNG

1. **Khi chưa cấu hình Cloud (Chạy Cục Bộ - Mặc định)**:
   * Hệ thống tự động sử dụng **IndexedDB** của trình duyệt máy tính/điện thoại để lưu video và ảnh.
   * Rất thích hợp khi **dùng chung 1 máy tính / iPad tại văn phòng**. Tất cả mọi người đứng trước máy đó đều xem lại được video/ảnh của nhau.

2. **Khi đã cấu hình Cloud (Chơi Online Phân Tán)**:
   * **Cloudinary (Lưu Video & Ảnh - Free 25GB/tháng)**: Khi anh em quay video trên iPhone/Android, video tự động tải lên Cloudinary và tạo link xem mượt mà trên mọi thiết bị.
   * **Firebase Realtime Database (Đồng Bộ Lượt Quay - Miễn phí 100%)**: Khi ai đó hoàn thành thử thách và quay trúng quà, kết quả sẽ nhảy ngay lập tức lên màn hình của tất cả mọi người khác.

---

## 🛠️ HƯỚNG DẪN LẤY THÔNG TIN CẤU HÌNH (MẤT ~3 PHÚT)

### PHẦN 1: Tạo Tài Khoản Cloudinary (Lưu Video & Ảnh)

1. Truy cập [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free) và đăng ký 1 tài khoản miễn phí.
2. Sau khi đăng nhập, tại trang **Dashboard**:
   * Bạn sẽ thấy **Cloud Name** (Ví dụ: `dxyzt1234`). Hãy copy lại tên này.
3. Tạo **Upload Preset (Unsigned)**:
   * Nhấn vào biểu tượng **Bánh răng Cài đặt (Settings)** ở góc dưới bên trái màn hình.
   * Chọn tab **Upload** (nằm ở cột bên trái).
   * Kéo xuống mục **Upload presets** -> Nhấn **Add upload preset**.
   * Đặt tên cho preset tại ô **Upload preset name** (Ví dụ: `menday_preset`).
   * Tại ô **Signing Mode**: Chuyển từ *Signed* sang **Unsigned** *(bước này rất quan trọng để điện thoại upload được thẳng lên mây)*.
   * Nhấn nút **Save** màu xanh ở góc trên bên phải.
4. 👉 **Bạn đã có 2 thông tin**:
   * `Cloud Name`: ví dụ `dxyzt1234`
   * `Upload Preset`: ví dụ `menday_preset`

---

### PHẦN 2: Tạo Firebase Realtime Database (Đồng Bộ Trực Tuyến)

1. Truy cập [https://console.firebase.google.com/](https://console.firebase.google.com/) bằng tài khoản Gmail của bạn.
2. Nhấn **Create a project** (Tạo dự án mới) -> Đặt tên dự án (ví dụ: `happy-men-day-1911`) -> Nhấn Continue qua các bước (có thể tắt Google Analytics).
3. Sau khi dự án tạo xong, ở menu bên trái:
   * Chọn **Build** -> chọn **Realtime Database**.
   * Nhấn nút **Create Database** (Tạo cơ sở dữ liệu).
   * Chọn vị trí máy chủ (mặc định United States hoặc Singapore) -> Nhấn Next.
   * Tại bước chọn chế độ bảo mật (Security Rules): Chọn **Start in test mode** -> Nhấn **Enable**.
4. Sau khi khởi tạo xong, bạn sẽ thấy đường link Database ở ngay trên cùng, có dạng:
   * `https://happy-men-day-1911-default-rtdb.firebaseio.com/` (hoặc `https://happy-men-day-1911-default-rtdb.asia-southeast1.firebasedatabase.app/`).
   * Hãy copy toàn bộ đường link này.
5. 👉 **Bạn đã có**:
   * `Firebase Database URL`: `https://happy-men-day-1911-default-rtdb.firebaseio.com`

---

## 🚀 2 CÁCH ĐIỀN CẤU HÌNH VÀO TRANG WEB

### CÁCH 1: Điền Trực Tiếp Trên Web (NHANH NHẤT - KHÔNG CẦN DEPLOY LẠI CODE)

1. Mở trang web game của bạn (kể cả trên localhost hay link Vercel).
2. Nhấn vào nút **Admin** ở góc trên cùng bên phải thanh Header.
3. Nhập mã PIN quản trị: `1911` -> Bấm **Đăng nhập**.
4. Trong cửa sổ Cài đặt, chọn tab **"Cấu hình Cloud Online"**:
   * Nhập `Cloud Name` (từ Cloudinary).
   * Nhập `Upload Preset` (từ Cloudinary).
   * Nhập `Firebase Database URL` (từ Firebase).
5. Nhấn nút **LƯU CẤU HÌNH ONLINE**.
6. 👉 **XONG!** Đèn trạng thái chuyển sang **Xanh lá (Đã kích hoạt)**. Toàn bộ thiết bị truy cập vào link web từ lúc này sẽ tự động lưu và đồng bộ lên Cloud!

---

### CÁCH 2: Điền Vào Biến Môi Trường (Khi Deploy Lên Vercel)

Nếu bạn muốn cấu hình cố định ngay khi deploy lên Vercel:

1. Vào trang quản lý dự án trên **Vercel** -> Chọn tab **Settings** -> Chọn **Environment Variables**.
2. Thêm 3 biến môi trường sau:
   * `VITE_CLOUDINARY_CLOUD_NAME` = `dxyzt1234`
   * `VITE_CLOUDINARY_UPLOAD_PRESET` = `menday_preset`
   * `VITE_FIREBASE_DB_URL` = `https://happy-men-day-1911-default-rtdb.firebaseio.com`
3. Nhấn **Save** và nhấn **Redeploy** lại phiên bản mới nhất.

*(Khi test cục bộ trên máy, bạn chỉ cần tạo file `.env` cạnh file `package.json` và paste 3 dòng trên vào).*

---

## 🎯 HƯỚNG DẪN TEST & QUẢN TRỊ NGÀY 19/11

1. **Kiểm thử trước ngày diễn ra sự kiện**:
   * Bạn có thể tự chọn 1 tên bất kỳ, quay thử thách hát/cười/selfie, gửi video và quay may mắn.
   * Mở bằng 2 trình duyệt khác nhau hoặc điện thoại để xem dữ liệu có nhảy realtime sang máy kia không.
   * Bấm vào tên người vừa quay trong **Bảng Vàng** để kiểm tra tính năng xem lại video và tải clip về máy.
2. **Cách xoá dữ liệu test để chuẩn bị cho ngày chính thức**:
   * Bấm vào nút **Cài đặt** (Admin đã đăng nhập với mã PIN `1911`).
   * Nhấn nút màu đỏ: **"XÓA TOÀN BỘ DATABASE TRÊN CLOUD & FIREBASE"**.
   * Hệ thống sẽ tự động thực thi 3 hành động cùng lúc:
     1. Gửi lệnh `DELETE` lên Firebase Realtime Database xóa sạch nhánh `/records` và cả root `/.json` trên mây.
     2. Xóa sạch kho lưu trữ video/ảnh trong IndexedDB.
     3. Xóa LocalStorage và reset Bảng Vàng trên giao diện của tất cả các máy đang kết nối về số 0 ngay lập tức!
   * Ngoài ra, trong tab **"Cấu hình Cloud Online"**, cũng có nút **"Xóa Firebase"** riêng biệt nếu bạn chỉ muốn xóa trắng database online mà không reset máy cục bộ.
3. **Cấu hình thanh lời chúc ghim ở đầu trang web**:
   * Tại cửa sổ Cài đặt Admin, chọn tab **"Lời chúc 19/11"** (hoặc nhấn nút "Chỉnh sửa" ở tab Lịch sử / nút "Sửa lời chúc" ngay trên banner).
   * Bạn có thể:
     - **Bật / Tắt** hiển thị thanh lời chúc trên đầu trang.
     - **Tùy chỉnh nội dung** câu chúc theo ý muốn (mặc định: *"Chúc các chàng trai của Nonelab một ngày tràn ngập tình yêu thương và may mắn nha <3"*).
     - **Xem trước trực tiếp (Live Preview)** giao diện banner ngay trong cửa sổ quản trị.
     - **Khôi phục mặc định** chỉ với 1 click.
     - Nhấn **LƯU CẤU HÌNH LỜI CHÚC** để cập nhật ngay lập tức trên máy và đồng bộ lên Firebase Cloud cho toàn bộ người xem.
4. **Cấp lại lượt quay cho người bị lỗi mạng / quay nhầm**:
   * Trong popup Cài đặt Admin, tại danh sách người đã quay, tìm tên người cần cấp lại và bấm **"Cho quay lại"**. Người đó sẽ có thể làm lại thử thách và quay thưởng mới.
5. **Xuất file báo cáo trao giải**:
   * Nhấn nút **"Xuất kết quả trao giải ra file Excel / CSV"** để tải file danh sách trúng thưởng kèm link video bằng chứng về máy.

---

Chúc bạn tổ chức chương trình Ngày Quốc Tế Đàn Ông 19/11 thành công rực rỡ và tràn ngập tiếng cười! 🎉🎩🍻
