/**
 * Chuẩn hoá chuỗi tiếng Việt: Bỏ dấu tiếng Việt, đưa về chữ thường, xoá khoảng trắng thừa
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Kiểm tra chuỗi tìm kiếm có khớp với tên tiếng Việt không
 */
export function matchVietnamese(query: string, target: string): boolean {
  const normQuery = normalizeVietnamese(query)
  const normTarget = normalizeVietnamese(target)
  return normTarget.includes(normQuery)
}
