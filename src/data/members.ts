import { Member } from '../types'
import { normalizeVietnamese } from '../utils/vietnamese'

const rawMembers = [
  'Hồ Xuân Hải',
  'Nguyễn Văn Nhật',
  'Đặng Thanh Định',
  'Trần Anh Phụng',
  'Cao Duy Khánh',
  'Nguyễn Thái Bình',
  'Nguyễn Tuấn Kiên',
  'Nguyễn Hải Long',
  'Nguyễn Trần Anh Vũ',
  'Nguyễn Văn Đức',
  'Đỗ Minh Đan',
  'Trần Quang Diệu',
  'Nguyễn Xuân Bảo',
  'Phạm Vũ Việt Khoa',
  'Phan Viết Tú',
  'Trần Việt Anh',
  'Nguyễn Thành Nghiệp',
  'Phan Nhật Minh',
  'Nguyễn Trọng Đức',
  'Hà Lê Đức Dũng',
  'Nguyễn Chí Công',
  'Trần Trọng Nghĩa',
  'Nguyễn Vũ Minh Sơn',
  'Trần Tiến Đạo',
  'Lý Đình Phát',
  'Nguyễn Tất Thành',
  'Bùi Đức Anh',
  'Nguyễn Quốc Minh',
  'Phan Trần Long',
  'Đặng Minh Vạn',
  'Ngô Minh Hoàng',
  'Vi Nhật Hoàng'
]

export const MEMBERS: Member[] = rawMembers.map((name, index) => ({
  id: `mem_${index + 1}`,
  name,
  normalizedName: normalizeVietnamese(name)
}))
