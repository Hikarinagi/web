<script setup lang="ts">
  import { Alert, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiEditorNotices' })

  const props = defineProps<{ base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const router = useRouter()
  const leftover = ref(false)
  onMounted(() => {
    leftover.value = editor.count.value > 0
  })
  watch(editor.count, next => {
    if (!next) leftover.value = false
  })

  const saved = computed(() => Number(route.query.saved) || null)
  const notice = computed({
    get: () => saved.value !== null,
    set: next => {
      if (next) return
      const { saved: _saved, later: _later, undone: _undone, ...query } = route.query
      void router.replace({ query })
    },
  })
  const undone = computed(() => route.query.undone === '1')
</script>

<template>
  <Alert v-model:open="leftover" tone="info" title="上次有未保存的修改" closable>
    <Inline gap="md">
      <Link :as="NuxtLink" :to="{ query: { ...route.query, save: '1' } }" class="text-sm">
        查看修改
      </Link>
      <Link :as="NuxtLink" :to="{ query: { ...route.query, discard: '1' } }" class="text-sm">
        放弃修改
      </Link>
    </Inline>
  </Alert>
  <Alert
    v-model:open="notice"
    :tone="undone ? 'neutral' : 'success'"
    :title="undone ? '已撤销' : '已保存'"
    closable
  >
    <Stack gap="xs">
      <Text v-if="route.query.later === '1' && !undone" size="sm">确认后显示在作品页。</Text>
      <Inline gap="md">
        <Link :as="NuxtLink" :to="`/create/wiki/changes/${saved}`" class="text-sm">
          查看本次修改
        </Link>
        <Link
          v-if="!undone"
          :as="NuxtLink"
          :to="{ path: `${props.base}/undo/${saved}`, query: route.query }"
          class="text-sm"
        >
          撤销
        </Link>
      </Inline>
    </Stack>
  </Alert>
</template>
