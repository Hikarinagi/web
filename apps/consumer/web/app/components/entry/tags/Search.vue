<script setup lang="ts">
  import {
    Alert,
    Autocomplete,
    Button as HnButton,
    Inline,
    Stack,
    Text,
    type AutocompleteOption,
  } from '@hina-ui/vue'
  import { Plus, Search } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { TAG_REJECT_ACTIONS, TAG_REJECT_LABELS, tagKey } from '~/features/entry/tags'
  import type { WorkTagsControl } from '~/features/entry/useWorkTags'

  interface Option extends AutocompleteOption {
    id?: number
    alias?: string | null
    count?: number
    propose?: boolean
  }

  defineOptions({ name: 'EntryTagsSearch' })
  const props = defineProps<{
    control: WorkTagsControl
    cast: { name: string; names: string[] }[]
  }>()
  defineEmits<{ go: [target: string] }>()

  const text = ref('')
  const listOpen = ref(false)
  const result = ref<ApiData<'/api/v3/tags/pool', 'get'>>({ items: [], reject: null })
  let sequence = 0

  watchDebounced(
    text,
    async value => {
      const current = ++sequence
      const query = value.trim()
      if (!query) {
        result.value = { items: [], reject: null }
        return
      }
      const found = await hikariRequest('/api/v3/tags/pool', { method: 'get', query: { q: query } })
      if (current === sequence) result.value = found
    },
    { debounce: 200 },
  )

  const castMember = computed(() => {
    const key = tagKey(text.value)
    if (!key) return null
    return (
      props.cast.find(
        member => tagKey(member.name) === key || member.names.some(name => tagKey(name) === key),
      ) ?? null
    )
  })
  const exact = computed(() => {
    const key = tagKey(text.value)
    return result.value.items.find(
      item => tagKey(item.name) === key || (item.alias && tagKey(item.alias) === key),
    )
  })
  const reject = computed(() =>
    exact.value ? null : castMember.value ? 'cast' : (result.value.reject ?? null),
  )
  const options = computed<Option[]>(() => {
    if (!tagKey(text.value) || reject.value) return []
    const found = result.value.items.map(item => ({
      value: String(item.id),
      label: item.name,
      id: item.id,
      alias: item.alias,
      count: item.works,
    }))
    return exact.value
      ? found
      : [{ value: '__propose__', label: text.value.trim(), propose: true }, ...found]
  })
  const notice = computed(() => {
    if (!reject.value) return null
    const body =
      reject.value === 'cast'
        ? `指本作角色${castMember.value?.name}`
        : (TAG_REJECT_LABELS[reject.value] ?? '')
    return {
      text: `「${text.value.trim()}」${body}，不能作为标签。`,
      action: TAG_REJECT_ACTIONS[reject.value],
      tone:
        reject.value === 'opinion' || reject.value === 'comment'
          ? ('warning' as const)
          : ('info' as const),
    }
  })

  async function select({ option }: { option: Option }) {
    text.value = ''
    if (option.propose) await props.control.propose(option.label)
    else if (option.id) await props.control.voteOn({ id: option.id, name: option.label })
  }

  async function submit(value: string) {
    if (!tagKey(value) || reject.value) return
    const hit = exact.value
    text.value = ''
    if (hit) await props.control.voteOn(hit)
    else await props.control.propose(value.trim())
  }
</script>

<template>
  <Stack gap="sm">
    <Autocomplete
      v-model="text"
      :open="listOpen && options.length > 0"
      :options="options"
      :get-completion="(_, context) => ({ range: [0, context.text.length], text: '' })"
      placeholder="搜索或添加标签"
      aria-label="搜索或添加标签"
      @update:open="listOpen = $event"
      @select="select"
      @submit="submit"
    >
      <template #leading><Search class="size-4 text-muted" /></template>
      <template #option="{ option }">
        <Inline
          v-if="option.propose"
          gap="sm"
          align="center"
          :wrap="false"
          class="text-accent-text"
        >
          <Plus class="size-4" />
          <Text weight="medium" class="text-accent-text">提议新标签「{{ option.label }}」</Text>
        </Inline>
        <Inline v-else gap="md" align="center" justify="between" :wrap="false" class="w-full">
          <Stack gap="none" class="min-w-0">
            <Text weight="medium" truncate>{{ option.label }}</Text>
            <Text v-if="option.alias" size="xs" tone="muted" truncate>
              又称 {{ option.alias }}
            </Text>
          </Stack>
          <Text size="xs" tone="muted" class="shrink-0 tabular-nums">
            {{ option.count?.toLocaleString() }} 部作品
          </Text>
        </Inline>
      </template>
    </Autocomplete>
    <Alert :open="Boolean(notice)" :tone="notice?.tone ?? 'info'">
      {{ notice?.text }}
      <template v-if="notice?.action" #actions>
        <HnButton
          size="sm"
          variant="soft"
          tone="neutral"
          @click="$emit('go', notice!.action!.target)"
        >
          {{ notice.action.label }}
        </HnButton>
      </template>
    </Alert>
  </Stack>
</template>
