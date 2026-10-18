import { Keyboard, MoveLeft, MoveRight, ZoomIn } from '@lucide/vue'
import type { ReaderEducationHint } from '~/components/reader/EducationOverlay.vue'

// Bumped when the gesture set changes so returning readers see it again.
export const MANGA_READER_EDUCATION_KEY = 'hikari-manga-reader-education-seen-v3'

export interface MangaEducationContext {
  coarsePointer: boolean
  /** Only the whole-page layout can be panned and zoomed. */
  zoomable: boolean
}

export function mangaEducationHints(
  context: MangaEducationContext,
): readonly ReaderEducationHint[] {
  const { coarsePointer, zoomable } = context

  return [
    {
      key: 'next',
      placement: 'left',
      icon: MoveRight,
      title: '右滑 下一页',
      description: coarsePointer ? '从右往左读，顺着翻页方向拖' : '从右往左读，按住拖动',
    },
    coarsePointer
      ? {
          key: 'previous',
          placement: 'right',
          icon: MoveLeft,
          title: '左滑 上一页',
        }
      : {
          key: 'previous',
          placement: 'right',
          icon: Keyboard,
          title: '左滑 / ← → 上下一页',
          description: '方向键随时可用',
        },
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
    {
      key: 'chrome',
      placement: 'center',
      title: coarsePointer ? '轻触 呼出工具栏' : '右键 呼出工具栏',
      description: coarsePointer ? '调整设置、快速跳页' : '左键单击收起，可调整设置与快速跳页',
    },
  ]
}
