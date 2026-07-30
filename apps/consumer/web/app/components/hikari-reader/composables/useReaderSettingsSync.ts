import type { ReaderController } from '@ritojs/kit'
import type { Ref, ShallowRef } from 'vue'
import { watch } from 'vue'
import { isDarkBackground } from '../lib/theme'
import type { BackendReaderSettings } from '~/components/hikari-reader/types'

interface ReaderSettingsSyncOptions {
  controller: ShallowRef<ReaderController | null>
  settings: Ref<BackendReaderSettings>
  surface: Ref<HTMLElement | null>
  refreshLayout: () => void
}

export function useReaderSettingsSync(options: ReaderSettingsSyncOptions) {
  watch(
    () => [options.settings.value.background_color, options.settings.value.text_color] as const,
    ([bg, text]) => {
      options.controller.value?.setTheme({
        backgroundColor: bg,
        foregroundColor: isDarkBackground(bg) ? text : '',
      })
    },
  )

  watch(
    () => [options.settings.value.line_height, options.settings.value.font_family] as const,
    ([lineHeight, fontFamily]) => {
      options.controller.value?.setTypography({
        lineHeight,
        lineHeightForce: true,
        fontFamily: fontFamily || null,
        fontFamilyForce: false,
      })
    },
  )

  watch(
    () => [options.settings.value.font_size, options.settings.value.margins] as const,
    () => {
      options.refreshLayout()
    },
  )
}
