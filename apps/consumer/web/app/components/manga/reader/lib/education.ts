import { Keyboard, MousePointerClick, MoveLeft, MoveRight, MoveVertical, ZoomIn } from '@lucide/vue'
import type { ReaderEducationHint } from '~/components/reader/EducationOverlay.vue'
import type { MangaReaderDirection, MangaReaderMode } from './settings'

export const MANGA_READER_EDUCATION_KEY = 'hikari-manga-reader-education-seen-v4'

export interface MangaEducationContext {
  coarsePointer: boolean
  zoomable: boolean
  mode: MangaReaderMode
  direction: MangaReaderDirection
  tapSides: boolean
}

export function mangaEducationHints(
  context: MangaEducationContext,
): readonly ReaderEducationHint[] {
  const { coarsePointer, zoomable, mode, direction, tapSides } = context
  const sides = mode === 'paged' && tapSides
  const chrome: ReaderEducationHint = {
    key: 'chrome',
    placement: 'center',
    icon: MousePointerClick,
    title: `${coarsePointer ? '轻触' : '单击'}${sides ? '中间' : '页面'} 呼出工具栏`,
    description: '目录、跳页与阅读设置都在工具栏里',
  }
  if (mode === 'scroll') {
    return [{ key: 'scroll', placement: 'top', icon: MoveVertical, title: '上下滑动 阅读' }, chrome]
  }
  const rtl = direction === 'rtl'
  const turning: ReaderEducationHint[] = sides
    ? [
        {
          key: 'left',
          placement: 'left',
          icon: MoveLeft,
          title: rtl ? '点左侧 下一页' : '点左侧 上一页',
          description: rtl ? '从右往左读，也可以向右拖动' : '也可以向右拖动',
        },
        {
          key: 'right',
          placement: 'right',
          icon: coarsePointer ? MoveRight : Keyboard,
          title: rtl ? '点右侧 上一页' : '点右侧 下一页',
          description: coarsePointer ? undefined : '← → 方向键随时可用',
        },
      ]
    : [
        {
          key: 'drag',
          placement: rtl ? 'left' : 'right',
          icon: rtl ? MoveRight : MoveLeft,
          title: rtl ? '向右拖动 下一页' : '向左拖动 下一页',
          description: coarsePointer ? undefined : '← → 方向键随时可用',
        },
      ]
  return [
    ...turning,
    ...(zoomable
      ? [
          {
            key: 'zoom',
            placement: 'top' as const,
            icon: ZoomIn,
            title: coarsePointer ? '双击 / 捏合 缩放' : '双击 / Ctrl 滚轮 缩放',
            description: '放大后先平移，拖到边缘才继续翻页',
          },
        ]
      : []),
    chrome,
  ]
}
