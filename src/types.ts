export interface Member {
  id: string
  name: string
  normalizedName: string
}

export interface Prize {
  id: number
  name: string
  icon: string
  description: string
  color: string
  textColor: string
  type?: 'troll' | 'special' | 'money' | 'normal'
  trollMessage?: string
}

export type ChallengeType =
  | 'sing'
  | 'flirt'
  | 'compliment'
  | 'laugh10s'
  | 'salary_reaction'
  | 'pout_selfie'
  | 'cross_eye_selfie'

export interface ChallengeItem {
  id: ChallengeType
  title: string
  icon: string
  mediaType: 'video' | 'photo'
  instruction: string
  description: string
  targetDurationSeconds?: number
  hint?: string
}

export interface SpinRecord {
  id?: string
  memberId: string
  memberName: string
  prizeId: number
  prizeName: string
  prizeIcon: string
  spunAt: string
  photoUrl?: string
  videoUrl?: string
  challengeId?: ChallengeType
  challengeTitle?: string
  mediaType?: 'video' | 'photo'
  mediaStorageKey?: string
}

export interface GreetingBannerConfig {
  enabled: boolean
  message: string
}

