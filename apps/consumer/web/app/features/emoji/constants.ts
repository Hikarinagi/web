export const EMOJI_SET_NAME_REGEX = /^[\p{L}\p{N}_-]{2,16}$/u
export const EMOJI_NAME_REGEX = /^[\p{L}\p{N}_-]{1,32}$/u
export const EMOJI_MAX_FILE_BYTES = 512 * 1024
export const EMOJI_VISIBILITY_OPTIONS = [
  { label: '私有 (仅自己可用)', value: 'PRIVATE' as const },
  { label: '公开 (其他用户可订阅)', value: 'PUBLIC' as const },
]
