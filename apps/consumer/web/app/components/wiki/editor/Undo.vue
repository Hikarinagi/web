<script setup lang="ts">
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  defineOptions({ name: 'WikiEditorUndo' })

  const props = defineProps<{ edit: number | null }>()
  const emit = defineEmits<{ done: [edit: number] }>()
  const nav = usePageNav()
  const active = usePageActive()
  const request = computed(
    () => `/api/pages/create/wiki/changes/${props.edit ?? 0}` as `/api/pages/${string}`,
  )
  const { data, execute } = useHikariApiData<ChangePageData>(request, {
    key: computed(() => `wiki-editor-undo:${props.edit ?? 0}`),
    dedupe: 'defer',
    lazy: true,
    server: false,
    immediate: false,
    watch: false,
  })
  watch(
    () => props.edit,
    id => {
      if (id !== null && data.value?.edit.id !== id) void execute()
    },
    { immediate: true },
  )

  const open = computed({
    get: () => active.value && props.edit !== null && data.value?.edit.id === props.edit,
    set: next => {
      if (!next) void nav.close(['panel', 'edit'])
    },
  })
</script>

<template>
  <WikiChangesUndo
    v-if="data"
    v-model:open="open"
    :edit="data.edit"
    :names="data.names"
    @done="emit('done', data.edit.id)"
  />
</template>
