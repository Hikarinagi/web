import type { ApiData } from '@hikarinagi/api-contract/v3'

export type CheckInStatus = ApiData<'/api/v3/user/me/check-ins/status', 'get'>
export type CheckInRecords = ApiData<'/api/v3/user/me/check-ins', 'get'>
export type CheckInRecord = CheckInRecords['records'][number]
export type CheckInResult = ApiData<'/api/v3/user/me/check-ins', 'post'>
export type CheckInMilestone = NonNullable<CheckInResult['milestone']>

export interface CheckInRewardToastProps {
  date: string
  points: number
  milestone: CheckInMilestone | null
}

export interface CheckInMakeUpToastProps {
  cost: number
  date: string
  method: 'points' | 'card'
}

export function pad2(value: number) {
  return String(value).padStart(2, '0')
}

export function monthOf(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

export function dayKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}
