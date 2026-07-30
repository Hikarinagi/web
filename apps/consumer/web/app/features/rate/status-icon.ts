import { BookOpenText, Bookmark, CircleCheck, CirclePause, CircleX, Play } from '@lucide/vue'
import type { Component } from 'vue'
import type { GalgameRateStatus } from '~/features/galgame/rate'
import type { LightNovelRateStatus } from '~/features/light-novel/rate'
import type { MangaRateStatus } from '~/features/manga/rate'

export const GALGAME_STATUS_ICON: Record<GalgameRateStatus, Component> = {
  PLAN: Bookmark,
  GOING: Play,
  COMPLETED: CircleCheck,
  ON_HOLD: CirclePause,
  DROPPED: CircleX,
}

export const LIGHT_NOVEL_STATUS_ICON: Record<LightNovelRateStatus, Component> = {
  PLAN: Bookmark,
  GOING: BookOpenText,
  COMPLETED: CircleCheck,
  ON_HOLD: CirclePause,
  DROPPED: CircleX,
}

export const MANGA_STATUS_ICON: Record<MangaRateStatus, Component> = {
  PLAN: Bookmark,
  GOING: BookOpenText,
  COMPLETED: CircleCheck,
  ON_HOLD: CirclePause,
  DROPPED: CircleX,
}
