import type { ApiData } from '@hikarinagi/api-contract/v3'

export type DownloadCards = ApiData<'/api/v3/user/me/download/cards', 'get'>
export type DownloadQuote = ApiData<'/api/v3/user/me/downloads/quotes', 'post'>
export type DownloadTask = ApiData<'/api/v3/user/me/downloads/{id}', 'get'>
export type DownloadLimits = ApiData<'/api/v3/user/me/downloads/limits', 'get'>
export type DownloadKind = DownloadQuote['kind']
export type DownloadFormat = DownloadQuote['format']
