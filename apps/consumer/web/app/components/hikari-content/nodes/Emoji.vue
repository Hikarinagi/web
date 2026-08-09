<script setup lang="ts">
  import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { AnimatePresence, motion } from 'motion-v'
  import { useContentEmojiSets } from '../composables/useContentEmojiSets'
  import { useEmojiHoverCard } from './emoji/composables/useHoverCard'
  import { resolveImageUrl } from '~/utils/media/image'

  defineOptions({ name: 'HikariContentNodesEmoji' })

  const props = defineProps<{ node: EditorNode }>()

  const config = useRuntimeConfig()
  const emojiIndex = useContentEmojiSets()

  const code = computed(() => (props.node.attrs?.emoji_code as string | undefined) ?? '')
  const entry = computed(() =>
    code.value ? (emojiIndex.value.byComposite[code.value] ?? null) : null,
  )
  const rawSrc = computed(() => entry.value?.src?.src ?? null)
  const setName = computed(() => entry.value?.set_name ?? null)
  const setId = computed(() => entry.value?.set_id ?? null)
  const subscribable = computed(() => entry.value?.set_subscribable ?? false)
  const displaySrc = computed(() =>
    rawSrc.value
      ? resolveImageUrl(rawSrc.value, {
          cdnHost: config.public.cdnHost,
          imageProcessorHost: config.public.imageProcessorHost,
          processing: false,
        })
      : null,
  )
  const label = computed(() => `:${code.value}:`)
  const anchorStyle = computed(() =>
    displaySrc.value ? { backgroundImage: `url(${JSON.stringify(displaySrc.value)})` } : undefined,
  )

  const anchorRef = useTemplateRef<HTMLElement>('anchorRef')
  const hostRef = useTemplateRef<HTMLElement>('hostRef')
  const { visible, requestShow, showNow, requestHide, cancelHide } = useEmojiHoverCard()

  const { floatingStyles } = useFloating(anchorRef, hostRef, {
    placement: 'top',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
</script>

<template>
  <span
    class="mx-0.5 inline-flex items-center align-middle leading-[inherit]"
    data-card-type="emoji"
    :data-emoji-code="code"
  >
    <ClientOnly>
      <Teleport to="body">
        <div
          ref="hostRef"
          class="pointer-events-none absolute top-0 left-0 z-10050"
          :style="floatingStyles"
        >
          <AnimatePresence>
            <motion.div
              v-if="visible"
              class="pointer-events-auto inline-flex origin-bottom flex-col items-center gap-1 rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 shadow-[0_8px_24px_rgb(0_0_0/0.12)] dark:border-surface-700 dark:bg-surface-900 dark:shadow-[0_8px_24px_rgb(0_0_0/0.4)]"
              :initial="{ opacity: 0, scale: 0.95, y: 4 }"
              :animate="{ opacity: 1, scale: 1, y: 0 }"
              :exit="{ opacity: 0, scale: 0.95, y: 4 }"
              @mouseenter="cancelHide"
              @mouseleave="requestHide"
            >
              <HikariContentNodesEmojiHoverCard
                :src="rawSrc"
                :code="code"
                :set-name="setName"
                :set-id="setId"
                :subscribable="subscribable"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Teleport>
    </ClientOnly>

    <span
      ref="anchorRef"
      class="inline-flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-(--editor-chip-radius) bg-contain bg-center bg-no-repeat leading-16"
      role="img"
      :aria-label="label"
      :style="anchorStyle"
      @mouseenter="requestShow"
      @mouseleave="requestHide"
      @click="showNow"
    >
      <span
        class="pointer-events-none block min-w-full text-base leading-16 font-normal whitespace-nowrap text-transparent opacity-0 select-none"
        aria-hidden="true"
      >
        {{ label }}
      </span>
    </span>
  </span>
</template>
