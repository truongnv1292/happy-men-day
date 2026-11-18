import { ChallengeItem } from '../types'

export const CHALLENGES: ChallengeItem[] = [
  {
    id: 'sing',
    title: 'Hát 1 câu bất kỳ',
    icon: '🎤',
    mediaType: 'video',
    instruction: 'Cất cao giọng hát nam thần! Hát ít nhất 1 câu hát bất kỳ tràn đầy tự tin.',
    description: 'Bật mic và hát 1 câu hát yêu thích (pop, ballad, bolero tuỳ chọn).',
    targetDurationSeconds: 10,
    hint: 'Gợi ý: "Em ơi có bao nhiêu... 60 năm cuộc đời!"'
  },
  {
    id: 'flirt',
    title: 'Thả thính đồng nghiệp nữ (≤ 10 từ)',
    icon: '💌',
    mediaType: 'video',
    instruction: 'Nói 1 câu thả thính đồng nghiệp nữ với độ dài KHÔNG QUÁ 10 từ!',
    description: 'Thả một câu thính ngọt như mía lùi gửi đến các chị em công ty.',
    targetDurationSeconds: 8,
    hint: 'Gợi ý: "Em có mệt không khi cứ chạy trong tim anh?" (10 từ)'
  },
  {
    id: 'compliment',
    title: 'Nói 3 lời khen dành cho đồng nghiệp nữ',
    icon: '💖',
    mediaType: 'video',
    instruction: 'Nói nhanh 3 lời khen ngọt ngào và chân thành nhất dành cho phái đẹp văn phòng.',
    description: 'Khen từ tận đáy lòng: Xinh đẹp, đảm đang, thông minh, tài năng...',
    targetDurationSeconds: 12,
    hint: 'Gợi ý: "Chị em công ty mình: 1. Cực kỳ xinh - 2. Rất thông minh - 3. Siêu dễ mến!"'
  },
  {
    id: 'laugh10s',
    title: 'Cười tươi trong 10 giây',
    icon: '😂',
    mediaType: 'video',
    instruction: 'Cười sảng khoái liên tục trong đúng 10 giây trước ống kính!',
    description: 'Hệ thống sẽ đếm ngược 10 giây, giữ nụ cười rạng rỡ nhất ngày 19/11.',
    targetDurationSeconds: 10,
    hint: 'Cười ha ha hoặc cười mỉm duyên dáng đều được tính!'
  },
  {
    id: 'salary_reaction',
    title: 'Diễn tả cảm xúc khi nhận lương',
    icon: '🤑',
    mediaType: 'video',
    instruction: 'Diễn xuất khuôn mặt và hành động khi tin nhắn ting ting thông báo lương về!',
    description: 'Hạnh phúc, sung sướng, nhảy múa hay muốn khóc vì đợi cả tháng?',
    targetDurationSeconds: 8,
    hint: 'Gợi ý: Mắt sáng rực, mồm cười toe toét, tay quẹt thẻ không cần nhìn giá!'
  },
  {
    id: 'pout_selfie',
    title: 'Chụp 1 ảnh selfie chu mỏ',
    icon: '😚',
    mediaType: 'photo',
    instruction: 'Tạo dáng chu mỏ thật đáng yêu/troll và bấm nút chụp ảnh selfie.',
    description: 'Chu mỏ hết cỡ để lưu lại khoảnh khắc cute phô mai que độc quyền.',
    hint: 'Chu mỏ thật căng trước camera rồi bấm Chụp!'
  },
  {
    id: 'cross_eye_selfie',
    title: 'Chụp 1 ảnh selfie mắt lác',
    icon: '🤪',
    mediaType: 'photo',
    instruction: 'Tạo dáng mắt lác (lé) đỉnh cao trước ống kính và bấm chụp.',
    description: 'Liếc hai mắt nhìn vào chóp mũi để tạo siêu phẩm mắt lác huyền thoại.',
    hint: 'Tập trung nhìn vào đầu ngón tay đặt trước mũi rồi bấm Chụp!'
  }
]
