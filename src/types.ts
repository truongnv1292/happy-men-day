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

export interface SpinRecord {
  memberId: string
  memberName: string
  prizeId: number
  prizeName: string
  prizeIcon: string
  spunAt: string
  photoUrl?: string
}
