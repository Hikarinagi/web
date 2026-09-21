<script setup lang="ts">
  import { Chip, Inline, Popover, Sheet, Stack, Text } from '@hina-ui/vue'
  import { RESOURCE_TYPE_ICON } from '~/features/creator/labels'
  import type { ComposerWork } from '../composables/useComposer'
  import { composerWorkKey } from './types'

  defineOptions({ name: 'FeedComposerRelatedWorksPicker' })

  defineProps<{ selected: ComposerWork[] }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ add: [work: ComposerWork]; remove: [work: ComposerWork] }>()
  defineSlots<{ default(): unknown }>()

  const narrow = useNarrow()
  const mounted = useMounted()
  const asSheet = computed(() => mounted.value && narrow.value)
</script>

<template>
  <Sheet v-if="asSheet" v-model:open="open" title="关联作品" class="h-[60dvh]">
    <slot />

    <template #body>
      <Stack gap="sm" class="min-h-0 grow px-(--hn-panel-p) pb-(--hn-panel-p)">
        <Inline v-if="selected.length" gap="xs" class="shrink-0">
          <Chip
            v-for="work in selected"
            :key="composerWorkKey(work)"
            size="sm"
            removable
            @remove="emit('remove', work)"
          >
            <template #icon>
              <component :is="RESOURCE_TYPE_ICON[work.work_type]" />
            </template>
            <Text as="span" truncate>{{ work.title }}</Text>
          </Chip>
        </Inline>

        <FeedComposerRelatedWorksSearch
          fill
          :selected="selected"
          @add="work => emit('add', work)"
        />
      </Stack>
    </template>
  </Sheet>

  <Popover v-else v-model:open="open" :padded="false" align="start">
    <slot />

    <template #content>
      <Stack gap="none" class="w-80 p-1.5">
        <FeedComposerRelatedWorksSearch :selected="selected" @add="work => emit('add', work)" />
      </Stack>
    </template>
  </Popover>
</template>
