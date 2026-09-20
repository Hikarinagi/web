import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  MousePointer2,
  MoveLeft,
  MoveRight,
  TextSelect,
} from '@lucide/vue'
import type {
  ReaderEducationHint,
  ReaderEducationPlacement,
} from '~/components/reader/EducationOverlay.vue'

// Bumped when the described gestures change so returning readers see it again.
export const HIKARI_READER_EDUCATION_KEY = 'hikari-reader-education-seen-v1'

export interface ReaderEducationContext {
  /** Touch input. Rito binds its swipe and long-press gestures to touch only. */
  coarsePointer: boolean
  tapZones: boolean
}

function selectionHint(
  coarsePointer: boolean,
  placement: ReaderEducationPlacement,
): ReaderEducationHint {
  return {
    key: 'selection',
    placement,
    icon: TextSelect,
    title: coarsePointer ? '长按 选中文字' : '拖选文字',
    description: '可以高亮、划线，或写一条笔记',
  }
}

const TAP_ZONE_HINTS: readonly ReaderEducationHint[] = [
  {
    key: 'previous',
    placement: 'left',
    icon: ChevronLeft,
    title: '点左侧 上一页',
    description: '左边 1/3 都算',
  },
  {
    key: 'next',
    placement: 'right',
    icon: ChevronRight,
    title: '点右侧 下一页',
    description: '右边 1/3 都算',
  },
]

/**
 * What drives the reader differs by input device as much as by settings:
 * swiping and long-press exist only on touch, while a mouse leans on the
 * keyboard and the context menu. Tap zones cut across both, and are the one
 * mode that gives a mouse click a paging meaning.
 */
export function readerEducationHints(
  context: ReaderEducationContext,
): readonly ReaderEducationHint[] {
  const { coarsePointer, tapZones } = context

  if (tapZones) {
    return [
      ...TAP_ZONE_HINTS,
      selectionHint(coarsePointer, 'top'),
      {
        key: 'chrome',
        placement: 'center',
        title: '点中间 呼出工具栏',
        description: coarsePointer ? '左右滑动也能翻页' : '← → 和右键菜单也能用',
      },
    ]
  }

  if (coarsePointer) {
    return [
      {
        key: 'previous',
        placement: 'left',
        icon: MoveRight,
        title: '右滑 上一页',
        description: '顺着翻页方向拖',
      },
      {
        key: 'next',
        placement: 'right',
        icon: MoveLeft,
        title: '左滑 下一页',
      },
      selectionHint(true, 'top'),
      {
        key: 'chrome',
        placement: 'center',
        title: '单击 呼出工具栏',
        description: '目录、书签、设置都在这里',
      },
    ]
  }

  // Mouse without tap zones: clicking the page does nothing at all, so lead
  // with the keys and the context menu — the only route to the toolbar here.
  return [
    {
      key: 'keys',
      placement: 'left',
      icon: Keyboard,
      title: '← → 翻页',
      description: '空格翻下一页，Home / End 跳首末页',
    },
    selectionHint(false, 'right'),
    {
      key: 'chrome',
      placement: 'center',
      icon: MousePointer2,
      title: '右键 呼出菜单',
      description: '目录、书签、设置、工具栏都在这里',
    },
  ]
}
