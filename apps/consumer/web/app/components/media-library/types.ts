export interface MediaValue {
  id: number
  src: string
  width?: number | null
  height?: number | null
}

export type MediaLibraryMode = 'single' | 'multiple'

export type MediaLibraryStyle = 'dialog' | 'popover'

export interface MediaLibraryOpenOptions {
  mode?: MediaLibraryMode
  max?: number
  /** host 形态：'dialog' (默认, modal) 或 'popover' (锚定 trigger, 无 backdrop) */
  style?: MediaLibraryStyle
  /** popover 锚点元素，style='popover' 时必填 */
  anchor?: HTMLElement
}

export interface PendingUpload {
  id: string
  previewUrl: string
}
