<script setup lang="ts">
  import { HoverCard } from '@hina-ui/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentEmojiSets } from '../composables/useContentEmojiSets'
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

  const open = ref(false)
</script>

<template>
  <span
    class="mx-0.5 inline-flex items-center align-middle leading-[inherit]"
    data-card-type="emoji"
    :data-emoji-code="code"
  >
    <HoverCard v-model:open="open" side="top">
      <span
        class="inline-flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-(--editor-chip-radius) bg-contain bg-center bg-no-repeat leading-16"
        role="img"
        :aria-label="label"
        :style="anchorStyle"
        @click="open = true"
      >
        <span
          class="pointer-events-none block min-w-full text-base leading-16 font-normal whitespace-nowrap text-transparent opacity-0 select-none"
          aria-hidden="true"
        >
          {{ label }}
        </span>
      </span>
      <template #content>
        <HikariContentNodesEmojiHoverCard
          :src="rawSrc"
          :code="code"
          :set-name="setName"
          :set-id="setId"
          :subscribable="subscribable"
        />
      </template>
    </HoverCard>
  </span>
</template>
