<script setup lang="ts">
  import { IconButton, Inline, SearchInput } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { ArrowLeft } from '@lucide/vue'
  import { TRANSITION_FAST } from '~/lib/motion'
  import { SEARCH_LISTBOX_ID, searchOptionId } from '~/features/search/search'
  import { useSearchControls } from '~/features/search/composables/useSearchControls'
  import type { useSearch } from '~/features/search/composables/useSearch'

  const props = defineProps<{ search: ReturnType<typeof useSearch>; open: boolean }>()
  const emit = defineEmits<{ close: [] }>()

  const { onKeydown, onPick } = useSearchControls(props.search)

  const activeOptionId = computed(() =>
    props.search.activeIndex >= 0 ? searchOptionId(props.search.activeIndex) : undefined,
  )

  const locked = useScrollLock(import.meta.client ? document.body : null)
  const field = useTemplateRef<ComponentPublicInstance>('field')

  watch(
    () => props.open,
    opened => {
      locked.value = opened
      if (!opened) return
      nextTick(() => unrefElement(field)?.querySelector('input')?.focus())
    },
  )

  onBeforeUnmount(() => (locked.value = false))
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        key="search-mobile"
        class="fixed inset-0 z-(--hn-z-overlay) flex flex-col bg-canvas"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 12 }"
        :transition="TRANSITION_FAST"
      >
        <Inline
          gap="xs"
          align="center"
          :wrap="false"
          class="shrink-0 border-b border-line px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2"
        >
          <IconButton label="返回" pill :tooltip="false" class="shrink-0" @click="emit('close')">
            <ArrowLeft />
          </IconButton>
          <SearchInput
            ref="field"
            :model-value="search.query"
            variant="secondary"
            :loading="search.loading"
            aria-label="搜索"
            placeholder="搜索作品 / 角色 / 人物…"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            :aria-controls="SEARCH_LISTBOX_ID"
            :aria-activedescendant="activeOptionId"
            class="min-w-0 flex-1"
            @update:model-value="search.setQuery"
            @keydown="onKeydown"
          />
        </Inline>

        <SearchPanel :search="search" class="flex-1" @pick="onPick" />
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
