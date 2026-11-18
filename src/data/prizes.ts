import { Prize } from '../types'

export const PRIZES: Prize[] = [
  {
    id: 1,
    name: 'Chuột laptop',
    icon: '🖱️',
    description: 'Vũ khí leo rank & gõ task mượt mà!',
    color: '#1E293B', // Slate 800
    textColor: '#F8FAFC',
    type: 'normal'
  },
  {
    id: 2,
    name: '1 thùng mì tôm',
    icon: '🍜',
    description: 'Lương thực cứu cánh những ngày chờ lương!',
    color: '#D97706', // Amber 600
    textColor: '#FFFFFF',
    type: 'normal'
  },
  {
    id: 3,
    name: 'Ví da',
    icon: '👛',
    description: 'Ví mới phong thuỷ - Tiền vào như nước!',
    color: '#475569', // Slate 600
    textColor: '#FFFFFF',
    type: 'normal'
  },
  {
    id: 4,
    name: 'Combo Tất ấm',
    icon: '🧦',
    description: 'Giữ ấm đôi chân mùa đông này!',
    color: '#0F766E', // Teal 700
    textColor: '#FFFFFF',
    type: 'normal'
  },
  {
    id: 5,
    name: 'Khăn quàng',
    icon: '🧣',
    description: 'Ấm áp tựa bờ vai người thương!',
    color: '#991B1B', // Red 800
    textColor: '#FFFFFF',
    type: 'normal'
  },
  {
    id: 6,
    name: '1 chai dầu ăn',
    icon: '🫒',
    description: 'Dầu ăn Neptune - Gắn kết tình huynh đệ!',
    color: '#EAB308', // Yellow 500
    textColor: '#0F172A',
    type: 'troll',
    trollMessage: 'Món quà trọn vẹn tình nghĩa anh em! Chiên xào nấu nướng hay kết thân đều chuẩn bài! 😂'
  },
  {
    id: 7,
    name: '10 lon bia Tiger',
    icon: '🍺',
    description: 'Bản lĩnh phái mạnh - Nâng ly hết mình!',
    color: '#1D4ED8', // Blue 700
    textColor: '#FFFFFF',
    type: 'special'
  },
  {
    id: 8,
    name: '10 lon Bò Húc',
    icon: '🐂',
    description: 'Húc bay deadline - Thức chiến thâu đêm!',
    color: '#B45309', // Amber 700
    textColor: '#FFFFFF',
    type: 'special'
  },
  {
    id: 9,
    name: '2 cốc nước bất kì',
    icon: '☕',
    description: 'Giải khát tức thì - Trà sữa hay cafe tuỳ chọn!',
    color: '#047857', // Emerald 700
    textColor: '#FFFFFF',
    type: 'normal'
  },
  {
    id: 10,
    name: '6 bữa ăn sáng tại cty',
    icon: '🥪',
    description: 'No nê cả tuần - Công ty bao trọn ăn sáng!',
    color: '#6D28D9', // Purple 700
    textColor: '#FFFFFF',
    type: 'special'
  },
  {
    id: 11,
    name: '1 quả sầu riêng',
    icon: '🍈',
    description: 'Độc lạ 19/11 - Mùi hương thơm lừng cả văn phòng!',
    color: '#CA8A04', // Yellow 600
    textColor: '#0F172A',
    type: 'troll',
    trollMessage: 'Đỉnh nóc kịch trần! Ai ở gần anh trai này hôm nay đều được hít hà hương vị quý tộc! 👃🤤'
  },
  {
    id: 12,
    name: '200k tiền mặt',
    icon: '💵',
    description: 'Tiền tươi thóc thật - Ting ting ấm túi ngay!',
    color: '#059669', // Emerald 600
    textColor: '#FFFFFF',
    type: 'money'
  }
]
