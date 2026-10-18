import type { TourAlign, TourSide } from '@hina-ui/vue'
import type { MangaReaderDirection, MangaReaderMode } from './settings'

export const MANGA_READER_TOUR_KEY = 'hikari-manga-reader-tour'

export type MangaTourTarget =
  | 'next'
  | 'previous'
  | 'center'
  | 'page'
  | 'pager'
  | 'pageNumber'
  | 'jump'
  | 'settings'
  | 'panel'
  | 'guide'

export type MangaTourScript = 'tap' | 'swipe' | 'scroll' | 'zoom' | 'toolbar' | 'pager' | 'settings'

export interface MangaTourStep {
  key: MangaTourScript
  title: string
  description: string
  target: MangaTourTarget
  side: TourSide
  align?: TourAlign
  padding?: number
  chrome: boolean
}

export interface MangaTourContext {
  coarsePointer: boolean
  zoomable: boolean
  mode: MangaReaderMode
  direction: MangaReaderDirection
  tapSides: boolean
  narrow: boolean
}

const TAP_COPY = {
  rtl: {
    touch: '点击左侧前往下一页，点击右侧回到上一页。也可左右滑动。',
    mouse: '点击左侧前往下一页，点击右侧回到上一页。也可使用方向键或空格键。',
  },
  ltr: {
    touch: '点击右侧前往下一页，点击左侧回到上一页。也可左右滑动。',
    mouse: '点击右侧前往下一页，点击左侧回到上一页。也可使用方向键或空格键。',
  },
}

const SWIPE_COPY = {
  rtl: '向右滑动前往下一页，向左滑动回到上一页。',
  ltr: '向左滑动前往下一页，向右滑动回到上一页。',
}

export function mangaTourSteps(context: MangaTourContext): MangaTourStep[] {
  const { coarsePointer, zoomable, mode, direction, tapSides, narrow } = context
  const paged = mode === 'paged'
  const sides = paged && tapSides
  const rtl = direction === 'rtl'
  const device = coarsePointer ? 'touch' : 'mouse'
  const beside: TourSide = narrow ? 'bottom' : rtl ? 'right' : 'left'
  const steps: MangaTourStep[] = []

  if (!paged) {
    steps.push({
      key: 'scroll',
      title: '阅读',
      description: coarsePointer ? '上下滑动即可连续阅读。' : '使用鼠标滚轮即可连续阅读。',
      target: 'page',
      side: narrow ? 'bottom' : 'right',
      padding: 0,
      chrome: false,
    })
  } else if (sides) {
    steps.push({
      key: 'tap',
      title: '翻页',
      description: TAP_COPY[direction][device],
      target: 'next',
      side: beside,
      align: narrow ? (rtl ? 'start' : 'end') : 'center',
      padding: 0,
      chrome: false,
    })
  } else {
    steps.push({
      key: 'swipe',
      title: '翻页',
      description: coarsePointer
        ? SWIPE_COPY[direction]
        : '拖动页面或使用方向键翻页。空格键前往下一页。',
      target: 'page',
      side: beside,
      padding: 0,
      chrome: false,
    })
  }

  if (paged && zoomable) {
    steps.push({
      key: 'zoom',
      title: '缩放',
      description: coarsePointer
        ? '双击放大，拖动移动画面，再次双击即可缩小。也可使用双指缩放。'
        : '双击放大，拖动移动画面，再次双击即可缩小。也可按住 Ctrl 并使用鼠标滚轮。',
      target: 'page',
      side: beside,
      padding: 0,
      chrome: false,
    })
  }

  steps.push(
    {
      key: 'toolbar',
      title: '工具栏',
      description: sides ? '点击屏幕中央可显示或隐藏工具栏。' : '点击页面可显示或隐藏工具栏。',
      target: sides ? 'center' : 'page',
      side: narrow ? 'bottom' : 'right',
      padding: 0,
      chrome: false,
    },
    {
      key: 'pager',
      title: '跳页',
      description: '拖动进度条可预览页面，松开即可跳转。点击页码可输入页码。',
      target: 'pager',
      side: 'top',
      chrome: true,
    },
    {
      key: 'settings',
      title: '阅读设置',
      description: paged
        ? '可在此更改阅读方式、翻页方向和点击两侧翻页。点击底部的「操作说明」可再次观看本引导。'
        : '可在此更改阅读方式和其他设置。点击底部的「操作说明」可再次观看本引导。',
      target: 'settings',
      side: narrow ? 'top' : 'bottom',
      align: 'end',
      chrome: true,
    },
  )

  return steps
}
