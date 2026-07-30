import {
  ArrowLeft,
  BookOpenText,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  Flag,
  Highlighter,
  ListTree,
  RotateCw,
  Settings2,
} from '@lucide/vue'
import { computed, type Ref } from 'vue'
import type { TocEntry } from '@ritojs/core'
import type { ReaderMenuItem } from '../ContextMenu.vue'

interface UseReaderContextItemsOptions {
  isLoaded: Ref<boolean>
  isLoading: Ref<boolean>
  onlineReadingAvailable: Ref<boolean>
  canGoPrevious: Ref<boolean>
  canGoNext: Ref<boolean>
  toc: Ref<readonly TocEntry[]>
  toolbarVisible: Ref<boolean>
  hasCurrentBookmark: Ref<boolean>
  previous: () => void
  next: () => void
  openCatalog: () => void
  openSettings: () => void
  openBookmarks: () => void
  openAnnotations: () => void
  addBookmark: () => void
  toggleToolbar: () => void
  openReport: () => void
  retry: () => void
  back: () => void
  exit: () => void
}

/**
 * Default context-menu items for the reader. Returns a computed of
 * `(ReaderMenuItem | 'separator')[]` so feature additions (search, annotations)
 * can later compose more items into the menu.
 */
export function useReaderContextItems(options: UseReaderContextItemsOptions) {
  return computed<(ReaderMenuItem | 'separator')[]>(() => [
    {
      key: 'previous',
      label: '上一页',
      icon: ChevronLeft,
      shortcut: '←',
      disabled: !options.canGoPrevious.value || !options.isLoaded.value,
      command: options.previous,
    },
    {
      key: 'next',
      label: '下一页',
      icon: ChevronRight,
      shortcut: '→',
      disabled: !options.canGoNext.value || !options.isLoaded.value,
      command: options.next,
    },
    'separator',
    {
      key: 'catalog',
      label: '目录',
      icon: ListTree,
      disabled: options.toc.value.length === 0,
      command: options.openCatalog,
    },
    {
      key: 'add-bookmark',
      label: options.hasCurrentBookmark.value ? '已添加书签' : '添加书签',
      icon: options.hasCurrentBookmark.value ? BookmarkCheck : BookmarkPlus,
      disabled: !options.isLoaded.value || options.hasCurrentBookmark.value,
      command: options.addBookmark,
    },
    {
      key: 'bookmarks',
      label: '书签',
      icon: Bookmark,
      command: options.openBookmarks,
    },
    {
      key: 'annotations',
      label: '标注',
      icon: Highlighter,
      command: options.openAnnotations,
    },
    {
      key: 'settings',
      label: '阅读设置',
      icon: Settings2,
      command: options.openSettings,
    },
    {
      key: 'toolbar',
      label: options.toolbarVisible.value ? '隐藏工具栏' : '显示工具栏',
      icon: BookOpenText,
      command: options.toggleToolbar,
    },
    'separator',
    {
      key: 'report',
      label: '报告渲染问题',
      icon: Flag,
      command: options.openReport,
    },
    {
      key: 'retry',
      label: options.isLoaded.value ? '重新加载' : '加载 EPUB',
      icon: RotateCw,
      disabled: !options.onlineReadingAvailable.value || options.isLoading.value,
      command: options.retry,
    },
    {
      key: 'back',
      label: '后退',
      icon: CornerUpLeft,
      command: options.back,
    },
    {
      key: 'exit',
      label: '返回分卷详情',
      icon: ArrowLeft,
      command: options.exit,
    },
  ])
}
