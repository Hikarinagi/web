import type { ApiData } from '@hikarinagi/api-contract/v3'

export type AuthMode = 'login' | 'register'

export type CurrentUser = ApiData<'/api/v3/user/me', 'get'>
export type UserRole = CurrentUser['role']
