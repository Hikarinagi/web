<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { ArrowLeft, Search, X } from '@lucide/vue'
  import { TRANSITION_FAST } from '~/lib/motion'
  import { SEARCH_LISTBOX_ID, searchOptionId } from '~/features/search/search'
  import { useSearchControls } from '~/features/search/composables/useSearchControls'
  import type { useSearch } from '~/features/search/composables/useSearch'

  const props = defineProps<{ search: ReturnType<typeof useSearch>; open: boolean }>()
  const emit = defineEmits<{ close: [] }>()

  const inputRef = useTemplateRef<{ $el: HTMLInputElement }>('inputRef')
  const { onKeydown, onPick } = useSearchControls(props.search)

  watch(
    () => props.open,
    v => {
      if (v) nextTick(() => inputRef.value?.$el?.focus())
    },
  )

  watch(
    () => props.search.activeIndex,
    index => {
      if (index < 0) return
      nextTick(() => {
        document.getElementById(searchOptionId(index))?.scrollIntoView({ block: 'nearest' })
      })
    },
  )
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        key="mobile-search"
        class="fixed inset-0 z-70 flex flex-col bg-surface-0 dark:bg-surface-950"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 12 }"
        :transition="TRANSITION_FAST"
      >
        <div
          class="flex h-(--app-header-height) items-center gap-2 border-b border-surface px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2"
        >
          <Button
            unstyled
            aria-label="返回"
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-color hover:bg-emphasis"
            @click="emit('close')"
          >
            <ArrowLeft class="size-5.5" />
          </Button>
          <div
            class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-100 px-3.5 dark:bg-surface-800"
          >
            <Search class="size-[18px] shrink-0 text-muted-color" />
            <InputText
              ref="inputRef"
              :model-value="search.query"
              unstyled
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              :aria-controls="SEARCH_LISTBOX_ID"
              :aria-activedescendant="
                search.activeIndex >= 0 ? searchOptionId(search.activeIndex) : undefined
              "
              placeholder="搜索作品 / 角色 / 人物…"
              class="min-w-0 flex-1 bg-transparent text-sm text-color outline-none placeholder:text-muted-color"
              @update:model-value="search.setQuery"
              @keydown="onKeydown"
            />
            <Button
              v-if="search.query"
              unstyled
              aria-label="清空"
              class="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-color hover:text-color"
              @click="search.setQuery('')"
            >
              <X class="size-[18px]" />
            </Button>
          </div>
        </div>

        <ScrollArea :id="SEARCH_LISTBOX_ID" role="listbox" class="min-h-0 flex-1">
          <div class="p-1.5">
            <SearchPanelResults v-if="search.mode === 'typing'" :search="search" @pick="onPick" />
            <SearchPanelIdle v-else :search="search" @pick="onPick" />
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
