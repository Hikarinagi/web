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
export const HIKARI_READER_EDUCATION_KEY = 'hikari-reader-education-seen-v2'

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
    title: coarsePointer ? '长按可以选中文字' : '拖动鼠标可以选中文字',
    description: '选中之后可以高亮、划线或者添加笔记',
  }
}

const TAP_ZONE_HINTS: readonly ReaderEducationHint[] = [
  {
    key: 'previous',
    placement: 'left',
    icon: ChevronLeft,
    title: '点击左侧翻到上一页',
    description: '屏幕左侧三分之一区域均可',
  },
  {
    key: 'next',
    placement: 'right',
    icon: ChevronRight,
    title: '点击右侧翻到下一页',
    description: '屏幕右侧三分之一区域均可',
  },
]

/**
 * What drives the reader differs by input device as much as by settings:
 * swiping exists only on touch, while a mouse leans on the keyboard. Tap zones
 * cut across both, and are the one mode that gives a click a paging meaning.
 * The context menu — long-press on touch, right-click otherwise — is the single
 * route to the toolbar everywhere.
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
        icon: MousePointer2,
        title: coarsePointer ? '长按屏幕打开菜单' : '点击鼠标右键打开菜单',
        description: '目录、书签与阅读设置都在菜单中',
      },
    ]
  }

  if (coarsePointer) {
    return [
      {
        key: 'previous',
        placement: 'left',
        icon: MoveRight,
        title: '向右滑动翻到上一页',
        description: '顺着翻页的方向拖动',
      },
      {
        key: 'next',
        placement: 'right',
        icon: MoveLeft,
        title: '向左滑动翻到下一页',
      },
      selectionHint(true, 'top'),
      {
        key: 'chrome',
        placement: 'center',
        icon: MousePointer2,
        title: '长按屏幕打开菜单',
        description: '目录、书签与阅读设置都在菜单中',
      },
    ]
  }

  // Mouse without tap zones: clicking the page does nothing at all, so lead
  // with the keys and the context menu.
  return [
    {
      key: 'keys',
      placement: 'left',
      icon: Keyboard,
      title: '使用左右方向键翻页',
      description: '空格键翻到下一页，Home 与 End 键跳转到首末页',
    },
    selectionHint(false, 'right'),
    {
      key: 'chrome',
      placement: 'center',
      icon: MousePointer2,
      title: '点击鼠标右键打开菜单',
      description: '目录、书签与阅读设置都在菜单中',
    },
  ]
}
